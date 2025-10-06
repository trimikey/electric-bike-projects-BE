const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Quote = sequelize.define("quotes", {
id: { type: DataTypes.CHAR(36), primaryKey: true },
customer_id: { type: DataTypes.CHAR(36), allowNull: false },
dealer_id: { type: DataTypes.CHAR(36), allowNull: false },
variant_id: { type: DataTypes.CHAR(36), allowNull: false },
price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
module.exports = Quote;