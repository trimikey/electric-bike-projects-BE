const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const VehicleModel = require("./VehicleModel");

const VehicleVariant = sequelize.define(
  "VehicleVariant",
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
    },
    model_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    version: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    base_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    thumbnail_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "vehicle_variants",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

VehicleModel.hasMany(VehicleVariant, {
  foreignKey: "model_id",
  as: "variants",
});
VehicleVariant.belongsTo(VehicleModel, {
  foreignKey: "model_id",
  as: "model",
});

module.exports = VehicleVariant;
