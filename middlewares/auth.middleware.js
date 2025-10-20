const { verifyToken: verifyJWT } = require("../utils/jwt");

// ✅ Middleware 1: chỉ xác thực token
exports.verifyToken = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "No token provided" });

  const token = auth.split(" ")[1];
  try {
    const decoded = verifyJWT(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


// ✅ Middleware 2: kiểm tra quyền theo tên role
exports.guard = (roles = []) => {
  return (req, res, next) => {
    try {
      const auth = req.headers.authorization;
      if (!auth) return res.status(401).json({ message: "No token provided" });
      const token = auth.split(" ")[1];
      const decoded = verifyJWT(token);

      if (roles.length && !roles.includes(decoded.role_name)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};
