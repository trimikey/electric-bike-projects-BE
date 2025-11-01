const { v4: uuidv4 } = require("uuid");
const { TestDrive } = require("../models");
const {  Customer, Dealer, VehicleModel, User } = require("../models");


// ==================== CREATE ====================
exports.schedule = async (req, res) => {
  try {
    const { customer_id, dealer_id, vehicle_model_id, staff_id, schedule_at, notes } = req.body;

    const td = await TestDrive.create({
      id: uuidv4(),
      customer_id,
      dealer_id,
      vehicle_model_id,
      staff_id,
      schedule_at,
      status: "scheduled",
      notes,
    });

    const result = await TestDrive.findByPk(td.id, {
      include: [
        { model: Customer, as: "customer", attributes: ["id", "full_name", "phone", "email"] },
        { model: Dealer, as: "dealer", attributes: ["id", "name", "address", "phone"] },
        { model: VehicleModel, as: "vehicleModel", attributes: ["id", "name"] },
        { model: User, as: "staff", attributes: ["id", "username", "email"] },
      ],
    });

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Lấy tất cả lịch lái thử
exports.listAll = async (req, res) => {
  try {
    const testDrives = await TestDrive.findAll({
      include: [
        { model: Customer, as: "customer", attributes: ["id", "full_name", "phone", "email"] },
        { model: Dealer, as: "dealer", attributes: ["id", "name", "address", "phone"] },
        { model: VehicleModel, as: "vehicleModel", attributes: ["id", "name"] },
        { model: User, as: "staff", attributes: ["id", "username", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(testDrives);
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
