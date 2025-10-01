const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Customer = sequelize.define("Customer", {
  id: { type: DataTypes.STRING(36), primaryKey: true },
  dealer_id: { type: DataTypes.STRING(36) },
  full_name: { type: DataTypes.STRING(200), allowNull: false },
  phone: { type: DataTypes.STRING(50) },
  email: { type: DataTypes.STRING(150) },
  address: { type: DataTypes.TEXT },
  preferred_contact: { type: DataTypes.STRING(50) }
}, {
  tableName: "customers",
  timestamps: true
});

module.exports = Customer;
