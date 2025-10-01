const express = require("express");
const router = express.Router();
const StockAllocationController = require("../controllers/stockAllocation.controller");

router.get("/", StockAllocationController.getAll);
router.get("/:id", StockAllocationController.getById);
router.post("/", StockAllocationController.create);
router.put("/:id", StockAllocationController.update);
router.delete("/:id", StockAllocationController.delete);

module.exports = router;
