const { Sequelize } = require("sequelize");

const {
  DB_NAME,
  DB_USER,
  DB_PASS,
  DB_HOST,
  DB_PORT,
  NODE_ENV,
} = process.env;

const sequelize = new Sequelize(
  DB_NAME || "electric_bike",
  DB_USER || "root",
  DB_PASS || "",
  {
    host: DB_HOST || "127.0.0.1",
    port: DB_PORT ? Number(DB_PORT) : 3306,
    dialect: "mysql",
    logging: NODE_ENV === "development" ? console.log : false,
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
    },
  }
);

module.exports = sequelize;
