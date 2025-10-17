const routerInv = require("express").Router();
const ctrlI = require("../controllers/inventory.controller");
const { guard } = require("../middlewares/auth.middleware");

routerInv.post("/apply-inbound", guard(["EVM Staff", "Admin"]), ctrlI.applyInboundToDealer);

module.exports = routerInv;
