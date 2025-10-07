const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const VehicleVariant = sequelize.define("vehicle_variants", {
id: { type: DataTypes.CHAR(36), primaryKey: true },
model_id: { type: DataTypes.CHAR(36), allowNull: false },
version: { type: DataTypes.STRING(100), allowNull: false },
color: { type: DataTypes.STRING(100), allowNull: false },
base_price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
module.exports = VehicleVariant;