const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ManufacturerOrder = sequelize.define("manufacturer_orders", {
  id: { type: DataTypes.CHAR(36), primaryKey: true },
  dealer_id: { type: DataTypes.CHAR(36), allowNull: false },
  manufacturer_id: { type: DataTypes.CHAR(36), allowNull: false },
  manufacturerInventory_id: { type: DataTypes.CHAR(36), allowNull: false },
  variant_id: { type: DataTypes.CHAR(36), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  total_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  created_by: { type: DataTypes.CHAR(36), allowNull: false },
  status: {
    type: DataTypes.ENUM(
      "pending",
      "confirmed",
      "inbounded",
      "shipped",
      "completed",
      "cancelled"
    ),
    defaultValue: "pending",
  },
  expected_delivery: { type: DataTypes.DATEONLY },
  confirmed_at: { type: DataTypes.DATE },
  shipped_at: { type: DataTypes.DATE },
  received_at: { type: DataTypes.DATE, allowNull: true },
  received_by: { type: DataTypes.CHAR(36), allowNull: true },
  notes: { type: DataTypes.TEXT },
});

module.exports = ManufacturerOrder;
