const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Dealer = sequelize.define("dealers", {
id: { type: DataTypes.CHAR(36), primaryKey: true },
name: { type: DataTypes.STRING(150), allowNull: false },
address: { type: DataTypes.STRING(255) },
phone: { type: DataTypes.STRING(20) },
email: { type: DataTypes.STRING(100) },
manager_id: { type: DataTypes.CHAR(36) },
created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
module.exports = Dealer;