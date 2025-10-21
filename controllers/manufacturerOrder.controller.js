const { v4: uuidv4 } = require("uuid");
const {
  sequelize,
  ManufacturerOrder,
  InboundAllocation,
  Dealer,
  User,
  VehicleVariant,
} = require("../models/associations");

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "completed",
  "cancelled",
];

const includeRelations = [
  {
    model: Dealer,
    as: "dealer",
    attributes: ["id", "name", "address", "phone", "email"],
  },
  {
    model: User,
    as: "creator",
    attributes: ["id", "username", "email"],
  },
  {
    model: InboundAllocation,
    as: "allocations",
    attributes: ["id", "variant_id", "quantity", "allocated_at"],
    include: [
      {
        model: VehicleVariant,
        as: "variant",
        attributes: ["id", "model_id", "version", "color", "base_price"],
      },
    ],
  },
];

const validateAllocations = async (allocations = []) => {
  if (!Array.isArray(allocations) || allocations.length === 0) {
    return "allocations must be a non-empty array";
  }

  for (const item of allocations) {
    if (!item || !item.variant_id) {
      return "Each allocation must include variant_id";
    }
    if (item.quantity === undefined || item.quantity < 1) {
      return "Each allocation must have quantity >= 1";
    }
  }

  const variantIds = allocations.map((i) => i.variant_id);
  const variants = await VehicleVariant.findAll({
    where: { id: variantIds },
    attributes: ["id"],
  });
  if (variants.length !== variantIds.length) {
    return "One or more variants do not exist";
  }

  return null;
};

exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { dealer_id, expected_delivery, notes, allocations, status } =
      req.body;

    if (!dealer_id) {
      await t.rollback();
      return res.status(400).json({ message: "dealer_id is required" });
    }

    const creatorId = req.user?.id || req.body.created_by;
    if (!creatorId) {
      await t.rollback();
      return res.status(400).json({ message: "created_by is required" });
    }

    const dealer = await Dealer.findByPk(dealer_id);
    if (!dealer) {
      await t.rollback();
      return res.status(400).json({ message: "Dealer not found" });
    }

    if (status && !ORDER_STATUSES.includes(status)) {
      await t.rollback();
      return res.status(400).json({ message: "Invalid status value" });
    }

    const allocationError = await validateAllocations(allocations);
    if (allocationError) {
      await t.rollback();
      return res.status(400).json({ message: allocationError });
    }

    const order = await ManufacturerOrder.create(
      {
        id: uuidv4(),
        dealer_id,
        created_by: creatorId,
        expected_delivery: expected_delivery || null,
        notes: notes || null,
        status: status && ORDER_STATUSES.includes(status) ? status : undefined,
      },
      { transaction: t }
    );

    for (const alloc of allocations) {
      await InboundAllocation.create(
        {
          id: uuidv4(),
          manufacturer_order_id: order.id,
          variant_id: alloc.variant_id,
          quantity: alloc.quantity,
        },
        { transaction: t }
      );
    }

    await t.commit();

    const payload = await ManufacturerOrder.findByPk(order.id, {
      include: includeRelations,
    });
    res.status(201).json(payload);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const { dealer_id, status, created_by } = req.query;
    const where = {};

    if (dealer_id) where.dealer_id = dealer_id;
    if (status) where.status = status;
    if (created_by) where.created_by = created_by;

    const orders = await ManufacturerOrder.findAll({
      where,
      include: includeRelations,
      order: [["createdAt", "DESC"]],
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await ManufacturerOrder.findByPk(id, {
      include: includeRelations,
    });

    if (!order) {
      return res.status(404).json({ message: "Manufacturer order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { dealer_id, expected_delivery, notes, status, allocations } =
      req.body;

    const order = await ManufacturerOrder.findByPk(id);
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Manufacturer order not found" });
    }

    if (dealer_id) {
      const dealer = await Dealer.findByPk(dealer_id);
      if (!dealer) {
        await t.rollback();
        return res.status(400).json({ message: "Dealer not found" });
      }
      order.dealer_id = dealer_id;
    }

    if (status) {
      if (!ORDER_STATUSES.includes(status)) {
        await t.rollback();
        return res.status(400).json({ message: "Invalid status value" });
      }
      order.status = status;
    }

    if (expected_delivery !== undefined) {
      order.expected_delivery = expected_delivery || null;
    }

    if (notes !== undefined) {
      order.notes = notes || null;
    }

    await order.save({ transaction: t });

    if (allocations !== undefined) {
      const allocationError = await validateAllocations(allocations);
      if (allocationError) {
        await t.rollback();
        return res.status(400).json({ message: allocationError });
      }

      await InboundAllocation.destroy({
        where: { manufacturer_order_id: id },
        transaction: t,
      });

      for (const alloc of allocations) {
        await InboundAllocation.create(
          {
            id: uuidv4(),
            manufacturer_order_id: id,
            variant_id: alloc.variant_id,
            quantity: alloc.quantity,
          },
          { transaction: t }
        );
      }
    }

    await t.commit();

    const payload = await ManufacturerOrder.findByPk(id, {
      include: includeRelations,
    });
    res.json(payload);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const order = await ManufacturerOrder.findByPk(id);
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Manufacturer order not found" });
    }

    await InboundAllocation.destroy({
      where: { manufacturer_order_id: id },
      transaction: t,
    });
    await order.destroy({ transaction: t });

    await t.commit();
    res.status(204).send();
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};
