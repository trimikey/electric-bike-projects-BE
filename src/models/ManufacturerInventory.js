const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ManufacturerInventory = sequelize.define(
  "manufacturer_inventory",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    variant_id: { type: DataTypes.STRING(36), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    location: { type: DataTypes.STRING(150) },
  },
  {
    tableName: "manufacturer_inventory",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = ManufacturerInventory;
