const { v4: uuidv43 } = require("uuid");
const { VehicleModel, VehicleVariant, Spec, VehicleModelSpec } = require("../models");


// Vehicle Models
exports.createModel = async (req, res) => {
    const { name, description } = req.body;
    const model = await VehicleModel.create({ id: uuidv43(), name, description });
    res.status(201).json(model);
};
exports.listModels = async (_req, res) => {
    const models = await VehicleModel.findAll({ include: [{ model: VehicleVariant, as: "variants" }] });
    res.json(models);
};


// Variants
exports.createVariant = async (req, res) => {
    const { model_id, version, color, base_price } = req.body;
    const variant = await VehicleVariant.create({ id: uuidv43(), model_id, version, color, base_price });
    res.status(201).json(variant);
};
exports.listVariants = async (_req, res) => {
    const items = await VehicleVariant.findAll({ include: [{ model: VehicleModel, as: "model" }] });
    res.json(items);
};


// Specs binding to model
exports.attachSpec = async (req, res) => {
    const { model_id, spec_id, value } = req.body;
    const rel = await VehicleModelSpec.create({ id: uuidv43(), model_id, spec_id, value });
    res.status(201).json(rel);
};