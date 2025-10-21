const express = require("express");
const router = express.Router();
const CustomerController = require("../controllers/customer.controller");

router.get("/", CustomerController.getAll);
router.get("/:id", CustomerController.getById);
router.post("/", CustomerController.create);
router.put("/:id", CustomerController.update);
router.delete("/:id", CustomerController.delete);

module.exports = router;
