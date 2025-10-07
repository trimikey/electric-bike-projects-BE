const { v4: uuidv4 } = require("uuid");
const { Complaint } = require("../models");

exports.createComplaint = async (req, res) => {
  try {
    const { customer_id, dealer_id, order_id, description } = req.body;
    if (!customer_id || !description) {
      return res.status(400).json({ message: "customer_id và description là bắt buộc" });
    }

    const complaint = await Complaint.create({
      id: uuidv4(),
      customer_id,
      dealer_id,
      order_id,
      description,
    });

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status = "resolved" } = req.body;

    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    await complaint.update({ status, resolved_at: new Date() });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
