const express = require("express");
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  googleLoginCustomer,
  logout,
} = require("../controllers/auth.controller");

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.post("/google", googleLoginCustomer);
router.post("/logout", logout);

module.exports = router;
