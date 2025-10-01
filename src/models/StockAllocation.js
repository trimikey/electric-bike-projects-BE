const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const StockAllocation = sequelize.define("StockAllocation", {
  id: { type: DataTypes.STRING(36), primaryKey: true },
  from_evm_staff_id: { type: DataTypes.STRING(36) },
  to_dealer_id: { type: DataTypes.STRING(36) },
  vehicle_inventory_id: { type: DataTypes.STRING(36) },
  qty: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM("allocated","shipped","received") }
}, {
  tableName: "stock_allocations",
  timestamps: true
});

module.exports = StockAllocation;
