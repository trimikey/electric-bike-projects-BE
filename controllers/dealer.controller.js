const { v4: uuidv4 } = require("uuid");
const { Dealer, User, Role } = require("../models/associations");

// helper: fetch dealer with manager info
const includeManager = [
  {
    model: User,
    as: "manager",
    attributes: ["id", "username", "email", "phone"],
    include: [{ model: Role, as: "role", attributes: ["name"] }],
  },
];

exports.create = async (req, res) => {
  try {
    const { name, address, phone, email, manager_id } = req.body;
    if (!name) return res.status(400).json({ message: "Dealer name is required" });

    if (manager_id) {
      const manager = await User.findByPk(manager_id, {
        include: [{ model: Role, as: "role", attributes: ["name"] }],
      });
      if (!manager)
        return res.status(400).json({ message: "Manager user not found" });
    }

    const dealer = await Dealer.create({
      id: uuidv4(),
      name,
      address,
      phone,
      email,
      manager_id: manager_id || null,
    });

    const payload = await Dealer.findByPk(dealer.id, { include: includeManager });
    res.status(201).json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const dealers = await Dealer.findAll({ include: includeManager });
    res.json(dealers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, email, manager_id } = req.body;

    const dealer = await Dealer.findByPk(id);
    if (!dealer) return res.status(404).json({ message: "Dealer not found" });

    if (manager_id) {
      const manager = await User.findByPk(manager_id);
      if (!manager)
        return res.status(400).json({ message: "Manager user not found" });
    }

    dealer.name = name ?? dealer.name;
    dealer.address = address ?? dealer.address;
    dealer.phone = phone ?? dealer.phone;
    dealer.email = email ?? dealer.email;
    dealer.manager_id =
      manager_id !== undefined ? manager_id || null : dealer.manager_id;

    await dealer.save();

    const payload = await Dealer.findByPk(dealer.id, { include: includeManager });
    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const dealer = await Dealer.findByPk(id);
    if (!dealer) return res.status(404).json({ message: "Dealer not found" });

    await dealer.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
