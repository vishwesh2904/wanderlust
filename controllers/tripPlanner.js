const Listing = require('../models/listing.js');
const { createAIProvider } = require('../services/aiProvider.js');

const ai = createAIProvider();

module.exports.estimateBudget = async (req, res) => {
  const { destination, days = 1, travelers = 1 } = req.body;
  if (!destination) {
    return res.status(400).json({ error: 'Destination is required' });
  }

  const numDays = Math.max(1, parseInt(days));
  const numTravelers = Math.max(1, parseInt(travelers));

  const listing = await Listing.findOne({
    $or: [
      { location: { $regex: destination, $options: 'i' } },
      { country: { $regex: destination, $options: 'i' } },
    ],
  });

  const nightlyRate = listing?.price || 150;
  const accommodation = nightlyRate * numDays;
  const food = 30 * numTravelers * numDays;
  const transport = 50 * numDays;
  const activities = 40 * numTravelers * numDays;

  res.json({
    destination,
    days: numDays,
    travelers: numTravelers,
    breakdown: {
      accommodation: {
        label: 'Accommodation',
        amount: accommodation,
        details: `$${nightlyRate}/night × ${numDays} nights`,
      },
      food: {
        label: 'Food & Dining',
        amount: food,
        details: `$${30}/person/day × ${numTravelers} people × ${numDays} days`,
      },
      transport: {
        label: 'Local Transport',
        amount: transport,
        details: `$${50}/day for ${numDays} days`,
      },
      activities: {
        label: 'Activities',
        amount: activities,
        details: `$${40}/person/day × ${numTravelers} people × ${numDays} days`,
      },
    },
    total: accommodation + food + transport + activities,
    currency: 'USD',
  });
};

module.exports.generateItinerary = async (req, res) => {
  const { destination, days = 3, interests = ['sightseeing'], budget = 'moderate' } = req.body;
  if (!destination) {
    return res.status(400).json({ error: 'Destination is required' });
  }

  const result = ai.generateItinerary({ destination, days: parseInt(days), interests, budget });
  res.json(result);
};
