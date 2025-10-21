const BaseController = require("./base.controller");
const StockAllocation = require("../models/StockAllocation");

class StockAllocationController extends BaseController {
  constructor() {
    super(StockAllocation);
  }
}

module.exports = new StockAllocationController();
