const mongoose = require("mongoose");

const ChatImageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    file: {
      type: String,
      required: true,
    },
    king_name: {
      type: String,
      // required: true,
    },
    description: {
      type: String,
      // required: true,
    },
    video: {
      type: String,
      // required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatImage", ChatImageSchema);
