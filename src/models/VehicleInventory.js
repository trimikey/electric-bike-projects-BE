const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VehicleInventory = sequelize.define(
  "vehicle_inventory",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    vehicle_model_id: { type: DataTypes.STRING(36) },
    variant_id: { type: DataTypes.STRING(36) },
    dealer_id: { type: DataTypes.STRING(36) },
    vin: { type: DataTypes.STRING(64) },
    status: {
      type: DataTypes.ENUM(
        "available",
        "allocated",
        "in_transit",
        "sold",
        "reserved",
        "in_factory",
        "in_dealer"
      ),
      defaultValue: "available",
    },
    location: { type: DataTypes.STRING(200) },
    msrp: { type: DataTypes.DECIMAL(12, 2) },
    manufactured_at: { type: DataTypes.DATE },
    received_at: { type: DataTypes.DATE },
    allocated_at: { type: DataTypes.DATE },
    sold_at: { type: DataTypes.DATE },
  },
  {
    tableName: "vehicle_inventory",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = VehicleInventory;
