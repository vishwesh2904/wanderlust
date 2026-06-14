const Listing = require('../models/listing.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

function getGeocodingClient() {
  const mapToken = process.env.MAP_TOKEN;
  if (!mapToken) return null;
  return mbxGeocoding({ accessToken: mapToken });
}

module.exports.index = async (req, res) => {
  let { page = 1, limit = 12, category, minPrice, maxPrice, search, country, owner } = req.query;
  page = Math.max(1, parseInt(page));
  limit = Math.min(50, Math.max(1, parseInt(limit)));

  const filter = {};
  if (category) filter.category = category;
  if (country) filter.country = { $regex: country, $options: 'i' };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }
  if (owner) filter.owner = owner;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
  }

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .skip((page - 1) * limit)
      .limit(limit),
    Listing.countDocuments(filter),
  ]);

  res.json({
    listings,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: 'reviews',
      populate: {
        path: 'author',
        select: 'username email',
      },
    })
    .populate('owner', 'username email');
  if (!listing) {
    return res.status(404).json({ error: 'Listing does not exist!' });
  }
  res.json(listing);
};

module.exports.createListing = async (req, res, next) => {
  try {
    const geocodingClient = getGeocodingClient();
    if (!geocodingClient) {
      return res
        .status(503)
        .json({ error: 'Map service is not configured. Please set MAP_TOKEN.' });
    }

    const geoData = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

    if (!geoData.body.features.length) {
      return res.status(400).json({ error: 'Invalid location!' });
    }

    let url = req.file ? req.file.path : '';
    let filename = req.file ? req.file.filename : '';

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = geoData.body.features[0].geometry;

    await newListing.save();

    res.status(201).json(newListing);
  } catch (e) {
    next(e);
  }
};

module.exports.updateListing = async (req, res, next) => {
  try {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    if (typeof req.file !== 'undefined') {
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url, filename };
      await listing.save();
    }

    res.json(listing);
  } catch (e) {
    next(e);
  }
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.json({ message: 'Listing Deleted' });
};
