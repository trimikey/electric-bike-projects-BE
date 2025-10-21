const { v4: uuidv45 } = require("uuid");
const {
  sequelize: sq,
  ManufacturerInventory,
  DealerInventory,
  InboundAllocation,
  ManufacturerOrder,
  VehicleInventory,
} = require("../models");

// Allocate inbound from manufacturer to dealer inventory
exports.applyInboundToDealer = async (req, res) => {
  const t = await sq.transaction();
  try {
    const { manufacturer_order_id, dealer_id } = req.body;
    const mo = await ManufacturerOrder.findByPk(manufacturer_order_id, {
      include: ["allocations"],
    });
    if (!mo)
      return res.status(404).json({ message: "Manufacturer order not found" });

    for (const alloc of mo.allocations) {
      // deduct manufacturer inventory
      const mi = await ManufacturerInventory.findOne({
        where: { variant_id: alloc.variant_id },  
      });
      if (!mi || mi.quantity < alloc.quantity)
        throw new Error("Insufficient factory inventory");
      await mi.update(
        { quantity: mi.quantity - alloc.quantity },
        { transaction: t }
      );

      // add to dealer inventory
      const di = await DealerInventory.findOne({
        where: { dealer_id, variant_id: alloc.variant_id },
      });
      if (!di) {
        await DealerInventory.create(
          {
            id: uuidv45(),
            dealer_id,
            variant_id: alloc.variant_id,
            quantity: alloc.quantity,
          },
          { transaction: t }
        );
      } else {
        await di.update(
          { quantity: di.quantity + alloc.quantity },
          { transaction: t }
        );
      }

      // create VINs at in_transit → in_dealer (simplified create placeholders)
      for (let i = 0; i < alloc.quantity; i++) {
        await VehicleInventory.create(
          {
            vin: uuidv45(),
            variant_id: alloc.variant_id,
            dealer_id,
            status: "in_dealer",
          },
          { transaction: t }
        );
      }
    }

    await mo.update({ status: "completed" }, { transaction: t });

    await t.commit();
    res.json({ message: "Inbound applied" });
  } catch (e) {
    await t.rollback();
    res.status(400).json({ message: e.message });
  }
};
