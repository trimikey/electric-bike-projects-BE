const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email và password là bắt buộc" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email và password là bắt buộc" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Email không tồn tại" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Sai mật khẩu" });

    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GOOGLE LOGIN
exports.googleLogin = async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    if (!email || !googleId) {
      return res.status(400).json({ message: "Thiếu email hoặc googleId" });
    }

    let user = await User.findOne({ where: { email } });
    if (!user) {
      // nếu chưa có user → tạo mới
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        googleId,
        password: null,
      });
    } else if (!user.googleId) {
      // nếu đã có user nhưng chưa gắn googleId
      user.googleId = googleId;
      await user.save();
    }

    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
