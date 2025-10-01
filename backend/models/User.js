// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: true },
  phonenumber: { type: DataTypes.STRING, allowNull: true },
  role: { type: DataTypes.ENUM("user", "admin"), defaultValue: "user" },
  googleId: { type: DataTypes.STRING, allowNull: true }, // để login Google
});

module.exports = User;
