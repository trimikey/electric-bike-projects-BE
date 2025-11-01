const router = require("express").Router();
const controller = require("../controllers/manufacturer.controller");
const { guard } = require("../middlewares/auth.middleware");

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.post("/", guard(["Admin", "EVM Staff"]), controller.create);
router.put("/:id", guard(["Admin", "EVM Staff"]), controller.update);
router.delete("/:id", guard(["Admin"]), controller.remove);

module.exports = router;
