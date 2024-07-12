const express = require("express");
const router = express.Router();
const cardController = require("../controllers/card.controller");

// Route to create a new card
router.post("/cards", cardController.createCard);

// Route to renew a card

router.put("/cards/renew/:cardId", cardController.renewCard);
// Route to get all cards for a user

router.get("/cards/:userId", cardController.getCardByUserId);

// Route to get a card by ID
router.get("/cards/:cardId", cardController.getCardById);

module.exports = router;
