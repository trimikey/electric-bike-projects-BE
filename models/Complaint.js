const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Complaint = sequelize.define("complaints", {
    id: { type: DataTypes.CHAR(36), primaryKey: true },
    customer_id: { type: DataTypes.CHAR(36), allowNull: false },
    dealer_id: { type: DataTypes.CHAR(36) },
    description: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM("pending", "in_progress", "resolved", "rejected"), defaultValue: "pending" },
    resolved_at: { type: DataTypes.DATE, allowNull: true },
});
module.exports = Complaint;



//     SELECT * FROM fa25_swd301_se1849_g4_electric_bike.complaints;

// ALTER TABLE complaints
// DROP COLUMN order_id;

// ALTER TABLE complaints
// DROP FOREIGN KEY complaints_ibfk_3;
// order_id: { type: DataTypes.CHAR(36) },