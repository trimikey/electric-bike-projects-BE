const express = require("express");
const router = express.Router();
const controller = require("../controllers/inventory.controller");

router.post("/apply-inbound", controller.applyInboundToDealer);

module.exports = router;
