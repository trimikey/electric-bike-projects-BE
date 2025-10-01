const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const VehicleModel = require("./VehicleModel");
const Dealer = require("./Dealer");

const VehicleInventory = sequelize.define("VehicleInventory", {
  id: { type: DataTypes.STRING(36), primaryKey: true },
  vehicle_model_id: { 
    type: DataTypes.STRING(36), 
    references: { model: "vehicle_models", key: "id" }
  },
  dealer_id: { 
    type: DataTypes.STRING(36), 
    references: { model: "dealers", key: "id" }
  },
  vin: { type: DataTypes.STRING(50), allowNull: true },
  status: { 
    type: DataTypes.ENUM("available","allocated","in_transit","sold","reserved"), 
    defaultValue: "available" 
  },
  location: { type: DataTypes.STRING(200) },
  msrp: { type: DataTypes.DECIMAL(12,2) },
  received_at: { type: DataTypes.DATE },
  allocated_at: { type: DataTypes.DATE },
  sold_at: { type: DataTypes.DATE }
}, {
  tableName: "vehicles_inventory",
  timestamps: true,
});

// Associations
VehicleInventory.belongsTo(VehicleModel, { foreignKey: "vehicle_model_id" });
VehicleInventory.belongsTo(Dealer, { foreignKey: "dealer_id" });

module.exports = VehicleInventory;
