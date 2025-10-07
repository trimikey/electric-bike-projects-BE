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