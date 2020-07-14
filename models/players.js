const mongoose = require("mongoose");
const validator = require("validator");

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    text: true,
  },

  email: {
    type: String,
    validate: [validator.isEmail, "Invalid Email"],
    trim: true,
    unique: true,
    required: true,
    lowercase: true,
  },

  age: {
    type: Number,
    required: true,
    trim: true,
  },

  games_purchased: {
    type: [mongoose.Types.ObjectId],
    ref: "games",
  },

  friends: {
    type: [mongoose.Types.ObjectId],
    ref: "players",
  },

  games_completed: {
    type: [mongoose.Types.ObjectId],
    ref: "games",
  },
});

module.exports = mongoose.model("players", playerSchema);
