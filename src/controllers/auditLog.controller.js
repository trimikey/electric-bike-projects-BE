const BaseController = require("./base.controller");
const AuditLog = require("../models/AuditLog");

class AuditLogController extends BaseController {
  constructor() {
    super(AuditLog);
  }
}

module.exports = new AuditLogController();
