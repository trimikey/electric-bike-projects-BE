const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Role = sequelize.define("roles", {
id: { type: DataTypes.CHAR(36), primaryKey: true },
name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
});
module.exports = Role;