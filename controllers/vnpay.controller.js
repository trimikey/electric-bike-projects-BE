const { v4: uuidv4 } = require("uuid");
const { Payment, Order } = require("../models/associations");

exports.payWithVNPay = async (req, res) => {
  try {
    const { order_id } = req.body;
    const order = await Order.findByPk(order_id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    const vnpUrl = `https://sandbox.vnpayment.vn/pay?txnRef=${uuidv4()}&amount=${order.total_amount}`;
    await Payment.update({ method: "vnpay" }, { where: { order_id: order.id } });

    res.status(201).json({
      message: "✅ Tạo URL thanh toán VNPay (mock)",
      payUrl: vnpUrl,
    });
  } catch (error) {
    console.error("💥 [VNPay Error]:", error.message);
    res.status(500).json({ message: "Lỗi khi tạo thanh toán VNPay" });
  }
};
