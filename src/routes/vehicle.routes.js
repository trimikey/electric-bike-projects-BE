const express = require("express");
const router = express.Router();
const controller = require("../controllers/vehicleCatalog.controller");

router.post("/models", controller.createModel);
router.get("/models", controller.listModels);
router.post("/variants", controller.createVariant);
router.get("/variants", controller.listVariants);
router.post("/specs", controller.createSpec);
router.post("/model-specs", controller.attachSpec);

module.exports = router;
