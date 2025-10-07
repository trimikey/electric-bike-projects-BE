const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define(
  "orders",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    dealer_id: { type: DataTypes.STRING(36) },
    customer_id: { type: DataTypes.STRING(36) },
    user_id: { type: DataTypes.STRING(36) },
    quote_id: { type: DataTypes.STRING(36) },
    variant_id: { type: DataTypes.STRING(36) },
    total_amount: { type: DataTypes.DECIMAL(15, 2) },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "shipped", "delivered", "cancelled"),
      defaultValue: "pending",
    },
    placed_at: { type: DataTypes.DATE },
    confirmed_at: { type: DataTypes.DATE },
    completed_at: { type: DataTypes.DATE },
    order_date: { type: DataTypes.DATE },
  },
  {
    tableName: "orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Order;
