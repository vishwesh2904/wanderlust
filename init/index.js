if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');
const Neighborhood = require('../models/neighborhood.js');

const CATEGORIES = [
  'Trending',
  'Rooms',
  'Iconic cities',
  'Mountains',
  'Castles',
  'Pools',
  'Camping',
  'Farms',
  'Arctic',
  'Domes',
  'Boats',
];

const COUNTRY_COORDS = {
  'United States': { lat: 39.8283, lng: -98.5795 },
  Canada: { lat: 56.1304, lng: -106.3468 },
  Mexico: { lat: 23.6345, lng: -102.5528 },
  France: { lat: 46.6034, lng: 1.8883 },
  Japan: { lat: 36.2048, lng: 138.2529 },
  Australia: { lat: -25.2744, lng: 133.7751 },
  Iceland: { lat: 64.9631, lng: -19.0208 },
  Maldives: { lat: 3.2028, lng: 73.2207 },
  'Costa Rica': { lat: 9.7489, lng: -83.7534 },
  Thailand: { lat: 15.87, lng: 100.9925 },
  Italy: { lat: 41.8719, lng: 12.5674 },
  Greece: { lat: 39.0742, lng: 21.8243 },
  Switzerland: { lat: 46.8182, lng: 8.2275 },
  'New Zealand': { lat: -40.9006, lng: 174.886 },
};

function getCoordinates(country) {
  const base = COUNTRY_COORDS[country] || { lat: 20, lng: 0 };
  const lat = base.lat + (Math.random() - 0.5) * 10;
  const lng = base.lng + (Math.random() - 0.5) * 10;
  return { type: 'Point', coordinates: [lng, lat] };
}

function getCategory(index) {
  return CATEGORIES[index % CATEGORIES.length];
}

const dbUrl = process.env.ATLASDB_URL;
if (!dbUrl) {
  console.error('Missing ATLASDB_URL. Set it in .env file.');
  process.exit(1);
}

mongoose
  .connect(dbUrl)
  .then(() => console.log('Connected to DB'))
  .catch((err) => console.error(err));

const initDB = async () => {
  await Listing.deleteMany({});
  await Neighborhood.deleteMany({});

  const ownerId = process.argv[2] || '65890deb8f222d8158e81093';

  const data = initData.data.map((obj, i) => ({
    ...obj,
    owner: ownerId,
    category: getCategory(i),
    geometry: getCoordinates(obj.country),
    ...initData.templates[i % initData.templates.length],
  }));

  await Listing.insertMany(data);
  console.log(`Seeded ${data.length} listings`);

  const neighborhoods = [
    {
      locationKey: 'Malibu, United States',
      safetyScore: 85,
      transitScore: 30,
      restaurants: [
        { name: 'Nobu Malibu', type: 'Japanese', rating: 4.5, priceRange: '$$$' },
        { name: 'The Sunset Restaurant', type: 'Californian', rating: 4.3, priceRange: '$$' },
        { name: 'Cafe del Rey', type: 'Fusion', rating: 4.1, priceRange: '$$' },
      ],
      hospitals: [
        { name: 'Malibu Urgent Care', distance: '2.3 mi' },
        { name: 'UCLA Malibu Medical Center', distance: '3.1 mi' },
      ],
      attractions: [
        {
          name: 'Malibu Beach',
          description: 'Iconic sandy beach with surfing spots',
          type: 'Nature',
          rating: 4.6,
        },
        {
          name: 'Getty Villa',
          description: 'Art museum with Roman and Greek collections',
          type: 'Culture',
          rating: 4.5,
        },
        {
          name: 'Point Dume State Beach',
          description: 'Cliffside beach with tide pools',
          type: 'Nature',
          rating: 4.4,
        },
      ],
    },
    {
      locationKey: 'New York City, United States',
      safetyScore: 70,
      transitScore: 95,
      restaurants: [
        { name: "Katz's Delicatessen", type: 'Deli', rating: 4.4, priceRange: '$$' },
        { name: 'Le Bernardin', type: 'French', rating: 4.8, priceRange: '$$$' },
        { name: "Joe's Pizza", type: 'Pizza', rating: 4.3, priceRange: '$' },
      ],
      hospitals: [
        { name: 'Mount Sinai Hospital', distance: '0.5 mi' },
        { name: 'NYU Langone Health', distance: '1.0 mi' },
      ],
      attractions: [
        {
          name: 'Central Park',
          description: 'Iconic urban park with trails and lake',
          type: 'Nature',
          rating: 4.7,
        },
        {
          name: 'Statue of Liberty',
          description: 'Iconic American landmark',
          type: 'History',
          rating: 4.6,
        },
        {
          name: 'Times Square',
          description: 'Vibrant entertainment hub',
          type: 'Culture',
          rating: 4.2,
        },
      ],
    },
    {
      locationKey: 'Aspen, United States',
      safetyScore: 90,
      transitScore: 40,
      restaurants: [
        { name: 'Element 47', type: 'American', rating: 4.6, priceRange: '$$$' },
        { name: 'The White House Tavern', type: 'American', rating: 4.4, priceRange: '$$' },
        { name: 'Spring Cafe', type: 'Healthy', rating: 4.3, priceRange: '$$' },
      ],
      hospitals: [
        { name: 'Aspen Valley Hospital', distance: '1.2 mi' },
        { name: 'Aspen Medical Center', distance: '0.8 mi' },
      ],
      attractions: [
        {
          name: 'Aspen Mountain',
          description: 'World-class skiing and snowboarding',
          type: 'Adventure',
          rating: 4.8,
        },
        {
          name: 'Maroon Bells',
          description: 'Scenic mountain peaks with hiking trails',
          type: 'Nature',
          rating: 4.9,
        },
        {
          name: 'Aspen Art Museum',
          description: 'Contemporary art exhibitions',
          type: 'Culture',
          rating: 4.3,
        },
      ],
    },
    {
      locationKey: 'Florence, Italy',
      safetyScore: 75,
      transitScore: 70,
      restaurants: [
        { name: 'Trattoria Za Za', type: 'Tuscan', rating: 4.5, priceRange: '$$' },
        { name: 'Osteria del Cinghiale Bianco', type: 'Italian', rating: 4.4, priceRange: '$$' },
        { name: "All'antico Vinaio", type: 'Sandwich', rating: 4.6, priceRange: '$' },
      ],
      hospitals: [
        { name: 'Ospedale Santa Maria Nuova', distance: '0.3 mi' },
        { name: 'Ospedale Careggi', distance: '2.0 mi' },
      ],
      attractions: [
        {
          name: 'Duomo di Firenze',
          description: 'Iconic cathedral with Brunelleschi dome',
          type: 'Culture',
          rating: 4.7,
        },
        {
          name: 'Uffizi Gallery',
          description: 'World-renowned art museum',
          type: 'Culture',
          rating: 4.6,
        },
        {
          name: 'Ponte Vecchio',
          description: 'Historic bridge with jewelry shops',
          type: 'History',
          rating: 4.5,
        },
      ],
    },
    {
      locationKey: 'Bali, Indonesia',
      safetyScore: 80,
      transitScore: 45,
      restaurants: [
        { name: 'Locavore', type: 'Indonesian', rating: 4.7, priceRange: '$$$' },
        { name: 'Warung Babi Guling Ibu Oka', type: 'Balinese', rating: 4.3, priceRange: '$' },
        { name: 'Monsieur Spoon', type: 'French', rating: 4.4, priceRange: '$$' },
      ],
      hospitals: [
        { name: 'BIMC Hospital Nusa Dua', distance: '5.0 mi' },
        { name: 'Sanglah General Hospital', distance: '8.0 mi' },
      ],
      attractions: [
        {
          name: 'Ubud Monkey Forest',
          description: 'Sacred monkey sanctuary in lush forest',
          type: 'Nature',
          rating: 4.5,
        },
        {
          name: 'Tanah Lot Temple',
          description: 'Sea temple on rocky outcrop',
          type: 'Culture',
          rating: 4.6,
        },
        {
          name: 'Tegallalang Rice Terraces',
          description: 'Beautiful layered rice paddies',
          type: 'Nature',
          rating: 4.4,
        },
      ],
    },
    {
      locationKey: 'Tokyo, Japan',
      safetyScore: 95,
      transitScore: 98,
      restaurants: [
        { name: 'Sukiyabashi Jiro', type: 'Sushi', rating: 4.8, priceRange: '$$$' },
        { name: 'Ichiran Ramen', type: 'Ramen', rating: 4.5, priceRange: '$' },
        { name: 'Gonpachi', type: 'Japanese', rating: 4.2, priceRange: '$$' },
      ],
      hospitals: [
        { name: "St. Luke's International Hospital", distance: '0.7 mi' },
        { name: 'Tokyo Medical University Hospital', distance: '1.2 mi' },
      ],
      attractions: [
        {
          name: 'Senso-ji Temple',
          description: 'Ancient Buddhist temple in Asakusa',
          type: 'Culture',
          rating: 4.6,
        },
        {
          name: 'Shibuya Crossing',
          description: 'Iconic scramble intersection',
          type: 'Culture',
          rating: 4.3,
        },
        {
          name: 'Meiji Shrine',
          description: 'Peaceful Shinto shrine in forested grounds',
          type: 'Culture',
          rating: 4.5,
        },
      ],
    },
  ];

  await Neighborhood.insertMany(neighborhoods);
  console.log(`Seeded ${neighborhoods.length} neighborhoods`);

  mongoose.connection.close();
};

initDB();
