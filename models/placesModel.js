const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Place name is required"],
    },
    description: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    entryFee: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    images: {
      type: String,
    },
    openingTime: {
      type: Date,
      required: true,
    },
    closingTime: {
      type: Date,
      required: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Hospitals",
        "Transportation",
        "Historical",
        "Souvenir",
        "Museums",
        "Entertainment",
        "Hotels",
        "Restaurants",
        "Beaches",
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Place", placeSchema);
