const { v4: uuidv4 } = require("uuid");
const { DealerInventory, Dealer, VehicleVariant } = require("../models/associations");

const includeRelations = [
  { model: Dealer, as: "dealer", attributes: ["id", "name", "phone", "email"] },
  { model: VehicleVariant, as: "variant", attributes: ["id", "model_id", "version", "color", "base_price"] },
];

exports.getDealersInventory = async (req, res) => {
  try {
    const { dealerId, variantId } = req.query;
    const where = {};
    if (dealerId) where.dealer_id = dealerId;
    if (variantId) where.variant_id = variantId;

    const rows = await DealerInventory.findAll({
      where,
      include: includeRelations,
      order: [["updated_at", "DESC"]],
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.adjustDealerInventory = async (req, res) => {
  try {
    const { dealerId, variantId, delta, reason } = req.body;
    if (!dealerId || !variantId || typeof delta !== "number") {
      return res.status(400).json({ message: "dealerId, variantId, delta are required" });
    }

    let row = await DealerInventory.findOne({ where: { dealer_id: dealerId, variant_id: variantId } });
    if (!row) {
      row = await DealerInventory.create({ id: uuidv4(), dealer_id: dealerId, variant_id: variantId, quantity: 0 });
    }

    const newQty = (Number(row.quantity) || 0) + delta;
    if (newQty < 0) return res.status(400).json({ message: "Resulting quantity cannot be negative" });

    row.quantity = newQty;
    row.updated_at = new Date();
    await row.save();

    const payload = await DealerInventory.findByPk(row.id, { include: includeRelations });
    res.json({ ...payload.toJSON(), adjustment_reason: reason || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



