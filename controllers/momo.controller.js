/**
 * momo.controller.js — Fixed version 2025
 */
const axios = require("axios");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const { Payment, Order } = require("../models/associations");

// ==============================
// 🔹 CONFIG (sandbox fallback)
// ==============================
const PARTNER_CODE = process.env.MOMO_PARTNER_CODE || "MOMO";
const ACCESS_KEY = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";
const SECRET_KEY = process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";
const API_URL = process.env.MOMO_API_URL || "https://test-payment.momo.vn/v2/gateway/api/create";

// FE có thể override qua req.body.returnUrl, nếu không dùng ENV này
const REDIRECT_URL_DEFAULT = "http://localhost:3000/dashboard/dealer/momo/success"; // 👈 đúng cấu trúc bạn đang có

const IPN_URL = process.env.MOMO_IPN_URL || "https://abc123.ngrok.io/payments/momo/notify";

// ========================================================
// 💰 CREATE PAYMENT (step 1)
// ========================================================
exports.payWithMomo = async (req, res) => {
    try {
        const { order_id, returnUrl } = req.body;
        if (!order_id) return res.status(400).json({ message: "Thiếu order_id" });

        const order = await Order.findByPk(order_id);
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

        // Không cho thanh toán lại đơn đã success
        const existing = await Payment.findOne({ where: { order_id } });
        if (existing?.paid_at) {
            return res.status(400).json({ message: "Đơn hàng này đã thanh toán thành công" });
        }
        // Nếu còn bản pending trước đó thì xoá để tạo mới
        if (existing && !existing.paid_at) {
            await existing.destroy();
        }

        // ===== MoMo request fields =====
        const requestId = uuidv4();
        const momoOrderId = uuidv4(); // MoMo internal orderId
        const amount = Math.round(Number(order.total_amount || 0)).toString(); // ✅ BẮT BUỘC
        const orderInfo = `Thanh toán đơn hàng #${order.id}`;
        const requestType = "captureWallet";
        const extraData = String(order.id); // lưu order id thật
        const redirectUrl = REDIRECT_URL_DEFAULT;

        // ✅ Raw signature theo thứ tự tham số
        const rawSignature = [
            `accessKey=${ACCESS_KEY}`,
            `amount=${amount}`,
            `extraData=${extraData}`,
            `ipnUrl=${IPN_URL}`,
            `orderId=${momoOrderId}`,
            `orderInfo=${orderInfo}`,
            `partnerCode=${PARTNER_CODE}`,
            `redirectUrl=${redirectUrl}`,
            `requestId=${requestId}`,
            `requestType=${requestType}`,
        ].join("&");

        const signature = crypto.createHmac("sha256", SECRET_KEY).update(rawSignature).digest("hex");

        const payload = {
            partnerCode: PARTNER_CODE,
            accessKey: ACCESS_KEY,
            requestId,
            amount,
            orderId: momoOrderId,
            orderInfo,
            redirectUrl,
            ipnUrl: IPN_URL,
            extraData,
            requestType,
            signature,
            lang: "vi",
        };

        // ✅ Gọi API MoMo
        const momoRes = await axios.post(API_URL, payload, {
            headers: { "Content-Type": "application/json" },
            timeout: 15000,
        });

        const data = momoRes.data;

        if (data.resultCode !== 0) {
            console.error("💥 [MoMo Error]:", data);
            return res.status(400).json({
                message: "Tạo thanh toán thất bại",
                resultCode: data.resultCode,
                momoMessage: data.message,
            });
        }

        // Lưu payment pending
        await Payment.create({
            id: uuidv4(),
            order_id: order.id,
            amount: order.total_amount,
            method: "momo",
            status: "pending",      // ✅

            paid_at: null, // pending
        });

        return res.status(201).json({
            message: "✅ Tạo thanh toán MoMo thành công",
            paymentUrl: data.payUrl || data.shortLink || null, // https page
            qrCodeUrl: data.qrCodeUrl || null,                 // momo://... cho QR/deeplink
            deeplink: data.deeplink || null,                   // nếu MoMo trả
        });
    } catch (error) {
        console.error("💥 [MoMo Payment Error]:", error.response?.data || error.message);
        return res.status(500).json({ message: "Lỗi server khi tạo thanh toán MoMo" });
    }
};

// ========================================================
// 🔔 HANDLE IPN CALLBACK (step 2)
// ========================================================
exports.handleMomoIPN = async (req, res) => {

    try {
        const {
            orderId,
            amount,
            resultCode,
            message,
            extraData,
            signature,
            transId,
            responseTime,
            requestId,
            partnerCode,
        } = req.body;

        // ✅ Verify signature (theo tài liệu v2)
        const rawSignature = [
            `accessKey=${ACCESS_KEY}`,
            `amount=${amount}`,
            `extraData=${extraData}`,
            `message=${message}`,
            `orderId=${orderId}`,
            `orderInfo=${req.body.orderInfo}`,
            `orderType=${req.body.orderType}`,
            `partnerCode=${partnerCode}`,
            `payType=${req.body.payType}`,
            `requestId=${requestId}`,
            `responseTime=${responseTime}`,
            `resultCode=${resultCode}`,
            `transId=${transId}`,
        ].join("&");

        const computedSig = crypto.createHmac("sha256", SECRET_KEY).update(rawSignature).digest("hex");
        if (signature !== computedSig) {
            return res.status(400).json({ message: "Sai chữ ký xác thực (signature invalid)" });
        }

        // ✅ Thành công
        if (parseInt(resultCode, 10) === 0) {
            const realOrderId = String(extraData); // order id thật
            const payment = await Payment.findOne({ where: { order_id: realOrderId } });
            if (!payment) return res.status(404).json({ message: "Không tìm thấy payment" });

            if (!payment.paid_at) {
                await payment.update({ paid_at: new Date() });
                await Order.update({ status: "confirmed" }, { where: { id: realOrderId } });
            }

            console.info("✅ Thanh toán thành công qua MoMo:", realOrderId);
            // MoMo chỉ cần 200 để biết đã nhận IPN
            return res.status(200).json({ message: "OK" });
        }

        // ❌ Thất bại
        console.warn("⚠️ Thanh toán thất bại:", resultCode, message);
        return res.status(400).json({ message: "Thanh toán thất bại", resultCode, momoMessage: message });
    } catch (error) {
        console.error("💥 [MoMo IPN Error]:", error.message);
        return res.status(500).json({ message: "Lỗi xử lý callback từ MoMo" });
    }
};

// controllers/momo.controller.js


exports.queryAndUpdateByMoMoIds = async ({ momoOrderId, requestId, realOrderId }) => {
    // Ký & gọi API query
    const raw = `accessKey=${ACCESS_KEY}&orderId=${momoOrderId}&partnerCode=${PARTNER_CODE}&requestId=${requestId}`;
    const signature = crypto.createHmac("sha256", SECRET_KEY).update(raw).digest("hex");

    const qres = await axios.post(
        "https://test-payment.momo.vn/v2/gateway/api/query",
        { partnerCode: PARTNER_CODE, requestId, orderId: momoOrderId, signature, lang: "vi" },
        { headers: { "Content-Type": "application/json" } }
    );

    const data = qres.data; // { resultCode, message, ... }

    if (data.resultCode === 0) {
        // cập nhật DB theo order_id thật của bạn (lưu ở extraData/realOrderId)
        await Payment.update({ paid_at: new Date() }, { where: { order_id: realOrderId } });
        await Order.update({ status: "confirmed" }, { where: { id: realOrderId } });
        return { ok: true, data };
    }
    return { ok: false, data };
};


