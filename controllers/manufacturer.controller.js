const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const { Manufacturer, VehicleModel } = require("../models/associations");

const includeVehicleModels = [
  {
    model: VehicleModel,
    as: "vehicleModels",
    attributes: ["id", "name", "description", "created_at", "updated_at"],
  },
];

const sanitizeString = (value) =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : null;

const normalizeBoolean = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
  }
  if (typeof value === "number") return value !== 0;
  return undefined;
};

exports.create = async (req, res) => {
  try {
    const {
      name,
      legal_name,
      description,
      headquarters,
      country,
      founded_year,
      website,
      logo_url,
      contact_email,
      contact_phone,
      support_hours,
      is_active,
    } = req.body;

    const trimmedName = sanitizeString(name);
    if (!trimmedName) {
      return res.status(400).json({ message: "Tên hãng xe (name) là bắt buộc" });
    }

    const existed = await Manufacturer.findOne({
      where: { name: trimmedName },
    });
    if (existed) {
      return res.status(400).json({ message: "Manufacturer đã tồn tại với tên này" });
    }

    let normalizedYear = null;
    if (founded_year !== undefined && founded_year !== null && founded_year !== "") {
      const numericYear = Number(founded_year);
      if (!Number.isInteger(numericYear) || numericYear < 1800 || numericYear > 2100) {
        return res
          .status(400)
          .json({ message: "founded_year phải là số nguyên hợp lệ (>= 1800)" });
      }
      normalizedYear = numericYear;
    }

    const normalizedActive = normalizeBoolean(is_active);

    const manufacturer = await Manufacturer.create({
      id: uuidv4(),
      name: trimmedName,
      legal_name: sanitizeString(legal_name),
      description: sanitizeString(description),
      headquarters: sanitizeString(headquarters),
      country: sanitizeString(country),
      founded_year: normalizedYear,
      website: sanitizeString(website),
      logo_url: sanitizeString(logo_url),
      contact_email: sanitizeString(contact_email),
      contact_phone: sanitizeString(contact_phone),
      support_hours: sanitizeString(support_hours),
      is_active: normalizedActive === undefined ? undefined : normalizedActive,
    });

    const payload = await Manufacturer.findByPk(manufacturer.id, {
      include: includeVehicleModels,
    });

    return res
      .status(201)
      .json({ message: "Tạo manufacturer thành công", manufacturer: payload });
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      return res
        .status(400)
        .json({ message: err.errors?.[0]?.message || err.message });
    }
    return res.status(500).json({ message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const { country, is_active, q } = req.query;
    const where = {};
    const likeOperator = Op.iLike ? Op.iLike : Op.like;

    const sanitizedCountry = sanitizeString(country);
    if (sanitizedCountry) where.country = sanitizedCountry;

    const normalizedActive = normalizeBoolean(is_active);
    if (normalizedActive !== undefined) {
      where.is_active = normalizedActive;
    }

    const keyword = sanitizeString(q);
    if (keyword) {
      where[Op.or] = [
        { name: { [likeOperator]: `%${keyword}%` } },
        { description: { [likeOperator]: `%${keyword}%` } },
      ];
    }

    const manufacturers = await Manufacturer.findAll({
      where,
      include: includeVehicleModels,
      order: [["created_at", "DESC"]],
    });

    return res.json(manufacturers);
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      return res
        .status(400)
        .json({ message: err.errors?.[0]?.message || err.message });
    }
    return res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const manufacturer = await Manufacturer.findByPk(id, {
      include: includeVehicleModels,
    });

    if (!manufacturer) {
      return res.status(404).json({ message: "Không tìm thấy manufacturer" });
    }

    return res.json(manufacturer);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      legal_name,
      description,
      headquarters,
      country,
      founded_year,
      website,
      logo_url,
      contact_email,
      contact_phone,
      support_hours,
      is_active,
    } = req.body;

    const manufacturer = await Manufacturer.findByPk(id);
    if (!manufacturer) {
      return res.status(404).json({ message: "Không tìm thấy manufacturer" });
    }

    if (name !== undefined) {
      const trimmedName = sanitizeString(name);
      if (!trimmedName) {
        return res.status(400).json({ message: "Tên hãng xe (name) không được để trống" });
      }

      const duplicate = await Manufacturer.findOne({
        where: {
          name: trimmedName,
          id: { [Op.ne]: id },
        },
      });
      if (duplicate) {
        return res.status(400).json({ message: "Manufacturer đã tồn tại với tên này" });
      }
      manufacturer.name = trimmedName;
    }

    if (legal_name !== undefined) {
      manufacturer.legal_name = sanitizeString(legal_name);
    }
    if (description !== undefined) {
      manufacturer.description = sanitizeString(description);
    }
    if (headquarters !== undefined) {
      manufacturer.headquarters = sanitizeString(headquarters);
    }
    if (country !== undefined) {
      manufacturer.country = sanitizeString(country);
    }
    if (founded_year !== undefined) {
      if (founded_year === null || founded_year === "") {
        manufacturer.founded_year = null;
      } else {
        const numericYear = Number(founded_year);
        if (!Number.isInteger(numericYear) || numericYear < 1800 || numericYear > 2100) {
          return res
            .status(400)
            .json({ message: "founded_year phải là số nguyên hợp lệ (>= 1800)" });
        }
        manufacturer.founded_year = numericYear;
      }
    }
    if (website !== undefined) {
      manufacturer.website = sanitizeString(website);
    }
    if (logo_url !== undefined) {
      manufacturer.logo_url = sanitizeString(logo_url);
    }
    if (contact_email !== undefined) {
      manufacturer.contact_email = sanitizeString(contact_email);
    }
    if (contact_phone !== undefined) {
      manufacturer.contact_phone = sanitizeString(contact_phone);
    }
    if (support_hours !== undefined) {
      manufacturer.support_hours = sanitizeString(support_hours);
    }
    const normalizedActive = normalizeBoolean(is_active);
    if (normalizedActive !== undefined) {
      manufacturer.is_active = normalizedActive;
    }

    await manufacturer.save();

    const payload = await Manufacturer.findByPk(id, {
      include: includeVehicleModels,
    });

    return res.json({
      message: "Cập nhật manufacturer thành công",
      manufacturer: payload,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const manufacturer = await Manufacturer.findByPk(id);
    if (!manufacturer) {
      return res.status(404).json({ message: "Không tìm thấy manufacturer" });
    }

    const modelCount = await VehicleModel.count({
      where: { manufacturer_id: id },
    });
    if (modelCount > 0) {
      return res.status(400).json({
        message: "Không thể xóa manufacturer khi vẫn còn vehicle model liên kết",
      });
    }

    await manufacturer.destroy();

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
