const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");

// validate body trước khi tới controller
router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3 }).withMessage("Username phải có ít nhất 3 ký tự"),
    body("email")
      .isEmail().withMessage("Email không hợp lệ"),
    body("password")
      .isLength({ min: 6 }).withMessage("Password phải có ít nhất 6 ký tự"),
    body("role")
      .isIn(["dealer_staff", "dealer_manager", "evm_staff", "admin"])
      .withMessage("Role không hợp lệ")
  ],
  AuthController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email không hợp lệ"),
    body("password").notEmpty().withMessage("Password không được bỏ trống")
  ],
  AuthController.login
);

module.exports = router;
