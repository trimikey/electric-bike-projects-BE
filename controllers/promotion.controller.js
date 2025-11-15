const { v4: uuidv4 } = require("uuid");
const { Promotion, Dealer } = require("../models/associations");

const includeRelations = [
  { model: Dealer, as: "dealer", attributes: ["id", "name", "email", "phone"] },
];

exports.list = async (req, res) => {
  try {
    const { dealer_id, activeOnly, date } = req.query;
    const where = {};
    if (dealer_id) where.dealer_id = dealer_id;

    const items = await Promotion.findAll({
      where,
      include: includeRelations,
      order: [["start_date", "DESC"]],
    });

    let result = items;
    if (activeOnly === "true") {
      const now = date ? new Date(date) : new Date();
      result = items.filter((p) => {
        const startOk = !p.start_date || new Date(p.start_date) <= now;
        const endOk = !p.end_date || new Date(p.end_date) >= now;
        return startOk && endOk;
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Promotion.findByPk(req.params.id, { include: includeRelations });
    if (!item) return res.status(404).json({ message: "Promotion not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { dealer_id, title, description, discount_percent, start_date, end_date } = req.body;
    if (!title) return res.status(400).json({ message: "title is required" });

    const record = await Promotion.create({
      id: uuidv4(),
      dealer_id: dealer_id || null,
      title,
      description: description || null,
      discount_percent: discount_percent ?? null,
      start_date: start_date || null,
      end_date: end_date || null,
    });

    const payload = await Promotion.findByPk(record.id, { include: includeRelations });
    res.status(201).json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Promotion.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Promotion not found" });

    const { dealer_id, title, description, discount_percent, start_date, end_date } = req.body;
    if (dealer_id !== undefined) item.dealer_id = dealer_id;
    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (discount_percent !== undefined) item.discount_percent = discount_percent;
    if (start_date !== undefined) item.start_date = start_date;
    if (end_date !== undefined) item.end_date = end_date;

    await item.save();
    const payload = await Promotion.findByPk(item.id, { include: includeRelations });
    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Promotion.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Promotion not found" });
    await item.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



