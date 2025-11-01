const { v4: uuidv4 } = require("uuid");
const { TestDrive } = require("../models");

exports.scheduleTestDrive = async (req, res) => {
  try {
    const { customer_id, dealer_id, vehicle_model_id, staff_id, schedule_at, notes } = req.body;
    if (!customer_id || !dealer_id || !vehicle_model_id || !schedule_at) {
      return res.status(400).json({ message: "Thiếu thông tin đặt lịch" });
    }

    const testDrive = await TestDrive.create({
      id: uuidv4(),
      customer_id,
      dealer_id,
      vehicle_model_id,
      staff_id,
      scheduled_at: schedule_at,
      status: "scheduled",
      notes,
    });

    res.status(201).json(testDrive);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
