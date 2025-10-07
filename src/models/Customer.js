const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Customer = sequelize.define(
  "customers",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    dealer_id: { type: DataTypes.STRING(36) },
    full_name: { type: DataTypes.STRING(200), allowNull: false },
    phone: { type: DataTypes.STRING(50) },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    address: { type: DataTypes.TEXT },
    preferred_contact: { type: DataTypes.STRING(50) },
    dob: { type: DataTypes.DATEONLY },
    password_hash: { type: DataTypes.STRING(255) },
  },
  {
    tableName: "customers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Customer;
