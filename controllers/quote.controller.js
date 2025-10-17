const { v4: uuidv4 } = require("uuid");
const { Quote, Customer, Dealer, VehicleVariant } = require("../models");

const quoteIncludes = [
  { model: Customer, as: "customer", attributes: ["id", "full_name", "email", "phone"] },
  { model: Dealer, as: "dealer", attributes: ["id", "name", "email", "phone"] },
  { model: VehicleVariant, as: "variant", attributes: ["id", "model_id", "version", "color", "base_price"] },
];

exports.create = async (req, res) => {
  try {
    const { customer_id, dealer_id, variant_id, price } = req.body;
    if (!customer_id || !dealer_id || !variant_id || price === undefined || price === null) {
      return res.status(400).json({ message: "customer_id, dealer_id, variant_id và price là bắt buộc" });
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: "price phải lớn hơn 0" });
    }

    const [customer, dealer, variant] = await Promise.all([
      Customer.findByPk(customer_id),
      Dealer.findByPk(dealer_id),
      VehicleVariant.findByPk(variant_id),
    ]);

    if (!customer) return res.status(404).json({ message: "Customer không tồn tại" });
    if (!dealer) return res.status(404).json({ message: "Dealer không tồn tại" });
    if (!variant) return res.status(404).json({ message: "Variant không tồn tại" });

    const quote = await Quote.create({
      id: uuidv4(),
      customer_id,
      dealer_id,
      variant_id,
      price: numericPrice,
    });

    const payload = await Quote.findByPk(quote.id, { include: quoteIncludes });
    res.status(201).json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const quotes = await Quote.findAll({ include: quoteIncludes });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const quote = await Quote.findByPk(id, { include: quoteIncludes });
    if (!quote) return res.status(404).json({ message: "Quote không tồn tại" });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_id, dealer_id, variant_id, price } = req.body;

    const quote = await Quote.findByPk(id);
    if (!quote) return res.status(404).json({ message: "Quote không tồn tại" });

    if (customer_id) {
      const customer = await Customer.findByPk(customer_id);
      if (!customer) return res.status(404).json({ message: "Customer không tồn tại" });
      quote.customer_id = customer_id;
    }

    if (dealer_id) {
      const dealer = await Dealer.findByPk(dealer_id);
      if (!dealer) return res.status(404).json({ message: "Dealer không tồn tại" });
      quote.dealer_id = dealer_id;
    }

    if (variant_id) {
      const variant = await VehicleVariant.findByPk(variant_id);
      if (!variant) return res.status(404).json({ message: "Variant không tồn tại" });
      quote.variant_id = variant_id;
    }

    if (price !== undefined) {
      if (price === null) {
        return res.status(400).json({ message: "price không được null" });
      }
      const numericPrice = Number(price);
      if (Number.isNaN(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ message: "price phải lớn hơn 0" });
      }
      quote.price = numericPrice;
    }

    await quote.save();
    const payload = await Quote.findByPk(quote.id, { include: quoteIncludes });
    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const quote = await Quote.findByPk(id);
    if (!quote) return res.status(404).json({ message: "Quote không tồn tại" });
    await quote.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
