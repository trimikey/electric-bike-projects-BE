const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Appointment = sequelize.define("Appointment", {
  id: { type: DataTypes.STRING(36), primaryKey: true },
  dealer_id: { type: DataTypes.STRING(36) },
  customer_id: { type: DataTypes.STRING(36) },
  user_id: { type: DataTypes.STRING(36) },
  appt_type: { type: DataTypes.ENUM("test_drive","consultation") },
  status: { type: DataTypes.ENUM("scheduled","completed","cancelled","no_show"), defaultValue: "scheduled" },
  scheduled_at: { type: DataTypes.DATE },
  notes: { type: DataTypes.TEXT }
}, {
  tableName: "appointments",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = Appointment;
