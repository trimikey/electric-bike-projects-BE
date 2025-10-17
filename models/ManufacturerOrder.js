const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const ManufacturerOrder = sequelize.define("manufacturer_orders", {
id: { type: DataTypes.CHAR(36), primaryKey: true },
dealer_id: { type: DataTypes.CHAR(36), allowNull: false },
created_by: { type: DataTypes.CHAR(36), allowNull: false },
status: { type: DataTypes.ENUM("pending", "confirmed", "shipped", "completed", "cancelled"), defaultValue: "pending" },
expected_delivery: { type: DataTypes.DATEONLY },
notes: { type: DataTypes.TEXT },
});
module.exports = ManufacturerOrder;