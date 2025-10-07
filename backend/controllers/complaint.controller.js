const { v4: uuidv47 } = require("uuid");
const { Complaint } = require("../models");
exports.create = async (req, res) => {
const { customer_id, dealer_id, order_id, description } = req.body;
const c = await Complaint.create({ id: uuidv47(), customer_id, dealer_id, order_id, description });
res.status(201).json(c);
};
exports.resolve = async (req, res) => {
const { id, status = "resolved" } = req.body;
const c = await Complaint.findByPk(id);
if (!c) return res.status(404).json({ message: "Complaint not found" });
await c.update({ status, resolved_at: new Date() });
res.json(c);
};  