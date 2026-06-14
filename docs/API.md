# API Reference — RoamNest (Wanderlust)

> Base URL: `http://localhost:8080/api` (dev) or `/api` (production proxy via Vite)
> Auth: JWT in httpOnly cookie (sent automatically with `credentials: "include"`)

---

## Table of Contents

- [Authentication](#authentication)
- [Listings](#listings)
- [Reviews](#reviews)
- [Trip Planner](#trip-planner)
- [Wishlist](#wishlist)
- [Insights](#insights)
- [AI Features](#ai-features)

---

## Authentication

### POST /api/auth/signup

Create a new user account.

**Request body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Success response (201):**
```json
{
  "user": { "id": "...", "username": "johndoe", "email": "john@example.com", "role": "guest" }
}
```

**Errors:** 400 if username/email taken or validation fails.

---

### POST /api/auth/login

Authenticate an existing user.

**Request body:**
```json
{
  "username": "johndoe",
  "password": "securepassword"
}
```

**Success response (200):**
```json
{
  "user": { "id": "...", "username": "johndoe", "email": "john@example.com", "role": "guest" }
}
```

**Errors:** 401 on invalid credentials.

---

### GET /api/auth/me

Restore session (check if logged in). Reads token from cookie.

**Success response (200):**
```json
{
  "user": { "id": "...", "username": "johndoe", "email": "john@example.com", "role": "host" }
}
```

Or if not authenticated:
```json
{
  "user": null
}
```

---

### GET /api/auth/logout

Clear the auth cookie.

**Success response (200):**
```json
{
  "message": "Logged out"
}
```

---

### POST /api/auth/upgrade

Upgrade guest account to host. Requires authentication.

**Success response (200):**
```json
{
  "user": { "id": "...", "username": "johndoe", "email": "john@example.com", "role": "host" }
}
```

---

## Listings

### GET /api/listings

List all listings with optional filters and pagination.

**Query parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| page | number | 1 | Page number |
| limit | number | 12 | Items per page (max 50) |
| category | string | - | Filter by category enum |
| search | string | - | Search title/description/location (regex) |
| minPrice | number | - | Minimum price filter |
| maxPrice | number | - | Maximum price filter |
| country | string | - | Filter by country (regex) |
| owner | string | - | Filter by owner ObjectId |

**Success response (200):**
```json
{
  "listings": [
    {
      "_id": "65abc...",
      "title": "Beachfront Villa",
      "description": "Beautiful villa...",
      "image": { "url": "https://...", "filename": "..." },
      "price": 250,
      "location": "Malibu",
      "country": "United States",
      "category": "Beach",
      "geometry": { "type": "Point", "coordinates": [-118.7, 34.0] },
      "workcationScore": { "internetSpeed": 85, "workspaceAvailable": true, ... },
      "sustainabilityScore": { "solarEnergy": false, ... },
      "compatibilityTags": ["Family", "Relaxation"],
      "amenities": ["WiFi", "Kitchen", "Parking"]
    }
  ],
  "total": 25,
  "page": 1,
  "pages": 3
}
```

---

### GET /api/listings/:id

Get a single listing with populated reviews and owner.

**Success response (200):**
```json
{
  "_id": "65abc...",
  "title": "Beachfront Villa",
  "description": "Beautiful villa...",
  "image": { "url": "https://...", "filename": "..." },
  "price": 250,
  "location": "Malibu",
  "country": "United States",
  "category": "Beach",
  "geometry": { "type": "Point", "coordinates": [-118.7, 34.0] },
  "owner": { "_id": "...", "username": "hostname" },
  "reviews": [
    {
      "_id": "...",
      "rating": 4,
      "comment": "Great place!",
      "author": { "_id": "...", "username": "guest1" }
    }
  ],
  "workcationScore": { ... },
  "sustainabilityScore": { ... },
  "compatibilityTags": ["Family", "Relaxation"],
  "amenities": ["WiFi", "Kitchen", "Parking"]
}
```

**Errors:** 404 if listing does not exist.

---

### POST /api/listings

Create a new listing. Requires authentication + host role.

**Request:** `multipart/form-data`

| Field | Type | Required |
|---|---|---|
| listing[title] | string | yes |
| listing[description] | string | yes |
| listing[price] | number | yes |
| listing[location] | string | yes |
| listing[country] | string | yes |
| listing[category] | string | yes |
| listing[image] | file | no |

**Success response (201):** Returns the created listing document.

---

### PUT /api/listings/:id

Update a listing. Requires authentication + ownership.

**Request:** `multipart/form-data` (same fields as POST)

**Success response (200):** Returns the updated listing document.

---

### DELETE /api/listings/:id

Delete a listing. Requires authentication + ownership. Cascading deletes associated reviews.

**Success response (200):**
```json
{ "message": "Listing Deleted!" }
```

---

## Reviews

### POST /api/listings/:id/reviews

Add a review to a listing. Requires authentication.

**Request body:**
```json
{
  "review": {
    "rating": 4,
    "comment": "Amazing stay with great views!"
  }
}
```

**Validation:** rating required (1-5), comment required.

**Success response (201):** Returns the created review document.

---

### DELETE /api/listings/:id/reviews/:reviewId

Delete a review. Requires authentication + review authorship.

**Success response (200):**
```json
{ "message": "Review Deleted" }
```

---

## Trip Planner

### POST /api/trip-planner/estimate

Estimate total trip cost.

**Request body:**
```json
{
  "destination": "Malibu, United States",
  "days": 5,
  "travelers": 2
}
```

**Success response (200):**
```json
{
  "breakdown": {
    "accommodation": 1250,
    "food": 300,
    "transport": 250,
    "activities": 400
  },
  "total": 2200,
  "currency": "USD"
}
```

---

### POST /api/trip-planner/itinerary

Generate an AI itinerary for a destination.

**Request body:**
```json
{
  "destination": "Tokyo, Japan",
  "days": 3,
  "interests": "sightseeing",
  "budget": "moderate"
}
```

**interests:** sightseeing, adventure, food, relaxation, culture
**budget:** budget, moderate, luxury

**Success response (200):**
```json
[
  {
    "day": 1,
    "date": "Day 1",
    "morning": "Visit Senso-ji Temple",
    "afternoon": "Explore Asakusa district",
    "evening": "Tokyo Tower observation deck",
    "meals": { "breakfast": "...", "lunch": "...", "dinner": "..." },
    "tips": "..."
  }
]
```

---

## Wishlist

### GET /api/wishlist

Get all wishlist entries for the logged-in user. Requires authentication.

**Success response (200):**
```json
[
  {
    "_id": "...",
    "listing": { /* full listing object */ },
    "user": "...",
    "createdAt": "2026-06-14T..."
  }
]
```

---

### POST /api/wishlist

Toggle a listing in the wishlist (add if absent, remove if present). Requires authentication.

**Request body:**
```json
{ "listingId": "65abc..." }
```

**Success response (200):**
```json
{ "wishlisted": true, "message": "Added to wishlist" }
```

---

### DELETE /api/wishlist/:listingId

Remove a listing from the wishlist. Requires authentication.

**Success response (200):**
```json
{ "message": "Removed from wishlist" }
```

---

### GET /api/wishlist/check/:listingId

Check if a listing is wishlisted. Requires authentication.

**Success response (200):**
```json
{ "wishlisted": true }
```

---

## Insights

### GET /api/listings/:id/insights

Get neighborhood insights for a listing.

**Success response (200):**
```json
{
  "locationKey": "Malibu, United States",
  "safetyScore": 85,
  "transitScore": 30,
  "restaurants": [
    { "name": "Nobu Malibu", "type": "Japanese", "rating": 4.5, "priceRange": "$$$" }
  ],
  "hospitals": [
    { "name": "Malibu Urgent Care", "distance": "2.3 mi" }
  ],
  "attractions": [
    { "name": "Malibu Beach", "description": "...", "type": "Nature", "rating": 4.6 }
  ]
}
```

---

## AI Features

### GET /api/listings/:id/reviews-summary

Get AI-generated sentiment summary of all reviews for a listing.

**Success response (200):**
```json
{
  "summary": "Guests particularly enjoy...",
  "sentiment": "positive",
  "pros": ["Great location", "Clean rooms"],
  "cons": ["Parking can be difficult"],
  "keywords": ["beach", "comfortable", "location"],
  "totalReviews": 12
}
```

---

### GET /api/seasonal?location=Malibu

Get seasonal/weather information for a location.

**Query parameters:** `location` (string, required)

**Success response (200):**
```json
{
  "bestTime": "June to September",
  "weatherTrends": "Warm and sunny with occasional marine layer",
  "festivals": ["Malibu International Film Festival"],
  "crowdLevel": "High in summer",
  "costFactor": "Premium during peak season"
}
```
