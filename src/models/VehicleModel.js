const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VehicleModel = sequelize.define("VehicleModel", {
  id: { type: DataTypes.STRING(36), primaryKey: true },
  sku: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false },
  brand: { type: DataTypes.STRING(100) },
  variant: { type: DataTypes.STRING(100) },
  base_price: { type: DataTypes.DECIMAL(12,2) },
  warranty_months: { type: DataTypes.INTEGER },
}, {
  tableName: "vehicle_models",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = VehicleModel;
