const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "secret";

exports.generateToken = (user, options = { expiresIn: "7d" }) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    SECRET,
    options
  );

exports.sign = (payload, options = { expiresIn: "1d" }) =>
  jwt.sign(payload, SECRET, options);

exports.verify = (token) => jwt.verify(token, SECRET);
