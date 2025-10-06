const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
  },
  dealer_id: {
    type: DataTypes.STRING(36),
    allowNull: true,
    references: {
      model: "dealers",
      key: "id"
    }
  },
  username: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    unique: true,
    allowNull: false,
  },
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  full_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM("dealer_staff", "dealer_manager", "evm_staff", "admin"),
    allowNull: false,
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: "users",
  timestamps: true,       // createdAt, updatedAt
  paranoid: true,         // bật soft delete => Sequelize sẽ dùng deletedAt
  createdAt: "created_at",  // ánh xạ đúng cột DB
  updatedAt: "updated_at",  // ánh xạ đúng cột DB
});

module.exports = User;
