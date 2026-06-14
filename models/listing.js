const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review.js');
const CATEGORY_ENUM = [
  'Trending',
  'Rooms',
  'Iconic cities',
  'Mountains',
  'Castles',
  'Pools',
  'Villas',
  'Beach',
  'Camping',
  'Farms',
  'Arctic',
  'Domes',
  'Boats',
  'Others',
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
      ref: 'Review',
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
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
  workcationScore: {
    internetSpeed: { type: Number, default: 0 },
    workspaceAvailable: { type: Boolean, default: false },
    noiseLevel: { type: String, enum: ['Low', 'Moderate', 'High'], default: 'Moderate' },
    nearbyCafes: { type: Number, default: 0 },
    powerBackup: { type: Boolean, default: false },
  },
  sustainabilityScore: {
    solarEnergy: { type: Boolean, default: false },
    waterConservation: { type: Boolean, default: false },
    wasteManagement: { type: Boolean, default: false },
    greenCertified: { type: Boolean, default: false },
  },
  compatibilityTags: [
    { type: String, enum: ['Adventure', 'Family', 'Luxury', 'Workcation', 'Budget'] },
  ],
  amenities: [String],
});
listingSchema.post('findOneAndDelete', async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
