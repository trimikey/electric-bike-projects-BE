const BaseController = require("./base.controller");
const Payment = require("../models/Payment");

class PaymentController extends BaseController {
  constructor() {
    super(Payment);
  }
}

module.exports = new PaymentController();
