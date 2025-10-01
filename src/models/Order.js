const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define("Order", {
  id: { type: DataTypes.STRING(36), primaryKey: true },
  dealer_id: { type: DataTypes.STRING(36) },
  customer_id: { type: DataTypes.STRING(36) },
  user_id: { type: DataTypes.STRING(36) },
  quote_id: { type: DataTypes.STRING(36) },
  total_amount: { type: DataTypes.DECIMAL(14,2) },
  status: { type: DataTypes.ENUM("pending","confirmed","shipped","completed","cancelled"), defaultValue: "pending" },
  placed_at: { type: DataTypes.DATE },
  confirmed_at: { type: DataTypes.DATE },
  completed_at: { type: DataTypes.DATE }
}, {
  tableName: "orders",
  timestamps: true
});

module.exports = Order;
