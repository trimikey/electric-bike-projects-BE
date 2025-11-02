const router = require("express").Router();
const controller = require("../controllers/shipment.controller");
const { guard } = require("../middlewares/auth.middleware");

// Create shipment
router.post("/", guard(["Dealer Staff", "Dealer Manager", "Admin"]), controller.create);

// List shipments
router.get("/", guard(["Dealer Staff", "Dealer Manager", "Admin"]), controller.list);

// Get shipment detail
router.get("/:id", guard(["Dealer Staff", "Dealer Manager", "Admin"]), controller.getById);

// Update shipment
router.put("/:id", guard(["Dealer Manager", "Admin"]), controller.update);

// Delete shipment
router.delete("/:id", guard(["Admin"]), controller.remove);

module.exports = router;
