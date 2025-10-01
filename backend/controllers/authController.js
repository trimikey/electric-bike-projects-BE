const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const admin = require("../config/firebase");

// ---------------- REGISTER ----------------
exports.register = async (req, res) => {
  try {
    const { name, email, password, phonenumber } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      phonenumber,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Đăng ký thành công",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- LOGIN ----------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- GOOGLE LOGIN ----------------
exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { email, name, uid } = decoded;

    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        name: name || "No Name",
        email,
        password: null,
        phonenumber: null,
        googleId: uid,  
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Google login thành công",
      user: { id: user.id, name: user.name, email: user.email, phonenumber: user.phonenumber, role: user.role },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: "Google login failed" });
  }
};

// ---------------- LOGOUT ----------------
exports.logout = (req, res) => {
  res.json({ message: "Đăng xuất thành công" });
};
