const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Shipment = sequelize.define("shipments", {
id: { type: DataTypes.CHAR(36), primaryKey: true },
type: { type: DataTypes.ENUM("factory_to_dealer", "dealer_to_customer"), allowNull: false },
dealer_id: { type: DataTypes.CHAR(36), allowNull: false },
order_id: { type: DataTypes.CHAR(36), allowNull: true },
status: { type: DataTypes.ENUM("pending", "in_transit", "delivered", "failed"), defaultValue: "pending" },
shipped_at: { type: DataTypes.DATE },
delivered_at: { type: DataTypes.DATE },
delivery_address: { type: DataTypes.STRING(255) }, // bổ sung theo yêu cầu mới
});
module.exports = Shipment;