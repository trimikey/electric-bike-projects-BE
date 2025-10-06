const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Promotion = sequelize.define("promotions", {
id: { type: DataTypes.CHAR(36), primaryKey: true },
dealer_id: { type: DataTypes.CHAR(36) },
title: { type: DataTypes.STRING(150), allowNull: false },
description: { type: DataTypes.TEXT },
discount_percent: { type: DataTypes.DECIMAL(5, 2) },
start_date: { type: DataTypes.DATEONLY },
end_date: { type: DataTypes.DATEONLY },
created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
module.exports = Promotion;