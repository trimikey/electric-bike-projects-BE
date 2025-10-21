const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const {
  VehicleModel,
  VehicleVariant,
  Spec,
  VehicleModelSpec,
  Manufacturer,
} = require("../models");

// ==========================
// 📘 CREATE MODEL
// ==========================
exports.createModel = async (req, res) => {
  try {
    const { name, description, manufacturer_id } = req.body;
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const trimmedManufacturerId =
      typeof manufacturer_id === "string" && manufacturer_id.trim()
        ? manufacturer_id.trim()
        : null;

    if (!trimmedName)
      return res.status(400).json({ message: "Tên dòng xe (name) là bắt buộc" });

    const existed = await VehicleModel.findOne({ where: { name: trimmedName } });
    if (existed)
      return res.status(400).json({ message: "Vehicle model đã tồn tại với tên này" });

    if (trimmedManufacturerId) {
      const manufacturer = await Manufacturer.findByPk(trimmedManufacturerId);
      if (!manufacturer) {
        return res.status(400).json({ message: "Manufacturer không tồn tại" });
      }
    }

    const model = await VehicleModel.create({
      id: uuidv4(),
      name: trimmedName,
      manufacturer_id: trimmedManufacturerId,
      description: typeof description === "string" ? description.trim() : description,
    });

    const payload = await VehicleModel.findByPk(model.id, {
      include: [
        { model: Manufacturer, as: "manufacturer" },
        { model: VehicleVariant, as: "variants" },
        {
          model: VehicleModelSpec,
          as: "modelSpecs",
          include: [{ model: Spec, as: "spec" }],
        },
      ],
    });

    return res
      .status(201)
      .json({ message: "Tạo vehicle model thành công", model: payload });
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
        { model: Manufacturer, as: "manufacturer" },
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
// 🛠️ UPDATE MODEL
// ==========================
exports.updateModel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, manufacturer_id } = req.body;

    const model = await VehicleModel.findByPk(id);
    if (!model) {
      return res.status(404).json({ message: "Không tìm thấy vehicle model" });
    }

    if (name !== undefined) {
      const trimmedName = typeof name === "string" ? name.trim() : "";
      if (!trimmedName) {
        return res.status(400).json({ message: "Tên dòng xe (name) không được để trống" });
      }

      const duplicate = await VehicleModel.findOne({
        where: { name: trimmedName, id: { [Op.ne]: id } },
      });
      if (duplicate) {
        return res.status(400).json({ message: "Vehicle model đã tồn tại với tên này" });
      }

      model.name = trimmedName;
    }

    if (description !== undefined) {
      model.description =
        typeof description === "string" ? description.trim() : description;
    }

    if (manufacturer_id !== undefined) {
      const normalizedId =
        manufacturer_id === null || manufacturer_id === ""
          ? null
          : typeof manufacturer_id === "string"
          ? manufacturer_id.trim()
          : manufacturer_id;

      if (normalizedId) {
        const manufacturer = await Manufacturer.findByPk(normalizedId);
        if (!manufacturer) {
          return res.status(400).json({ message: "Manufacturer không tồn tại" });
        }
        model.manufacturer_id = normalizedId;
      } else {
        model.manufacturer_id = null;
      }
    }

    await model.save();

    const payload = await VehicleModel.findByPk(model.id, {
      include: [
        { model: Manufacturer, as: "manufacturer" },
        { model: VehicleVariant, as: "variants" },
        {
          model: VehicleModelSpec,
          as: "modelSpecs",
          include: [{ model: Spec, as: "spec" }],
        },
      ],
    });

    return res.json({
      message: "Cập nhật vehicle model thành công",
      model: payload,
    });
  } catch (err) {
    console.error("Update model error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==========================
// 🗑️ DELETE MODEL
// ==========================
exports.deleteModel = async (req, res) => {
  try {
    const { id } = req.params;

    const model = await VehicleModel.findByPk(id);
    if (!model) {
      return res.status(404).json({ message: "Không tìm thấy vehicle model" });
    }

    const variantCount = await VehicleVariant.count({ where: { model_id: id } });
    if (variantCount > 0) {
      return res
        .status(400)
        .json({ message: "Không thể xóa vehicle model khi vẫn còn variants" });
    }

    await VehicleModelSpec.destroy({ where: { model_id: id } });
    await model.destroy();

    return res.status(204).send();
  } catch (err) {
    console.error("Delete model error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==========================
// 🚙 CREATE VARIANT
// ==========================
exports.createVariant = async (req, res) => {
  try {
    const { model_id, version, color, base_price, thumbnail_url } = req.body;

    const trimmedModelId = model_id?.trim();
    const trimmedVersion = version?.trim();
    const trimmedColor = color?.trim();
    let sanitizedThumbnailUrl = null;

    if (!trimmedModelId || !trimmedVersion || !trimmedColor)
      return res.status(400).json({ message: "model_id, version và color là bắt buộc" });

    if (base_price === undefined || base_price === null || base_price === "")
      return res.status(400).json({ message: "base_price là bắt buộc" });

    if (thumbnail_url !== undefined && thumbnail_url !== null) {
      if (typeof thumbnail_url !== "string") {
        return res.status(400).json({ message: "thumbnail_url phải là chuỗi URL" });
      }
      sanitizedThumbnailUrl = thumbnail_url.trim();
      if (
        sanitizedThumbnailUrl &&
        !/^https?:\/\//i.test(sanitizedThumbnailUrl)
      ) {
        return res.status(400).json({ message: "thumbnail_url không hợp lệ" });
      }
      if (sanitizedThumbnailUrl === "") sanitizedThumbnailUrl = null;
    }

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
      thumbnail_url: sanitizedThumbnailUrl,
    });

    const payload = await VehicleVariant.findByPk(variant.id, {
      include: { model: VehicleModel, as: "vehicleModel" },
    });

    return res.status(201).json({ message: "Tạo variant thành công", variant: payload });
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
// 🚙 GET VARIANT DETAIL
// ==========================
exports.getVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const variant = await VehicleVariant.findByPk(id, {
      include: { model: VehicleModel, as: "vehicleModel" },
    });
    if (!variant) {
      return res.status(404).json({ message: "Không tìm thấy vehicle variant" });
    }
    return res.json(variant);
  } catch (err) {
    console.error("Get variant error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==========================
// 🛠️ UPDATE VARIANT
// ==========================
exports.updateVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { model_id, version, color, base_price, thumbnail_url } = req.body;

    const variant = await VehicleVariant.findByPk(id);
    if (!variant) {
      return res.status(404).json({ message: "Không tìm thấy vehicle variant" });
    }

    if (model_id) {
      const trimmedModelId = model_id.trim();
      const model = await VehicleModel.findByPk(trimmedModelId);
      if (!model) {
        return res.status(404).json({ message: "Không tìm thấy vehicle model" });
      }
      variant.model_id = trimmedModelId;
    }

    if (version !== undefined) {
      const trimmedVersion = typeof version === "string" ? version.trim() : "";
      if (!trimmedVersion) {
        return res.status(400).json({ message: "version không được để trống" });
      }
      variant.version = trimmedVersion;
    }

    if (color !== undefined) {
      const trimmedColor = typeof color === "string" ? color.trim() : "";
      if (!trimmedColor) {
        return res.status(400).json({ message: "color không được để trống" });
      }
      variant.color = trimmedColor;
    }

    if (base_price !== undefined) {
      if (base_price === null || base_price === "") {
        return res.status(400).json({ message: "base_price không hợp lệ" });
      }
      const numericPrice = Number(base_price);
      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({ message: "base_price phải là số không âm" });
      }
      variant.base_price = numericPrice;
    }

    if (thumbnail_url !== undefined) {
      if (thumbnail_url === null) {
        variant.thumbnail_url = null;
      } else if (typeof thumbnail_url === "string") {
        const trimmedThumbnailUrl = thumbnail_url.trim();
        if (
          trimmedThumbnailUrl &&
          !/^https?:\/\//i.test(trimmedThumbnailUrl)
        ) {
          return res.status(400).json({ message: "thumbnail_url không hợp lệ" });
        }
        variant.thumbnail_url =
          trimmedThumbnailUrl === "" ? null : trimmedThumbnailUrl;
      } else {
        return res.status(400).json({ message: "thumbnail_url phải là chuỗi URL" });
      }
    }

    await variant.save();
    const payload = await VehicleVariant.findByPk(variant.id, {
      include: { model: VehicleModel, as: "vehicleModel" },
    });

    return res.json({ message: "Cập nhật variant thành công", variant: payload });
  } catch (err) {
    console.error("Update variant error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==========================
// 🗑️ DELETE VARIANT
// ==========================
exports.deleteVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const variant = await VehicleVariant.findByPk(id);
    if (!variant) {
      return res.status(404).json({ message: "Không tìm thấy vehicle variant" });
    }
    await variant.destroy();
    return res.status(204).json({message: "Xóa variant thành công" });
  } catch (err) {
    console.error("Delete variant error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==========================
// ⚙️ ATTACH SPEC TO MODEL
// ==========================
exports.attachSpec = async (req, res) => {
  try {
    const { model_id, spec: specPayload, value } = req.body;

    const trimmedModelId = typeof model_id === "string" ? model_id.trim() : "";
    const normalizedValue =
      value === undefined || value === null ? "" : String(value).trim();

    if (!trimmedModelId || !normalizedValue) {
      return res
        .status(400)
        .json({ message: "model_id và value là bắt buộc" });
    }

    if (!specPayload || typeof specPayload !== "object") {
      return res.status(400).json({ message: "spec là bắt buộc" });
    }

    const specId =
      typeof specPayload.id === "string" ? specPayload.id.trim() : null;
    const specName =
      typeof specPayload.name === "string" ? specPayload.name.trim() : "";
    const specCategory =
      typeof specPayload.category === "string"
        ? specPayload.category.trim()
        : null;
    const specUnit =
      typeof specPayload.unit === "string" ? specPayload.unit.trim() : null;

    if (!specId && !specName) {
      return res
        .status(400)
        .json({ message: "spec.name là bắt buộc khi không truyền spec.id" });
    }

    const model = await VehicleModel.findByPk(trimmedModelId);
    if (!model)
      return res.status(404).json({ message: "Không tìm thấy vehicle model" });

    let spec;

    if (specId) {
      spec = await Spec.findByPk(specId);
      if (!spec) {
        return res.status(404).json({ message: "Không tìm thấy spec" });
      }
      let specUpdated = false;
      if (specName && spec.name !== specName) {
        spec.name = specName;
        specUpdated = true;
      }
      if (specCategory !== null && spec.category !== specCategory) {
        spec.category = specCategory;
        specUpdated = true;
      }
      if (specUnit !== null && spec.unit !== specUnit) {
        spec.unit = specUnit;
        specUpdated = true;
      }
      if (specUpdated) await spec.save();
    }

    if (!spec) {
      let existingSpec = null;
      if (specName) {
        existingSpec = await Spec.findOne({
          where: {
            name: specName,
            category: specCategory,
          },
        });
      }

      if (existingSpec) {
        spec = existingSpec;
        let shouldSave = false;
        if (specUnit !== null && spec.unit !== specUnit) {
          spec.unit = specUnit;
          shouldSave = true;
        }
        if (
          specCategory !== null &&
          (spec.category || null) !== (specCategory || null)
        ) {
          spec.category = specCategory;
          shouldSave = true;
        }
        if (shouldSave) await spec.save();
      } else {
        spec = await Spec.create({
          id: uuidv4(),
          name: specName,
          category: specCategory,
          unit: specUnit,
        });
      }
    }

    const [modelSpec, created] = await VehicleModelSpec.findOrCreate({
      where: {
        model_id: trimmedModelId,
        spec_id: spec.id,
      },
      defaults: {
        id: uuidv4(),
        value: normalizedValue,
      },
    });

    if (!created) {
      modelSpec.value = normalizedValue;
      await modelSpec.save();
    }

    await modelSpec.reload({
      include: [{ model: Spec, as: "spec" }],
    });

    return res.status(created ? 201 : 200).json({
      message: created
        ? "Gắn spec cho model thành công"
        : "Cập nhật giá trị spec thành công",
      vehicleModelSpec: modelSpec,
    });
  } catch (err) {
    console.error("Attach spec error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
