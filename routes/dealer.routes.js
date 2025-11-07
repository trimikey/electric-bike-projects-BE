const routerDealer = require("express").Router();
const ctrlD = require("../controllers/dealer.controller");
const { guard } = require("../middlewares/auth.middleware");

routerDealer.post("/", guard(["Admin", "EVM Staff","Dealer Staff"]), ctrlD.create);
routerDealer.get("/", guard(["Admin", "Dealer Manager", "EVM Staff","Dealer Staff", "Customer"]), ctrlD.list);
routerDealer.put("/:id", guard(["Admin", "EVM Staff","Dealer Staff"]), ctrlD.update);
routerDealer.delete("/:id", guard(["Admin","Dealer Staff"]), ctrlD.remove);

module.exports = routerDealer;