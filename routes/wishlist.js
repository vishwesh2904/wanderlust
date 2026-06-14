const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const { isLoggedIn } = require('../middleware.js');
const wishlist = require('../controllers/wishlist.js');

router
  .route('/')
  .get(isLoggedIn, wrapAsync(wishlist.index))
  .post(isLoggedIn, wrapAsync(wishlist.toggle));

router.get('/check/:listingId', isLoggedIn, wrapAsync(wishlist.check));
router.delete('/:listingId', isLoggedIn, wrapAsync(wishlist.remove));

module.exports = router;
