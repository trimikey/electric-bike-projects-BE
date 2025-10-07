const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Complaint = sequelize.define("complaints", {
id: { type: DataTypes.CHAR(36), primaryKey: true },
customer_id: { type: DataTypes.CHAR(36), allowNull: false },
dealer_id: { type: DataTypes.CHAR(36) },
order_id: { type: DataTypes.CHAR(36) },
description: { type: DataTypes.TEXT, allowNull: false },
status: { type: DataTypes.ENUM("pending", "in_progress", "resolved", "rejected"), defaultValue: "pending" },
created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
resolved_at: { type: DataTypes.DATE, allowNull: true },
});
module.exports = Complaint;