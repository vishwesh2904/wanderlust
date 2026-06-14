class MockAIProvider {
  generateItinerary({ destination, days = 3, interests = ['sightseeing'], budget = 'moderate' }) {
    const dayActivities = {
      sightseeing: [
        {
          morning: 'Visit the main city square and historical landmarks',
          afternoon: 'Explore local museums and galleries',
          evening: 'Sunset walk through the old town',
        },
        {
          morning: 'Guided walking tour of architectural highlights',
          afternoon: 'Visit panoramic viewpoints for photos',
          evening: 'Traditional dinner at a local restaurant',
        },
        {
          morning: 'Discover hidden gems and local markets',
          afternoon: 'Boat ride or river cruise',
          evening: 'Nightlife experience at a popular lounge',
        },
      ],
      adventure: [
        {
          morning: 'Early morning trek to nearby hills',
          afternoon: 'Rock climbing or zip-lining session',
          evening: 'Campfire dinner under the stars',
        },
        {
          morning: 'White water rafting or kayaking',
          afternoon: 'Mountain biking on scenic trails',
          evening: 'Barbecue at the adventure base camp',
        },
        {
          morning: 'Paragliding or hot air balloon ride',
          afternoon: 'Nature scavenger hunt',
          evening: 'Stargazing session with a guide',
        },
      ],
      food: [
        {
          morning: 'Visit local farmers market and bakery tour',
          afternoon: 'Cooking class with a local chef',
          evening: 'Street food walking tour',
        },
        {
          morning: 'Wine or tea tasting session',
          afternoon: 'Visit spice markets and specialty stores',
          evening: 'Fine dining at a rooftop restaurant',
        },
        {
          morning: 'Traditional breakfast cooking demo',
          afternoon: 'Food photography walk',
          evening: 'Home-cooked meal with a local family',
        },
      ],
      relaxation: [
        {
          morning: 'Yoga session at sunrise',
          afternoon: 'Spa and wellness treatments',
          evening: 'Quiet dinner by the beach or garden',
        },
        {
          morning: 'Meditation and mindfulness workshop',
          afternoon: 'Leisurely nature walk',
          evening: 'Sunset cocktail hour',
        },
        {
          morning: 'Slow breakfast at a charming café',
          afternoon: 'Visit a botanical garden',
          evening: 'Live acoustic music at a lounge',
        },
      ],
      culture: [
        {
          morning: 'Visit UNESCO heritage sites',
          afternoon: 'Attend a local festival or workshop',
          evening: 'Traditional dance or theater performance',
        },
        {
          morning: 'Art gallery and studio tours',
          afternoon: 'Visit temples, churches, or historical monuments',
          evening: 'Cultural dinner show',
        },
        {
          morning: 'Museum pass for top attractions',
          afternoon: 'Architecture photography walk',
          evening: 'Conversation with local artists',
        },
      ],
    };

    const selected = dayActivities[interests[0]] || dayActivities.sightseeing;

    return {
      destination,
      days: days,
      interests,
      budget,
      summary: `A ${days}-day ${interests[0]} trip to ${destination} designed for a ${budget} budget.`,
      estimatedCost: days * (budget === 'budget' ? 50 : budget === 'moderate' ? 100 : 200),
      itinerary: Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
        activities: selected[i % selected.length],
        mealSuggestions: [
          'Breakfast: Local café near your accommodation',
          `Lunch: ${['Street food spot', 'Farm-to-table restaurant', 'Popular bistro'][i % 3]}`,
          `Dinner: ${['Rooftop dining', 'Traditional cuisine restaurant', 'Waterfront seafood'][i % 3]}`,
        ],
        tips: [
          'Wear comfortable walking shoes',
          'Carry a water bottle and sunscreen',
          'Book dinner reservations in advance',
        ],
      })),
    };
  }

  summarizeReviews(reviews) {
    if (!reviews || reviews.length === 0) {
      return {
        summary: 'No reviews yet for this property.',
        sentiment: 'neutral',
        pros: [],
        cons: [],
        keywords: [],
      };
    }

    const allText = reviews
      .map((r) => (typeof r === 'string' ? r : r.text || r.comment || ''))
      .filter(Boolean);
    const wordFreq = {};
    allText.forEach((t) => {
      t.toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3)
        .forEach((w) => {
          wordFreq[w] = (wordFreq[w] || 0) + 1;
        });
    });

    const positiveWords = [
      'amazing',
      'beautiful',
      'clean',
      'comfortable',
      'friendly',
      'wonderful',
      'great',
      'excellent',
      'spacious',
      'cozy',
      'perfect',
      'lovely',
      'fantastic',
      'helpful',
      'convenient',
    ];
    const negativeWords = [
      'noisy',
      'dirty',
      'small',
      'expensive',
      'uncomfortable',
      'poor',
      'bad',
      'terrible',
      'broken',
      'rude',
      'slow',
      'cold',
      'old',
      'crowded',
      'disappointed',
    ];

    let positiveScore = 0;
    let negativeScore = 0;
    const pros = [];
    const cons = [];

    allText.forEach((t) => {
      const lower = t.toLowerCase();
      positiveWords.forEach((w) => {
        if (lower.includes(w)) {
          positiveScore++;
          if (!pros.includes(w)) pros.push(w);
        }
      });
      negativeWords.forEach((w) => {
        if (lower.includes(w)) {
          negativeScore++;
          if (!cons.includes(w)) cons.push(w);
        }
      });
    });

    const keywords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([word]) => word);

    let sentiment = 'neutral';
    let summary;

    if (positiveScore > negativeScore * 1.5) {
      sentiment = 'positive';
      summary = `Guests loved the ${pros.slice(0, 3).join(', ')}. ${reviews.length} review${reviews.length > 1 ? 's' : ''} highlight a great experience.`;
    } else if (negativeScore > positiveScore * 1.5) {
      sentiment = 'negative';
      summary = `Common complaints: ${cons.slice(0, 3).join(', ')}. Consider checking recent reviews before booking.`;
    } else {
      const topPros = pros.slice(0, 2);
      const topCons = cons.slice(0, 2);
      summary = 'Mixed reviews. ';
      if (topPros.length) summary += `Guests appreciated ${topPros.join(' and ')}. `;
      if (topCons.length) summary += `Some noted issues with ${topCons.join(' and ')}.`;
      if (!topPros.length && !topCons.length)
        summary = 'Guests had varied experiences. Read individual reviews for details.';
    }

    return {
      summary,
      sentiment,
      pros: pros.slice(0, 5),
      cons: cons.slice(0, 5),
      keywords: keywords.slice(0, 8),
      totalReviews: reviews.length,
    };
  }

  getSeasonalInfo({ location }) {
    const seasonalData = {
      default: {
        bestTime: 'October to March',
        weatherTrends: [
          { month: 'Jan', temp: '15°C', rainfall: 'Low', crowd: 'High' },
          { month: 'Apr', temp: '25°C', rainfall: 'Moderate', crowd: 'Medium' },
          { month: 'Jul', temp: '30°C', rainfall: 'High', crowd: 'Low' },
          { month: 'Oct', temp: '20°C', rainfall: 'Low', crowd: 'Medium' },
        ],
        festivals: [
          {
            name: 'New Year Celebration',
            month: 'January',
            description: 'Grand celebrations with fireworks and events.',
          },
          {
            name: 'Summer Festival',
            month: 'July',
            description: 'Outdoor concerts, food fairs, and cultural events.',
          },
          {
            name: 'Harvest Festival',
            month: 'October',
            description: 'Traditional harvest celebrations with local cuisine.',
          },
        ],
        crowdLevel: 'Moderate',
        costFactor: 'Moderate',
      },
      mountain: {
        bestTime: 'November to February',
        weatherTrends: [
          { month: 'Jan', temp: '-2°C', rainfall: 'Snow', crowd: 'High' },
          { month: 'Apr', temp: '10°C', rainfall: 'Moderate', crowd: 'Medium' },
          { month: 'Jul', temp: '22°C', rainfall: 'Moderate', crowd: 'High' },
          { month: 'Oct', temp: '8°C', rainfall: 'Low', crowd: 'Low' },
        ],
        festivals: [
          {
            name: 'Winter Sports Championship',
            month: 'January',
            description: 'Skiing and snowboarding competitions.',
          },
          {
            name: 'Spring Blossom Festival',
            month: 'April',
            description: 'Celebration of spring with local flowers and music.',
          },
          {
            name: 'Oktoberfest in the Mountains',
            month: 'October',
            description: 'Local brews, traditional food, and alpine music.',
          },
        ],
        crowdLevel: 'Seasonal - peaks in winter and summer',
        costFactor: 'Higher during peak seasons',
      },
      beach: {
        bestTime: 'December to April',
        weatherTrends: [
          { month: 'Jan', temp: '28°C', rainfall: 'Low', crowd: 'High' },
          { month: 'Apr', temp: '30°C', rainfall: 'Low', crowd: 'High' },
          { month: 'Jul', temp: '27°C', rainfall: 'High', crowd: 'Low' },
          { month: 'Oct', temp: '29°C', rainfall: 'Moderate', crowd: 'Medium' },
        ],
        festivals: [
          {
            name: 'Beach Music Festival',
            month: 'March',
            description: 'Live music on the beach with international artists.',
          },
          {
            name: 'Summer Solstice Party',
            month: 'June',
            description: 'Beach parties, bonfires, and water sports.',
          },
          {
            name: 'Seafood Festival',
            month: 'November',
            description: 'Fresh seafood, cooking demos, and beach activities.',
          },
        ],
        crowdLevel: 'High during dry season',
        costFactor: 'Premium during peak winter months',
      },
    };

    const lower = location.toLowerCase();
    let profile = seasonalData.default;
    if (
      lower.includes('mountain') ||
      lower.includes('hill') ||
      lower.includes('alpine') ||
      lower.includes('ski')
    ) {
      profile = seasonalData.mountain;
    } else if (
      lower.includes('beach') ||
      lower.includes('coastal') ||
      lower.includes('island') ||
      lower.includes('sea') ||
      lower.includes('ocean')
    ) {
      profile = seasonalData.beach;
    }

    return {
      location,
      ...profile,
      recommendation:
        profile === seasonalData.default
          ? `${location} is pleasant year-round, but the best experience is ${profile.bestTime}.`
          : `Visit ${location} during ${profile.bestTime} for the best experience.`,
    };
  }

  suggestActivities({ location, interests = ['sightseeing'], budget = 'moderate' }) {
    const attractions = {
      sightseeing: [
        {
          name: `${location} City Center`,
          description: 'Historic downtown area with shops and cafes',
          type: 'Culture',
          estimatedCost: 'Free',
        },
        {
          name: `${location} Viewpoint`,
          description: 'Panoramic views of the city and surroundings',
          type: 'Nature',
          estimatedCost: 'Free',
        },
        {
          name: `${location} Museum`,
          description: 'Local history and art exhibitions',
          type: 'Culture',
          estimatedCost: '$10-20',
        },
      ],
      adventure: [
        {
          name: `${location} Trekking Trail`,
          description: 'Scenic hiking route through natural landscapes',
          type: 'Adventure',
          estimatedCost: 'Free',
        },
        {
          name: `${location} Adventure Park`,
          description: 'Zip-lining, rope courses, and outdoor activities',
          type: 'Adventure',
          estimatedCost: '$30-50',
        },
        {
          name: `${location} River Rafting`,
          description: 'Exciting rapids adventure with professional guides',
          type: 'Adventure',
          estimatedCost: '$40-80',
        },
      ],
      food: [
        {
          name: `${location} Food Market`,
          description: 'Local street food and fresh produce',
          type: 'Food',
          estimatedCost: '$5-15',
        },
        {
          name: `${location} Cooking Studio`,
          description: 'Learn to cook local cuisine',
          type: 'Food',
          estimatedCost: '$40-60',
        },
        {
          name: `${location} Fine Dining District`,
          description: 'Upscale restaurants with local specialties',
          type: 'Food',
          estimatedCost: '$50-100',
        },
      ],
    };

    return (attractions[interests[0]] || attractions.sightseeing).map((a) => ({
      ...a,
      budget_friendly:
        budget === 'budget'
          ? a.estimatedCost === 'Free' || parseInt(a.estimatedCost.replace(/[^0-9]/g, '')) < 20
          : true,
    }));
  }
}

function createAIProvider() {
  const provider = process.env.AI_PROVIDER || 'mock';
  if (provider === 'mock') return new MockAIProvider();
  throw new Error(`Unknown AI provider: ${provider}`);
}

module.exports = { createAIProvider, MockAIProvider };
