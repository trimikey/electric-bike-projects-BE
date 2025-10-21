const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Manufacturer = sequelize.define(
  "Manufacturer",
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    legal_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    headquarters: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    founded_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1800,
      },
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    logo_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    contact_email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    contact_phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    support_hours: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "manufacturers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Manufacturer;
