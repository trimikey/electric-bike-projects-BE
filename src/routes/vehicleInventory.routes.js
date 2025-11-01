const express = require("express");
const router = express.Router();
const VehicleInventoryController = require("../controllers/vehicleInventory.controller");

// CRUD mặc định
router.get("/", VehicleInventoryController.getAll);
router.get("/:id", VehicleInventoryController.getById);
router.post("/", VehicleInventoryController.create);
router.put("/:id", VehicleInventoryController.update);
router.delete("/:id", VehicleInventoryController.delete);

// Custom
router.get("/status/:status", VehicleInventoryController.getByStatus);
router.get("/dealer/:dealerId", VehicleInventoryController.getByDealer);

module.exports = router;
