// database.js — Mock booking database. Provides per-city hotels, activities,
// flights, and reviews. Procedurally generated from CITIES data so each city
// gets coherent, realistic-feeling content without hand-writing 25 × 4 hotels.

(function () {
  // Deterministic PRNG (mulberry32) seeded from a string — same city always
  // returns the same data on reload, so it feels like a real database.
  function seededRand(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      h = (h ^ seed.charCodeAt(i)) >>> 0;
      h = Math.imul(h, 16777619) >>> 0;
    }
    return function () {
      h |= 0; h = (h + 0x6D2B79F5) | 0;
      let t = Math.imul(h ^ (h >>> 15), 1 | h);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
  const range = (rng, lo, hi) => Math.round(lo + rng() * (hi - lo));

  // Base price tiers driven by city.cost
  const tierMult = { Budget: 0.55, Moderate: 1.0, Premium: 1.6 };

  // Stock photos for hotel rooms / activities — selected to look generic-luxe
  const HOTEL_IMGS = [
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
  ];

  const ACT_IMGS = {
    food: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    walk: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    boat: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=800&q=80',
    market: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80',
    nightlife: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
    nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
    spa: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    photo: 'https://images.unsplash.com/photo-1520637736862-4d197d17c87a?w=800&q=80',
  };

  const HOTEL_PERKS = ['Pool', 'Spa', 'Rooftop', 'Free breakfast', 'Concierge', 'Gym', 'Kid-friendly', 'Pet-friendly', 'Airport shuttle', 'Bar', 'Garden', 'Library', '24h room service'];
  const HOTEL_TIERS = [
    { tier: 'Luxury', priceMult: 2.6, rating: [4.7, 4.95], perkCount: 5 },
    { tier: 'Boutique', priceMult: 1.5, rating: [4.4, 4.8], perkCount: 4 },
    { tier: 'Design', priceMult: 1.2, rating: [4.2, 4.7], perkCount: 3 },
    { tier: 'Comfort', priceMult: 0.7, rating: [3.9, 4.4], perkCount: 2 },
  ];

  const REVIEW_AUTHORS = ['Maya R.', 'Sebastián D.', 'Nina K.', 'Yuki T.', 'Rohan P.', 'Marisol G.', 'Theo W.', 'Elena P.', 'Adaeze N.', 'Kai L.', 'Lucia F.', 'Omar S.', 'Hana B.', 'Anders J.', 'Inés M.'];
  const REVIEW_TEMPLATES = [
    (c) => `Three days here wasn’t enough. ${c.name} surprised me at every corner — start with a long walk, you’ll find your favourite block by hour two.`,
    (c) => `Skip the obvious tourist stops on day one. The real ${c.name} is in the side streets and small markets.`,
    (c) => `Came for the food, stayed for the feeling. ${c.food[0]} alone is worth the flight.`,
    (c) => `Stayed in ${c.neighborhoods[0].name} and would do it again — quiet at night, lively at breakfast.`,
    (c) => `Bring walking shoes, an empty memory card, and an open evening calendar. ${c.name} unfolds slow.`,
    (c) => `${c.places[0].name} was magical at sunrise. Get there before 8am, the light is otherworldly.`,
    (c) => `Underrated city for ${c.vibes[0]}. I’ve been to ${c.country} twice now — already planning a third.`,
  ];

  const HOME_HUBS = [
    { code: 'SIN', name: 'Singapore', lat: 1.35, lon: 103.82, currency: 'SGD' },
    { code: 'LHR', name: 'London', lat: 51.51, lon: -0.13, currency: 'GBP' },
    { code: 'JFK', name: 'New York', lat: 40.71, lon: -74.0, currency: 'USD' },
    { code: 'DXB', name: 'Dubai', lat: 25.20, lon: 55.27, currency: 'AED' },
  ];
  const AIRLINES = [
    'Singapore Airlines', 'Emirates', 'Qatar Airways', 'British Airways', 'Cathay Pacific',
    'ANA', 'Lufthansa', 'KLM', 'Air France', 'Turkish Airlines', 'Japan Airlines', 'Qantas', 'Delta',
  ];

  function generateHotels(city) {
    const rng = seededRand(city.id + ':hotels');
    const baseDay = parseInt(city.daily.replace(/[^0-9]/g, '').slice(0, 3)) || 150;
    const mult = tierMult[city.cost] || 1;
    const names = city.hotelNames || ['Grand Hotel', 'Boutique Stay', 'Design House', 'Comfort Inn'];

    return HOTEL_TIERS.map((t, i) => {
      const name = names[i] || `${city.name} ${t.tier}`;
      const price = Math.round(baseDay * mult * t.priceMult);
      const ratingLo = t.rating[0], ratingHi = t.rating[1];
      const rating = Math.round((ratingLo + rng() * (ratingHi - ratingLo)) * 10) / 10;
      const reviews = range(rng, 320, 4800);
      const perks = [];
      const pool = [...HOTEL_PERKS];
      for (let k = 0; k < t.perkCount && pool.length; k++) {
        const idx = Math.floor(rng() * pool.length);
        perks.push(pool[idx]);
        pool.splice(idx, 1);
      }
      const area = city.neighborhoods[Math.floor(rng() * city.neighborhoods.length)].name;
      return {
        id: `${city.id}-h${i}`,
        name,
        tier: t.tier,
        area,
        rating,
        reviewCount: reviews,
        pricePerNight: price,
        currency: 'USD',
        img: HOTEL_IMGS[(i * 2 + Math.floor(rng() * 3)) % HOTEL_IMGS.length],
        perks,
        availability: rng() > 0.2 ? 'Available' : 'Few rooms left',
      };
    });
  }

  function generateActivities(city) {
    const rng = seededRand(city.id + ':activities');
    const mult = tierMult[city.cost] || 1;

    const anchored = city.places.slice(0, 4).map((p, i) => {
      const cats = ['walk', 'photo', 'walk', 'food'];
      const titles = [
        `Guided walk through ${p.name}`,
        `Photo tour: ${p.name} & beyond`,
        `${p.name} early-access ticket`,
        `Local food tasting near ${p.name}`,
      ];
      const durations = ['2.5 hr', '3 hr', '1.5 hr', '3.5 hr'];
      const basePrice = [38, 55, 28, 72];
      return {
        id: `${city.id}-a${i}`,
        name: titles[i],
        category: cats[i],
        area: p.area,
        duration: durations[i],
        rating: Math.round((4.4 + rng() * 0.5) * 10) / 10,
        reviewCount: range(rng, 80, 1900),
        price: Math.round(basePrice[i] * mult * (0.85 + rng() * 0.4)),
        currency: 'USD',
        img: p.img,
        booksFast: rng() > 0.6,
      };
    });

    const extras = [
      {
        id: `${city.id}-af`,
        name: `${city.name} flavours: tasting crawl`,
        category: 'food',
        area: city.neighborhoods[1].name,
        duration: '3 hr',
        rating: 4.8,
        reviewCount: range(rng, 200, 2400),
        price: Math.round(85 * mult),
        currency: 'USD',
        img: ACT_IMGS.food,
        booksFast: true,
      },
      {
        id: `${city.id}-an`,
        name: city.vibes.includes('nightlife') ? `${city.name} after-dark cocktail trail` : (city.vibes.includes('nature') ? `Sunset hike & viewpoint` : `Hidden ${city.name} walking tour`),
        category: city.vibes.includes('nightlife') ? 'nightlife' : (city.vibes.includes('nature') ? 'nature' : 'walk'),
        area: city.neighborhoods[2] ? city.neighborhoods[2].name : city.neighborhoods[0].name,
        duration: '2.5 hr',
        rating: Math.round((4.5 + rng() * 0.4) * 10) / 10,
        reviewCount: range(rng, 60, 900),
        price: Math.round(65 * mult * (0.9 + rng() * 0.3)),
        currency: 'USD',
        img: city.vibes.includes('nightlife') ? ACT_IMGS.nightlife : (city.vibes.includes('nature') ? ACT_IMGS.nature : ACT_IMGS.walk),
        booksFast: false,
      },
    ];
    return [...anchored, ...extras];
  }

  function generateFlights(city) {
    const rng = seededRand(city.id + ':flights');
    return HOME_HUBS.map((hub, i) => {
      const dist = window.cityDistance(hub, city);
      const basePrice = Math.round((dist * 0.07 + 80) * (0.85 + rng() * 0.45));
      const flightHours = dist / 850 + 1;
      const stops = dist < 5000 ? (rng() > 0.55 ? 0 : 1) : (rng() > 0.4 ? 1 : 0);
      const totalHours = flightHours + (stops * 1.6);
      const h = Math.floor(totalHours);
      const m = Math.round((totalHours - h) * 60);
      return {
        id: `${city.id}-f${i}`,
        from: hub.code,
        fromName: hub.name,
        airline: AIRLINES[(i + city.id.length) % AIRLINES.length],
        price: basePrice,
        currency: 'USD',
        duration: `${h}h ${m}m`,
        stops,
        nextDeparture: ['Tomorrow 06:40', 'Tomorrow 14:25', 'Fri 22:10', 'Sat 09:50'][i % 4],
      };
    });
  }

  function generateReviews(city) {
    const rng = seededRand(city.id + ':reviews');
    const out = [];
    const used = new Set();
    for (let i = 0; i < 4; i++) {
      let author;
      do { author = REVIEW_AUTHORS[Math.floor(rng() * REVIEW_AUTHORS.length)]; } while (used.has(author));
      used.add(author);
      const tpl = REVIEW_TEMPLATES[Math.floor(rng() * REVIEW_TEMPLATES.length)];
      const rating = Math.round((4.3 + rng() * 0.7) * 10) / 10;
      const stayed = ['Stayed 3 nights', 'Stayed 5 nights', 'Stayed a week', 'Long weekend'][i % 4];
      const monthsAgo = range(rng, 1, 11);
      out.push({
        id: `${city.id}-r${i}`,
        author,
        rating,
        text: tpl(city),
        date: `${monthsAgo} mo ago · ${stayed}`,
      });
    }
    return out.sort((a, b) => b.rating - a.rating);
  }

  function summary(city, h, a, f) {
    const minHotel = Math.min(...h.map(x => x.pricePerNight));
    const minFlight = Math.min(...f.map(x => x.price));
    const avgActivity = Math.round(a.reduce((s, x) => s + x.price, 0) / a.length);
    return {
      hotelFrom: minHotel,
      flightFrom: minFlight,
      avgActivity,
      total3DayFrom: minFlight + minHotel * 3 + avgActivity * 4,
    };
  }

  const cache = {};
  window.MockDB = {
    fetchCity(cityId) {
      if (cache[cityId]) return Promise.resolve(cache[cityId]);
      const city = window.CITIES.find(c => c.id === cityId);
      if (!city) return Promise.reject(new Error('Unknown city: ' + cityId));
      return new Promise((resolve) => {
        const delay = 220 + Math.random() * 280;
        setTimeout(() => {
          const hotels = generateHotels(city);
          const activities = generateActivities(city);
          const flights = generateFlights(city);
          const reviews = generateReviews(city);
          const data = {
            cityId, hotels, activities, flights, reviews,
            summary: summary(city, hotels, activities, flights),
            fetchedAt: Date.now(),
          };
          cache[cityId] = data;
          resolve(data);
        }, delay);
      });
    },
    clearCache() { for (const k in cache) delete cache[k]; },
  };
})();
