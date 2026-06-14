const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const insights = require('../controllers/insights.js');

router.get('/listings/:id/insights', wrapAsync(insights.getNeighborhoodInsights));

module.exports = router;
