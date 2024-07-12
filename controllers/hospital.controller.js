const Hospital = require("../models/Hospital.model");

// Get all hospitals
exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.status(200).json(hospitals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a new hospital (if needed)
exports.addHospital = async (req, res) => {
  try {
    const { name, address, city, state, contactNumber } = req.body;
    const hospital = new Hospital({
      name,
      address,
      city,
      state,
      contactNumber,
    });
    await hospital.save();
    res.status(201).json(hospital);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
