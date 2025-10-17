const routerC = require("express").Router();
const ctrlC = require("../controllers/complaint.controller");
const { guard } = require("../middlewares/auth.middleware");
routerC.post("/", guard(["Customer", "Admin", "Dealer Staff", "Dealer Manager"]), ctrlC.create);
routerC.post("/resolve", guard(["Admin", "Dealer Manager"]), ctrlC.resolve);
module.exports = routerC;