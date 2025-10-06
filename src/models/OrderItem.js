const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: "orders",
        key: "id",
      },
    },
    vehicle_model_id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: "vehicle_models",
        key: "id",
      },
    },
    vehicle_inventory_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
      references: {
        model: "vehicles_inventory",
        key: "id",
      },
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unit_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    discount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    tableName: "order_items",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = OrderItem;
