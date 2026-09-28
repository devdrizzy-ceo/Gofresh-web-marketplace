/**
 * GoFresh - Local Agricultural Marketplace
 * Mock Data Store: Farmers, Categories, Products & Orders
 */

const INITIAL_FARMERS = [
  {
    id: 'farmer-1',
    name: 'Grace Okafor',
    farmName: "Grace's Organic Farm",
    location: 'Kaduna, Nigeria',
    state: 'Kaduna',
    avatar: 'assets/images/farmer_grace.jpg',
    heroImage: 'assets/images/hero_farmer.jpg',
    bio: 'Grace is an organic tomato and vegetable farmer supplying fresh produce directly from her 8-acre farm in Kaduna. Committed to zero chemical ripening, natural composting, and harvesting only on order day.',
    farmingType: 'Organic Vegetable & Horticulture',
    joinedDate: 'March 2023',
    verified: true,
    rating: 4.9,
    reviewsCount: 382,
    totalHarvests: 1450,
    acres: 8,
    phone: '+234 803 111 2233',
    email: 'grace.okafor@gofresh.example'
  },
  {
    id: 'farmer-2',
    name: 'Ibrahim Musa',
    farmName: 'Arewa Golden Grains',
    location: 'Kano, Nigeria',
    state: 'Kano',
    avatar: 'assets/images/farmer_ibrahim.jpg',
    heroImage: 'assets/images/grains.jpg',
    bio: 'Ibrahim carries on a 3-generation family tradition of growing pristine non-GMO yellow maize, guinea corn, and premium brown honey beans in the fertile plains of Kano.',
    farmingType: 'Grains & Legumes Specialist',
    joinedDate: 'August 2022',
    verified: true,
    rating: 4.95,
    reviewsCount: 512,
    totalHarvests: 2900,
    acres: 24,
    phone: '+234 802 444 5566',
    email: 'ibrahim.musa@gofresh.example'
  },
  {
    id: 'farmer-3',
    name: 'Chioma Adeleke',
    farmName: 'Oyo Sunburst Orchards',
    location: 'Ibadan, Oyo, Nigeria',
    state: 'Oyo',
    avatar: 'assets/images/farmer_chioma.jpg',
    heroImage: 'assets/images/fruits.jpg',
    bio: 'Chioma cultivates sun-ripened tropical citrus, honey watermelons, and sweet pineapples in Oyo State. She works with 12 local women harvesters ensuring tree-to-table freshness.',
    farmingType: 'Tropical Fruit Orchards',
    joinedDate: 'January 2023',
    verified: true,
    rating: 4.88,
    reviewsCount: 294,
    totalHarvests: 980,
    acres: 15,
    phone: '+234 805 777 8899',
    email: 'chioma.adeleke@gofresh.example'
  },
  {
    id: 'farmer-4',
    name: 'Samuel Danladi',
    farmName: 'Benue Food Basket Roots',
    location: 'Makurdi, Benue, Nigeria',
    state: 'Benue',
    avatar: 'assets/images/farmer_ibrahim.jpg', // fallback avatar
    heroImage: 'assets/images/tubers.jpg',
    bio: 'Samuel harvests champion white yam tubers, sweet potatoes, and organic cassava from the heartland of Benue State. Known across Nigeria for rich, floury, and sweet yam varieties.',
    farmingType: 'Tuber & Root Crops',
    joinedDate: 'November 2022',
    verified: true,
    rating: 4.92,
    reviewsCount: 440,
    totalHarvests: 2100,
    acres: 18,
    phone: '+234 807 333 4455',
    email: 'samuel.danladi@gofresh.example'
  }
];

const CATEGORIES = [
  {
    id: 'grains',
    name: 'Grains',
    headline: 'Grains & Cereals',
    description: 'Rice, maize, beans, and other locally sourced wholesome grains.',
    image: 'assets/images/grains.jpg',
    productCount: 14,
    featuredNote: 'Sun-dried & freshly bagged'
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    headline: 'Fresh Farm Vegetables',
    description: 'Fresh vegetables sourced directly from local open-field farms.',
    image: 'assets/images/vegetables.jpg',
    productCount: 28,
    featuredNote: 'Harvested at dawn daily'
  },
  {
    id: 'fruits',
    name: 'Fruits',
    headline: 'Seasonal Tropical Fruits',
    description: 'Tree-ripened seasonal fruits straight from local orchards.',
    image: 'assets/images/fruits.jpg',
    productCount: 19,
    featuredNote: 'Naturally sweet & juicy'
  },
  {
    id: 'tubers',
    name: 'Tubers',
    headline: 'Tubers & Roots',
    description: 'Yam, cassava, sweet potatoes, and other freshly dug tubers.',
    image: 'assets/images/tubers.jpg',
    productCount: 16,
    featuredNote: 'Direct from Benue & Niger soil'
  },
  {
    id: 'meat',
    name: 'Meat',
    headline: 'Farm-Fresh Meat',
    description: 'Locally pasture-raised prime beef, goat meat, and poultry.',
    image: 'assets/images/meat.jpg',
    productCount: 12,
    featuredNote: 'Grass-fed & certified butchery'
  },
  {
    id: 'fish',
    name: 'Fish',
    headline: 'Fresh Fish & Seafood',
    description: 'Fresh river tilapia, catfish, and local artisanal seafood.',
    image: 'assets/images/fish.jpg',
    productCount: 15,
    featuredNote: 'Wild & fresh tank harvest'
  }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Kaduna Fresh Plum Tomatoes',
    category: 'vegetables',
    price: 4500,
    unit: 'Per large cane basket (~8kg)',
    image: 'assets/images/tomatoes.jpg',
    farmerId: 'farmer-1',
    location: 'Kaduna, Nigeria',
    availableQty: 45,
    availability: 'In Stock · Harvested Daily',
    badge: 'Popular Choice',
    isFeatured: true,
    description: 'Firm, sun-sweetened, ripe red Kaduna plum tomatoes. Perfect for hearty Nigerian jollof rice, stews, and pastes with low water content and rich pulp.'
  },
  {
    id: 'prod-2',
    name: 'Fiery Scotch Bonnet (Rodo & Bawa)',
    category: 'vegetables',
    price: 3200,
    unit: 'Per basket (~4kg)',
    image: 'assets/images/vegetables.jpg',
    farmerId: 'farmer-1',
    location: 'Kaduna, Nigeria',
    availableQty: 30,
    availability: 'In Stock · Super Fresh',
    badge: 'Very Hot & Aromatic',
    isFeatured: false,
    description: 'Pungent, handpicked organic scotch bonnet peppers and fresh red tatase. Unmatched aroma and heat for traditional soups and peppery sauces.'
  },
  {
    id: 'prod-3',
    name: 'Kano Golden Dry Maize (Corn)',
    category: 'grains',
    price: 18500,
    unit: 'Per 50kg bag',
    image: 'assets/images/grains.jpg',
    farmerId: 'farmer-2',
    location: 'Kano, Nigeria',
    availableQty: 60,
    availability: 'In Stock · Dry Store',
    badge: 'Non-GMO Quality',
    isFeatured: true,
    description: 'Thoroughly cleaned, stones-free yellow maize harvested in Kano. Ideal for home cornmeal, pap (ogi/akamu), poultry feed, and traditional cooking.'
  },
  {
    id: 'prod-4',
    name: 'Brown Honey Oloyin Beans',
    category: 'grains',
    price: 26000,
    unit: 'Per 50kg bag',
    image: 'assets/images/grains.jpg',
    farmerId: 'farmer-2',
    location: 'Kano, Nigeria',
    availableQty: 25,
    availability: 'In Stock · Pest-Free',
    badge: 'Naturally Sweet',
    isFeatured: false,
    description: 'Authentic Nigerian honey beans (Ewa Oloyin). Cooks rapidly to a velvety sweet texture without chemical fumigation or artificial preservatives.'
  },
  {
    id: 'prod-5',
    name: 'Benue Giant White Yams',
    category: 'tubers',
    price: 12000,
    unit: 'Per bundle of 5 large tubers',
    image: 'assets/images/tubers.jpg',
    farmerId: 'farmer-4',
    location: 'Makurdi, Benue, Nigeria',
    availableQty: 35,
    availability: 'In Stock · New Harvest',
    badge: 'Pounded Yam Grade A',
    isFeatured: true,
    description: 'Heavy, floury, mature white yams from the fertile banks of Benue. Pounds into flawless, stretchy, smooth pounded yam and fries crisp golden.'
  },
  {
    id: 'prod-6',
    name: 'Red Skin Sweet Potatoes',
    category: 'tubers',
    price: 5500,
    unit: 'Per 20kg sack',
    image: 'assets/images/tubers.jpg',
    farmerId: 'farmer-4',
    location: 'Makurdi, Benue, Nigeria',
    availableQty: 40,
    availability: 'In Stock',
    badge: 'Nutrient Rich',
    isFeatured: false,
    description: 'High-fiber, naturally sweet reddish-purple skinned sweet potatoes. Delicious boiled, roasted, or pan-fried with spicy egg sauce.'
  },
  {
    id: 'prod-7',
    name: 'Oyo Sugar-Sweet Watermelons',
    category: 'fruits',
    price: 3800,
    unit: 'Per pair (2 large whole melons)',
    image: 'assets/images/fruits.jpg',
    farmerId: 'farmer-3',
    location: 'Ibadan, Oyo, Nigeria',
    availableQty: 28,
    availability: 'In Stock · Picked Today',
    badge: 'Super Crisp',
    isFeatured: true,
    description: 'Deep ruby-red flesh bursting with cool, honeyed hydration. Picked ripe from the vine at 5:00 AM each delivery morning.'
  },
  {
    id: 'prod-8',
    name: 'Farm-Fresh Sweet Oranges & Citrus',
    category: 'fruits',
    price: 4200,
    unit: 'Per 15kg crate',
    image: 'assets/images/fruits.jpg',
    farmerId: 'farmer-3',
    location: 'Ibadan, Oyo, Nigeria',
    availableQty: 32,
    availability: 'In Stock · Tree-Ripened',
    badge: 'Vitamin C Boost',
    isFeatured: false,
    description: 'Juicy Nigerian sweet oranges and sunburst tangerines from the orchards of Oyo. Outstanding natural sweetness for morning fresh juice.'
  },
  {
    id: 'prod-9',
    name: 'Fresh Live River Tilapia & Catfish',
    category: 'fish',
    price: 7500,
    unit: 'Per 3kg fresh catch pack',
    image: 'assets/images/fish.jpg',
    farmerId: 'farmer-1',
    location: 'Kaduna, Nigeria',
    availableQty: 22,
    availability: 'Harvested on Order Day',
    badge: 'River Farm Fresh',
    isFeatured: true,
    description: 'Freshly harvested large African catfish and tilapia cleaned, gutted upon request, and delivered in cold insulated chilled packs ready for pepper soup or grilling.'
  },
  {
    id: 'prod-10',
    name: 'Grass-Fed Prime Cut Beef & Goat Meat',
    category: 'meat',
    price: 9800,
    unit: 'Per 2kg assorted butcher cut',
    image: 'assets/images/meat.jpg',
    farmerId: 'farmer-2',
    location: 'Kano, Nigeria',
    availableQty: 18,
    availability: 'Daily Butchery · Chilled',
    badge: '100% Grass-Fed',
    isFeatured: true,
    description: 'Tender pasture-raised beef and lean goat meat from northern grazing co-ops. Hand-cut and hygienic, vacuum-sealed for maximum natural tenderness.'
  }
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-8921',
    customerName: 'Babatunde Alabi',
    customerPhone: '+234 812 333 4499',
    deliveryAddress: '14 Admiralty Way, Lekki Phase 1, Lagos',
    items: [
      { name: 'Kaduna Fresh Plum Tomatoes', qty: 2, price: 4500 },
      { name: 'Benue Giant White Yams', qty: 1, price: 12000 }
    ],
    total: 21000,
    status: 'In Transit',
    date: 'Today, 08:30 AM'
  },
  {
    id: 'ORD-8919',
    customerName: 'Ngozi Ezechukwu',
    customerPhone: '+234 809 555 1212',
    deliveryAddress: 'Plot 402, Garki II, Abuja',
    items: [
      { name: 'Oyo Sugar-Sweet Watermelons', qty: 1, price: 3800 },
      { name: 'Fresh Live River Tilapia & Catfish', qty: 2, price: 7500 }
    ],
    total: 18800,
    status: 'Packed & Ready',
    date: 'Today, 06:45 AM'
  }
];
