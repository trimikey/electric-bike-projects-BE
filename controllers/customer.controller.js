const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { Customer } = require("../models");
const { verifyToken } = require("../utils/jwt");

// Tạo khách hàng mới (Admin/EVM Staff)
exports.createCustomer = async (req, res) => {
  try {
    const { full_name, email, phone, password, address, dob } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        message: "full_name, email và password là bắt buộc",
      });
    }

    const existed = await Customer.findOne({ where: { email } });
    if (existed) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const customer = await Customer.create({
      id: uuidv4(),
      full_name,
      email,
      phone: phone || null,
      password_hash,
      address: address || null,
      dob: dob ? new Date(dob) : null,
    });

    res.status(201).json({
      message: "Tạo khách hàng thành công",
      customer: {
        id: customer.id,
        full_name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        dob: customer.dob,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy thông tin khách hàng hiện tại
exports.getCurrentCustomer = async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "No token provided" });

    // Guard middleware đã gán req.user sau khi verify token thành công.
    let currentUser = req.user;

    // Phòng trường hợp route khác gọi trực tiếp mà không qua guard.
    if (!currentUser) {
      const token = auth.split(" ")[1];
      currentUser = verifyToken(token);
    }

    if (!currentUser?.id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const customer = await Customer.findByPk(currentUser.id, {
      attributes: { exclude: ["password_hash"] },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ customer });
  } catch (err) {
    console.error("getCurrentCustomer error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Lấy danh sách tất cả khách hàng
exports.listCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      attributes: { exclude: ["password_hash"] },
    });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật thông tin khách hàng
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, address, dob } = req.body;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    customer.full_name = full_name || customer.full_name;
    customer.phone = phone || customer.phone;
    customer.address = address || customer.address;
    customer.dob = dob || customer.dob;

    await customer.save();

    res.json({
      message: "Cập nhật thông tin thành công",
      customer: {
        id: customer.id,
        full_name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        dob: customer.dob,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa khách hàng
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    await customer.destroy();
    res.json({ message: "Xóa khách hàng thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
