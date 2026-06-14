# Setup Guide — RoamNest (Wanderlust)

> Local development setup instructions for the full-stack application.

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | >= 18.17.1 | Check with `node -v` |
| npm | >= 9 | Check with `npm -v` |
| MongoDB Atlas | Free tier | Or local MongoDB instance |
| Cloudinary | Free account | Image hosting |
| Mapbox | Free account | Maps + geocoding |

---

## Step 1: Clone & Install Dependencies

```bash
git clone <repo-url> wanderlust
cd wanderlust

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

---

## Step 2: Environment Variables

Create `.env` in the project root (use `.env.example` as reference):

```env
ATLASDB_URL=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/roamnest
SECRET=your-random-64-char-hex-secret
JWT_SECRET=your-jwt-secret (optional, falls back to SECRET)

CLOUD_NAME=your-cloudinary-cloud-name
CLOUD_API_KEY=your-cloudinary-api-key
CLOUD_API_SECRET=your-cloudinary-api-secret

MAP_TOKEN=pk.your-mapbox-token
```

Create `client/.env` for Vite:

```env
VITE_MAPBOX_TOKEN=pk.your-mapbox-token
```

> **Important:** The client env file is separate because Vite only exposes `VITE_` prefixed vars to the browser.

---

## Step 3: Database & Seed

Make sure your `ATLASDB_URL` is correct, then seed the database:

```bash
# Seed listings, reviews, and neighborhoods
node init/index.js <owner-user-id>
```

The `<owner-user-id>` is a MongoDB ObjectId of a user to own the seed listings. You can first create a user via the app, then grab its `_id`.

---

## Step 4: Run the Application

### Development (both servers)

```bash
# From project root — starts backend on :8080 and client on :5173
npx concurrently "npm start" "npm run dev --prefix client"
```

Or run separately:

```bash
# Terminal 1 — Backend
npm start

# Terminal 2 — Client (with hot reload)
cd client
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:8080` (configured in `client/vite.config.js`).

---

## Step 5: Verify It Works

1. Open `http://localhost:5173` in your browser
2. Sign up for a new account
3. Browse listings on the home page
4. Click into a listing detail page
5. Test features: Workcation scores, Eco badges, Budget Estimator, Compare

---

## Common Issues

| Problem | Solution |
|---|---|
| `Map unavailable — MAPBOX_TOKEN not configured` | Ensure `VITE_MAPBOX_TOKEN` is set in `client/.env` and restart the Vite dev server |
| `"review.rating" is required` | Select a star rating before submitting the review |
| MongoDB connection error | Check `ATLASDB_URL` in `.env` and whitelist your IP in Atlas |
| Cloudinary upload fails | Verify `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET` |
| `JWT_SECRET not set` | Add `SECRET` or `JWT_SECRET` to `.env` |
| Seed script fails | Pass a valid user ObjectId as the argument |
