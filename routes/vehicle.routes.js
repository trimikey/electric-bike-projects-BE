const express = require("express");
const router = express.Router();
const vehicleCtrl = require("../controllers/vehicle.controller");
const { verifyToken, guard } = require("../middlewares/auth.middleware");

// ===========================
// VEHICLE MODELS
// ===========================
// router.get("/models", guard(["Admin", "EVM Staff", "Customer"]), vehicleCtrl.listModels);
// router.post("/models", guard(["Admin", "EVM Staff"]), vehicleCtrl.createModel);
// router.put("/models/:id", guard(["Admin", "EVM Staff"]), vehicleCtrl.updateModel);
// router.delete("/models/:id", guard(["Admin"]), vehicleCtrl.deleteModel);



// ===========================
// VEHICLE MODELS - CUSTOMER ACCESS
// ===========================
router.get("/models", guard(["Admin", "EVM Staff", "Customer","Dealer Staff"]), vehicleCtrl.listModels);
router.post("/models", guard(["Admin", "EVM Staff", "Customer","Dealer Staff"]), vehicleCtrl.createModel);
router.put("/models/:id", guard(["Admin", "EVM Staff", "Customer","Dealer Staff"]), vehicleCtrl.updateModel);
router.delete("/models/:id", guard(["Admin", "Customer","Dealer Staff"]), vehicleCtrl.deleteModel);




// ===========================
// VEHICLE VARIANTS
// ===========================
// router.get("/variants", guard(["Admin", "EVM Staff"]), vehicleCtrl.listVariants);
// router.post("/variants", guard(["Admin", "EVM Staff"]), vehicleCtrl.createVariant);
// router.get("/variants/:id", guard(["Admin", "EVM Staff"]), vehicleCtrl.getVariant);
// router.put("/variants/:id", guard(["Admin", "EVM Staff"]), vehicleCtrl.updateVariant);
// router.delete("/variants/:id", guard(["Admin"]), vehicleCtrl.deleteVariant);


// ===========================
// VEHICLE VARIANTS - CUSTOMER ACCESS
// ===========================
router.get("/variants", guard(["Admin", "EVM Staff", "Customer"]), vehicleCtrl.listVariants);
router.post("/variants", guard(["Admin", "EVM Staff", "Customer"]), vehicleCtrl.createVariant);
router.get("/variants/:id", guard(["Admin", "EVM Staff", "Customer"]), vehicleCtrl.getVariant);
router.put("/variants/:id", guard(["Admin", "EVM Staff", "Customer"]), vehicleCtrl.updateVariant);
router.delete("/variants/:id", guard(["Admin", "Customer"]), vehicleCtrl.deleteVariant);

// ===========================
// VEHICLE MODEL SPECS
// ===========================
// router.post("/model-specs", guard(["Admin", "EVM Staff"]), vehicleCtrl.attachSpec);


// ===========================
// VEHICLE MODEL SPECS - CUSTOMER ACCESS
// ===========================


router.post("/model-specs", guard(["Admin", "EVM Staff", "Customer"]), vehicleCtrl.attachSpec);


module.exports = router;
