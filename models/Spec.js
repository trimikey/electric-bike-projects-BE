const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Spec = sequelize.define("specs", {
id: { type: DataTypes.CHAR(36), primaryKey: true },
category: { type: DataTypes.STRING(100), allowNull: false },
name: { type: DataTypes.STRING(150), allowNull: false },
unit: { type: DataTypes.STRING(50) },
});
module.exports = Spec;