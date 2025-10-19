const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // 1️⃣ Kiểm tra input hợp lệ
    if (!email || !password) {
      return res.status(400).json({ message: "Email và password là bắt buộc" });
    }

    // 2️⃣ Kiểm tra email đã tồn tại chưa
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 3️⃣ Mã hóa password
    const hashed = await bcrypt.hash(password, 10);

    // 4️⃣ Gán role mặc định Customer
    const customerRoleId = "44444444-4444-4444-4444-444444444444";

    // 5️⃣ Tạo user mới
    const user = await User.create({
      id: uuidv4(),
      name,
      email,
      phone,
      password: hashed,
      role_id: customerRoleId, // ✅ gán role Customer mặc định
    });

    // 6️⃣ Tạo JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role_id, // ✅ để middleware guard() đọc được
    });

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" } // 7 ngày
    );

    // 7️⃣ Trả về response
    return res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
      },
      token,
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email và password là bắt buộc" });
    }

    const user = await User.findOne({
      where: { email },
      include: { model: Role, as: "role" },
    });
    if (!user) return res.status(404).json({ message: "Email không tồn tại" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Sai mật khẩu" });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role_name: user.role.name, // 👈 dùng role name
    });

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GOOGLE LOGIN
exports.googleLogin = async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    if (!email || !googleId) {
      return res.status(400).json({ message: "Thiếu email hoặc googleId" });
    }

    let user = await User.findOne({ where: { email } });
    if (!user) {
      // nếu chưa có user → tạo mới
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        googleId,
        password: null,
      });
    } else if (!user.googleId) {
      // nếu đã có user nhưng chưa gắn googleId
      user.googleId = googleId;
      await user.save();
    }

    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
