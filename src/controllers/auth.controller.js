const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const User = require("../models/User");
const Customer = require("../models/Customer");
const admin = require("../config/firebase");
const authService = require("../services/auth.service");
const { generateToken } = require("../utils/jwt");

// -------- Staff / internal auth --------
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg })),
    });
  }

  try {
    const { username, email, password, role, dealer_id, role_id } = req.body;
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      id: uuidv4(),
      username,
      email,
      password_hash: hash,
      role,
      dealer_id,
      role_id,
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg })),
    });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------- Customer auth flows from tri branch --------
exports.registerCustomer = async (req, res) => {
  try {
    const payload = await authService.registerCustomer(req.body);
    res.status(201).json({
      message: "Đăng ký thành công",
      customer: authService.buildCustomerPayload(payload.customer),
      token: payload.token,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.loginCustomer = async (req, res) => {
  try {
    const payload = await authService.loginCustomer(req.body);
    res.json({
      message: "Đăng nhập thành công",
      token: payload.token,
      customer: authService.buildCustomerPayload(payload.customer),
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.googleLoginCustomer = async (req, res) => {
  const { idToken } = req.body;

  try {
    console.log("🔥 [Google Login] Request received");
    console.log("🧩 Received idToken:", idToken ? idToken.slice(0, 20) + "..." : "(none)");

    if (!idToken) {
      console.warn("⚠️ Missing idToken");
      return res.status(400).json({ message: "Thiếu idToken" });
    }

    let decoded;

    // ⚙️ Mock mode cho Swagger (chỉ khi token = "test-token")
    // if (idToken === "test-token") {
      // console.log("⚙️ Mock mode (Swagger testing) activated");
      // decoded = { email: "test@gmail.com", name: "Swagger User" };
    // } else {
      console.log("🧠 Verifying idToken with Firebase...");
      console.log("✅ Verify success:", decoded);
      decoded = await admin.auth().verifyIdToken(idToken);
      console.log("✅ [Google Verify Result]", {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        iss: decoded.iss,
      });
    // }

    const { email, name } = decoded || {};
    if (!email) {
      console.warn("❌ Missing email in decoded token");
      return res.status(400).json({ message: "Token không chứa email hợp lệ" });
    }

    console.log("💾 Upserting customer:", email, name);

    const payload = await authService.upsertGoogleCustomer({ email, name });
    console.log("✅ Customer upserted:", payload.customer.email);

    return res.json({
      message: "Google login thành công",
      customer: authService.buildCustomerPayload(payload.customer),
      token: payload.token,
    });
  } catch (error) {
    console.error("🔥 Firebase verify failed:", error.message);
    
    return res.status(500).json({
      error: "Google login failed",
      details: error.message || "Unknown error",
    });
  }
};


exports.logout = (_req, res) => {
  res.json({ message: "Đăng xuất thành công" });
};

// Utility endpoint for customer profile (optional)
exports.me = async (req, res) => {
  try {
    const { id } = req.user;
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ customer: authService.buildCustomerPayload(customer) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Issue new token utility
exports.refreshToken = async (req, res) => {
  const { id, email, role } = req.user;
  const token = generateToken({ id, email, role });
  res.json({ token });
};
