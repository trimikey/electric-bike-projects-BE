const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Order = sequelize.define("orders", {
id: { type: DataTypes.CHAR(36), primaryKey: true },
customer_id: { type: DataTypes.CHAR(36), allowNull: false },
dealer_id: { type: DataTypes.CHAR(36), allowNull: false },
variant_id: { type: DataTypes.CHAR(36), allowNull: false },
order_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
status: {
type: DataTypes.ENUM("pending", "confirmed", "shipped", "delivered", "cancelled"),
defaultValue: "pending",
},
total_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
});
module.exports = Order;