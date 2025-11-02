const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Payment = sequelize.define("payments", {
    id: { type: DataTypes.CHAR(36), primaryKey: true },
    order_id: { type: DataTypes.CHAR(36), allowNull: false },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    method: { type: DataTypes.ENUM("cash", "bank_transfer", "installment", "momo", "vnpay"), allowNull: false },
  paid_at: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    status: {
  type: DataTypes.ENUM("pending", "success", "failed"),
  defaultValue: "pending",
}
});
module.exports = Payment;