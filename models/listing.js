const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const User = require("../models/user.js");
const { string } = require("joi");
const CATEGORY_ENUM = [
  "Trending",
  "Rooms",
  "Iconic cities",
  "Mountains",
  "Castles",
  "Pools",
  "Villas",
  "Beach",
  "Camping",
  "Farms",
  "Arctic",
  "Domes",
  "Boats",
  "Others"
];

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  category: {
    type: String,
    required: true,
    enum: CATEGORY_ENUM,
  },
});
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
