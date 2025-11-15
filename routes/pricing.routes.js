const router = require("express").Router();
const controller = require("../controllers/pricing.controller");
const { guard } = require("../middlewares/auth.middleware");

router.get(
  "/quote",
  guard(["Admin", "EVM Staff", "Dealer Manager", "Dealer Staff"]),
  controller.quote
);

module.exports = router;


