const Listing = require('./models/listing');
const Review = require('./models/review');
const User = require('./models/user');
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema, reviewSchema } = require('./schema.js');
const { verifyToken } = require('./utils/jwt.js');

module.exports.isLoggedIn = async (req, res, next) => {
  const decoded = verifyToken(req);
  if (!decoded) {
    return res.status(401).json({ error: 'Log in to perform this action' });
  }
  const user = await User.findById(decoded.id).select('username email role');
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  req.user = user;
  res.locals.currUser = user;
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  if (!listing.owner._id.equals(req.user._id)) {
    return res.status(403).json({ error: 'Only the owner can edit/delete the listing' });
  }
  next();
};

module.exports.isHost = (req, res, next) => {
  if (req.user.role !== 'host') {
    return res.status(403).json({ error: 'Only hosts can perform this action' });
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(400, errMsg);
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(400, errMsg);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }
  if (!review.author.equals(req.user._id)) {
    return res.status(403).json({ error: 'Only the author can delete the review' });
  }
  next();
};
