const BaseController = require("./base.controller");
const {
  Order,
  Customer,
  Dealer,
  OrderItem,
  Payment,
  VehicleModel,
} = require("../models");

const orderInclude = [
  { model: Customer },
  { model: Dealer },
  { model: Payment },
  {
    model: OrderItem,
    include: [VehicleModel],
  },
];

class OrderController extends BaseController {
  constructor() {
    super(Order);
  }

  // Override to eagerly load associated entities for richer order responses
  getAll = async (req, res) => {
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
}

module.exports = new OrderController();
