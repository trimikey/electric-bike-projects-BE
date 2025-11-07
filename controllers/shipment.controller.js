// controllers/shipment.controller.js
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");
const { sequelize, Shipment, Dealer, Order } = require("../models"); // đảm bảo index.js export các model + sequelize

const includes = [
  { model: Dealer, as: "dealer", attributes: ["id", "name", "email", "phone"] },
  { model: Order, as: "order", attributes: ["id", "status", "total_amount", "customer_id", "dealer_id", "variant_id"] },
];

// Create shipment
exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { type, dealer_id, order_id, delivery_address } = req.body;

    if (!type || !dealer_id || !order_id)
      return res.status(400).json({ message: "type, dealer_id, order_id là bắt buộc" });

    if (!["factory_to_dealer", "dealer_to_customer"].includes(type))
      return res.status(400).json({ message: "type không hợp lệ" });

    // validate dealer & order
    const [dealer, order] = await Promise.all([
      Dealer.findByPk(dealer_id),
      Order.findByPk(order_id),
    ]);
    if (!dealer) return res.status(404).json({ message: "Dealer không tồn tại" });
    if (!order) return res.status(404).json({ message: "Order không tồn tại" });

    // Optional: khớp dealer giữa order và shipment
    if (order.dealer_id !== dealer_id)
      return res.status(400).json({ message: "order.dealer_id không khớp dealer_id" });

    // require address nếu giao cho khách
    if (type === "dealer_to_customer" && !delivery_address)
      return res.status(400).json({ message: "delivery_address là bắt buộc với dealer_to_customer" });

    const s = await Shipment.create(
      {
        id: uuidv4(),
        type,
        dealer_id,
        order_id,
        status: "pending",
        delivery_address: delivery_address || null,
      },
      { transaction: t }
    );

    await t.commit();
    const payload = await Shipment.findByPk(s.id, { include: includes });
    res.status(201).json(payload);
  } catch (e) {
    await t.rollback();
    res.status(500).json({ message: e.message });
  }
};

// List + filter + pagination
exports.list = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      status,
      type,
      dealer_id,
      order_id,
      q,                  // search trong delivery_address
      date_from,          // filter created_at range
      date_to,
      sort = "created_at:desc",
    } = req.query;

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (dealer_id) where.dealer_id = dealer_id;
    if (order_id) where.order_id = order_id;
    if (q) where.delivery_address = { [Op.like]: `%${q}%` };
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[Op.gte] = new Date(date_from);
      if (date_to) where.created_at[Op.lte] = new Date(date_to);
    }

    let order = [["created_at", "DESC"]];
    if (sort) {
      const [col, dir] = String(sort).split(":");
      if (col) order = [[col, (dir || "desc").toUpperCase()]];
    }

    const limit = Number(pageSize);
    const offset = (Number(page) - 1) * limit;

    const { rows, count } = await Shipment.findAndCountAll({
      where,
      include: includes,
      order,
      limit,
      offset,
    });

    res.json({
      data: rows,
      meta: {
        total: count,
        page: Number(page),
        pageSize: limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get by id
exports.getById = async (req, res) => {
  try {
    const s = await Shipment.findByPk(req.params.id, { include: includes });
    if (!s) return res.status(404).json({ message: "Shipment không tồn tại" });
    res.json(s);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Update editable fields (address, type)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { delivery_address, type } = req.body;

    const s = await Shipment.findByPk(id);
    if (!s) return res.status(404).json({ message: "Shipment không tồn tại" });

    if (type) {
      if (!["factory_to_dealer", "dealer_to_customer"].includes(type))
        return res.status(400).json({ message: "type không hợp lệ" });
      s.type = type;
    }
    if (delivery_address !== undefined) s.delivery_address = delivery_address || null;

    await s.save();
    const payload = await Shipment.findByPk(id, { include: includes });
    res.json(payload);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Mark shipped (→ in_transit)
exports.markShipped = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const s = await Shipment.findByPk(id, { transaction: t });
    if (!s) return res.status(404).json({ message: "Shipment không tồn tại" });

    if (s.status !== "pending")
      return res.status(400).json({ message: "Chỉ shipment ở trạng thái pending mới có thể chuyển in_transit" });

    await s.update({ status: "in_transit", shipped_at: new Date() }, { transaction: t });

    // TODO (tuỳ nghiệp vụ): nếu factory_to_dealer ⇒ trừ kho nhà máy, tạo vận đơn,...
    await t.commit();

    const payload = await Shipment.findByPk(id, { include: includes });
    res.json(payload);
  } catch (e) {
    await t.rollback();
    res.status(500).json({ message: e.message });
  }
};

// Mark delivered (→ delivered)
exports.markDelivered = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const s = await Shipment.findByPk(id, { transaction: t });
    if (!s) return res.status(404).json({ message: "Shipment không tồn tại" });

    if (!["in_transit", "pending"].includes(s.status))
      return res.status(400).json({ message: "Chỉ shipment in_transit/pending mới chuyển delivered" });

    await s.update({ status: "delivered", delivered_at: new Date() }, { transaction: t });

    // TODO (tuỳ nghiệp vụ):
    // - nếu type=factory_to_dealer: cộng kho DealerInventory
    // - nếu type=dealer_to_customer: cập nhật Order.status = "delivered"
    await t.commit();

    const payload = await Shipment.findByPk(id, { include: includes });
    res.json(payload);
  } catch (e) {
    await t.rollback();
    res.status(500).json({ message: e.message });
  }
};

// Mark failed (→ failed)
exports.markFailed = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const s = await Shipment.findByPk(id, { transaction: t });
    if (!s) return res.status(404).json({ message: "Shipment không tồn tại" });

    if (s.status === "delivered")
      return res.status(400).json({ message: "Shipment đã delivered không thể chuyển failed" });

    await s.update({ status: "failed" }, { transaction: t });
    await t.commit();

    const payload = await Shipment.findByPk(id, { include: includes });
    res.json(payload);
  } catch (e) {
    await t.rollback();
    res.status(500).json({ message: e.message });
  }
};

// Delete
exports.remove = async (req, res) => {
  try {
    const s = await Shipment.findByPk(req.params.id);
    if (!s) return res.status(404).json({ message: "Shipment không tồn tại" });
    if (["in_transit", "delivered"].includes(s.status))
      return res.status(400).json({ message: "Không xoá shipment đang vận chuyển/đã giao" });
    await s.destroy();
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
