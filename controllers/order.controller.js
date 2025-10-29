const { v4: uuidv44 } = require("uuid");
const {
    sequelize,
    Quote,
    Order,
    Payment,
    Shipment,
    DealerInventory,
    VehicleInventory,
    VehicleVariant,
    Dealer,
    Customer,
    VehicleModel
} = require("../models");


// Quote → Order
exports.createOrderFromQuote = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { quote_id } = req.body;
        const quote = await Quote.findByPk(quote_id);
        if (!quote) return res.status(404).json({ message: "Quote not found" });


        const order = await Order.create(
            {
                id: uuidv44(),
                customer_id: quote.customer_id,
                dealer_id: quote.dealer_id,
                variant_id: quote.variant_id,
                total_amount: quote.price,
                status: "pending",
            },
            { transaction: t }
        );


        await t.commit();
        res.status(201).json(order);
    } catch (e) {
        await t.rollback();
        res.status(500).json({ message: e.message });
    }
};
exports.confirmOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { order_id, dealer_id } = req.body;
        const order = await Order.findByPk(order_id);
        if (!order) return res.status(404).json({ message: "Order not found" });


        // decrement dealer inventory
        const inv = await DealerInventory.findOne({ where: { dealer_id, variant_id: order.variant_id } });
        if (!inv || inv.quantity <= 0) throw new Error("Out of stock at dealer");
        await inv.update({ quantity: inv.quantity - 1 }, { transaction: t });


        // assign a VIN record at dealer (simplified: create placeholder VIN)
        const vin = uuidv44();
        await VehicleInventory.create(
            { vin, variant_id: order.variant_id, dealer_id, status: "in_dealer" },
            { transaction: t }
        );


        await order.update({ status: "confirmed" }, { transaction: t });


        await t.commit();
        res.json({ message: "Order confirmed", vin });
    } catch (e) {
        await t.rollback();
        res.status(400).json({ message: e.message });
    }
};
exports.payOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { order_id, amount, method } = req.body;
        const order = await Order.findByPk(order_id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        const payment = await Payment.create({ id: uuidv44(), order_id, amount, method }, { transaction: t });
        await order.update({ status: "shipped" }, { transaction: t }); // next step will be shipment creation
        await t.commit();
        res.json({ payment });
    } catch (e) {
        await t.rollback();
        res.status(400).json({ message: e.message });
    }
};
exports.createShipment = async (req, res) => {
    const { order_id, dealer_id, delivery_address } = req.body;
    const shipment = await Shipment.create({
        id: uuidv44(),
        type: "dealer_to_customer",
        order_id,
        dealer_id,
        status: "in_transit",
        shipped_at: new Date(),
        delivery_address,
    });
    res.status(201).json(shipment);
};
exports.markDelivered = async (req, res) => {
const { shipment_id } = req.body;
const ship = await Shipment.findByPk(shipment_id);
if (!ship) return res.status(404).json({ message: "Shipment not found" });
await ship.update({ status: "delivered", delivered_at: new Date() });
// set order to delivered
if (ship.order_id) {
const order = await Order.findByPk(ship.order_id);
if (order) await order.update({ status: "delivered" });
}
res.json({ message: "Delivered" });
};


const { v4: uuidv4 } = require("uuid");

// ================== CREATE ORDER ==================
exports.create = async (req, res) => {
  try {
    const { customer_id, dealer_id, variant_id, total_amount, payment_method } = req.body;

    if (!customer_id || !dealer_id || !variant_id || !total_amount || !payment_method)
      return res.status(400).json({ message: "Thiếu thông tin đặt hàng" });

    // 🔹 Tạo đơn hàng
    const newOrder = await Order.create({
      id: uuidv4(),
      customer_id,
      dealer_id,
      variant_id,
      total_amount,
      status: "pending",
    });

    // 🔹 Tạo record thanh toán (chưa thanh toán)
    const payment = await Payment.create({
      id: uuidv4(),
      order_id: newOrder.id,
      amount: total_amount,
      method: payment_method,
    });

    return res.status(201).json({
      message: "Tạo đơn hàng thành công",
      order: newOrder,
      payment,
    });
  } catch (error) {
    console.error("❌ create order error:", error);
    res.status(500).json({ message: "Lỗi server khi tạo đơn hàng" });
  }
};

// ================== GET ALL ==================
// ================== GET ALL ==================
exports.listAll = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: Customer, as: "customer", attributes: ["full_name", "email", "phone"] },
        { model: Dealer, as: "dealer", attributes: ["name"] },
        {
          model: VehicleVariant,
          as: "variant",
          attributes: ["version", "color", "base_price"],
          include: [
            {
              model: VehicleModel,
              as: "model",
              attributes: ["name", "description"],
            },
          ],
        },
        { model: Payment, as: "payments", attributes: ["method", "amount", "paid_at"] },
      ],
      order: [["order_date", "DESC"]],
    });

    res.json(orders);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách đơn hàng:", err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng" });
  }
};

// ================== UPDATE STATUS ==================
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    await order.update({ status });
    res.json({ message: "Cập nhật trạng thái thành công", order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái đơn hàng" });
  }
};

// ================== DELETE ORDER ==================
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    await Payment.destroy({ where: { order_id: id } });
    await order.destroy();

    res.json({ message: "Đã xoá đơn hàng và thanh toán liên quan" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xoá đơn hàng" });
  }
};
