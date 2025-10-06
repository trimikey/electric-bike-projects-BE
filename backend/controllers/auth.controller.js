const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const admin = require("../config/firebase");
const { v4: uuidv4 } = require("uuid");
const Customer = require("../models/Customer");

// ---------------- REGISTER CUSTOMER ----------------
exports.registerCustomer = async (req, res) => {
  try {
    const { full_name, email, phone, password, address, dob } = req.body;

    // Check duplicate
    const existed = await Customer.findOne({ where: { email } });
    if (existed) return res.status(400).json({ message: "Email already registered" });

    // Hash password (lưu tạm trong cột riêng nếu bạn có cột password_hash)
    const hash = await bcrypt.hash(password, 10);

    const newCustomer = await Customer.create({
      id: uuidv4(),
      full_name,
      email,
      phone,
      address,
      dob,
      password_hash: hash,
    });

    res.status(201).json({
      message: "Đăng ký thành công",
      customer: { id: newCustomer.id, full_name, email, phone },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- LOGIN CUSTOMER ----------------
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ where: { email } });
    if (!customer) return res.status(404).json({ message: "Email không tồn tại" });

    const isValid = await bcrypt.compare(password, customer.password_hash || "");
    if (!isValid) return res.status(401).json({ message: "Sai mật khẩu" });

    const token = jwt.sign(
      { id: customer.id, email: customer.email, type: "customer" },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      customer: {
        id: customer.id,
        full_name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- GOOGLE LOGIN CUSTOMER ----------------
exports.googleLoginCustomer = async (req, res) => {
  const { idToken } = req.body;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { email, name } = decoded;

    let customer = await Customer.findOne({ where: { email } });
    if (!customer) {
      customer = await Customer.create({
        id: uuidv4(),
        full_name: name || "Khách hàng",
        email,
        phone: null,
        address: null,
        dob: null,
      });
    }

    const token = jwt.sign(
      { id: customer.id, email: customer.email, type: "customer" },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Google login thành công",
      customer: {
        id: customer.id,
        full_name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
      },
      token,
    });

  }  catch (err) {
  console.error("❌ Firebase verify failed:", err);
  res.status(500).json({
    error: "Google login failed",
    details: err.message || "Unknown",
  });
}
};
// ---------------- LOGOUT ----------------
exports.logout = (req, res) => {
  res.json({ message: "Đăng xuất thành công" });
};
