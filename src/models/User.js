const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "users",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    dealer_id: { type: DataTypes.STRING(36) },
    role_id: { type: DataTypes.STRING(36) },
    username: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    full_name: { type: DataTypes.STRING(200) },
    phone: { type: DataTypes.STRING(50) },
    role: {
      type: DataTypes.ENUM("dealer_staff", "dealer_manager", "evm_staff", "admin", "customer"),
    },
    deleted_at: { type: DataTypes.DATE },
  },
  {
    tableName: "users",
    timestamps: true,
    paranoid: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = User;
