const Listing = require('../models/listing.js');
const Neighborhood = require('../models/neighborhood.js');

module.exports.getNeighborhoodInsights = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id).select('location country');
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  const locationKey = `${listing.location}, ${listing.country}`;
  let neighborhood = await Neighborhood.findOne({ locationKey });

  if (!neighborhood) {
    neighborhood = await Neighborhood.findOne({
      locationKey: { $regex: listing.country, $options: 'i' },
    });
  }

  if (!neighborhood) {
    return res.json({
      locationKey,
      safetyScore: 70,
      transitScore: 50,
      restaurants: [
        { name: `${listing.location} Bistro`, type: 'Local', rating: 4.0, priceRange: '$$' },
        { name: 'Cafe Central', type: 'Café', rating: 3.8, priceRange: '$' },
        { name: 'The Garden House', type: 'International', rating: 4.2, priceRange: '$$' },
      ],
      hospitals: [
        { name: `${listing.country} General Hospital`, distance: '3.0 mi' },
        { name: 'City Medical Center', distance: '5.0 mi' },
      ],
      attractions: [
        {
          name: `${listing.location} Downtown`,
          description: 'Main city area with shops and dining',
          type: 'Culture',
          rating: 4.0,
        },
        {
          name: 'Local Park',
          description: 'Green space for relaxation',
          type: 'Nature',
          rating: 3.8,
        },
        {
          name: 'Heritage Museum',
          description: 'Local history and culture exhibits',
          type: 'Culture',
          rating: 4.1,
        },
      ],
    });
  }

  res.json(neighborhood);
};
