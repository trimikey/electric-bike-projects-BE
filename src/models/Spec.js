const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Spec = sequelize.define(
  "specs",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    unit: { type: DataTypes.STRING(50) },
  },
  {
    tableName: "specs",
    timestamps: false,
  }
);

module.exports = Spec;
