const jwt = require("jsonwebtoken");

exports.generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "secret123",
    { expiresIn: "7d" }
  );
};

const jwt = require("jsonwebtoken");
exports.sign = (payload, options = { expiresIn: "1d" }) =>
jwt.sign(payload, process.env.JWT_SECRET || "secret", options);
exports.verify = (token) => jwt.verify(token, process.env.JWT_SECRET || "secret");