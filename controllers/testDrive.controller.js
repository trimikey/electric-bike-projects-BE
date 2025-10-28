const { v4: uuidv46 } = require("uuid");
const { TestDrive } = require("../models");


exports.schedule = async (req, res) => {
const { customer_id, dealer_id, vehicle_model_id, staff_id, schedule_at, notes } = req.body;
const td = await TestDrive.create({
id: uuidv46(),
customer_id,
dealer_id,
vehicle_model_id,
staff_id,
schedule_at,
status: "scheduled",
notes,
});
res.status(201).json(td);
};      