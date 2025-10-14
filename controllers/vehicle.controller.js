const { v4: uuidv4 } = require("uuid");
const {
  VehicleModel,
  VehicleVariant,
  Spec,
  VehicleModelSpec,
} = require("../models");

// ==========================
// 📘 CREATE MODEL
// ==========================
exports.createModel = async (req, res) => {
  try {
    const { name, description } = req.body;
    const trimmedName = typeof name === "string" ? name.trim() : "";

    if (!trimmedName)
      return res.status(400).json({ message: "Tên dòng xe (name) là bắt buộc" });

    const existed = await VehicleModel.findOne({ where: { name: trimmedName } });
    if (existed)
      return res.status(400).json({ message: "Vehicle model đã tồn tại với tên này" });

    const model = await VehicleModel.create({
      id: uuidv4(),
      name: trimmedName,
      description: typeof description === "string" ? description.trim() : description,
    });

    return res.status(201).json({ message: "Tạo vehicle model thành công", model });
  } catch (err) {
    console.error("Create model error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==========================
// 📗 LIST MODELS (with variants + specs)
// ==========================
exports.listModels = async (_req, res) => {
  try {
    const models = await VehicleModel.findAll({
      include: [
        { model: VehicleVariant, as: "variants" },
        {
          model: VehicleModelSpec,
          as: "modelSpecs",
          include: [{ model: Spec, as: "spec" }],
        },
      ],
      order: [
        ["created_at", "DESC"],
        [{ model: VehicleVariant, as: "variants" }, "created_at", "DESC"],
      ],
    });

    return res.json(models);
  } catch (err) {
    console.error("List models error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==========================
// 🚙 CREATE VARIANT
// ==========================
exports.createVariant = async (req, res) => {
  try {
    const { model_id, version, color, base_price } = req.body;

    const trimmedModelId = model_id?.trim();
    const trimmedVersion = version?.trim();
    const trimmedColor = color?.trim();

    if (!trimmedModelId || !trimmedVersion || !trimmedColor)
      return res.status(400).json({ message: "model_id, version và color là bắt buộc" });

    if (base_price === undefined || base_price === null || base_price === "")
      return res.status(400).json({ message: "base_price là bắt buộc" });

    const model = await VehicleModel.findByPk(trimmedModelId);
    if (!model) return res.status(404).json({ message: "Không tìm thấy vehicle model" });

    const numericPrice = Number(base_price);
    if (Number.isNaN(numericPrice) || numericPrice < 0)
      return res.status(400).json({ message: "base_price phải là số không âm" });

    const duplicated = await VehicleVariant.findOne({
      where: {
        model_id: trimmedModelId,
        version: trimmedVersion,
        color: trimmedColor,
      },
    });
    if (duplicated)
      return res.status(400).json({ message: "Variant đã tồn tại cho model này" });

    const variant = await VehicleVariant.create({
      id: uuidv4(),
      model_id: trimmedModelId,
      version: trimmedVersion,
      color: trimmedColor,
      base_price: numericPrice,
    });

    return res.status(201).json({ message: "Tạo variant thành công", variant });
  } catch (err) {
    console.error("Create variant error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==========================
// 🚗 LIST VARIANTS
// ==========================
exports.listVariants = async (_req, res) => {
  try {
    const items = await VehicleVariant.findAll({
      include: { model: VehicleModel, as: "vehicleModel" },
      order: [
        ["created_at", "DESC"],
        [{ model: VehicleModel, as: "vehicleModel" }, "created_at", "DESC"],
      ],
    });

    return res.json(items);
  } catch (err) {
    console.error("List variants error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==========================
// ⚙️ ATTACH SPEC TO MODEL
// ==========================
exports.attachSpec = async (req, res) => {
  try {
    const { model_id, spec_id, value } = req.body;
    const trimmedModelId = model_id?.trim();
    const trimmedSpecId = spec_id?.trim();
    const trimmedValue = value?.trim();

    if (!trimmedModelId || !trimmedSpecId || !trimmedValue)
      return res.status(400).json({ message: "model_id, spec_id và value là bắt buộc" });

    const [model, spec] = await Promise.all([
      VehicleModel.findByPk(trimmedModelId),
      Spec.findByPk(trimmedSpecId),
    ]);

    if (!model) return res.status(404).json({ message: "Không tìm thấy vehicle model" });
    if (!spec) return res.status(404).json({ message: "Không tìm thấy spec" });

    // ✅ Update nếu đã tồn tại
    const existed = await VehicleModelSpec.findOne({
      where: { model_id: trimmedModelId, spec_id: trimmedSpecId },
    });
    if (existed) {
      existed.value = trimmedValue;
      await existed.save();
      return res.json({
        message: "Cập nhật giá trị spec thành công",
        vehicleModelSpec: existed,
      });
    }

    // ✅ Nếu chưa có thì tạo mới
    const rel = await VehicleModelSpec.create({
      id: uuidv4(),
      model_id: trimmedModelId,
      spec_id: trimmedSpecId,
      value: trimmedValue,
    });

    return res.status(201).json({
      message: "Gắn spec cho model thành công",
      vehicleModelSpec: rel,
    });
  } catch (err) {
    console.error("Attach spec error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
