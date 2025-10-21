const BaseController = require("./base.controller");
const OrderItem = require("../models/OrderItem");

class OrderItemController extends BaseController {
  constructor() {
    super(OrderItem);
  }
}

module.exports = new OrderItemController();
