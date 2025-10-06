const routerDealer = require("express").Router();
const ctrlD = require("../controllers/dealer.controller");
const guard = require("../middlewares/auth.middleware");
routerDealer.post("/", guard(["Admin", "EVM Staff"]), ctrlD.create);
routerDealer.get("/", guard(["Admin", "Dealer Manager", "EVM Staff"]), ctrlD.list);
routerDealer.put("/:id", guard(["Admin", "EVM Staff"]), ctrlD.update);
routerDealer.delete("/:id", guard(["Admin"]), ctrlD.remove);
module.exports = routerDealer;