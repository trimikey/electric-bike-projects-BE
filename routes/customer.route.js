const express = require("express");
const routeCustomer = express.Router();
const ctrlC = require("../controllers/customer.controller");
const { guard } = require("../middlewares/auth.middleware");

// ===========================
// CUSTOMER ROUTES
// ===========================
routeCustomer.post("/", guard(["Admin", "EVM Staff"]), ctrlC.createCustomer);
routeCustomer.get("/", guard(["Admin", "EVM Staff"]), ctrlC.listCustomers); 
routeCustomer.get("/me", guard(["Admin", "EVM Staff", "Customer"]), ctrlC.getCurrentCustomer);
routeCustomer.put("/:id", guard(["Admin", "EVM Staff", "Customer"]), ctrlC.updateCustomer);
routeCustomer.delete("/:id", guard(["Admin"]), ctrlC.deleteCustomer);

module.exports = routeCustomer;
