const routerTD = require("express").Router();
const ctrlTD = require("../controllers/testDrive.controller");
const { guard } = require("../middlewares/auth.middleware");
routerTD.post("/schedule", guard(["Dealer Staff", "Dealer Manager", "Admin"]), ctrlTD.schedule);
module.exports = routerTD;                                                                                  