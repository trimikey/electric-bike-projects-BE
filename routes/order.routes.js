const routerOrder = require("express").Router();
const ctrlO = require("../controllers/order.controller");
const { guard } = require("../middlewares/auth.middleware");

routerOrder.post("/from-quote", guard(["Dealer Staff", "Dealer Manager", "Admin"]), ctrlO.createOrderFromQuote);
routerOrder.post("/confirm", guard(["Dealer Manager", "Admin"]), ctrlO.confirmOrder);
routerOrder.post("/pay", guard(["Dealer Staff", "Dealer Manager", "Admin"]), ctrlO.payOrder);
routerOrder.post("/shipment", guard(["Dealer Staff", "Dealer Manager", "Admin"]), ctrlO.createShipment);
routerOrder.post("/shipment/delivered", guard(["Dealer Staff", "Dealer Manager", "Admin"]), ctrlO.markDelivered);

module.exports = routerOrder;
