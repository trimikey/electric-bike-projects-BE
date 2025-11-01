const routerOrder = require("express").Router();
const ctrlO = require("../controllers/order.controller");
const { guard } = require("../middlewares/auth.middleware");

routerOrder.post("/from-quote", guard(["Dealer Staff", "Dealer Manager", "Admin"]), ctrlO.createOrderFromQuote);
routerOrder.post("/confirm", guard(["Dealer Manager", "Admin"]), ctrlO.confirmOrder);
routerOrder.post("/pay", guard(["Dealer Staff", "Dealer Manager", "Admin"]), ctrlO.payOrder);
routerOrder.post("/shipment", guard(["Dealer Staff", "Dealer Manager", "Admin"]), ctrlO.createShipment);
routerOrder.post("/shipment/delivered", guard(["Dealer Staff", "Dealer Manager", "Admin"]), ctrlO.markDelivered);


// 🔹 Dealer hoặc Customer có thể tạo đơn
routerOrder.post("/", guard(["Customer", "Dealer Manager", "Dealer Staff"]), ctrlO.create);

// 🔹 Lấy tất cả đơn (Admin hoặc Dealer)
routerOrder.get("/", guard(["Admin", "Dealer Manager", "Dealer Staff"]), ctrlO.listAll);

// 🔹 Cập nhật trạng thái đơn hàng
routerOrder.put("/:id/status", guard(["Dealer Manager", "Admin"]), ctrlO.updateStatus);

// 🔹 Xoá đơn hàng
routerOrder.delete("/:id", guard(["Admin"]), ctrlO.remove);


module.exports = routerOrder;
