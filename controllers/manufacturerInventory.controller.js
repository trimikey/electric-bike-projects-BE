const { v4: uuidv4 } = require("uuid");
const {
  ManufacturerInventory,
  VehicleVariant,
  VehicleModel,
  Manufacturer,
} = require("../models/associations");

const includeVariant = [
  {
    model: VehicleVariant,
    as: "variant",
    attributes: ["id", "model_id", "version", "color", "base_price"],
    include: [
      {
        model: VehicleModel,
        as: "vehicleModel",
        attributes: ["id", "name", "manufacturer_id"],
        include: [
          {
            model: Manufacturer,
            as: "manufacturer",
            attributes: ["id", "name", "logo_url", "country"],
          },
        ],
      },
    ],
  },
];

exports.create = async (req, res) => {
  try {
    const { variant_id, quantity } = req.body;

    if (!variant_id) {
      return res.status(400).json({ message: "variant_id is required" });
    }

    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({ message: "quantity must be >= 0" });
    }

    const variant = await VehicleVariant.findByPk(variant_id);
    if (!variant) {
      return res.status(400).json({ message: "Vehicle variant not found" });
    }

    const existed = await ManufacturerInventory.findOne({
      where: { variant_id },
    });
    if (existed) {
      return res
        .status(400)
        .json({ message: "Inventory already exists for this variant" });
    }

    const record = await ManufacturerInventory.create({
      id: uuidv4(),
      variant_id,
      quantity: quantity ?? 0,
      updated_at: new Date(),
    });

    const payload = await ManufacturerInventory.findByPk(record.id, {
      include: includeVariant,
    });
    res.status(201).json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const { variant_id } = req.query;
    const where = {};
    if (variant_id) where.variant_id = variant_id;

    const inventories = await ManufacturerInventory.findAll({
      where,
      include: includeVariant,
      order: [["updated_at", "DESC"]],
    });

    res.json(inventories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await ManufacturerInventory.findByPk(id, {
      include: includeVariant,
    });

    if (!inventory) {
      return res.status(404).json({ message: "Manufacturer inventory not found" });
    }

    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const inventory = await ManufacturerInventory.findByPk(id);
    if (!inventory) {
      return res.status(404).json({ message: "Manufacturer inventory not found" });
    }

    if (quantity === undefined) {
      return res
        .status(400)
        .json({ message: "quantity is required to update inventory" });
    }

    if (quantity < 0) {
      return res.status(400).json({ message: "quantity must be >= 0" });
    }

    inventory.quantity = quantity;
    inventory.updated_at = new Date();
    await inventory.save();

    const payload = await ManufacturerInventory.findByPk(id, {
      include: includeVariant,
    });
    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await ManufacturerInventory.findByPk(id);
    if (!inventory) {
      return res.status(404).json({ message: "Manufacturer inventory not found" });
    }

    await inventory.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
