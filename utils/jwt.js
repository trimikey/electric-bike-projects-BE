const jwt = require("jsonwebtoken");

// 🔹 Sinh token chứa role_name
exports.generateToken = (user, options = {}) => {
  const payload = {
    id: user.id,
    email: user.email,
    role_name: user.role_name || user.role?.name || "Customer", // ✅ đổi dòng này
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
    ...options,
  });
};

// 🔹 Xác thực token
exports.verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
