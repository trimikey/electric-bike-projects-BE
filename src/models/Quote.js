const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Quote = sequelize.define("Quote", {
  id: { type: DataTypes.STRING(36), primaryKey: true },
  dealer_id: { type: DataTypes.STRING(36) },
  customer_id: { type: DataTypes.STRING(36) },
  user_id: { type: DataTypes.STRING(36) },
  valid_until: { type: DataTypes.DATE },
  total_amount: { type: DataTypes.DECIMAL(14,2) },
  status: { type: DataTypes.ENUM("draft","sent","accepted","rejected","expired") }
}, {
  tableName: "quotes",
  timestamps: true
});

module.exports = Quote;
