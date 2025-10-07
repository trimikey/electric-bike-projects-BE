const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const TestDrive = sequelize.define("test_drives", {
id: { type: DataTypes.CHAR(36), primaryKey: true },
customer_id: { type: DataTypes.CHAR(36), allowNull: false },
dealer_id: { type: DataTypes.CHAR(36), allowNull: false },
vehicle_model_id: { type: DataTypes.CHAR(36), allowNull: false },
staff_id: { type: DataTypes.CHAR(36) },
schedule_at: { type: DataTypes.DATE, allowNull: false },
status: { type: DataTypes.ENUM("scheduled", "completed", "cancelled"), defaultValue: "scheduled" },
notes: { type: DataTypes.TEXT },
});
module.exports = TestDrive;