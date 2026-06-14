# RoamNest (Wanderlust) — Application Architecture

> A full-stack travel listing marketplace with AI-powered trip planning, property comparison, and smart travel tools.

---

## 1. Application Overview

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7, Vite 8, Tailwind CSS 4, shadcn/ui |
| Backend | Node.js, Express 4, Mongoose 8 |
| Database | MongoDB Atlas |
| Auth | JWT (httpOnly cookies) + passport-local-mongoose |
| Maps | Mapbox GL JS (client) + Mapbox Geocoding SDK (server) |
| Media | Cloudinary (image upload via multer) |
| AI | Mock provider (swappable via AI_PROVIDER env var) |
| Testing | Jest + Supertest |

**Purpose:** Users can browse, search, and compare vacation rentals; view workcation/sustainability scores; get AI-generated itineraries and budget estimates; manage wishlists; and hosts can list and manage properties.

---

## 2. Project Structure

```
wanderlust/
+-- app.js                  # Express entry point, middleware, routes, error handler
+-- cloudConfig.js          # Cloudinary + multer storage config
+-- middleware.js            # Auth guards, validation, ownership checks
+-- schema.js               # Joi validation schemas (listing, review)
+-- package.json            # Backend dependencies
+-- jest.config.js          # Jest configuration
+-- .env                    # Environment variables (not committed)
+-- .env.example            # Env var template
¦
+-- controllers/
¦   +-- listing.js          # Listing CRUD + pagination/filtering
¦   +-- review.js           # Review create/delete
¦   +-- user.js             # Signup, login, logout, getMe, upgradeToHost
¦   +-- scores.js           # Workcation + sustainability score calculators
¦   +-- tripPlanner.js      # Budget estimator + itinerary generator
¦   +-- insights.js         # Neighborhood insights
¦   +-- ai.js               # Review summary + seasonal info
¦   +-- wishlist.js         # Wishlist CRUD
¦
+-- models/
¦   +-- listing.js          # Listing schema (geometry, scores, tags, amenities)
¦   +-- user.js             # User schema (passport-local-mongoose)
¦   +-- review.js           # Review schema (rating, comment)
¦   +-- wishlist.js         # Wishlist schema (user + listing unique index)
¦   +-- neighborhood.js     # Neighborhood schema (scores, POIs)
¦
+-- routes/
¦   +-- listing.js          # /api/listings
¦   +-- review.js           # /api/listings/:id/reviews (mergeParams)
¦   +-- user.js             # /api/auth
¦   +-- tripPlanner.js      # /api/trip-planner
¦   +-- wishlist.js         # /api/wishlist
¦   +-- insights.js         # /api/listings/:id/insights
¦   +-- ai.js               # /api/listings/:id/reviews-summary, /api/seasonal
¦
+-- services/
¦   +-- aiProvider.js       # MockAIProvider (itinerary, summary, seasonal)
¦
+-- utils/
¦   +-- ExpressError.js     # Custom error class
¦   +-- jwt.js              # Token sign, verify, cookie set/clear
¦   +-- wrapAsync.js        # Async error wrapper
¦
+-- init/
¦   +-- data.js             # Seed listing data (50+ properties)
¦   +-- index.js            # Seed script (listings + neighborhoods)
¦
+-- __tests__/
¦   +-- app.test.js         # Basic app test
¦
+-- client/                 # React SPA (Vite)
    +-- vite.config.js      # Proxy /api -> localhost:8080, @ alias
    +-- index.html
    +-- package.json
    +-- .env                # VITE_MAPBOX_TOKEN (client-side env)
    +-- src/
        +-- main.jsx
        +-- App.jsx         # Router + AuthProvider + Navbar
        +-- index.css       # Tailwind imports
        +-- lib/
        ¦   +-- api.js      # fetch wrapper + all API methods
        ¦   +-- utils.js    # cn() utility
        +-- contexts/
        ¦   +-- AuthContext.jsx  # Auth state provider
        +-- pages/          # 14 route pages
        +-- components/     # UI + feature components
            +-- ui/         # 19 shadcn/ui primitives
```


## 3. Backend Architecture

### 3.1 Entry Point (app.js)

```
Request -> cookieParser -> json/urlencoded -> routes -> error handler
```

1. Loads .env via dotenv (development only)
2. Connects to MongoDB Atlas
3. Mounts 6 route modules under /api
4. Serves client/dist in production
5. Catch-all GET * serves SPA index.html for client-side routing
6. Global JSON error handler { error: message }
7. Listens on PORT || 8080

### 3.2 Complete Route Table

| Method | Endpoint | Auth | Controller |
|---|---|---|---|
| GET | /api/listings | - | listingController.index |
| POST | /api/listings | isLoggedIn + isHost | listingController.createListing |
| GET | /api/listings/:id | - | listingController.showListing |
| PUT | /api/listings/:id | isLoggedIn + isOwner | listingController.updateListing |
| DELETE | /api/listings/:id | isLoggedIn + isOwner | listingController.destroyListing |
| POST | /api/listings/:id/reviews | isLoggedIn | reviewController.createReview |
| DELETE | /api/listings/:id/reviews/:reviewId | isLoggedIn + isReviewAuthor | reviewController.destroyReview |
| GET | /api/listings/:id/reviews-summary | - | aiController.getReviewSummary |
| GET | /api/listings/:id/insights | - | insightsController.getNeighborhoodInsights |
| POST | /api/auth/signup | - | userController.signup |
| POST | /api/auth/login | - | userController.login |
| GET | /api/auth/logout | - | userController.logout |
| GET | /api/auth/me | - | userController.getMe |
| POST | /api/auth/upgrade | isLoggedIn | userController.upgradeToHost |
| POST | /api/trip-planner/estimate | - | tripPlannerController.estimateBudget |
| POST | /api/trip-planner/itinerary | - | tripPlannerController.generateItinerary |
| GET | /api/wishlist | isLoggedIn | wishlistController.index |
| POST | /api/wishlist | isLoggedIn | wishlistController.toggle |
| DELETE | /api/wishlist/:listingId | isLoggedIn | wishlistController.remove |
| GET | /api/wishlist/check/:listingId | isLoggedIn | wishlistController.check |
| GET | /api/seasonal?location= | - | aiController.getSeasonalInfo |

### 3.3 Middleware (middleware.js)

| Middleware | Logic |
|---|---|
| isLoggedIn | Reads JWT from cookie, verifies, sets req.user and res.locals.currUser |
| isOwner | Finds listing by :id, compares listing.owner._id to req.user._id |
| isHost | Checks req.user.role === 'host' |
| isReviewAuthor | Finds review by :reviewId, compares review.author to req.user._id |
| validateListing | Joi validates req.body.listing, throws 400 on failure |
| validateReview | Joi validates req.body.review, throws 400 on failure |

### 3.4 Data Models

**Listing**
```
title, description, image: { url, filename }, price, location, country
reviews: [ObjectId], owner: ObjectId
geometry: { type: 'Point', coordinates: [lng, lat] }
category: enum(14)
workcationScore: { internetSpeed, workspaceAvailable, noiseLevel, nearbyCafes, powerBackup }
sustainabilityScore: { solarEnergy, waterConservation, wasteManagement, greenCertified }
compatibilityTags: [enum], amenities: [String]
```
Post-hook: cascade delete reviews on findOneAndDelete.

**User**
```
username, email, password (hash via passport-local-mongoose), role: enum(guest, host)
```

**Review**
```
comment, rating: 1-5, createdAt, author: ObjectId
```

**Wishlist**
```
user: ObjectId, listing: ObjectId, createdAt
```
Compound unique index on { user, listing }.

**Neighborhood**
```
locationKey (unique), safetyScore, transitScore
restaurants: [{ name, type, rating, priceRange }]
hospitals: [{ name, distance }]
attractions: [{ name, description, type, rating }]
```

### 3.5 JWT Authentication Flow

```
Signup -> User.register() -> signToken({ id, username, email, role })
  -> setTokenCookie(res, token) -> httpOnly cookie -> { user }

Login -> User.authenticate() -> same token flow

Session restore -> GET /api/auth/me -> read cookie -> jwt.verify
  -> fetch user -> { user } or { user: null }

Logout -> clearTokenCookie(res)

Host upgrade -> set role='host' -> re-sign token -> new cookie
```

Cookie options: httpOnly: true, secure: true (production only), sameSite: lax, maxAge: 7 days.

### 3.6 Joi Validation (schema.js)

**listingSchema** - validates req.body.listing:
- title, description, location, country: string, required
- price: number, required, min 0
- category: string, required, one of 14 values

**reviewSchema** - validates req.body.review:
- rating: number, required, 1-5
- comment: string, required

### 3.7 Error Handling

- ExpressError: new ExpressError(statusCode, message)
- wrapAsync: wraps async route handlers, passes rejections to next(err)
- Global handler: returns { error: message } with appropriate status code

### 3.8 AI Provider (services/aiProvider.js)

Mock implementation swappable via AI_PROVIDER env var. Current methods:
- generateItinerary({ destination, days, interests, budget }) - structured day-by-day plan
- summarizeReviews(reviews) - keyword frequency + positive/negative sentiment
- getSeasonalInfo({ location }) - weather, festivals, best time to visit
- suggestActivities({ location, interests, budget }) - activity suggestions

---

## 4. Frontend Architecture

### 4.1 Component Tree

```
HelmetProvider > BrowserRouter > AuthProvider
  +-- Navbar (logo, nav links, user avatar/dropdown, Toaster)
  +-- Routes
      +-- / -> HomePage
      +-- /listings -> ListingsIndex
      +-- /listings/new -> ProtectedRoute(host) -> CreateListing
      +-- /listings/:id -> ListingShow
      +-- /listings/:id/dashboard -> Dashboard
      +-- /listings/:id/edit -> ProtectedRoute -> EditListing
      +-- /compare -> ComparePage
      +-- /wishlist -> ProtectedRoute -> WishlistPage
      +-- /profile -> ProtectedRoute -> ProfilePage
      +-- /host/dashboard -> ProtectedRoute(host) -> HostDashboard
      +-- /my-listings -> ProtectedRoute(host) -> MyListings
      +-- /login -> LoginPage
      +-- /signup -> SignupPage
```

### 4.2 API Client (lib/api.js)

Single request() wrapper around fetch:
- Prefixes /api, sends credentials: include, JSON Content-Type
- Parses JSON, throws error with .status and .data on non-ok
- create/update for listings use raw fetch (FormData/multipart)

```
api.auth         -> { signup, login, logout, me, upgradeToHost }
api.listings     -> { getAll(params), getById, create, update, delete }
api.reviews      -> { create(listingId, body), delete(listingId, reviewId), summary(listingId) }
api.tripPlanner  -> { estimate(body), itinerary(body) }
api.insights     -> { get(listingId) }
api.seasonal     -> { get(location) }
api.wishlist     -> { getAll, add, remove, check }
```

### 4.3 AuthContext (contexts/AuthContext.jsx)

Provides { user, loading, login, signup, logout, upgradeToHost }:
- On mount: calls GET /api/auth/me to restore session from cookie
- login/signup: calls respective API, sets user state on success
- logout: calls API, clears user state
- upgradeToHost: updates role to host

### 4.4 Feature Components

| Component | Purpose | Data Source |
|---|---|---|
| MapboxMap | Renders map with marker | listing.geometry.coordinates via prop |
| ScoreCard | Circular progress SVG | { label, value, maxValue } via props |
| WorkcationBadge | Workcation score 0-100 | listing.workcationScore (client-calculated) |
| SustainabilityBadge | Eco score 0-100 | listing.sustainabilityScore (client-calculated) |
| WishlistButton | Heart toggle | GET/POST/DELETE /api/wishlist |
| CompareDrawer | Side-by-side property comparison | Search API + GET /api/listings/:id |
| TravelCompatibility | Travel style match % | Client-side only (listingTags prop) |
| BudgetEstimator | Trip cost breakdown | POST /api/trip-planner/estimate |
| AiItinerary | Day-by-day trip plan | POST /api/trip-planner/itinerary |
| NeighborhoodInsights | Nearby POIs + scores | GET /api/listings/:id/insights |
| ReviewSummary | AI sentiment analysis | GET /api/listings/:id/reviews-summary |
| SeasonalRecommendations | Weather + festivals | GET /api/seasonal?location= |
| ProtectedRoute | Auth gate | AuthContext.user |

---

## 5. Feature Deep-Dives

### 5.1 Listing CRUD

| Action | Frontend | API | Backend |
|---|---|---|---|
| Browse | ListingsIndex + URL search params | GET /api/listings?page=&category=&search= | index controller: MongoDB filter with regex, paginated response |
| View | ListingShow -> getById(id) | GET /api/listings/:id | showListing: populate reviews+author, owner |
| Create | CreateListing -> FormData -> create | POST /api/listings | isLoggedIn -> isHost -> multer -> validateListing -> geocode -> save |
| Edit | EditListing -> pre-fill -> FormData -> update | PUT /api/listings/:id | isLoggedIn -> isOwner -> multer -> validateListing -> update |
| Delete | Owner clicks Delete | DELETE /api/listings/:id | isLoggedIn -> isOwner -> destroyListing -> cascade reviews |

### 5.2 Reviews

```
User selects rating (1-5 stars) + writes comment
  -> POST /api/listings/:id/reviews  { review: { rating, comment } }
  -> validateReview (Joi)
  -> createReview: save Review, push to listing.reviews
  -> re-fetch listing -> update UI

User clicks Delete
  -> DELETE /api/listings/:id/reviews/:reviewId
  -> isReviewAuthor check
  -> pull from listing.reviews -> delete Review doc
```

**AI Summary:** GET /api/listings/:id/reviews-summary -> MockAIProvider.summarizeReviews() -> { summary, sentiment, pros, cons, keywords, totalReviews }.

### 5.3 Workcation Scores

```
listing.workcationScore = {
  internetSpeed: 0-100 (30 pts),
  workspaceAvailable: bool (20 pts),
  noiseLevel: Low/Moderate/High (20/10/0 pts),
  nearbyCafes: count (15 pts, capped at 10),
  powerBackup: bool (15 pts)
}
Score = sum of all -> 0-100. Circular badge with tooltip breakdown.
```

### 5.4 Sustainability Ratings

```
listing.sustainabilityScore = {
  solarEnergy: bool,
  waterConservation: bool,
  wasteManagement: bool,
  greenCertified: bool
}
Score = (checkedCount / 4) x 100. Green circular badge with tooltip.
```

### 5.5 Budget Predictor

```
User inputs: days, travelers
  -> POST /api/trip-planner/estimate  { destination, days, travelers }
  -> Backend calculation:
      accommodation = (listingPrice or $150) x days
      food = $30 x travelers x days
      transport = $50 x days
      activities = $40 x travelers x days
  -> Returns { breakdown: { accommodation, food, transport, activities }, total }
```

### 5.6 AI Trip Planner

```
User selects: days, interest (Sightseeing/Adventure/Food/Relaxation/Culture),
  budget (Budget/Moderate/Luxury)
  -> POST /api/trip-planner/itinerary  { destination, days, interests, budget }
  -> MockAIProvider.generateItinerary() -> structured day-by-day plan
  -> Returns: [{ day, date, morning, afternoon, evening, meals, tips }]
```

### 5.7 Travel Compatibility

Client-side only. User clicks travel-style tags:
```
match % = (selectedTags matching listingTags) / selectedTags x 100
Color: >=66% green, >=33% amber, <33% muted
```

### 5.8 Smart Comparison

```
Search by name (debounced 300ms) via GET /api/listings?search=&limit=8
  OR paste listing ID manually
-> Add up to 4 IDs (stored in sessionStorage)
-> Click "Compare N Properties"
-> Promise.all(listingIds.map(id => api.listings.getById(id)))
-> Render comparison table:
    Price | Location | Category | Workcation | Eco Score | Tags | Amenities
```

### 5.9 Neighborhood Insights

```
GET /api/listings/:id/insights
  -> Backend looks up Neighborhood by "{location}, {country}"
  -> Returns { safetyScore, transitScore, restaurants[], hospitals[], attractions[] }
  -> Client renders score bars + POI lists
```

### 5.10 Wishlist

```
Check: GET  /api/wishlist/check/:listingId -> { wishlisted: bool }
Toggle: POST /api/wishlist { listingId } -> upsert (add if new, remove if exists)
List:   GET  /api/wishlist -> populated wishlist entries
Remove: DEL  /api/wishlist/:listingId -> delete entry
```

### 5.11 Seasonal Recommendations

```
GET /api/seasonal?location=<name>
  -> MockAIProvider.getSeasonalInfo() -> detects mountain/beach/default
  -> Returns { bestTime, weatherTrends, festivals, crowdLevel, costFactor }
```

---

## 6. Key Data Flows (End-to-End)

### 6.1 User Browses Listings

```
ListingsIndex mounts
  -> reads URL search params (?category=Beach&search=Malibu&page=1)
  -> api.listings.getAll({ category: 'Beach', search: 'Malibu', page: '1' })
  -> fetch GET /api/listings?category=Beach&search=Malibu&page=1&limit=12
  -> Backend: index controller builds filter
  -> MongoDB query with skip/limit
  -> Response: { listings: [...], total, page, pages }
  -> Client renders card grid + pagination
```

### 6.2 User Compares 3 Properties

```
User opens Compare drawer
  -> Types "beach" in search input
  -> 300ms debounce -> GET /api/listings?search=beach&limit=8
  -> Results dropdown shows matching listings
  -> User clicks listing -> addId(listing._id)
  -> ID stored in sessionStorage + shown as named badge
  -> User adds 2 more (up to 4)
  -> Clicks "Compare 3 Properties"
  -> Promise.all([getById(id1), getById(id2), getById(id3)])
  -> Scores calculated client-side
  -> Table renders: Feature rows x Property columns
```

### 6.3 User Writes a Review

```
User selects 4 stars + types "Great place!"
  -> handleReviewSubmit
  -> POST /api/listings/:id/reviews { review: { rating: 4, comment: "Great place!" } }
  -> Backend: isLoggedIn -> validateReview (Joi) -> createReview
  -> new Review saved -> pushed to listing.reviews
  -> Response 201
  -> Client re-fetches listing -> UI updates
```

### 6.4 Host Creates a Listing

```
Host fills CreateListing form
  -> FormData built: listing[title], listing[image] (file), etc.
  -> POST /api/listings with credentials
  -> Backend: isLoggedIn -> isHost -> multer -> validateListing -> geocode
  -> Save Listing with geometry.coordinates + image.url
  -> Response 201
  -> Client navigates to /listings/:newId
```

---

## 7. Configuration & Environment

| Variable | Used By | Purpose |
|---|---|---|
| ATLASDB_URL | app.js / init/index.js | MongoDB connection string |
| SECRET | utils/jwt.js | JWT signing secret (fallback) |
| JWT_SECRET | utils/jwt.js | JWT signing secret (primary) |
| CLOUD_NAME | cloudConfig.js | Cloudinary cloud name |
| CLOUD_API_KEY | cloudConfig.js | Cloudinary API key |
| CLOUD_API_SECRET | cloudConfig.js | Cloudinary API secret |
| MAP_TOKEN | controllers/listing.js | Mapbox Geocoding SDK token |
| VITE_MAPBOX_TOKEN | client/.env -> MapboxMap.jsx | Mapbox GL JS token |
| AI_PROVIDER | services/aiProvider.js | AI backend selection (default: mock) |
| PORT | app.js | Server port (default: 8080) |
| NODE_ENV | Various | Production/development mode |

---

## 8. Testing

- Framework: Jest + Supertest
- Environment: Node
- Config: forceExit: true, detectOpenHandles: true
- Script: npm test -> jest --forceExit
- Coverage: Basic app test in __tests__/app.test.js

---

## 9. Security Considerations

- JWT stored in httpOnly cookie (prevents XSS token theft)
- secure: true cookie flag in production (HTTPS only)
- sameSite: lax prevents CSRF for top-level navigations
- Passwords hashed via passport-local-mongoose (bcrypt-derived salt rounds)
- Joi validation on all write endpoints prevents malformed data
- Ownership checks (isOwner, isReviewAuthor) prevent unauthorized mutations
- Role-based access (isHost) prevents guest users from creating listings
- Multer file type restriction (png, jpg, jpeg only)
- Cloudinary provides secure image hosting
- No secrets in client bundle (only VITE_-prefixed vars exposed)

---

## 10. Performance & UX Notes

- Debounced search (300ms) in CompareDrawer prevents excessive API calls
- SessionStorage for compare IDs persists across page navigation within a tab
- URL-based filter state in ListingsIndex - shareable/bookmarkable URLs
- Skeleton loading states prevent layout shift
- Client-side score calculation avoids extra API calls
- Promise.all for parallel listing fetches in CompareDrawer
- Pagination (12 per page) with page/pageSize controls
- React Helmet for per-page SEO meta tags
