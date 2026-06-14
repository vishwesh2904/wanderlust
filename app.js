if (process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const ExpressError = require('./utils/ExpressError.js');

const listingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');
const tripPlannerRouter = require('./routes/tripPlanner.js');
const wishlistRouter = require('./routes/wishlist.js');
const insightsRouter = require('./routes/insights.js');
const aiRouter = require('./routes/ai.js');

const dbUrl = process.env.ATLASDB_URL;

if (!dbUrl) {
  console.error('Missing ATLASDB_URL. Copy .env.example to .env and fill in your credentials.');
  process.exit(1);
}

main()
  .then(() => {
    console.log('Connected to DB');
  })
  .catch((err) => {
    console.error(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/listings', listingRouter);
app.use('/api/listings/:id/reviews', reviewRouter);
app.use('/api/auth', userRouter);
app.use('/api/trip-planner', tripPlannerRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api', insightsRouter);
app.use('/api', aiRouter);

const clientDist = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDist));

app.get('/api/*', (req, res, next) => {
  next(new ExpressError(404, 'Page not Found!'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use((err, req, res, _next) => {
  let { statusCode = 500, message = 'Something went Wrong!' } = err;
  res.status(statusCode).json({ error: message });
});

const port = process.env.PORT || 8080;
module.exports = app;

if (require.main === module) {
  app.listen(port, () => {
    console.log('server is listening to port ' + port);
  });
}
