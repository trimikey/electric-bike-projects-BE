// middlewares/error.middleware.js
module.exports = (err, req, res, next) => {
  console.error("🔥 Error:", err);

  // Nếu controller chủ động ném lỗi chuẩn
  if (err.isCustomError) {
    return res.status(err.status || 400).json({
      message: err.message || "Error",
      errors: err.errors || null,
    });
  }

  // Sequelize: validation
  if (err.name === "SequelizeValidationError") {
    const errors = {};
    for (const e of err.errors || []) {
      // e.path: field, e.message: message
      if (e.path) errors[e.path] = e.message;
    }
    return res.status(400).json({ message: "Validation error", errors });
  }

  // Sequelize: unique constraint
  if (err.name === "SequelizeUniqueConstraintError") {
    const errors = {};
    for (const e of err.errors || []) {
      const field = e.path || "field";
      errors[field] =
        e.message ||
        `${field.charAt(0).toUpperCase() + field.slice(1)} đã tồn tại`;
    }
    return res.status(409).json({ message: "Validation error", errors });
  }

  // Sequelize: foreign key
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(409).json({
      message: "Foreign key constraint error",
      errors: { [err.index || "relation"]: "Ràng buộc khoá ngoại không hợp lệ" },
    });
  }

  // Joi / express-validator (nếu dùng)
  if (err.errors && Array.isArray(err.errors)) {
    // Ví dụ express-validator format
    const errors = {};
    for (const e of err.errors) {
      if (e.param) errors[e.param] = e.msg || "Invalid value";
    }
    return res.status(err.status || 400).json({
      message: err.message || "Validation error",
      errors,
    });
  }

  // Fallback
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  return res.status(status).json({ message });
};
