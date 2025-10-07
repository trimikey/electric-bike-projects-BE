const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TestDrive = sequelize.define(
  "test_drives",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    customer_id: { type: DataTypes.STRING(36), allowNull: false },
    dealer_id: { type: DataTypes.STRING(36), allowNull: false },
    vehicle_model_id: { type: DataTypes.STRING(36), allowNull: false },
    staff_id: { type: DataTypes.STRING(36) },
    scheduled_at: { type: DataTypes.DATE, allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "scheduled", "confirmed", "completed", "cancelled"),
      defaultValue: "pending",
    },
    notes: { type: DataTypes.TEXT },
  },
  {
    tableName: "test_drives",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = TestDrive;
