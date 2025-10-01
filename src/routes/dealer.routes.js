const express = require("express");
const router = express.Router();
const DealerController = require("../controllers/dealer.controller");

router.get("/", DealerController.getAll);
router.get("/:id", DealerController.getById);
router.post("/", DealerController.create);
router.put("/:id", DealerController.update);
router.delete("/:id", DealerController.delete);

module.exports = router;
