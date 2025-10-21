const BaseController = require("./base.controller");
const Dealer = require("../models/Dealer");

class DealerController extends BaseController {
  constructor() {
    super(Dealer);
  }

  // Custom method: tìm đại lý theo vùng
  async getByRegion(req, res) {
    try {
      const dealers = await this.model.findAll({ where: { region: req.params.region } });
      res.json(dealers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DealerController();
