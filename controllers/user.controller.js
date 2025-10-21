const { User, Role } = require("../models/associations");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const {generateTokens}  = require("../utils/jwt");

// 🧾 Lấy danh sách user nội bộ
exports.list = async (req, res) => {
  try {
    const users = await User.findAll({
      include: { model: Role, as: "role", attributes: ["name"] },
      attributes: ["id", "username", "email", "phone", "created_at"],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Login nội bộ (Admin / EVM Staff / Dealer Staff)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });

    const user = await User.findOne({
      where: { email },
      include: { model: Role, as: "role", attributes: ["name"] },
    });
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Sai mật khẩu" });

    const token = generateTokens({
      id: user.id,
      email: user.email,
      role_name: user.role.name, // ✅ dùng role name để middleware đọc
    });

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role_name: user.role.name,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// ➕ Tạo mới user nội bộ (Admin, EVM Staff)
exports.create = async (req, res) => {
  try {
    const { username, email, password, phone, role_name } = req.body;
    if (!username || !email || !password || !role_name)
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });

    const existed = await User.findOne({ where: { email } });
    if (existed) return res.status(400).json({ message: "Email đã tồn tại" });

    // 🔍 Lấy role_id từ tên
    const role = await Role.findOne({ where: { name: role_name } });
    if (!role)
      return res.status(400).json({ message: `Không tìm thấy role '${role_name}'` });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      id: uuidv4(),
      username,
      email,
      password_hash,
      phone,
      role_id: role.id, // ✅ vẫn lưu bằng role_id  
    });

    res.status(201).json({
      message: "Tạo user thành công",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role_name,
      },
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✏️ Cập nhật user
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, phone, role_name } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    user.username = username || user.username;
    user.phone = phone || user.phone;

    if (role_name) {
      const role = await Role.findOne({ where: { name: role_name } });
      if (!role)
        return res.status(400).json({ message: `Không tìm thấy role '${role_name}'` });
      user.role_id = role.id;
    }

    await user.save();
    res.json({ message: "Cập nhật thành công", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ Xóa user
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    await user.destroy();
    res.json({ message: "Đã xóa user" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
