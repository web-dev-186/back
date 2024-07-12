// routes/plan.routes.js
const express = require("express");
const router = express.Router();
const planController = require("../controllers/plan.controller");

router.get("/plans", planController.getPlans);
router.post("/plans", planController.addPlan);

module.exports = router;
