const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OrderItem = sequelize.define(
  "order_items",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    order_id: { type: DataTypes.STRING(36), allowNull: false },
    vehicle_model_id: { type: DataTypes.STRING(36) },
    vehicle_inventory_id: { type: DataTypes.STRING(36) },
    variant_id: { type: DataTypes.STRING(36) },
    qty: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    unit_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    discount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  },
  {
    tableName: "order_items",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = OrderItem;
