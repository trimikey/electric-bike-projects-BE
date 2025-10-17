const express = require("express");
const router = express.Router();
const vehicleCtrl = require("../controllers/vehicle.controller");
const { verifyToken, guard } = require("../middlewares/auth.middleware");

// ===========================
// VEHICLE MODELS
// ===========================
router.get("/models", guard(["Admin", "EVM Staff"]), vehicleCtrl.listModels);
router.post("/models", guard(["Admin", "EVM Staff"]), vehicleCtrl.createModel);
router.put("/models/:id", guard(["Admin", "EVM Staff"]), vehicleCtrl.updateModel);
router.delete("/models/:id", guard(["Admin"]), vehicleCtrl.deleteModel);

// ===========================
// VEHICLE VARIANTS
// ===========================
router.get("/variants", guard(["Admin", "EVM Staff"]), vehicleCtrl.listVariants);
router.post("/variants", guard(["Admin", "EVM Staff"]), vehicleCtrl.createVariant);
router.get("/variants/:id", guard(["Admin", "EVM Staff"]), vehicleCtrl.getVariant);
router.put("/variants/:id", guard(["Admin", "EVM Staff"]), vehicleCtrl.updateVariant);
router.delete("/variants/:id", guard(["Admin"]), vehicleCtrl.deleteVariant);

// ===========================
// VEHICLE MODEL SPECS
// ===========================
router.post("/model-specs", guard(["Admin", "EVM Staff"]), vehicleCtrl.attachSpec);

module.exports = router;
