const BaseController = require("./base.controller");
const User = require("../models/User");

class UserController extends BaseController {
  constructor() {
    super(User);
  }

  // Ví dụ thêm method riêng: lấy user theo role
  async getByRole(req, res) {
    try {
      const users = await this.model.findAll({ where: { role: req.params.role } });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();
