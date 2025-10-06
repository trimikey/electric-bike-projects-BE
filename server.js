require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./src/config/database");

// 1. Tạo app
const app = express();
app.use(cors());
app.use(express.json());

// Swagger setup
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));





// CORS configuration
app.use(cors({
  origin: "*", // Cho phép tất cả origin (tạm thời)
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


// ⚡ Nếu sau này bạn triển khai production, có thể đổi lại:

// origin: ["http://localhost:3000", "https://yourdomain.com"]



// Import routes
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
const auditLogRoutes = require("./src/routes/auditLog.routes");


// Use routes
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
app.use("/api/audit-logs", auditLogRoutes);




// 3. Khởi chạy server
const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => console.log("✅ Database connected!"))
  .catch((err) => console.error("❌ DB error:", err));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));








