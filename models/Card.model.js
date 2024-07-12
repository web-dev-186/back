const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  planName: {
    type: String,
    required: true,
  },
  expiredAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Card", CardSchema);
