const { v4: uuidv4 } = require("uuid");
const { DealerInventory, Dealer, VehicleVariant } = require("../models/associations");

const includeRelations = [
  { model: Dealer, as: "dealer", attributes: ["id", "name", "address", "phone", "email"] },
  { model: VehicleVariant, as: "variant", attributes: ["id", "model_id", "version", "color", "base_price"] },
];

// CREATE
exports.create = async (req, res) => {
  try {
    const { dealer_id, variant_id, quantity } = req.body;

    if (!dealer_id || !variant_id)
      return res.status(400).json({ message: "dealer_id và variant_id là bắt buộc" });
    if (quantity !== undefined && quantity < 0)
      return res.status(400).json({ message: "quantity phải >= 0" });

    const existed = await DealerInventory.findOne({ where: { dealer_id, variant_id } });
    if (existed) {
      return res.status(400).json({ message: "Inventory đã tồn tại cho variant này" });
    }

    const record = await DealerInventory.create({
      id: uuidv4(),
      dealer_id,
      variant_id,
      quantity: quantity ?? 0,
    });

    const payload = await DealerInventory.findByPk(record.id, { include: includeRelations });
    res.status(201).json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LIST
exports.list = async (req, res) => {
  try {
    const { dealer_id, variant_id } = req.query;
    const where = {};
    if (dealer_id) where.dealer_id = dealer_id;
    if (variant_id) where.variant_id = variant_id;

    const inventories = await DealerInventory.findAll({
      where,
      include: includeRelations,
      order: [["updated_at", "DESC"]],
    });

    res.json(inventories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await DealerInventory.findByPk(id, {
      include: includeRelations,
    });

    if (!inventory) {
      return res.status(404).json({ message: "Dealer inventory không tồn tại" });
    }

    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const inventory = await DealerInventory.findByPk(id);
    if (!inventory) {
      return res.status(404).json({ message: "Dealer inventory không tồn tại" });
    }

    if (quantity === undefined) {
      return res
        .status(400)
        .json({ message: "quantity là bắt buộc để cập nhật" });
    }

    if (quantity < 0) {
      return res.status(400).json({ message: "quantity phải lớn hơn hoặc bằng 0" });
    }

    inventory.quantity = quantity;
    inventory.updated_at = new Date();
    await inventory.save();

    const payload = await DealerInventory.findByPk(id, {
      include: includeRelations,
    });

    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await DealerInventory.findByPk(id);
    if (!inventory) {
      return res.status(404).json({ message: "Dealer inventory không tồn tại" });
    }

    await inventory.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};