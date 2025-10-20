const jwt = require("jsonwebtoken");

// 🔹 Sinh token chứa role_name

// === CONFIG ===
// access token hết hạn sau 24h
const ACCESS_EXPIRE = "24h";
const REFRESH_EXPIRE_DAYS = 7;

exports.ACCESS_EXPIRE = ACCESS_EXPIRE;
exports.REFRESH_EXPIRE_DAYS = REFRESH_EXPIRE_DAYS;

// 🔹 Sinh token chứa role_name
exports.generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role_name: user.role_name || user.role?.name || "Customer",
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_EXPIRE,
  });

  const refreshToken = jwt.sign(
    { id: user.id },  
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: `${REFRESH_EXPIRE_DAYS}d` }
  );

  return { accessToken, refreshToken };
};

// 🔹 Xác thực token
exports.verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
