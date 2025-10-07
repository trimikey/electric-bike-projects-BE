const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const InboundAllocation = sequelize.define(
  "inbound_allocations",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    manufacturer_order_id: { type: DataTypes.STRING(36), allowNull: false },
    variant_id: { type: DataTypes.STRING(36), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    expected_arrival: { type: DataTypes.DATE },
  },
  {
    tableName: "inbound_allocations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = InboundAllocation;
