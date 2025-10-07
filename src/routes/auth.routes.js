const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");

router.post(
  "/register",
  [
    body("username").isLength({ min: 3 }).withMessage("Username phải có ít nhất 3 ký tự"),
    body("email").isEmail().withMessage("Email không hợp lệ"),
    body("password").isLength({ min: 6 }).withMessage("Password phải có ít nhất 6 ký tự"),
    body("role")
      .optional()
      .isIn(["dealer_staff", "dealer_manager", "evm_staff", "admin", "customer"])
      .withMessage("Role không hợp lệ"),
  ],
  AuthController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email không hợp lệ"),
    body("password").notEmpty().withMessage("Password không được bỏ trống"),
  ],
  AuthController.login
);

router.post("/customers/register", AuthController.registerCustomer);
router.post("/customers/login", AuthController.loginCustomer);
router.post("/customers/google", AuthController.googleLoginCustomer);
router.post("/customers/logout", AuthController.logout);

module.exports = router;
