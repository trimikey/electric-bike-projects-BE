const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Customer = sequelize.define("customers", {
id: { type: DataTypes.CHAR(36), primaryKey: true },
full_name: { type: DataTypes.STRING(150), allowNull: false },
phone: { type: DataTypes.STRING(20), allowNull: true, unique: true  },
email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
address: { type: DataTypes.STRING(255) },
dob: { type: DataTypes.DATEONLY },
created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
module.exports = Customer;