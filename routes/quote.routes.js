const routerQuote = require("express").Router();
const ctrlQ = require("../controllers/quote.controller");
const { guard } = require("../middlewares/auth.middleware");

routerQuote.post(
  "/",
  guard(["Dealer Staff", "Dealer Manager", "Admin", "EVM Staff"]),
  ctrlQ.create
);

routerQuote.get(
  "/",
  guard(["Dealer Staff", "Dealer Manager", "Admin", "EVM Staff"]),
  ctrlQ.list
);

routerQuote.get(
  "/:id",
  guard(["Dealer Staff", "Dealer Manager", "Admin", "EVM Staff"]),
  ctrlQ.getById
);

routerQuote.put(
  "/:id",
  guard(["Dealer Staff", "Dealer Manager", "Admin"]),
  ctrlQ.update
);

routerQuote.delete(
  "/:id",
  guard(["Dealer Manager", "Admin"]),
  ctrlQ.remove
);

module.exports = routerQuote;
