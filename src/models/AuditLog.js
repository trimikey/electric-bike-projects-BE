const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AuditLog = sequelize.define("AuditLog", {
  id: { type: DataTypes.STRING(36), primaryKey: true },
  entity_id: { type: DataTypes.STRING(36) },
  performed_by: { type: DataTypes.STRING(36) },
  entity_name: { type: DataTypes.STRING(100) },
  action: { type: DataTypes.STRING(50) },
  payload: { type: DataTypes.JSON }
}, {
  tableName: "audit_logs",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = AuditLog;
