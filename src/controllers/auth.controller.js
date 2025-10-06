const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
// xử lý lỗi cụ thể validate từ express-validator
const { validationResult } = require("express-validator");


exports.register = async (req, res) => {

    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Nếu có lỗi validation, trả về chi tiết
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }


  try {
    const { username, email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      id: uuidv4(),
      username,
      email,
      password_hash: hash,
      role
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {

      const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Nếu có lỗi validation, trả về chi tiết
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }


  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
