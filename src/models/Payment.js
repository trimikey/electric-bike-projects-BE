const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Payment = sequelize.define("Payment", {
  id: { type: DataTypes.STRING(36), primaryKey: true },
  order_id: { type: DataTypes.STRING(36) },
  amount: { type: DataTypes.DECIMAL(14,2) },
  method: { type: DataTypes.ENUM("card","bank_transfer","cash","deposit") },
  status: { type: DataTypes.ENUM("pending","success","failed","refunded"), defaultValue: "pending" },
  gateway: { type: DataTypes.STRING(255) },
  paid_at: { type: DataTypes.DATE }
}, {
  tableName: "payments",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = Payment;
