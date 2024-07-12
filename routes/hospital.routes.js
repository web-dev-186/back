const express = require("express");
const router = express.Router();
const hospitalController = require("../controllers/hospital.controller");

// Route to get all hospitals
router.get("/hospitals", hospitalController.getAllHospitals);

// Route to add a new hospital (if needed)
router.post("/hospitals", hospitalController.addHospital);

module.exports = router;
