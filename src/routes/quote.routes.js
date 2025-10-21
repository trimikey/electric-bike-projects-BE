const express = require("express");
const router = express.Router();
const QuoteController = require("../controllers/quote.controller");

router.get("/", QuoteController.getAll);
router.get("/:id", QuoteController.getById);
router.post("/", QuoteController.create);
router.put("/:id", QuoteController.update);
router.delete("/:id", QuoteController.delete);

module.exports = router;
