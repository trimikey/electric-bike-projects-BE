const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Role = sequelize.define(
  "roles",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  },
  {
    tableName: "roles",
    timestamps: false,
  }
);

module.exports = Role;
