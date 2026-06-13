<h1 align=\"center\">?? RoamNest</h1>
<h3 align=\"center\">Find a stay worth remembering</h3>

<p align=\"center\">
  <img src=\"https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white\" alt=\"Node.js\"/>
  <img src=\"https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white\" alt=\"Express\"/>
  <img src=\"https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white\" alt=\"MongoDB\"/>
  <img src=\"https://img.shields.io/badge/EJS-8A2BE2?logo=ejs&logoColor=white\" alt=\"EJS\"/>
  <img src=\"https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white\" alt=\"Bootstrap\"/>
  <img src=\"https://img.shields.io/badge/Passport.js-34E27A?logo=passport&logoColor=white\" alt=\"Passport.js\"/>
  <img src=\"https://img.shields.io/badge/Cloudinary-3448C5?logo=cloudinary&logoColor=white\" alt=\"Cloudinary\"/>
  <img src=\"https://img.shields.io/badge/Mapbox-000000?logo=mapbox&logoColor=white\" alt=\"Mapbox\"/>
  <img src=\"https://img.shields.io/badge/Render-46E3B7?logo=render&logoColor=white\" alt=\"Render\"/>
</p>

---

## ?? Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Live Demo](#live-demo)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

---

## ?? About

**RoamNest** is a full-stack Airbnb-inspired vacation rental platform that connects travelers with unique stays worldwide. Users can browse listings, create accommodations, leave reviews, and explore properties through an interactive map � all wrapped in a clean, responsive UI.

---

## ? Features

| Feature                  | Details                                                        |
| ------------------------ | -------------------------------------------------------------- |
| **?? Authentication**    | User signup/login with Passport.js; session management         |
| **?? CRUD Listings**     | Create, read, update, and delete property listings with images |
| **? Reviews & Ratings**  | Leave and manage reviews on listings                           |
| **??? Interactive Map**  | Mapbox-powered location display for each listing               |
| **?? Image Upload**      | Cloudinary integration for seamless image hosting              |
| **??? Category Filters** | Browse by Trending, Mountains, Castles, Pools, Beach, and more |
| **?? Responsive UI**     | Bootstrap 5.3 with mobile-first design                         |
| **? Server Validation**  | Joi schemas for robust input validation                        |
| **?? Flash Messages**    | Real-time feedback for user actions                            |
| **?? Price Toggle**      | Switch between base price and tax-inclusive pricing            |

---

## ??? Tech Stack

### Backend

| Technology             | Purpose                         |
| ---------------------- | ------------------------------- |
| **Node.js**            | Runtime environment             |
| **Express**            | Web framework & routing         |
| **MongoDB + Mongoose** | Database & ODM                  |
| **Passport.js**        | Authentication (local strategy) |
| **Joi**                | Server-side validation          |
| **connect-mongo**      | Session storage in MongoDB      |

### Frontend

| Technology         | Purpose                           |
| ------------------ | --------------------------------- |
| **EJS + ejs-mate** | Templating engine with layouts    |
| **Bootstrap 5.3**  | CSS framework & responsive design |
| **Font Awesome 6** | Icons                             |
| **Mapbox GL JS**   | Interactive listing maps          |

### Cloud Services

| Service           | Purpose                      |
| ----------------- | ---------------------------- |
| **Cloudinary**    | Image hosting & optimization |
| **Mapbox**        | Geocoding & map rendering    |
| **MongoDB Atlas** | Cloud database               |
| **Render**        | Application hosting          |

---

## ?? Live Demo

> **?? [https://roamnest.onrender.com](https://roamnest.onrender.com)**

---

## ?? Screenshots

> _Add screenshots here:_
>
> - Homepage hero section
> - Listings index with category filters
> - Listing detail page with map
> - Create/edit listing form
> - Mobile responsive view

---

## ?? Project Structure

\\\
RoamNest/
+-- app.js # Entry point & middleware setup
+-- cloudConfig.js # Cloudinary configuration
+-- schema.js # Joi validation schemas
+-- middleware.js # Auth & validation middleware
+-- package.json
+-- .env # Environment variables (not committed)
+-- controllers/
� +-- listing.js # Listing CRUD logic
� +-- review.js # Review logic
� +-- user.js # Auth logic (signup/login/logout)
+-- models/
� +-- listing.js # Listing Mongoose schema
� +-- review.js # Review Mongoose schema
� +-- user.js # User Mongoose schema (passport-local-mongoose)
+-- routes/
� +-- listing.js # Listing route definitions
� +-- review.js # Review route definitions
� +-- user.js # Auth route definitions
+-- views/
� +-- layouts/ # EJS layout templates
� +-- includes/ # Navbar, footer, flash partials
� +-- listings/ # Index, show, new, edit pages
� +-- users/ # Signup, login pages
+-- public/
� +-- css/ # Stylesheets
� +-- js/ # Client-side scripts (map, form validation)
+-- init/
� +-- data.js # Seed data
� +-- index.js # Database seeder
+-- utils/
+-- wrapAsync.js # Async error wrapper
+-- ExpressError.js # Custom error class
\\\

---

## ?? Getting Started

### Prerequisites

- Node.js 18.x+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Mapbox account

### Installation

1. **Clone the repository**
   \\\ash
   git clone https://github.com/yourusername/roamnest.git
   cd roamnest
   \\\

2. **Install dependencies**
   \\\ash
   npm install
   \\\

3. **Set up environment variables** � create a \.env\ file:
   \\\env
   ATLASDB_URL=your_mongodb_atlas_connection_string
   SECRET=your_session_secret
   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret
   MAP_TOKEN=your_mapbox_token
   \\\

4. **Seed the database** (optional � populates sample listings)
   \\\ash
   node init/index.js
   \\\

5. **Start the server**
   \\\ash
   npm start
   \\\

Visit **http://localhost:8080** in your browser.

---

## ?? Environment Variables

| Variable            | Description                     | Required |
| ------------------- | ------------------------------- | -------- |
| \ATLASDB_URL\       | MongoDB Atlas connection string | ?        |
| \SECRET\            | Session encryption secret       | ?        |
| \CLOUD_NAME\        | Cloudinary cloud name           | ?        |
| \CLOUD_API_KEY\     | Cloudinary API key              | ?        |
| \CLOUD_API_SECRET\  | Cloudinary API secret           | ?        |
| \MAP_TOKEN\         | Mapbox access token             | ?        |

---

## ?? Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

---

## ?? License

This project is for educational and portfolio purposes.
