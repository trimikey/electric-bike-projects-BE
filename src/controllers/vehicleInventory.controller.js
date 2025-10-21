const BaseController = require("./base.controller");
const VehicleInventory = require("../models/VehicleInventory");

class VehicleInventoryController extends BaseController {
  constructor() {
    super(VehicleInventory);
  }

  // Custom: lấy tất cả xe theo trạng thái
  async getByStatus(req, res) {
    try {
      const items = await this.model.findAll({ where: { status: req.params.status } });
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Custom: lấy xe theo dealer
  async getByDealer(req, res) {
    try {
      const items = await this.model.findAll({ where: { dealer_id: req.params.dealerId } });
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new VehicleInventoryController();
