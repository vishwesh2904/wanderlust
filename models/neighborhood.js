const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const neighborhoodSchema = new Schema({
  locationKey: {
    type: String,
    required: true,
    unique: true,
  },
  safetyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 70,
  },
  transitScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  restaurants: [
    {
      name: String,
      type: String,
      rating: { type: Number, min: 1, max: 5 },
      priceRange: { type: String, enum: ['$', '$$', '$$$'], default: '$$' },
    },
  ],
  hospitals: [
    {
      name: String,
      distance: String,
      phone: String,
    },
  ],
  attractions: [
    {
      name: String,
      description: String,
      type: {
        type: String,
        enum: ['Nature', 'Culture', 'Food', 'Adventure', 'Shopping', 'History'],
      },
      rating: { type: Number, min: 1, max: 5 },
    },
  ],
});

module.exports = mongoose.model('Neighborhood', neighborhoodSchema);
