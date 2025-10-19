const express = require("express");
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  googleLoginCustomer,
  logout,
  refreshTokenCustomer,
} = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { getProfile } = require("../controllers/auth.controller");



router.get("/profile", verifyToken, getProfile);
router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.post("/google", googleLoginCustomer);
router.post("/logout", logout);
router.post("/refresh-token", refreshTokenCustomer);


module.exports = router;
