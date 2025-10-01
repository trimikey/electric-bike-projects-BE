const BaseController = require("./base.controller");
const Appointment = require("../models/Appointment");

class AppointmentController extends BaseController {
  constructor() {
    super(Appointment);
  }
}

module.exports = new AppointmentController();
