require("dotenv").config();
const express = require("express");
const cors = require("cors");
  const { sequelize, Role } = require("./models");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middlewares/error.middleware");


const app = express();
app.use(cors());
app.use(express.json());


app.use("/auth", authRoutes);
app.use(errorHandler);


(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    const count = await Role.count();
    if (count === 0) {
      await Role.bulkCreate([
        { id: "11111111-1111-1111-1111-111111111111", name: "Admin" },
        { id: "22222222-2222-2222-2222-222222222222", name: "Dealer Manager" },
        { id: "33333333-3333-3333-3333-333333333333", name: "Dealer Staff" },
        { id: "44444444-4444-4444-4444-444444444444", name: "Customer" },
        { id: "55555555-5555-5555-5555-555555555555", name: "EVM Staff" },
      ]);
      console.log("✅ Roles seeded");
    }
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running at http://0.0.0.0:${PORT}`));
  } catch (err) {
    console.error("❌ Error initializing server:", err);
    process.exit(1);
  }
})();