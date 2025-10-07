const { v4: uuidv4 } = require("uuid");
const { VehicleModel, VehicleVariant, Spec, VehicleModelSpec } = require("../models");

exports.createModel = async (req, res) => {
  try {
    const { name, description, sku, brand } = req.body;
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const model = await VehicleModel.create({ id: uuidv4(), name, description, sku, brand });
    res.status(201).json(model);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.listModels = async (_req, res) => {
  try {
    const models = await VehicleModel.findAll({ include: [{ association: "variants" }] });
    res.json(models);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createVariant = async (req, res) => {
  try {
    const { model_id, version, color, base_price } = req.body;
    if (!model_id || !version || !color) {
      return res.status(400).json({ message: "Thiếu thông tin variant" });
    }

    const variant = await VehicleVariant.create({
      id: uuidv4(),
      model_id,
      version,
      color,
      base_price,
    });

    res.status(201).json(variant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.listVariants = async (_req, res) => {
  try {
    const variants = await VehicleVariant.findAll({ include: [{ association: "model" }] });
    res.json(variants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.attachSpec = async (req, res) => {
  try {
    const { model_id, spec_id, value } = req.body;
    if (!model_id || !spec_id || !value) {
      return res.status(400).json({ message: "Thiếu thông tin spec" });
    }

    const record = await VehicleModelSpec.create({
      id: uuidv4(),
      model_id,
      spec_id,
      value,
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSpec = async (req, res) => {
  try {
    const { name, unit } = req.body;
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const spec = await Spec.create({ id: uuidv4(), name, unit });
    res.status(201).json(spec);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
