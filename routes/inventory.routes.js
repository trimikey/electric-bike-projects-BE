const router = require("express").Router();
const controller = require("../controllers/inventoryAdmin.controller");
const { guard } = require("../middlewares/auth.middleware");

router.get(
  "/dealers",
  guard(["Admin", "EVM Staff", "Dealer Manager", "Dealer Staff"]),
  controller.getDealersInventory
);

router.post(
  "/dealers/adjust",
  guard(["Admin", "EVM Staff"]),
  controller.adjustDealerInventory
);

module.exports = router;



