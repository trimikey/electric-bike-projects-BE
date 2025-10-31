/**
 * payment.controller.js
 * Payment Gateway (MoMo / VNPay / etc.)
 * Author: Senior Backend Developer – 10+ yrs exp
 */

const { v4: uuidv4 } = require("uuid");
/**
 * payment.controller.js
 * Payment Gateway (MoMo / VNPay / etc.)
 * Author: Senior Backend Developer – Refactored 2025
 */

const { Payment, Order } = require("../models/associations");
const momoController = require("./momo.controller");
const vnpayController = require("./vnpay.controller"); // mock

// ========================================================
// 🔹 CREATE PAYMENT (Gateway logic)
// ========================================================
exports.createPayment = async (req, res) => {
  try {
    const { order_id, method } = req.body;
    if (!order_id || !method)
      return res.status(400).json({ message: "Thiếu order_id hoặc phương thức thanh toán" });

    // ✅ Kiểm tra đơn hàng hợp lệ
    const order = await Order.findByPk(order_id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    // ✅ Điều hướng sang provider tương ứng
    switch (method.toLowerCase()) {
      case "momo":
        return momoController.payWithMomo(req, res);
      case "vnpay":
        return vnpayController.payWithVNPay(req, res);
      default:
        return res.status(400).json({ message: `Phương thức ${method} chưa được hỗ trợ` });
    }
  } catch (error) {
    console.error("💥 [Create Payment Error]:", error.message);
    res.status(500).json({ message: "Lỗi khi tạo thanh toán" });
  }
};

// ========================================================
// 🔹 LIST PAYMENTS
// ========================================================
exports.listPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [{ model: Order, as: "order" }],
      order: [["createdAt", "DESC"]],
    });
    res.json({ message: "✅ Danh sách thanh toán", data: payments });
  } catch (error) {
    console.error("💥 [Payment List Error]:", error.message);
    res.status(500).json({ message: "Không thể tải danh sách thanh toán" });
  }
};

// ========================================================
// 🔹 MoMo CALLBACK (IPN)
// ========================================================
exports.momoIPN = async (req, res) => {
  try {
    await momoController.handleMomoIPN(req, res);
  } catch (err) {
    console.error("💥 [MoMo IPN Wrapper Error]:", err.message);
    res.status(500).json({ message: "Lỗi xử lý IPN từ MoMo" });
  }
};
// controllers/payment.controller.js

exports.verifyMomo = async (req, res) => {
  try {
    const { orderId, requestId, realOrderId } = req.body;
    if (!orderId || !requestId || !realOrderId) {
      return res.status(400).json({ message: "Thiếu orderId/requestId/realOrderId" });
    }

    const result = await momoController.queryAndUpdateByMoMoIds({
      momoOrderId: orderId,
      requestId,
      realOrderId,
    });

    if (result.ok) return res.json({ message: "Đã xác nhận thanh toán", data: result.data });
    return res.status(400).json({ message: "Thanh toán chưa xác nhận", data: result.data });
  } catch (e) {
    console.error("verifyMomo error:", e.message);
    res.status(500).json({ message: "Lỗi verify MoMo" });
  }
};

