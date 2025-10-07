const { v4: uuidv4 } = require("uuid");
const {
  sequelize,
  ManufacturerInventory,
  DealerInventory,
  ManufacturerOrder,
  VehicleInventory,
} = require("../models");

exports.applyInboundToDealer = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { manufacturer_order_id, dealer_id } = req.body;
    if (!manufacturer_order_id || !dealer_id) {
      return res.status(400).json({ message: "manufacturer_order_id và dealer_id là bắt buộc" });
    }

    const manufacturerOrder = await ManufacturerOrder.findByPk(manufacturer_order_id, {
      include: [{ association: "allocations" }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!manufacturerOrder) {
      await transaction.rollback();
      return res.status(404).json({ message: "Manufacturer order not found" });
    }

    for (const allocation of manufacturerOrder.allocations || []) {
      const factoryStock = await ManufacturerInventory.findOne({
        where: { variant_id: allocation.variant_id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!factoryStock || factoryStock.quantity < allocation.quantity) {
        throw new Error("Insufficient factory inventory");
      }

      await factoryStock.update({ quantity: factoryStock.quantity - allocation.quantity }, { transaction });

      const dealerStock = await DealerInventory.findOne({
        where: { dealer_id, variant_id: allocation.variant_id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!dealerStock) {
        await DealerInventory.create(
          {
            id: uuidv4(),
            dealer_id,
            variant_id: allocation.variant_id,
            quantity: allocation.quantity,
          },
          { transaction }
        );
      } else {
        await dealerStock.update({ quantity: dealerStock.quantity + allocation.quantity }, { transaction });
      }

      for (let index = 0; index < allocation.quantity; index += 1) {
        await VehicleInventory.create(
          {
            id: uuidv4(),
            variant_id: allocation.variant_id,
            dealer_id,
            status: "in_dealer",
            vin: uuidv4(),
          },
          { transaction }
        );
      }
    }

    await manufacturerOrder.update({ status: "completed" }, { transaction });
    await transaction.commit();

    res.json({ message: "Inbound applied" });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ message: error.message });
  }
};
