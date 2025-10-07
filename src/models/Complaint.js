const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Complaint = sequelize.define(
  "complaints",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    order_id: { type: DataTypes.STRING(36) },
    dealer_id: { type: DataTypes.STRING(36) },
    customer_id: { type: DataTypes.STRING(36), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM("submitted", "in_progress", "resolved", "dismissed"),
      defaultValue: "submitted",
    },
    resolved_at: { type: DataTypes.DATE },
  },
  {
    tableName: "complaints",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Complaint;
