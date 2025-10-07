const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const VehicleInventory = sequelize.define("vehicle_inventory", {
vin: { type: DataTypes.CHAR(36), primaryKey: true },
variant_id: { type: DataTypes.CHAR(36), allowNull: false },
dealer_id: { type: DataTypes.CHAR(36) },
status: { type: DataTypes.ENUM("in_factory", "in_transit", "in_dealer", "sold"), defaultValue: "in_factory" },
manufactured_at: { type: DataTypes.DATEONLY },
});
module.exports = VehicleInventory;