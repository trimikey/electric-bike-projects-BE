const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

// ✅ Tạo thanh toán (MoMo / VNPay)
router.post("/momo", paymentController.createPayment);

// ✅ Lấy danh sách thanh toán
router.get("/", paymentController.listPayments);

// ✅ IPN callback từ MoMo
router.post("/momo/notify", paymentController.momoIPN);

module.exports = router;
