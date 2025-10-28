const router = require("express").Router();
const controller = require("../controllers/manufacturerOrder.controller");
const { guard } = require("../middlewares/auth.middleware");

router.post("/", guard(["Admin", "EVM Staff"]), controller.create);
router.get("/", guard(["Admin", "EVM Staff"]), controller.list);
router.get("/:id", guard(["Admin", "EVM Staff"]), controller.getById);
router.put("/:id", guard(["Admin", "EVM Staff"]), controller.update);
router.patch(
  "/:id/status",
  guard(["Admin", "EVM Staff"]),
  controller.updateStatus
);
router.delete("/:id", guard(["Admin"]), controller.remove);

module.exports = router;
