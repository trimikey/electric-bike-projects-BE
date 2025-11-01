const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DealerInventory = sequelize.define(
  "dealer_inventory",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    dealer_id: { type: DataTypes.STRING(36), allowNull: false },
    variant_id: { type: DataTypes.STRING(36), allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    tableName: "dealer_inventory",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = DealerInventory;
