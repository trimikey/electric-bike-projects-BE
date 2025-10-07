const routerVeh = require("express").Router();
const ctrlV = require("../controllers/vehicle.controller");
const guardV = require("../middlewares/auth.middleware");
routerVeh.post("/models", guardV(["Admin", "EVM Staff"]), ctrlV.createModel);
routerVeh.get("/models", ctrlV.listModels);
routerVeh.post("/variants", guardV(["Admin", "EVM Staff"]), ctrlV.createVariant);
routerVeh.get("/variants", ctrlV.listVariants);
routerVeh.post("/model-specs", guardV(["Admin", "EVM Staff"]), ctrlV.attachSpec);
module.exports = routerVeh;