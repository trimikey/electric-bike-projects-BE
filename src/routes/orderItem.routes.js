const express = require("express");
const router = express.Router();
const OrderItemController = require("../controllers/orderItem.controller");

router.get("/", OrderItemController.getAll);
router.get("/:id", OrderItemController.getById);
router.post("/", OrderItemController.create);
router.put("/:id", OrderItemController.update);
router.delete("/:id", OrderItemController.delete);

module.exports = router;
