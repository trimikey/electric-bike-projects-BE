const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Spec = sequelize.define("Spec", {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
  },
  category: {
    type: DataTypes.STRING(100),
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING(50),
  },
}, {
  tableName: "specs",
  timestamps: false,
});

module.exports = Spec;
