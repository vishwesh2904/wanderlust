const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const ai = require('../controllers/ai.js');

router.get('/listings/:id/reviews-summary', wrapAsync(ai.getReviewSummary));
router.get('/seasonal', wrapAsync(ai.getSeasonalInfo));

module.exports = router;
