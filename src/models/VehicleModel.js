const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VehicleModel = sequelize.define(
  "vehicle_models",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    sku: { type: DataTypes.STRING(100), unique: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    brand: { type: DataTypes.STRING(100) },
    variant: { type: DataTypes.STRING(100) },
    base_price: { type: DataTypes.DECIMAL(12, 2) },
    warranty_months: { type: DataTypes.INTEGER },
    description: { type: DataTypes.TEXT },
  },
  {
    tableName: "vehicle_models",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = VehicleModel;
