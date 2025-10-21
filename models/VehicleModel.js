const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const VehicleModel = sequelize.define(
  "VehicleModel",
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    manufacturer_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "vehicle_models",
    timestamps: true, // ✅ bật timestamps
    createdAt: "created_at", // ✅ mapping chính xác với DB
    updatedAt: "updated_at", // ✅ mapping chính xác với DB
  }
);
module.exports = VehicleModel;
