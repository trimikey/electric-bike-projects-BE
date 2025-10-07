const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VehicleModelSpec = sequelize.define(
  "vehicle_model_specs",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    model_id: { type: DataTypes.STRING(36), allowNull: false },
    spec_id: { type: DataTypes.STRING(36), allowNull: false },
    value: { type: DataTypes.STRING(255), allowNull: false },
  },
  {
    tableName: "vehicle_model_specs",
    timestamps: false,
  }
);

module.exports = VehicleModelSpec;
