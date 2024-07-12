// controllers/plan.controller.js
const Plan = require("../models/Plan.model");

exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find();
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: "Error fetching plans", error });
  }
};

exports.addPlan = async (req, res) => {
  try {
    const { name, price, features } = req.body;
    const newPlan = new Plan({ name, price, features });
    await newPlan.save();
    res.status(201).json(newPlan);
  } catch (error) {
    res.status(500).json({ message: "Error creating plan", error });
  }
};
