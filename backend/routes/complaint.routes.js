const routerC = require("express").Router();
const ctrlC = require("../controllers/complaint.controller");
const guardC = require("../middlewares/auth.middleware");
routerC.post("/", guardC(["Customer", "Admin", "Dealer Staff", "Dealer Manager"]), ctrlC.create);
routerC.post("/resolve", guardC(["Admin", "Dealer Manager"]), ctrlC.resolve);
module.exports = routerC;