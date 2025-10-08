require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./src/config/database");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

const errorHandler = require("./src/middlewares/error.middleware");

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const dealerRoutes = require("./src/routes/dealer.routes");
const customerRoutes = require("./src/routes/customer.routes");
const vehicleModelRoutes = require("./src/routes/vehicleModel.routes");
const vehicleInventoryRoutes = require("./src/routes/vehicleInventory.routes");
const appointmentRoutes = require("./src/routes/appointment.routes");
const quoteRoutes = require("./src/routes/quote.routes");
const orderRoutes = require("./src/routes/order.routes");
const orderItemRoutes = require("./src/routes/orderItem.routes");
const paymentRoutes = require("./src/routes/payment.routes");
const stockAllocationRoutes = require("./src/routes/stockAllocation.routes");
const vehicleCatalogRoutes = require("./src/routes/vehicle.routes");
const inventoryRoutes = require("./src/routes/inventory.routes");
const testDriveRoutes = require("./src/routes/testDrive.routes");
const complaintRoutes = require("./src/routes/complaint.routes");

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dealers", dealerRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/vehicle-models", vehicleModelRoutes);
app.use("/api/vehicles-inventory", vehicleInventoryRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/order-items", orderItemRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/stock-allocations", stockAllocationRoutes);
app.use("/api/vehicle-catalog", vehicleCatalogRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/test-drives", testDriveRoutes);
app.use("/api/complaints", complaintRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(async () => {
    console.log("✅ Database connected!");
    if (process.env.SEQUELIZE_SYNC === "true") {
      await sequelize.sync();
    }
  })
  .catch((err) => console.error("❌ DB error:", err));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
