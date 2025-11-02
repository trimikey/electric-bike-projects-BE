const { v4: uuidv4 } = require("uuid");
const { Shipment, Dealer, Order } = require("../models/associations");

const SHIPMENT_TYPES = ["factory_to_dealer", "dealer_to_customer"];
const SHIPMENT_STATUSES = ["pending", "in_transit", "delivered", "failed"];

const includeRelations = [
  { model: Dealer, as: "dealer", attributes: ["id", "name", "address", "phone", "email"] },
  {
    model: Order,
    as: "order",
    attributes: ["id", "status", "total_amount", "customer_id", "dealer_id"],
  },
];

const parseOptionalDate = (value, field) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const error = new Error(`${field} không hợp lệ`);
    error.statusCode = 400;
    throw error;
  }
  return parsed;
};

// CREATE
exports.create = async (req, res) => {
  try {
    const { type, dealer_id, order_id, status, shipped_at, delivered_at, delivery_address } = req.body;

    if (!type || !SHIPMENT_TYPES.includes(type)) {
      return res.status(400).json({ message: "type không hợp lệ" });
    }

    if (!dealer_id) {
      return res.status(400).json({ message: "dealer_id là bắt buộc" });
    }

    if (status && !SHIPMENT_STATUSES.includes(status)) {
      return res.status(400).json({ message: "status không hợp lệ" });
    }

    const parsedShippedAt = parseOptionalDate(shipped_at, "shipped_at");
    const parsedDeliveredAt = parseOptionalDate(delivered_at, "delivered_at");

    const shipment = await Shipment.create({
      id: uuidv4(),
      type,
      dealer_id,
      order_id: order_id ?? null,
      status: status ?? "pending",
      shipped_at: shipped_at === undefined ? new Date() : parsedShippedAt,
      delivered_at: parsedDeliveredAt ?? null,
      delivery_address: delivery_address ?? null,
    });

    const payload = await Shipment.findByPk(shipment.id, { include: includeRelations });
    res.status(201).json(payload);
  } catch (err) {
    console.error("❌ create shipment error:", err);
    const statusCode = err.statusCode ?? 500;
    res.status(statusCode).json({ message: err.message });
  }
};

// LIST
exports.list = async (req, res) => {
  try {
    const { dealer_id, order_id, status, type } = req.query;
    const where = {};

    if (dealer_id) where.dealer_id = dealer_id;
    if (order_id) where.order_id = order_id;
    if (status) {
      if (!SHIPMENT_STATUSES.includes(status)) {
        return res.status(400).json({ message: "status không hợp lệ" });
      }
      where.status = status;
    }
    if (type) {
      if (!SHIPMENT_TYPES.includes(type)) {
        return res.status(400).json({ message: "type không hợp lệ" });
      }
      where.type = type;
    }

    const shipments = await Shipment.findAll({
      where,
      include: includeRelations,
      order: [
        ["shipped_at", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    res.json(shipments);
  } catch (err) {
    console.error("❌ list shipments error:", err);
    res.status(500).json({ message: err.message });
  }
};

// DETAIL
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await Shipment.findByPk(id, { include: includeRelations });

    if (!shipment) {
      return res.status(404).json({ message: "Shipment không tồn tại" });
    }

    res.json(shipment);
  } catch (err) {
    console.error("❌ get shipment error:", err);
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await Shipment.findByPk(id);

    if (!shipment) {
      return res.status(404).json({ message: "Shipment không tồn tại" });
    }

    const {
      type,
      dealer_id,
      order_id,
      status,
      shipped_at,
      delivered_at,
      delivery_address,
    } = req.body;

    if (
      type === undefined &&
      dealer_id === undefined &&
      order_id === undefined &&
      status === undefined &&
      shipped_at === undefined &&
      delivered_at === undefined &&
      delivery_address === undefined
    ) {
      return res.status(400).json({ message: "Không có dữ liệu để cập nhật" });
    }

    if (type !== undefined && !SHIPMENT_TYPES.includes(type)) {
      return res.status(400).json({ message: "type không hợp lệ" });
    }
    if (status !== undefined && !SHIPMENT_STATUSES.includes(status)) {
      return res.status(400).json({ message: "status không hợp lệ" });
    }

    const parsedShippedAt = parseOptionalDate(shipped_at, "shipped_at");
    const parsedDeliveredAt = parseOptionalDate(delivered_at, "delivered_at");

    const updates = {};
    if (type !== undefined) updates.type = type;
    if (dealer_id !== undefined) updates.dealer_id = dealer_id;
    if (order_id !== undefined) updates.order_id = order_id || null;
    if (status !== undefined) updates.status = status;
    if (parsedShippedAt !== undefined) updates.shipped_at = parsedShippedAt;
    if (parsedDeliveredAt !== undefined) updates.delivered_at = parsedDeliveredAt;
    if (delivery_address !== undefined) updates.delivery_address = delivery_address ?? null;

    if (
      updates.status === "delivered" &&
      (updates.delivered_at === undefined || updates.delivered_at === null)
    ) {
      updates.delivered_at = new Date();
    }

    await shipment.update(updates);

    const payload = await Shipment.findByPk(id, { include: includeRelations });
    res.json(payload);
  } catch (err) {
    console.error("❌ update shipment error:", err);
    const statusCode = err.statusCode ?? 500;
    res.status(statusCode).json({ message: err.message });
  }
};

// DELETE
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await Shipment.findByPk(id);

    if (!shipment) {
      return res.status(404).json({ message: "Shipment không tồn tại" });
    }

    await shipment.destroy();
    res.status(204).send();
  } catch (err) {
    console.error("❌ remove shipment error:", err);
    res.status(500).json({ message: err.message });
  }
};
