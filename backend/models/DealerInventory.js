const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const DealerInventory = sequelize.define("dealer_inventory", {
id: { type: DataTypes.CHAR(36), primaryKey: true },
dealer_id: { type: DataTypes.CHAR(36), allowNull: false },
variant_id: { type: DataTypes.CHAR(36), allowNull: false },
quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
module.exports = DealerInventory;