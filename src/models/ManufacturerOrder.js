const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ManufacturerOrder = sequelize.define(
  "manufacturer_orders",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    dealer_id: { type: DataTypes.STRING(36), allowNull: false },
    created_by: { type: DataTypes.STRING(36), allowNull: false },
    status: {
      type: DataTypes.ENUM("draft", "submitted", "in_production", "completed", "cancelled"),
      defaultValue: "draft",
    },
    notes: { type: DataTypes.TEXT },
  },
  {
    tableName: "manufacturer_orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = ManufacturerOrder;
