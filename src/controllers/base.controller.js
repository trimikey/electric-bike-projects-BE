class BaseController {
  constructor(model) {
    this.model = model;
  }

  // GET all
  getAll = async (req, res) => {
    try {
      const items = await this.model.findAll();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // GET by ID
  getById = async (req, res) => {
    try {
      const item = await this.model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: "Not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // CREATE
  create = async (req, res) => {
    try {
      const { v4: uuidv4 } = require("uuid");
      const newItem = await this.model.create({
        id: uuidv4(),
        ...req.body,
      });
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // UPDATE
  update = async (req, res) => {
    try {
      const item = await this.model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: "Not found" });

      await item.update(req.body);
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // DELETE
  delete = async (req, res) => {
    try {
      const item = await this.model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: "Not found" });

      await item.destroy();
      res.json({ message: "Deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

module.exports = BaseController;
