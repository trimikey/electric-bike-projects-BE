const { v4: uuidv4 } = require("uuid");
const { TestDrive } = require("../models");

// ==================== CREATE ====================
exports.schedule = async (req, res) => {
  try {
    const { customer_id, dealer_id, vehicle_model_id, staff_id, schedule_at, notes } = req.body;

    if (!customer_id || !dealer_id || !vehicle_model_id || !schedule_at) {
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc." });
    }

    const testDrive = await TestDrive.create({
      id: uuidv4(),
      customer_id,
      dealer_id,
      vehicle_model_id,
      staff_id,
      schedule_at,
      status: "scheduled",
      notes,
    });

    res.status(201).json({
      message: "Tạo lịch lái thử thành công",
      data: testDrive,
    });
  } catch (err) {
    console.error("❌ Lỗi tạo lịch lái thử:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// ==================== LIST ALL ====================
exports.listAll = async (req, res) => {
  try {
    const { dealer_id, status } = req.query;
    const where = {};
    if (dealer_id) where.dealer_id = dealer_id;
    if (status) where.status = status;

    const list = await TestDrive.findAll({
      where,
      order: [["schedule_at", "DESC"]],
    });

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== LIST BY CUSTOMER ====================
exports.listByCustomer = async (req, res) => {
  try {
    const { id } = req.params; // customer_id
    const list = await TestDrive.findAll({
      where: { customer_id: id },
      order: [["schedule_at", "DESC"]],
    });

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== UPDATE STATUS ====================
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["scheduled", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const td = await TestDrive.findByPk(id);
    if (!td) return res.status(404).json({ message: "Không tìm thấy lịch lái thử" });

    td.status = status;
    await td.save();

    res.json({ message: "Cập nhật trạng thái thành công", data: td });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== DELETE ====================
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const td = await TestDrive.findByPk(id);
    if (!td) return res.status(404).json({ message: "Không tìm thấy lịch lái thử" });

    await td.destroy();
    res.json({ message: "Đã xoá lịch lái thử" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
