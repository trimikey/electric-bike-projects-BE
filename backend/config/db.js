// const { Sequelize } = require("sequelize");
// const sequelize = new Sequelize(
// process.env.DB_NAME || "electric_bike",
// process.env.DB_USER || "root",
// process.env.DB_PASS || "12345678",
// {
// host: process.env.DB_HOST || "localhost",
// dialect: "mysql",
// logging: false,
// define: { timestamps: false },
// }
// );


// module.exports = sequelize;
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("fa25_swd301_se1849_g4_electric_bike", "root", "12345678", {
  host: "localhost",
  dialect: "mysql",
    logging: false, // tắt log SQL cho gọn

});
// sequelize.sync({ force: true });
sequelize.sync();                 // ✅ Chỉ tạo bảng nếu chưa có



module.exports = sequelize;
