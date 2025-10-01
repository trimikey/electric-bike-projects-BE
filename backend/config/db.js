// const mysql = require("mysql2/promise");
// require("dotenv").config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASS || "12345678",
//   database: process.env.DB_NAME || "electric_bike",
// });

// module.exports = pool;

// config/db.js
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("electric_bike", "root", "12345678", {
  host: "localhost",
  dialect: "mysql",
    logging: false, // tắt log SQL cho gọn

});

module.exports = sequelize;
