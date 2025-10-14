const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const VehicleModelSpec = sequelize.define("VehicleModelSpec", {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
  },
  model_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  spec_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  value: {
    type: DataTypes.STRING(100),
  },
},
{
  tableName: "vehicle_model_specs",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = VehicleModelSpec;
