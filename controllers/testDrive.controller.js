const { v4: uuidv4 } = require("uuid");
const { TestDrive } = require("../models");
const {  Customer, Dealer, VehicleModel, User } = require("../models");


  // ==================== CREATE ====================
 // controllers/testDrive.controller.js


exports.schedule = async (req, res) => {
  try {
    // FE có thể không gửi customer_id -> ưu tiên lấy từ token
    let {
      customer_id,    // optional
      dealer_id,
      vehicle_model_id,
      staff_id,
      schedule_at,
      notes,
    } = req.body;

    // ✅ Lấy customer_id từ token nếu FE không gửi
    if (!customer_id) {
      if (req.user?.customer_id) {
        customer_id = req.user.customer_id;
      } else if (req.user?.email) {
        const c = await Customer.findOne({ where: { email: req.user.email } });
        if (c) customer_id = c.id;
      }
    }

    // ---- Validate input cơ bản
    if (!customer_id) return res.status(400).json({ message: "Không xác định được khách hàng" });
    if (!dealer_id) return res.status(400).json({ message: "Thiếu dealer_id" });
    if (!vehicle_model_id) return res.status(400).json({ message: "Thiếu vehicle_model_id" });
    if (!schedule_at) return res.status(400).json({ message: "Thiếu schedule_at" });

    // ---- Kiểm tra khóa ngoại tồn tại
    const [customer, dealer, model] = await Promise.all([
      Customer.findByPk(customer_id),
      Dealer.findByPk(dealer_id),
      VehicleModel.findByPk(vehicle_model_id),
    ]);
    if (!customer) return res.status(404).json({ message: "Khách hàng không tồn tại" });
    if (!dealer) return res.status(404).json({ message: "Đại lý không tồn tại" });
    if (!model) return res.status(404).json({ message: "Dòng xe không tồn tại" });

    // ---- Chuẩn hóa thời gian
    const dt = new Date(schedule_at);
    if (isNaN(dt.getTime())) {
      return res.status(400).json({ message: "schedule_at không hợp lệ" });
    }

    // (tuỳ chọn) Chống trùng lịch trong ~30 phút cùng KH
    // const thirtyMin = 30 * 60 * 1000;
    // const clash = await TestDrive.findOne({
    //   where: {
    //     customer_id,
    //     schedule_at: {
    //       [Op.between]: [new Date(dt.getTime() - thirtyMin), new Date(dt.getTime() + thirtyMin)],
    //     },
    //   },
    // });
    // if (clash) return res.status(400).json({ message: "Bạn đã có lịch gần thời điểm này" });

    const td = await TestDrive.create({
      id: uuidv4(),
      customer_id,
      dealer_id,
      vehicle_model_id,
      staff_id: staff_id || null,
      schedule_at: dt,             // để Date, Sequelize sẽ map sang DATETIME
      status: "scheduled",
      notes: notes || "",
    });

    const result = await TestDrive.findByPk(td.id, {
      include: [
        { model: Customer, as: "customer", attributes: ["id", "full_name", "phone", "email"] },
        { model: Dealer, as: "dealer", attributes: ["id", "name", "address", "phone"] },
        { model: VehicleModel, as: "vehicleModel", attributes: ["id", "name"] },
        { model: User, as: "staff", attributes: ["id", "username", "email"] },
      ],
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
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



// ... các hàm schedule, listAll, listByCustomer, updateStatus, remove giữ nguyên

// ✅ Helper: trả entity đã include
async function getTDWithInclude(id) {
  return TestDrive.findByPk(id, {
    include: [
      { model: Customer, as: "customer", attributes: ["id", "full_name", "phone", "email"] },
      { model: Dealer, as: "dealer", attributes: ["id", "name", "address", "phone"] },
      { model: VehicleModel, as: "vehicleModel", attributes: ["id", "name"] },
      { model: User, as: "staff", attributes: ["id", "username", "email"] },
    ],
  });
}

/**
 * PATCH /test-drives/:id
 * Cập nhật từng phần các trường cho phép
 */
exports.updateOne = async (req, res) => {
  try {
    const { id } = req.params;

    const td = await TestDrive.findByPk(id);
    if (!td) return res.status(404).json({ message: "Không tìm thấy lịch lái thử" });

    // allowlist các field được sửa
    const allow = [
      "customer_id",
      "dealer_id",
      "vehicle_model_id",
      "staff_id",
      "schedule_at",
      "status",
      "notes",
    ];

    // Validate status nếu có
    if (req.body.status && !["scheduled", "completed", "cancelled"].includes(req.body.status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    // Gán field hợp lệ
    allow.forEach((k) => {
      if (typeof req.body[k] !== "undefined") {
        td[k] = req.body[k];
      }
    });

    await td.save();
    const result = await getTDWithInclude(td.id);
    return res.json({ message: "Đã cập nhật lịch lái thử", data: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * PATCH /test-drives/:id/notes
 * Chỉnh sửa nhanh ghi chú
 */
exports.updateNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const td = await TestDrive.findByPk(id);
    if (!td) return res.status(404).json({ message: "Không tìm thấy lịch lái thử" });

    td.notes = notes ?? "";
    await td.save();

    const result = await getTDWithInclude(td.id);
    return res.json({ message: "Đã cập nhật ghi chú", data: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};
