const BaseController = require("./base.controller");
const VehicleModel = require("../models/VehicleModel");

class VehicleModelController extends BaseController {
  constructor() {
    super(VehicleModel);
  }

  // Ví dụ custom: tìm model theo brand
  async getByBrand(req, res) {
    try {
      const models = await this.model.findAll({ where: { brand: req.params.brand } });
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new VehicleModelController();
