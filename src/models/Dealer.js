const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Dealer = sequelize.define(
  "dealers",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    code: { type: DataTypes.STRING(50), unique: true },
    address: { type: DataTypes.TEXT },
    phone: { type: DataTypes.STRING(50) },
    email: { type: DataTypes.STRING(100) },
    region: { type: DataTypes.STRING(100) },
    manager_id: { type: DataTypes.STRING(36) },
  },
  {
    tableName: "dealers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Dealer;
