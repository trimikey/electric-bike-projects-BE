const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const admin = require("../config/firebase");
const { v4: uuidv4 } = require("uuid");
const Customer = require("../models/Customer");
const generateTokens = require("../utils/jwt").generateTokens;
const { User, Role } = require("../models/associations");
const RefreshToken = require("../models/RefreshToken"); // ✅ Sửa import đúng, không destructure
const { REFRESH_EXPIRE_DAYS, ACCESS_EXPIRE } = require("../utils/jwt");



// 
exports.registerCustomer = async (req, res) => {
  try {
    const { full_name, email, password, phone, address, dob } = req.body;

    if (!full_name || !email || !password) {
      return res
        .status(400)
        .json({ message: "full_name, email và password là bắt buộc" });
    }

    const existed = await Customer.findOne({ where: { email } });
    if (existed) {
      return res.status(400).json({ message: "Email đã được đăng ký" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const customer = await Customer.create({
      id: uuidv4(),
      full_name,
      email,
      phone: phone || null,
      password_hash: hashed,
      address: address || null,
      dob: dob ? new Date(dob) : null,
    });

    const { accessToken, refreshToken } = generateTokens(customer);

    // ✅ Thêm lưu refresh token gắn với customer_id
    await RefreshToken.create({
      id: uuidv4(),
      customer_id: customer.id, // ✅ đổi từ user_id sang customer_id
      token: refreshToken,
      expires_at: new Date(
        Date.now() + Number(REFRESH_EXPIRE_DAYS) * 24 * 60 * 60 * 1000
      ),
    });

    res.status(201).json({
      message: "Đăng ký thành công",
      customer: {
        id: customer.id,
        full_name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        dob: customer.dob,
      },
      accessToken,
      refreshToken,
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
    if (!customer)
      return res.status(404).json({ message: "Email không tồn tại" });

    const isValid = await bcrypt.compare(
      password,
      customer.password_hash || ""
    );
    if (!isValid) return res.status(401).json({ message: "Sai mật khẩu" });

    const { accessToken, refreshToken } = generateTokens(customer);

    // ✅ Lưu refresh token vào DB (gắn customer_id)
    await RefreshToken.create({
      id: uuidv4(),
      customer_id: customer.id, // ✅ đổi từ user_id sang customer_id
      token: refreshToken,
      expires_at: new Date(
        Date.now() + Number(REFRESH_EXPIRE_DAYS) * 24 * 60 * 60 * 1000
      ),
    });

    res.json({
      message: "Đăng nhập thành công",
      accessToken,
      refreshToken,
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

    const { accessToken, refreshToken } = generateTokens(customer);

    // ✅ Sửa: dùng customer_id thay user_id
    await RefreshToken.create({
      id: uuidv4(),
      customer_id: customer.id, // ✅ fix
      token: refreshToken,
      expires_at: new Date(
        Date.now() + Number(REFRESH_EXPIRE_DAYS) * 24 * 60 * 60 * 1000
      ),
    });

    res.json({
      message: "Google login thành công",
      customer: {
        id: customer.id,
        full_name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("❌ Firebase verify failed:", err);
    res.status(500).json({
      error: "Google login failed",
      details: err.message || "Unknown",
    });
  }
};

// ---------------- REFRESH TOKEN ---------------- 🆕
exports.refreshTokenCustomer = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ message: "Thiếu refresh token" });

    // ✅ Kiểm tra token có trong DB
    const stored = await RefreshToken.findOne({
      where: { token: refreshToken },
    });
    if (!stored)
      return res.status(403).json({ message: "Refresh token không hợp lệ" });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const customer = await Customer.findByPk(decoded.id);
    if (!customer)
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });

    const { accessToken: newAccess } = generateTokens(customer);

    return res.json({ accessToken: newAccess });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(403).json({ message: "Refresh token không hợp lệ" });
  }
};

// ---------------- LOGOUT ----------------
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await RefreshToken.destroy({ where: { token: refreshToken } }); // ✅ xóa token khỏi DB
    }
    res.json({ message: "Đăng xuất thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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
