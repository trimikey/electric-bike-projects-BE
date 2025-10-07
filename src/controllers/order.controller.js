const { v4: uuidv4 } = require("uuid");
const BaseController = require("./base.controller");
const {
  sequelize,
  Order,
  Customer,
  Dealer,
  OrderItem,
  Payment,
  VehicleModel,
  Quote,
  Shipment,
  DealerInventory,
  VehicleInventory,
  VehicleVariant,
} = require("../models");

const orderInclude = [
  { model: Customer, as: "customer" },
  { model: Dealer, as: "dealer" },
  { model: Payment, as: "payments" },
  {
    model: OrderItem,
    as: "items",
    include: [
      { model: VehicleModel, as: "vehicleModel" },
      { model: VehicleVariant, as: "variant" },
    ],
  },
  { model: Shipment, as: "shipments" },
];

class OrderController extends BaseController {
  constructor() {
    super(Order);
  }

  getAll = async (_req, res) => {
    try {
      const orders = await Order.findAll({ include: orderInclude });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getById = async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id, { include: orderInclude });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  createOrderFromQuote = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { quote_id } = req.body;
      if (!quote_id) {
        await transaction.rollback();
        return res.status(400).json({ message: "quote_id is required" });
      }

      const quote = await Quote.findByPk(quote_id, { transaction });
      if (!quote) {
        await transaction.rollback();
        return res.status(404).json({ message: "Quote not found" });
      }

      const order = await Order.create(
        {
          id: uuidv4(),
          customer_id: quote.customer_id,
          dealer_id: quote.dealer_id,
          variant_id: quote.variant_id,
          total_amount: quote.price || quote.total_amount,
          status: "pending",
        },
        { transaction }
      );

      await transaction.commit();
      res.status(201).json(order);
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ message: error.message });
    }
  };

  confirmOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { order_id, dealer_id } = req.body;
      if (!order_id || !dealer_id) {
        await transaction.rollback();
        return res.status(400).json({ message: "order_id và dealer_id là bắt buộc" });
      }

      const order = await Order.findByPk(order_id, { transaction });
      if (!order) {
        await transaction.rollback();
        return res.status(404).json({ message: "Order not found" });
      }

      const inventory = await DealerInventory.findOne({
        where: { dealer_id, variant_id: order.variant_id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!inventory || inventory.quantity <= 0) {
        throw new Error("Out of stock at dealer");
      }

      await inventory.update({ quantity: inventory.quantity - 1 }, { transaction });

      await VehicleInventory.create(
        {
          id: uuidv4(),
          variant_id: order.variant_id,
          dealer_id,
          status: "in_dealer",
          vin: uuidv4(),
        },
        { transaction }
      );

      await order.update({ status: "confirmed" }, { transaction });
      await transaction.commit();

      res.json({ message: "Order confirmed" });
    } catch (error) {
      await transaction.rollback();
      res.status(400).json({ message: error.message });
    }
  };

  payOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { order_id, amount, method } = req.body;
      if (!order_id || !amount || !method) {
        await transaction.rollback();
        return res.status(400).json({ message: "Thiếu thông tin thanh toán" });
      }

      const order = await Order.findByPk(order_id, { transaction });
      if (!order) {
        await transaction.rollback();
        return res.status(404).json({ message: "Order not found" });
      }

      const payment = await Payment.create(
        { id: uuidv4(), order_id, amount, method },
        { transaction }
      );

      await order.update({ status: "shipped" }, { transaction });
      await transaction.commit();

      res.json({ payment });
    } catch (error) {
      await transaction.rollback();
      res.status(400).json({ message: error.message });
    }
  };

  createShipment = async (req, res) => {
    try {
      const { order_id, dealer_id, delivery_address, type } = req.body;
      if (!order_id) {
        return res.status(400).json({ message: "order_id is required" });
      }

      const shipment = await Shipment.create({
        id: uuidv4(),
        type: type || "dealer_to_customer",
        order_id,
        dealer_id,
        status: "in_transit",
        shipped_at: new Date(),
        delivery_address,
      });

      res.status(201).json(shipment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  markDelivered = async (req, res) => {
    try {
      const { shipment_id } = req.body;
      if (!shipment_id) {
        return res.status(400).json({ message: "shipment_id is required" });
      }

      const shipment = await Shipment.findByPk(shipment_id);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }

      await shipment.update({ status: "delivered", delivered_at: new Date() });

      if (shipment.order_id) {
        const order = await Order.findByPk(shipment.order_id);
        if (order) {
          await order.update({ status: "delivered" });
        }
      }

      res.json({ message: "Delivered" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
}

module.exports = new OrderController();
