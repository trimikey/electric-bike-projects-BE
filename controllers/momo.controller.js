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
const REDIRECT_URL = process.env.MOMO_REDIRECT_URL || "http://localhost:3000/payment/momo/success";
const IPN_URL = process.env.MOMO_IPN_URL || "http://localhost:5000/payments/momo/notify";

// ========================================================
// 💰 CREATE PAYMENT (step 1)
// ========================================================
exports.payWithMomo = async (req, res) => {
    try {
        const { order_id } = req.body;
        if (!order_id) return res.status(400).json({ message: "Thiếu order_id" });

        const order = await Order.findByPk(order_id);
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

        // Kiểm tra payment cũ
        const existingPayment = await Payment.findOne({ where: { order_id } });

        if (existingPayment?.status === "success") {
            return res.status(400).json({ message: "Đơn hàng này đã thanh toán thành công" });
        }

        if (existingPayment?.status === "pending") {
            await existingPayment.destroy();
        }

        // MoMo request fields
        const requestId = uuidv4();
        const momoOrderId = uuidv4(); // MoMo chỉ dùng nội bộ
        const amount = Math.round(order.total_amount).toString();
        const orderInfo = `Thanh toán đơn hàng #${order.id}`;
        const requestType = "captureWallet";
        const extraData = order.id; // ✅ Lưu order.id thật

        // ✅ Ký signature
        const rawSignature = [
            `accessKey=${ACCESS_KEY}`,
            `amount=${amount}`,
            `extraData=${extraData}`,
            `ipnUrl=${IPN_URL}`,
            `orderId=${momoOrderId}`,
            `orderInfo=${orderInfo}`,
            `partnerCode=${PARTNER_CODE}`,
            `redirectUrl=${REDIRECT_URL}`,
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
            redirectUrl: REDIRECT_URL,
            ipnUrl: IPN_URL,
            extraData, // chứa order_id thật
            requestType,
            signature,
            lang: "vi",
        };

        // ✅ Gọi API MoMo
        const momoRes = await axios.post(API_URL, payload, {
            headers: { "Content-Type": "application/json" },
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

        // ✅ Tạo record payment pending
        await Payment.create({
            id: uuidv4(),
            order_id: order.id,
            amount: order.total_amount,
            method: "momo",
            paid_at: null, // pending
        });

        return res.status(201).json({
            message: "✅ Tạo thanh toán MoMo thành công",
            payUrl: data.payUrl,
            qrCodeUrl: data.qrCodeUrl || null,
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

        // ✅ Kiểm tra chữ ký xác thực
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
        if (signature !== computedSig)
            return res.status(400).json({ message: "Sai chữ ký xác thực (signature invalid)" });

        // ✅ Nếu thanh toán thành công
        if (parseInt(resultCode) === 0) {
            const realOrderId = extraData; // lấy order_id thật từ extraData
            const payment = await Payment.findOne({ where: { order_id: realOrderId } });
            if (!payment) return res.status(404).json({ message: "Không tìm thấy payment" });

            await payment.update({ paid_at: new Date() });
            await Order.update({ status: "confirmed" }, { where: { id: realOrderId } });

            console.info("✅ Thanh toán thành công qua MoMo:", realOrderId);
            return res.status(200).json({ message: "Thanh toán thành công" });
        }

        // ❌ Nếu thất bại
        console.warn("⚠️ Thanh toán thất bại:", resultCode, message);
        return res.status(400).json({ message: "Thanh toán thất bại", resultCode, message });
    } catch (error) {
        console.error("💥 [MoMo IPN Error]:", error.message);
        return res.status(500).json({ message: "Lỗi xử lý callback từ MoMo" });
    }
};
