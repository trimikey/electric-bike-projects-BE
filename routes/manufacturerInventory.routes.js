const router = require("express").Router();
const controller = require("../controllers/manufacturerInventory.controller");
const { guard } = require("../middlewares/auth.middleware");

router.post("/", guard(["Admin", "EVM Staff"]), controller.create);
router.get("/", guard(["Admin", "EVM Staff"]), controller.list);
router.get("/:id", guard(["Admin", "EVM Staff"]), controller.getById);
router.put("/:id", guard(["Admin", "EVM Staff"]), controller.update);
router.delete("/:id", guard(["Admin"]), controller.remove);

module.exports = router;
