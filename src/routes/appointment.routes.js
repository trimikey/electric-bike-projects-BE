const express = require("express");
const router = express.Router();
const AppointmentController = require("../controllers/appointment.controller");

router.get("/", AppointmentController.getAll);
router.get("/:id", AppointmentController.getById);
router.post("/", AppointmentController.create);
router.put("/:id", AppointmentController.update);
router.delete("/:id", AppointmentController.delete);

module.exports = router;
