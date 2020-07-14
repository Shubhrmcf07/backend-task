const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },

  description: {
    type: String,
    trim: true,
    required: true,
  },

  min_age: {
    type: Number,
  },

  prequels: {
    type: [mongoose.Types.ObjectId],
    ref: "games",
  },

  tags: {
    type: [String],
  },
});

module.exports = mongoose.model("games", gameSchema);
