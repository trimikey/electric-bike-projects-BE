const express = require("express");
const router = express.Router();
const VehicleModelController = require("../controllers/vehicleModel.controller");

// CRUD mặc định
router.get("/", VehicleModelController.getAll);
router.get("/:id", VehicleModelController.getById);
router.post("/", VehicleModelController.create);
router.put("/:id", VehicleModelController.update);
router.delete("/:id", VehicleModelController.delete);

// Custom
router.get("/brand/:brand", VehicleModelController.getByBrand);

module.exports = router;
