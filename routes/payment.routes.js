const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { guard } = require("../middlewares/auth.middleware");

// ✅ Tạo thanh toán (MoMo / VNPay)
router.post("/momo", guard(["Customer", "Dealer Staff", "Dealer Manager", "Admin"]), paymentController.createPayment);

// ✅ Lấy danh sách thanh toán
router.get("/", guard(["Dealer Staff", "Dealer Manager", "Admin"]), paymentController.listPayments);

// ✅ IPN callback từ MoMo
router.post("/momo/notify", paymentController.momoIPN);

module.exports = router;
