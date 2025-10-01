const express = require("express");
const sequelize = require("./src/config/database");
require("dotenv").config();

const app = express();
app.use(express.json());


// Import routes
const userRoutes = require("./src/routes/user.routes");
const vehicleRoutes = require("./src/routes/vehicle.routes");
const vehicleModelRoutes = require("./src/routes/vehicleModel.routes");
const vehicleInventoryRoutes = require("./src/routes/vehicleInventory.routes");

app.use("/api/users", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/vehicle-models", vehicleModelRoutes);
app.use("/api/vehicles-inventory", vehicleInventoryRoutes);

// Test DB connection
sequelize.authenticate()
  .then(() => {
    console.log("✅ Database connected!");
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });

app.get("/", (req, res) => {
  res.send("EV Dealer API Running 🚗⚡");
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
