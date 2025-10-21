const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
    },
    role_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: "roles", // ✅ Trỏ đúng bảng
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "users",
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci", // ✅ Cùng với Role để tránh lỗi FK
  }
);

module.exports = User;
