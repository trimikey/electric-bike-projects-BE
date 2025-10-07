const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const InboundAllocation = sequelize.define("inbound_allocations", {
id: { type: DataTypes.CHAR(36), primaryKey: true },
manufacturer_order_id: { type: DataTypes.CHAR(36), allowNull: false },
variant_id: { type: DataTypes.CHAR(36), allowNull: false },
quantity: { type: DataTypes.INTEGER, allowNull: false },
allocated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
module.exports = InboundAllocation;