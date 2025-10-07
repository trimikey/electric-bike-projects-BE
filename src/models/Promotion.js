const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Promotion = sequelize.define(
  "promotions",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    dealer_id: { type: DataTypes.STRING(36), allowNull: false },
    title: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT },
    discount_percent: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: false },
  },
  {
    tableName: "promotions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Promotion;
