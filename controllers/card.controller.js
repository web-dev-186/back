const Card = require("../models/Card.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

// Create a new card

exports.getCardByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Query the database to find the card by userId and populate the user's name
    const card = await Card.findOne({ userId }).populate({
      path: "userId",
      model: User,
      select: "name", // Specify the fields to select from the User model
    });

    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    res.status(200).json(card);
  } catch (err) {
    console.error("Error retrieving card:", err);
    res.status(500).json({ error: "Failed to retrieve card" });
  }
};
// Import ObjectId from mongoose

exports.createCard = async (req, res) => {
  try {
    const { userId, planName, expiredAt } = req.body;

    // Create a new card instance
    const newCard = new Card({
      userId,
      planName,
      expiredAt,
    });

    // Save the card to the database
    await newCard.save();

    res
      .status(201)
      .json({ message: "Card created successfully", card: newCard });
  } catch (err) {
    console.error("Error creating card:", err);
    res.status(500).json({ error: "Failed to create card" });
  }
};
// Renew a card

exports.renewCard = async (req, res) => {
  try {
    const cardId = req.params.cardId;
    console.log("Received cardId:", cardId); // Debugging line

    // Validate cardId
    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      return res.status(400).json({ error: "Invalid card ID format" });
    }

    // Find the card by cardId
    const card = await Card.findById(cardId);
    console.log("Found card:", card); // Debugging line

    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    // Get today's date
    const today = new Date();

    // Add one year to today's date for the new expiration date
    const newExpiredAt = new Date(today);
    newExpiredAt.setFullYear(newExpiredAt.getFullYear() + 1);

    // Update card with new expiration date
    card.expiredAt = newExpiredAt;

    // Save the updated card
    await card.save();

    res.status(200).json({ message: "Card renewed successfully", card });
  } catch (err) {
    console.error("Error renewing card:", err);
    res.status(500).json({ error: "Failed to renew card" });
  }
};
exports.getmycard = async (req, res) => {
  const { userId } = req.params; // Extract userId from route parameters

  console.log("Searching for userId:", userId);

  try {
    const cards = await Card.find({ userId: userId }).populate("planId");

    console.log("Cards found:", cards);

    if (!cards || cards.length === 0) {
      return res.status(404).json({ message: "Cards not found" });
    }

    res.json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get card by ID
exports.getCardById = async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId);
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }
    res.status(200).json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getCardsByuserId = async (req, res) => {
  const { userId } = req.params; // Assuming userId is passed as a parameter

  try {
    // Find cards associated with the userId and populate the 'userId' field to get user details
    const cards = await Card.find({ userId }).populate("userId");

    if (!cards) {
      return res.status(404).json({ message: "No cards found for the user" });
    }

    res.status(200).json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).json({ message: "Error fetching cards" });
  }
};
