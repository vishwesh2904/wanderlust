const Wishlist = require('../models/wishlist.js');
const Listing = require('../models/listing.js');

module.exports.index = async (req, res) => {
  const wishlist = await Wishlist.find({ user: req.user._id })
    .populate('listing')
    .sort('-createdAt');
  res.json(wishlist);
};

module.exports.toggle = async (req, res) => {
  const { listingId } = req.body;
  if (!listingId) {
    return res.status(400).json({ error: 'listingId is required' });
  }

  const listing = await Listing.findById(listingId);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  const existing = await Wishlist.findOne({ user: req.user._id, listing: listingId });

  if (existing) {
    await Wishlist.findByIdAndDelete(existing._id);
    return res.json({ wishlisted: false, message: 'Removed from wishlist' });
  }

  await Wishlist.create({ user: req.user._id, listing: listingId });
  res.status(201).json({ wishlisted: true, message: 'Added to wishlist' });
};

module.exports.remove = async (req, res) => {
  const { listingId } = req.params;

  const deleted = await Wishlist.findOneAndDelete({
    user: req.user._id,
    listing: listingId,
  });

  if (!deleted) {
    return res.status(404).json({ error: 'Not in wishlist' });
  }

  res.json({ message: 'Removed from wishlist' });
};

module.exports.check = async (req, res) => {
  const { listingId } = req.params;

  const existing = await Wishlist.findOne({ user: req.user._id, listing: listingId });
  res.json({ wishlisted: !!existing });
};
