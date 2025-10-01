const BaseController = require("./base.controller");
const Order = require("../models/Order");

class OrderController extends BaseController {
  constructor() {
    super(Order);
  }
}

module.exports = new OrderController();
