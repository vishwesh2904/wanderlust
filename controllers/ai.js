const Listing = require('../models/listing.js');
const { createAIProvider } = require('../services/aiProvider.js');

const ai = createAIProvider();

module.exports.getReviewSummary = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id).populate({
    path: 'reviews',
    populate: { path: 'author', select: 'username' },
  });

  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  const reviews = listing.reviews || [];
  const result = ai.summarizeReviews(reviews);
  res.json(result);
};

module.exports.getSeasonalInfo = async (req, res) => {
  const { location } = req.query;
  if (!location) {
    return res.status(400).json({ error: 'Location query parameter is required' });
  }

  const result = ai.getSeasonalInfo({ location });
  res.json(result);
};
