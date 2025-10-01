const BaseController = require("./base.controller");
const Quote = require("../models/Quote");

class QuoteController extends BaseController {
  constructor() {
    super(Quote);
  }
}

module.exports = new QuoteController();
