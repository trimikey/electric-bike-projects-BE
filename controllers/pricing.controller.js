const { VehicleVariant, Promotion, Dealer } = require("../models/associations");

exports.quote = async (req, res) => {
  try {
    const { dealerId, variantId, date } = req.query;
    if (!variantId) return res.status(400).json({ message: "variantId is required" });

    const variant = await VehicleVariant.findByPk(variantId);
    if (!variant) return res.status(404).json({ message: "Variant not found" });

    const base = parseFloat(variant.base_price);

    let discountPercent = 0;
    if (dealerId) {
      const now = date ? new Date(date) : new Date();
      const promos = await Promotion.findAll({ where: { dealer_id: dealerId } });
      const active = promos.find((p) => {
        const startOk = !p.start_date || new Date(p.start_date) <= now;
        const endOk = !p.end_date || new Date(p.end_date) >= now;
        return startOk && endOk && p.discount_percent != null;
      });
      if (active) discountPercent = parseFloat(active.discount_percent) || 0;
    }

    const discountAmount = +(base * (discountPercent / 100)).toFixed(2);
    const finalPrice = +(base - discountAmount).toFixed(2);

    res.json({
      variantId,
      dealerId: dealerId || null,
      base_price: base,
      discount_percent_applied: discountPercent,
      final_price: finalPrice,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



