require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
require("./models/associations");
const { sequelize, Role } = require("./models");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const errorHandler = require("./middlewares/error.middleware");


    

const app = express();
// ✅ Cấu hình CORS chi tiết
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, Accept");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(cors()); // đảm bảo các request thường cũng có CORS
app.options(/(.*)/, cors()); // preflight
app.use(express.json());


// Swagger setup
const swaggerPath = path.join(__dirname, "swagger.yaml"); 
console.log("📄 Loading Swagger from:", swaggerPath);

const swaggerDocument = YAML.load(swaggerPath);
console.log("✅ Swagger loaded:", !!swaggerDocument);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs.json", (req, res) => {
  res.json(swaggerDocument);
});



// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
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
