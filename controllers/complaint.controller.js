// controllers/complaint.controller.js
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");
const { Complaint, Customer, Dealer } = require("../models");

// include để trả kèm thông tin KH/Đại lý
const complaintIncludes = [
  { model: Customer, as: "customer", attributes: ["id", "full_name", "email", "phone"] },
  { model: Dealer, as: "dealer", attributes: ["id", "name", "email", "phone"] },
];

// Create
exports.create = async (req, res) => {
  try {
    const { customer_id, dealer_id = null, description } = req.body;

    if (!customer_id || !description) {
      return res.status(400).json({ message: "customer_id và description là bắt buộc" });
    }

    const c = await Complaint.create({
      id: uuidv4(),
      customer_id,
      dealer_id,
      description,
      status: "pending",
      resolved_at: null,
    });

    const payload = await Complaint.findByPk(c.id, { include: complaintIncludes });
    res.status(201).json(payload);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// List (lọc + phân trang)
exports.list = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      status,           // pending | in_progress | resolved | rejected
      customer_id,
      dealer_id,
      q,                // search theo mô tả
      sort = "created_at:desc",
    } = req.query;

    const where = {};
    if (status) where.status = status;
    if (customer_id) where.customer_id = customer_id;
    if (dealer_id) where.dealer_id = dealer_id;
    if (q) where.description = { [Op.like]: `%${q}%` };

    // sort
    let order = [["created_at", "DESC"]];
    if (sort) {
      const [col, dir] = String(sort).split(":");
      if (col) order = [[col, (dir || "desc").toUpperCase()]];
    }

    const limit = Number(pageSize);
    const offset = (Number(page) - 1) * limit;

    const { rows, count } = await Complaint.findAndCountAll({
      where,
      include: complaintIncludes,
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
    const { id } = req.params;
    const c = await Complaint.findByPk(id, { include: complaintIncludes });
    if (!c) return res.status(404).json({ message: "Complaint không tồn tại" });
    res.json(c);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Update (mô tả, gán dealer, đổi status)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, dealer_id, status } = req.body;

    const c = await Complaint.findByPk(id);
    if (!c) return res.status(404).json({ message: "Complaint không tồn tại" });

    if (description !== undefined) c.description = description;
    if (dealer_id !== undefined) c.dealer_id = dealer_id;

    // validate status hợp lệ
    if (status !== undefined) {
      const allowed = ["pending", "in_progress", "resolved", "rejected"];
      if (!allowed.includes(status)) {
        return res.status(400).json({ message: "status không hợp lệ" });
      }
      c.status = status;
      // nếu chuyển sang resolved → set timestamp
      if (status === "resolved" && !c.resolved_at) c.resolved_at = new Date();
      // nếu rời khỏi resolved → clear timestamp
      if (status !== "resolved") c.resolved_at = null;
    }

    await c.save();
    const payload = await Complaint.findByPk(id, { include: complaintIncludes });
    res.json(payload);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Resolve nhanh (mặc định resolved, có thể truyền rejected)
exports.resolve = async (req, res) => {
  try {
    const { id, status = "resolved" } = req.body;
    const c = await Complaint.findByPk(id);
    if (!c) return res.status(404).json({ message: "Complaint không tồn tại" });

    if (!["resolved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "status phải là resolved hoặc rejected" });
    }

    await c.update({
      status,
      resolved_at: status === "resolved" ? new Date() : new Date(), // rejected cũng đánh dấu thời điểm đóng
    });

    const payload = await Complaint.findByPk(id, { include: complaintIncludes });
    res.json(payload);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Delete
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const c = await Complaint.findByPk(id);
    if (!c) return res.status(404).json({ message: "Complaint không tồn tại" });
    await c.destroy();
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
