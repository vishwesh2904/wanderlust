const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const tripPlanner = require('../controllers/tripPlanner.js');

router.post('/estimate', wrapAsync(tripPlanner.estimateBudget));
router.post('/itinerary', wrapAsync(tripPlanner.generateItinerary));

module.exports = router;
