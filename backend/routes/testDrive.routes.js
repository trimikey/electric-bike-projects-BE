const routerTD = require("express").Router();
const ctrlTD = require("../controllers/testDrive.controller");
const guardTD = require("../middlewares/auth.middleware");
routerTD.post("/schedule", guardTD(["Dealer Staff", "Dealer Manager", "Admin"]), ctrlTD.schedule);
module.exports = routerTD;