const express = require("express");
const router = express.Router();
const controller = require("../controllers/testDrive.controller");

router.post("/schedule", controller.scheduleTestDrive);

module.exports = router;
