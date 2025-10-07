const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Quote = sequelize.define(
  "quotes",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    dealer_id: { type: DataTypes.STRING(36) },
    customer_id: { type: DataTypes.STRING(36) },
    user_id: { type: DataTypes.STRING(36) },
    variant_id: { type: DataTypes.STRING(36) },
    valid_until: { type: DataTypes.DATE },
    price: { type: DataTypes.DECIMAL(15, 2) },
    total_amount: { type: DataTypes.DECIMAL(14, 2) },
    status: {
      type: DataTypes.ENUM("draft", "sent", "accepted", "rejected", "expired"),
      defaultValue: "draft",
    },
  },
  {
    tableName: "quotes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Quote;
