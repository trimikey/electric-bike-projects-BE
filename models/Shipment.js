// models/Shipment.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Shipment = sequelize.define(
  "shipments",
  {
    id: { type: DataTypes.CHAR(36), primaryKey: true },
    type: {
      type: DataTypes.ENUM("factory_to_dealer", "dealer_to_customer"),
      allowNull: false,
    },
    dealer_id: { type: DataTypes.CHAR(36), allowNull: false },
    order_id: { type: DataTypes.CHAR(36), allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "in_transit", "delivered", "failed"),
      defaultValue: "pending",
      allowNull: false,
    },
    shipped_at: { type: DataTypes.DATE, allowNull: true },
    delivered_at: { type: DataTypes.DATE, allowNull: true },
    delivery_address: { type: DataTypes.STRING(255), allowNull: true }, // required if dealer_to_customer
  },
  {
    tableName: "shipments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Shipment;
