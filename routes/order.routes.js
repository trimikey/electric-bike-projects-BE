const routerOrder = require("express").Router();
const ctrlO = require("../controllers/order.controller");
const guardO = require("../middlewares/auth.middleware");
routerOrder.post("/from-quote", guardO(["Dealer Staff", "Dealer Manager", "Admin"]), ctrlO.createOrderFromQuote);
routerOrder.post("/confirm", guardO(["Dealer Manager", "Admin"]), ctrlO.confirmOrder);
routerOrder.post("/pay", guardO(["Dealer Staff", "Dealer Manager", "Admin"]), ctrlO.payOrder);
routerOrder.post("/shipment", guardO(["Dealer Staff", "Dealer Manager", "Admin"]), ctrlO.createShipment);
routerOrder.post("/shipment/delivered", guardO(["Dealer Staff", "Dealer Manager", "Admin"]), ctrlO.markDelivered);
module.exports = routerOrder;