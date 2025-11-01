const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Shipment = sequelize.define(
  "shipments",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    order_id: { type: DataTypes.STRING(36) },
    dealer_id: { type: DataTypes.STRING(36) },
    type: {
      type: DataTypes.ENUM("factory_to_dealer", "dealer_to_customer"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "in_transit", "delivered", "cancelled"),
      defaultValue: "pending",
    },
    shipped_at: { type: DataTypes.DATE },
    delivered_at: { type: DataTypes.DATE },
    delivery_address: { type: DataTypes.STRING(255) },
  },
  {
    tableName: "shipments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Shipment;
