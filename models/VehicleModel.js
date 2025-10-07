const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const VehicleModel = sequelize.define("vehicle_models", {
id: { type: DataTypes.CHAR(36), primaryKey: true },
name: { type: DataTypes.STRING(150), allowNull: false },
description: { type: DataTypes.TEXT },
created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
module.exports = VehicleModel;