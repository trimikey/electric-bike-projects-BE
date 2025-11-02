const { v4: uuidv4 } = require("uuid");
const {
  sequelize,
  ManufacturerOrder,
  Dealer,
  User,
  VehicleVariant,
  Manufacturer,
  ManufacturerInventory,
  DealerInventory,
} = require("../models/associations");

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "inbounded",
  "shipped",
  "completed",
  "cancelled",
];

const createInvalidStatusError = () => {
  const error = new Error("Invalid status value");
  error.statusCode = 400;
  return error;
};

const applyStatusTransition = async (order, status, transaction) => {
  if (!ORDER_STATUSES.includes(status)) {
    throw createInvalidStatusError();
  }

  if (order.status === status) {
    return;
  }

  if (status === "confirmed") {
    order.confirmed_at = new Date();
  }

  if (status === "inbounded" || status === "shipped") {
    const inventory = await ManufacturerInventory.findByPk(
      order.manufacturerInventory_id,
      { transaction }
    );

    if (!inventory) {
      const error = new Error("Manufacturer inventory not found for order");
      error.statusCode = 404;
      throw error;
    }

    const now = new Date();
    if (status === "inbounded") {
      inventory.quantity = Number(inventory.quantity || 0) + order.quantity;
      inventory.updated_at = now;
      await inventory.save({ transaction });
    }

    if (status === "shipped") {
      const currentQuantity = Number(inventory.quantity || 0);
      if (currentQuantity < order.quantity) {
        const error = new Error("Not enough stock in manufacturer inventory");
        error.statusCode = 400;
        throw error;
      }

      inventory.quantity = currentQuantity - order.quantity;
      inventory.updated_at = now;
      await inventory.save({ transaction });

      const dealerInventory = await DealerInventory.findOne({
        where: {
          dealer_id: order.dealer_id,
          variant_id: order.variant_id,
        },
        transaction,
      });

      if (dealerInventory) {
        await dealerInventory.increment("quantity", {
          by: order.quantity,
          transaction,
        });
        dealerInventory.updated_at = now;
        await dealerInventory.save({ transaction });
      } else {
        await DealerInventory.create(
          {
            id: uuidv4(),
            dealer_id: order.dealer_id,
            variant_id: order.variant_id,
            quantity: order.quantity,
            updated_at: now,
          },
          { transaction }
        );
      }
    }
  }

  order.status = status;
};

const includeRelations = [
  {
    model: Dealer,
    as: "dealer",
    attributes: ["id", "name", "address", "phone", "email"],
  },
  { 
    model: Manufacturer,
    as: "manufacturer",
    attributes: ["id", "name", "country", "logo_url"],
  },
  {
    model: User,
    as: "creator",
    attributes: ["id", "username", "email"],
  },
  {
    model: VehicleVariant,
    as: "variant",
    attributes: ["id", "model_id", "version", "color", "base_price"],
  },
];

/**
 * CREATE
 */
exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      dealer_id,
      manufacturerInventory_id,
      variant_id,
      quantity,
      // expected_delivery,
      notes,
      status,
    } = req.body;

    // 🔹 Validate cơ bản
    if (!dealer_id || !manufacturerInventory_id || !variant_id) {
      await t.rollback();
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      await t.rollback();
      return res.status(400).json({ message: "quantity must be integer > 0" });
    }

    const creatorId = req.user?.id || req.body.created_by;
    if (!creatorId) {
      await t.rollback();
      return res.status(400).json({ message: "created_by is required" });
    }

    const [dealer, manufacturerInventory, variant] = await Promise.all([
      Dealer.findByPk(dealer_id),
      ManufacturerInventory.findByPk(manufacturerInventory_id),
      VehicleVariant.findByPk(variant_id),
    ]);

    if (!dealer || !manufacturerInventory || !variant) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Dealer, manufacturerInventory, or variant not found" });
    }

    if (status && !ORDER_STATUSES.includes(status)) {
      await t.rollback();
      return res.status(400).json({ message: "Invalid status value" });
    }

    // 🔹 Lấy unit_price từ ManufacturerInventory
    const inventory = await ManufacturerInventory.findByPk(manufacturerInventory_id, { transaction: t });


    if (!inventory) {
      await t.rollback();
      return res.status(404).json({
        message:
          "Không tìm thấy tồn kho của manufacturerInventory cho variant này (manufacturerInventory_id + variant_id).",
      });
    }

    const unit_price = parseFloat(inventory.unit_price);
    const manufacturerId = inventory.manufacturer_id;

    // 🔹 Tính total_amount
    const total_amount = parseFloat((unit_price * quantity).toFixed(2));

    // Tạo expected_delivery mặc định là 3 ngày kể từ ngày tạo
    const expected_delivery = new Date();
    expected_delivery.setDate(expected_delivery.getDate() + 3); 

    // 🔹 Tạo order
    const order = await ManufacturerOrder.create(
      {
        id: uuidv4(),
        dealer_id,
        manufacturer_id: manufacturerId,
        manufacturerInventory_id,
        variant_id,
        quantity,
        total_amount,
        created_by: creatorId,
        expected_delivery: expected_delivery || null,
        notes: notes || null,
        status: status || "pending",
      },
      { transaction: t }
    );

    await t.commit();

    const payload = await ManufacturerOrder.findByPk(order.id, {
      include: includeRelations,
    });

    res.status(201).json({
      message: "Tạo ManufacturerOrder thành công",
      order: payload,
    });
  } catch (err) {
    await t.rollback();
    console.error("❌ Error creating ManufacturerOrder:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * LIST
 */
exports.list = async (req, res) => {
  try {
    const { dealer_id, status, created_by, manufacturer_id, variant_id } =
      req.query;
    const where = {};
    if (dealer_id) where.dealer_id = dealer_id;
    if (manufacturer_id) where.manufacturer_id = manufacturer_id;
    if (variant_id) where.variant_id = variant_id;
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

/**
 * GET BY ID
 */
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

/**
 * UPDATE (status flow + inventory handling)
 */
exports.update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status, confirmed_at, shipped_at, received_at, notes } = req.body;

    const order = await ManufacturerOrder.findByPk(id);
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Manufacturer order not found" });
    }

    if (confirmed_at !== undefined) order.confirmed_at = confirmed_at || null;
    if (shipped_at !== undefined) order.shipped_at = shipped_at || null;
    if (received_at !== undefined) order.received_at = received_at || null;
    if (notes !== undefined) order.notes = notes;
    if (status !== undefined) {
      await applyStatusTransition(order, status, t);
    }

    await order.save({ transaction: t });
    await t.commit();

    const payload = await ManufacturerOrder.findByPk(order.id, {
      include: includeRelations,
    });
    res.json(payload);
  } catch (err) {
    await t.rollback();
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ message: err.message });
  }
};

/**
 * UPDATE STATUS ONLY
 */
exports.updateStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status === undefined) {
      await t.rollback(); 
      return res.status(400).json({ message: "status is required" });
    }

    const order = await ManufacturerOrder.findByPk(id);
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Manufacturer order not found" });
    }

    await applyStatusTransition(order, status, t);
    console.log("🚚 Updated status to:", status);

    await order.save({ transaction: t });
    await t.commit();

    const payload = await ManufacturerOrder.findByPk(order.id, {
      include: includeRelations,
    });

    res.json(payload);
  } catch (err) {
    await t.rollback();
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ message: err.message });
  }
};

/**
 * DELETE
 */
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await ManufacturerOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "Manufacturer order not found" });
    }

    await order.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};