const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Ensures that the unique index is only applied to documents where googleId is not null
    index: true, // Ensure this field is indexed for faster lookups
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
});

module.exports = mongoose.model("User", UserSchema);
