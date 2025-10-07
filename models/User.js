const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = sequelize.define("users", {
id: { type: DataTypes.CHAR(36), primaryKey: true },
username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
password_hash: { type: DataTypes.STRING(255), allowNull: false },
phone: { type: DataTypes.STRING(20) },
role_id: { type: DataTypes.CHAR(36), allowNull: false },
created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
module.exports = User;