  const { v4: uuidv4 } = require("uuid");
  const { TestDrive, Customer, Dealer, VehicleModel, User } = require("../models");

  // ==================== CREATE ====================
  exports.schedule = async (req, res) => {
  try {
    let {
      customer_id,    // optional
      dealer_id,
      vehicle_model_id,
      staff_id,
      schedule_at,
      notes,
      customer_phone,   // ✅ nhận từ FE
      customer_name,    // (optional) nếu muốn sync tên
    } = req.body;

    // Lấy customer_id từ token nếu không gửi
    if (!customer_id) {
      if (req.user?.customer_id) {
        customer_id = req.user.customer_id;
      } else if (req.user?.email) {
        const c = await Customer.findOne({ where: { email: req.user.email } });
        if (c) customer_id = c.id;
      }
    }

    if (!customer_id) return res.status(400).json({ message: "Không xác định được khách hàng" });
    if (!dealer_id) return res.status(400).json({ message: "Thiếu dealer_id" });
    if (!vehicle_model_id) return res.status(400).json({ message: "Thiếu vehicle_model_id" });
    if (!schedule_at) return res.status(400).json({ message: "Thiếu schedule_at" });

    // Kiểm tra FK tồn tại
    const [customer, dealer, model] = await Promise.all([
      Customer.findByPk(customer_id),
      Dealer.findByPk(dealer_id),
      VehicleModel.findByPk(vehicle_model_id),
    ]);
    if (!customer) return res.status(404).json({ message: "Khách hàng không tồn tại" });
    if (!dealer) return res.status(404).json({ message: "Đại lý không tồn tại" });
    if (!model) return res.status(404).json({ message: "Dòng xe không tồn tại" });

    // 🆕 Cập nhật phone (và name) cho Customer nếu FE gửi
    if (customer_phone) {
      const digits = String(customer_phone).replace(/\D/g, "");
      if (digits.length < 9 || digits.length > 12) {
        return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
      }
      if (customer.phone !== customer_phone) {
        await customer.update({ phone: customer_phone });
      }
    }
    if (customer_name && customer.full_name !== customer_name) {
      await customer.update({ full_name: customer_name });
    }

    // Chuẩn hóa thời gian
    const dt = new Date(schedule_at);
    if (isNaN(dt.getTime())) {
      return res.status(400).json({ message: "schedule_at không hợp lệ" });
    }

    const td = await TestDrive.create({
      id: uuidv4(),
      customer_id,
      dealer_id,
      vehicle_model_id,
      staff_id: staff_id || null,
      schedule_at: dt, // Sequelize nhận Date
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
    console.error("schedule error:", err);
    return res.status(500).json({ message: err.message });
  }
};

  // ==================== LIST ALL ====================
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
      console.error("listAll error:", err);
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
      console.error("listByCustomer error:", err);
      res.status(500).json({ message: err.message });
    }
  };

  // ==================== UPDATE STATUS (nhanh) ====================
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

      const result = await TestDrive.findByPk(td.id, {
        include: [
          { model: Customer, as: "customer", attributes: ["id", "full_name", "phone", "email"] },
          { model: Dealer, as: "dealer", attributes: ["id", "name", "address", "phone"] },
          { model: VehicleModel, as: "vehicleModel", attributes: ["id", "name"] },
          { model: User, as: "staff", attributes: ["id", "username", "email"] },
        ],
      });

      res.json({ message: "Cập nhật trạng thái thành công", data: result });
    } catch (err) {
      console.error("updateStatus error:", err);
      res.status(500).json({ message: err.message });
    }
  };

  // ==================== UPDATE NOTES (nhanh) ====================
  exports.updateNotes = async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const td = await TestDrive.findByPk(id);
      if (!td) return res.status(404).json({ message: "Không tìm thấy lịch lái thử" });

      td.notes = notes ?? "";
      await td.save();

      const result = await TestDrive.findByPk(td.id, {
        include: [
          { model: Customer, as: "customer", attributes: ["id", "full_name", "phone", "email"] },
          { model: Dealer, as: "dealer", attributes: ["id", "name", "address", "phone"] },
          { model: VehicleModel, as: "vehicleModel", attributes: ["id", "name"] },
          { model: User, as: "staff", attributes: ["id", "username", "email"] },
        ],
      });

      return res.json({ message: "Đã cập nhật ghi chú", data: result });
    } catch (err) {
      console.error("updateNotes error:", err);
      return res.status(500).json({ message: err.message });
    }
  };

  // ==================== PATCH /test-drives/:id (partial update) ====================
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
      if (
        typeof req.body.status !== "undefined" &&
        !["scheduled", "completed", "cancelled"].includes(req.body.status)
      ) {
        return res.status(400).json({ message: "Trạng thái không hợp lệ" });
      }

      // Chuẩn hoá schedule_at (nếu có)
      if (typeof req.body.schedule_at !== "undefined") {
        const dt = new Date(req.body.schedule_at);
        if (isNaN(dt.getTime())) {
          return res.status(400).json({ message: "schedule_at không hợp lệ" });
        }
        req.body.schedule_at = dt; // Sequelize cần Date object
      }

      // Gán field hợp lệ
      allow.forEach((k) => {
        if (typeof req.body[k] !== "undefined") {
          td[k] = req.body[k];
        }
      });

      await td.save();

      const result = await TestDrive.findByPk(td.id, {
        include: [
          { model: Customer, as: "customer", attributes: ["id", "full_name", "phone", "email"] },
          { model: Dealer, as: "dealer", attributes: ["id", "name", "address", "phone"] },
          { model: VehicleModel, as: "vehicleModel", attributes: ["id", "name"] },
          { model: User, as: "staff", attributes: ["id", "username", "email"] },
        ],
      });

      return res.json({ message: "Đã cập nhật lịch lái thử", data: result });
    } catch (err) {
      console.error("updateOne error:", err);
      return res.status(500).json({ message: err.message });
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
      console.error("remove error:", err);
      res.status(500).json({ message: err.message });
    }
  };
