const Listing = require('../models/listing.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

function getGeocodingClient() {
  const mapToken = process.env.MAP_TOKEN;
  if (!mapToken) return null;
  return mbxGeocoding({ accessToken: mapToken });
}

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render('listings/index.ejs', { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render('listings/new.ejs');
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: 'reviews',
      populate: {
        path: 'author',
      },
    })
    .populate('owner');
  if (!listing) {
    req.flash('error', 'Listing does not exist!');
    res.redirect('/listings');
  }
  res.render('listings/show.ejs', { listing });
};

module.exports.createListing = async (req, res, next) => {
  try {
    const geocodingClient = getGeocodingClient();
    if (!geocodingClient) {
      req.flash('error', 'Map service is not configured. Please set MAP_TOKEN.');
      return res.redirect('/listings/new');
    }

    const geoData = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

    if (!geoData.body.features.length) {
      req.flash('error', 'Invalid location!');
      return res.redirect('/listings/new');
    }

    let url = req.file ? req.file.path : '';
    let filename = req.file ? req.file.filename : '';

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = geoData.body.features[0].geometry;

    await await newListing.save();

    req.flash('success', 'New Listing Created');
    res.redirect('/listings');
  } catch (e) {
    next(e);
  }
};
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash('error', 'Listing does not exist!');
    res.redirect('/listings');
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace('/upload', '/upload/w_250');
  res.render('listings/edit.ejs', { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res, next) => {
  try {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== 'undefined') {
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url, filename };
      await listing.save();
    }
    req.flash('success', 'Listing Updated');
    res.redirect(`/listings/${id}`);
  } catch (e) {
    next(e);
  }
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;

  await Listing.findByIdAndDelete(id);

  req.flash('success', 'Listing Deleted');
  res.redirect('/listings');
};

module.exports.filterListingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const filteredListings = await Listing.find({ category });
    res.render('listings/index.ejs', { allListings: filteredListings });
  } catch (e) {
    req.flash('error', 'Unable to filter listings by category');
    res.redirect('/listings');
  }
};

module.exports.filterByCategory = async (req, res) => {
  const { category } = req.params;
  const allListings = await Listing.find({ category });
  res.render('listings/index.ejs', { allListings });
};
