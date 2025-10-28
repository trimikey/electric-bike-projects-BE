const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const {
  ManufacturerInventory,
  VehicleVariant,
  Manufacturer,
} = require("../models/associations");

// ==================== CREATE ====================
exports.create = async (req, res) => {
  try {
    const { manufacturer_id, variant_id, unit_price, quantity } = req.body;

    // 🧩 Kiểm tra trường bắt buộc
    if (!manufacturer_id || !variant_id) {
      return res
        .status(400)
        .json({ message: "manufacturer_id và variant_id là bắt buộc" });
    }

    if (unit_price === undefined || unit_price === null) {
      return res
        .status(400)
        .json({ message: "unit_price là bắt buộc" });
    }

    if (isNaN(unit_price) || unit_price <= 0) {
      return res
        .status(400)
        .json({ message: "unit_price phải là số dương" });
    }

    if (quantity !== undefined && (isNaN(quantity) || quantity < 0)) {
      return res
        .status(400)
        .json({ message: "quantity phải là số nguyên >= 0" });
    }

    // 🧩 Đảm bảo manufacturer và variant tồn tại
    const [manufacturer, variant] = await Promise.all([
      Manufacturer.findByPk(manufacturer_id),
      VehicleVariant.findByPk(variant_id),
    ]);

    if (!manufacturer) {
      return res.status(404).json({
        message: "Không tìm thấy manufacturer tương ứng",
      });
    }

    if (!variant) {
      return res.status(404).json({
        message: "Không tìm thấy vehicle variant tương ứng",
      });
    }

    // 🧩 Kiểm tra trùng inventory
    const existed = await ManufacturerInventory.findOne({
      where: { manufacturer_id, variant_id },
    });
    if (existed) {
      return res
        .status(400)
        .json({ message: "Inventory đã tồn tại cho variant này" });
    }

    // 🧩 Tạo bản ghi mới
    const record = await ManufacturerInventory.create({
      id: uuidv4(),
      manufacturer_id,
      variant_id,
      unit_price,
      quantity: quantity ?? 0,
    });

    const payload = await ManufacturerInventory.findByPk(record.id, {
      include: [
        { model: VehicleVariant, as: "variant" },
        { model: Manufacturer, as: "manufacturer" },
      ],
    });

    res.status(201).json(payload);
  } catch (err) {
    console.error("Error creating manufacturer inventory:", err);
    res.status(500).json({ message: err.message });
  }
};

// ==================== LIST ====================
exports.list = async (req, res) => {
  try {
    const { manufacturer_id, variant_id, min_price, max_price } = req.query;
    const where = {};

    if (manufacturer_id) where.manufacturer_id = manufacturer_id;
    if (variant_id) where.variant_id = variant_id;
    if (min_price || max_price) {
      where.unit_price = {}; 
      if (min_price) where.unit_price[Op.gte] = parseFloat(min_price); 
      if (max_price) where.unit_price[Op.lte] = parseFloat(max_price);
    }

    const inventories = await ManufacturerInventory.findAll({
      where,
      include: [
        { model: VehicleVariant, as: "variant" },
        { model: Manufacturer, as: "manufacturer" },
      ],
      order: [["updated_at", "DESC"]],
    });

    res.json(inventories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== GET BY ID ====================
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const inventory = await ManufacturerInventory.findByPk(id, {
      include: [
        { model: VehicleVariant, as: "variant" },
        { model: Manufacturer, as: "manufacturer" },
      ],
    });

    if (!inventory) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bản ghi tồn kho của hãng" });
    }

    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== UPDATE ====================
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { unit_price, quantity, manufacturer_id } = req.body;

    const inventory = await ManufacturerInventory.findByPk(id);
    if (!inventory) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bản ghi tồn kho của hãng" });
    }

    let updated = false;

    // ✅ Cập nhật manufacturer
    if (manufacturer_id !== undefined) {
      const manufacturer = await Manufacturer.findByPk(manufacturer_id);
      if (!manufacturer) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy manufacturer tương ứng" });
      }

      const duplicate = await ManufacturerInventory.findOne({
        where: {
          manufacturer_id,
          variant_id: inventory.variant_id,
          id: { [Op.ne]: id },
        },
      });

      if (duplicate) {
        return res.status(400).json({
          message: "Manufacturer inventory cho variant này đã tồn tại",
        });
      }

      inventory.manufacturer_id = manufacturer_id;
      updated = true;
    }

    // ✅ Cập nhật giá
    if (unit_price !== undefined) {
      if (isNaN(unit_price) || unit_price <= 0) {
        return res
          .status(400)
          .json({ message: "unit_price phải là số dương" });
      }
      inventory.unit_price = unit_price;
      updated = true;
    }

    // ✅ Cập nhật số lượng
    if (quantity !== undefined) {
      if (isNaN(quantity) || quantity < 0) {
        return res
          .status(400)
          .json({ message: "quantity phải là số nguyên >= 0" });
      }
      inventory.quantity = quantity;
      updated = true;
    }

    if (!updated) {
      return res.status(400).json({
        message: "Phải cung cấp ít nhất một trong hai trường: unit_price hoặc quantity",
      });
    }

    inventory.updated_at = new Date();
    await inventory.save();

    const payload = await ManufacturerInventory.findByPk(id, {
      include: [
        { model: VehicleVariant, as: "variant" },
        { model: Manufacturer, as: "manufacturer" },
      ],
    });

    res.json(payload);
  } catch (err) {
    console.error("Error updating manufacturer inventory:", err);
    res.status(500).json({ message: err.message });
  }
};

// ==================== REMOVE ====================
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const inventory = await ManufacturerInventory.findByPk(id);
    if (!inventory) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bản ghi tồn kho của hãng" });
    }

    await inventory.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
