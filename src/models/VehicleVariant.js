const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VehicleVariant = sequelize.define(
  "vehicle_variants",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    model_id: { type: DataTypes.STRING(36), allowNull: false },
    version: { type: DataTypes.STRING(100), allowNull: false },
    color: { type: DataTypes.STRING(100), allowNull: false },
    base_price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "vehicle_variants",
    timestamps: false,
  }
);

module.exports = VehicleVariant;
