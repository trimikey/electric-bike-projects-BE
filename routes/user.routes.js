const express = require("express");
const routerUser = express.Router();
const ctrlU = require("../controllers/user.controller");
const { guard } = require("../middlewares/auth.middleware");

// ✅ Login nội bộ
routerUser.post("/login",  ctrlU.loginUser);

// ✅ CRUD cho Admin, EVM Staff
routerUser.get("/", guard(["Admin", "EVM Staff","Dealer Staff","Dealer Manager"]), ctrlU.list);
// routerUser.post("/", guard(["Admin"]), ctrlU.create);
routerUser.post("/", ctrlU.create);
routerUser.put("/:id", guard(["Admin", "EVM Staff"]), ctrlU.update);
routerUser.delete("/:id", guard(["Admin"]), ctrlU.remove);

module.exports = routerUser;
    