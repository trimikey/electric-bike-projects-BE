const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");




router.post("/customers/register", AuthController.registerCustomer);
router.post("/customers/login", AuthController.loginCustomer);
router.post("/customers/google", AuthController.googleLoginCustomer);
router.post("/customers/logout", AuthController.logout);

module.exports = router;
