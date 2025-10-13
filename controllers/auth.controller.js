const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const admin = require("../config/firebase");
const { v4: uuidv4 } = require("uuid");
const Customer = require("../models/Customer");
const generateToken = require("../utils/jwt").generateToken;
const { User, Role } = require("../models/associations");


// ✅ Đăng ký Customer
exports.registerCustomer = async (req, res) => {
  const { name, email, password, phone } = req.body;

  const hashed = await bcrypt.hash(password, 10);
  const customerRole = await Role.findOne({ where: { name: "Customer" } }); // 👈 lấy role theo name

  const user = await User.create({
    id: uuidv4(),
    name,
    email,
    phone,
    password: hashed,
    role_id: customerRole.id, // vẫn FK
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role_name: customerRole.name, // 👈 gửi role_name vào token
  });

  res.status(201).json({
    message: "Đăng ký thành công",
    user: { id: user.id, name: user.name, email: user.email, role_name: customerRole.name },
    token,
  });
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


// ---------------- GET PROFILE ----------------
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: { model: Role, as: "role" },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

