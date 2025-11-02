const express = require("express");
const routeCustomer = express.Router();
const ctrlC = require("../controllers/customer.controller");
const { guard } = require("../middlewares/auth.middleware");

// ===========================
// CUSTOMER ROUTES
// ===========================
routeCustomer.post("/", guard(["Admin", "EVM Staff","Dealer Staff"]), ctrlC.createCustomer);
routeCustomer.get("/", guard(["Admin", "EVM Staff","Dealer Staff"]), ctrlC.listCustomers);
routeCustomer.get("/me", guard(["Admin", "EVM Staff", "Customer","Dealer Staff"]), ctrlC.getCurrentCustomer);
routeCustomer.put("/:id", guard(["Admin", "EVM Staff", "Customer","Dealer Staff"]), ctrlC.updateCustomer);
routeCustomer.delete("/:id", guard(["Admin","Dealer Staff"]), ctrlC.deleteCustomer);



module.exports = routeCustomer;
