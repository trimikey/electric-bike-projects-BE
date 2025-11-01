const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/order.controller");

router.get("/", OrderController.getAll);
router.get("/:id", OrderController.getById);
router.post("/", OrderController.create);
router.put("/:id", OrderController.update);
router.delete("/:id", OrderController.delete);

router.post("/create-from-quote", OrderController.createOrderFromQuote);
router.post("/confirm", OrderController.confirmOrder);
router.post("/pay", OrderController.payOrder);
router.post("/shipments", OrderController.createShipment);
router.post("/shipments/delivered", OrderController.markDelivered);

module.exports = router;
