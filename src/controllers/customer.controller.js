const BaseController = require("./base.controller");
const Customer = require("../models/Customer");

class CustomerController extends BaseController {
  constructor() {
    super(Customer);
  }
}

module.exports = new CustomerController();
