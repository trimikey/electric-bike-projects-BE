const routerInv = require("express").Router();
const ctrlI = require("../controllers/inventory.controller");
const guardI = require("../middlewares/auth.middleware");
routerInv.post("/apply-inbound", guardI(["EVM Staff", "Admin"]), ctrlI.applyInboundToDealer);
module.exports = routerInv;