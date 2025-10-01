const jwt = require("jsonwebtoken");

exports.generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "secret123",
    { expiresIn: "7d" }
  );
};
