const express = require("express");
const sequelize = require("./config/db");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");

const app = express();
const cors = require('cors');   

app.use(express.json());
app.use(cors());
// Routes
app.use("/auth", authRoutes);


// Sync DB
sequelize
  .sync({ alter: true }) // tự tạo bảng nếu chưa có
  .then(() => console.log("✅ Database synced"))
  .catch((err) => console.error("❌ Error syncing DB:", err));

app.listen(5000, '0.0.0.0', () => {
  console.log("🚀 Server running on http://0.0.0.0:5000");
});
