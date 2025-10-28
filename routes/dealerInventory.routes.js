const router = require("express").Router();
const controller = require("../controllers/dealerInventory.controller");
const { guard } = require("../middlewares/auth.middleware");

router.post(
  "/",
  guard(["Admin", "EVM Staff"]),
  controller.create
);

router.get(
  "/",
  guard(["Admin", "EVM Staff", "Dealer Manager", "Dealer Staff"]),
  controller.list
);



module.exports = router;
