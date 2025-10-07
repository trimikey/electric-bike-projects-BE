const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const VehicleModelSpec = sequelize.define("vehicle_model_specs", {
id: { type: DataTypes.CHAR(36), primaryKey: true },
model_id: { type: DataTypes.CHAR(36), allowNull: false },
spec_id: { type: DataTypes.CHAR(36), allowNull: false },
value: { type: DataTypes.STRING(255), allowNull: false },
});
module.exports = VehicleModelSpec;