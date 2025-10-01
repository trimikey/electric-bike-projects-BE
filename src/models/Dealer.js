const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Dealer = sequelize.define("Dealer", {
  id: { type: DataTypes.STRING(36), primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  code: { type: DataTypes.STRING(50), unique: true },
  address: { type: DataTypes.TEXT },
  phone: { type: DataTypes.STRING(50) },
  email: { type: DataTypes.STRING(100) },
  region: { type: DataTypes.STRING(100) },
}, {
  tableName: "dealers",
  timestamps: true,
});

module.exports = Dealer;
