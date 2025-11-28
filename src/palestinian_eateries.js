// palestinian_eateries.js
// A comprehensive list of simulated Palestinian cafes and restaurants across various cities.
// Note: Coordinates (lat/lng) are approximate and fictional for demonstration purposes.

export const eateriesData = [
    // Ramallah (Central Hub)
    { id: 'r1', name: 'Zaman Cafe & Gallery', city: 'Ramallah', location: 'Al-Irsal St.', coords: { lat: 31.9015, lng: 35.2075 }, visitors: 1800, type: 'Cafe' },
    { id: 'r2', name: 'Snowbar Restaurant', city: 'Ramallah', location: 'Masyoun', coords: { lat: 31.9050, lng: 35.2110 }, visitors: 2500, type: 'Restaurant' },
    { id: 'r3', name: 'The Jasmine Terrace', city: 'Ramallah', location: 'Old City', coords: { lat: 31.8988, lng: 35.2045 }, visitors: 1200, type: 'Cafe' },
    { id: 'r4', name: 'Darna Restaurant', city: 'Ramallah', location: 'Ein Munjid', coords: { lat: 31.9030, lng: 35.2090 }, visitors: 2100, type: 'Restaurant' },
    { id: 'r5', name: 'Sufra Kitchen', city: 'Ramallah', location: 'Ramallah Main St.', coords: { lat: 31.9001, lng: 35.2061 }, visitors: 1550, type: 'Restaurant' },
    { id: 'r6', name: 'Karaz Cafe', city: 'Ramallah', location: 'Al-Manara Square', coords: { lat: 31.8995, lng: 35.2068 }, visitors: 1750, type: 'Cafe' },
    { id: 'r7', name: 'Al-Quds Sweets & Cafe', city: 'Ramallah', location: 'Al-Bireh', coords: { lat: 31.9060, lng: 35.2120 }, visitors: 1900, type: 'Cafe' },

    // Jerusalem (Historical Significance)
    { id: 'j1', name: 'The Palestinian House', city: 'Jerusalem', location: 'Sheikh Jarrah', coords: { lat: 31.7891, lng: 35.2341 }, visitors: 3000, type: 'Restaurant' },
    { id: 'j2', name: 'Al-Quds Rooftop Cafe', city: 'Jerusalem', location: 'Old City', coords: { lat: 31.7801, lng: 35.2330 }, visitors: 2800, type: 'Cafe' },
    { id: 'j3', name: 'Abu Shukri Hummus', city: 'Jerusalem', location: 'Christian Quarter', coords: { lat: 31.7770, lng: 35.2300 }, visitors: 2200, type: 'Restaurant' },
    { id: 'j4', name: 'Wadi Nisnas Grill', city: 'Jerusalem', location: 'Beit Safafa', coords: { lat: 31.7450, lng: 35.1950 }, visitors: 1600, type: 'Restaurant' },
    { id: 'j5', name: 'Hosh Al-Syrian Cafe', city: 'Jerusalem', location: 'Walled City', coords: { lat: 31.7788, lng: 35.2325 }, visitors: 1950, type: 'Cafe' },

    // Bethlehem (Nativity Area)
    { id: 'b1', name: 'Afteem Falafel', city: 'Bethlehem', location: 'Manger Square', coords: { lat: 31.7052, lng: 35.2001 }, visitors: 2900, type: 'Restaurant' },
    { id: 'b2', name: 'The Grotto Cafe', city: 'Bethlehem', location: 'Nativity Church Area', coords: { lat: 31.7060, lng: 35.2010 }, visitors: 1400, type: 'Cafe' },
    { id: 'b3', name: 'Singing Fountain', city: 'Bethlehem', location: 'Star Street', coords: { lat: 31.7035, lng: 35.1985 }, visitors: 1100, type: 'Restaurant' },
    { id: 'b4', name: 'Abu Elias Cafe', city: 'Bethlehem', location: 'Hebron Road', coords: { lat: 31.7020, lng: 35.1970 }, visitors: 950, type: 'Cafe' },
    { id: 'b5', name: 'The Olive Branch', city: 'Bethlehem', location: 'Dheisheh', coords: { lat: 31.6905, lng: 35.1955 }, visitors: 1300, type: 'Restaurant' },

    // Nablus (The Northern Capital)
    { id: 'n1', name: 'Al-Aqsa Knafeh & Cafe', city: 'Nablus', location: 'Old City Market', coords: { lat: 32.2201, lng: 35.2530 }, visitors: 4000, type: 'Cafe' },
    { id: 'n2', name: 'Tulkarm Gate Restaurant', city: 'Nablus', location: 'Tulkarm Rd', coords: { lat: 32.2215, lng: 35.2515 }, visitors: 1700, type: 'Restaurant' },
    { id: 'n3', name: 'Hawa Chicken & Grill', city: 'Nablus', location: 'Rafidia St.', coords: { lat: 32.2250, lng: 35.2580 }, visitors: 1900, type: 'Restaurant' },
    { id: 'n4', name: 'The Poet\'s Nook Cafe', city: 'Nablus', location: 'Nablus University St.', coords: { lat: 32.2240, lng: 35.2555 }, visitors: 1050, type: 'Cafe' },
    { id: 'n5', name: 'Shami Palace', city: 'Nablus', location: 'Qasaba', coords: { lat: 32.2190, lng: 35.2520 }, visitors: 1500, type: 'Restaurant' },

    // Hebron (Southern City)
    { id: 'h1', name: 'Hebron Heritage Kitchen', city: 'Hebron', location: 'Old City', coords: { lat: 31.5305, lng: 35.0965 }, visitors: 1300, type: 'Restaurant' },
    { id: 'h2', name: 'Al-Haram Cafe', city: 'Hebron', location: 'Near Ibrahimi Mosque', coords: { lat: 31.5290, lng: 35.0975 }, visitors: 1150, type: 'Cafe' },
    { id: 'h3', name: 'Qalandia Sweets', city: 'Hebron', location: 'Wadi Al-Tuffah', coords: { lat: 31.5315, lng: 35.0990 }, visitors: 1450, type: 'Cafe' },
    { id: 'h4', name: 'Khalil Grill House', city: 'Hebron', location: 'Industrial Area', coords: { lat: 31.5400, lng: 35.1050 }, visitors: 900, type: 'Restaurant' },
    { id: 'h5', name: 'The Clay Oven Bakery', city: 'Hebron', location: 'Main Street', coords: { lat: 31.5320, lng: 35.0980 }, visitors: 1050, type: 'Restaurant' },

    // Jericho (Lowest City on Earth)
    { id: 'e1', name: 'Oasis Restaurant', city: 'Jericho', location: 'Jericho Springs', coords: { lat: 31.8601, lng: 35.4410 }, visitors: 2000, type: 'Restaurant' },
    { id: 'e2', name: 'The Date Palm Cafe', city: 'Jericho', location: 'City Center', coords: { lat: 31.8550, lng: 35.4380 }, visitors: 1100, type: 'Cafe' },
    { id: 'e3', name: 'Hisham’s Palace Grill', city: 'Jericho', location: 'Tourist Street', coords: { lat: 31.8700, lng: 35.4450 }, visitors: 1500, type: 'Restaurant' },

    // Gaza (Coastal Area - Simulated Data)
    { id: 'g1', name: 'Al-Mina Seafood', city: 'Gaza', location: 'Gaza Port', coords: { lat: 31.5216, lng: 34.4533 }, visitors: 2700, type: 'Restaurant' },
    { id: 'g2', name: 'The Coastal Cafe', city: 'Gaza', location: 'Beach Road', coords: { lat: 31.5180, lng: 34.4500 }, visitors: 1900, type: 'Cafe' },
    { id: 'g3', name: 'Fawzi’s Shawarma', city: 'Gaza', location: 'Rimal District', coords: { lat: 31.5150, lng: 34.4600 }, visitors: 2100, type: 'Restaurant' },
    { id: 'g4', name: 'Palestine Bakery', city: 'Gaza', location: 'Market Square', coords: { lat: 31.5090, lng: 34.4650 }, visitors: 1600, type: 'Cafe' },
    { id: 'g5', name: 'The Old Fisherman', city: 'Gaza', location: 'Northern Coast', coords: { lat: 31.5300, lng: 34.4550 }, visitors: 1800, type: 'Restaurant' },

    // Jenin (North West)
    { id: 'i1', name: 'Jabal Al-Nur Cafe', city: 'Jenin', location: 'City Center', coords: { lat: 32.4630, lng: 35.2950 }, visitors: 1200, type: 'Cafe' },
    { id: 'i2', name: 'Jenin Family Restaurant', city: 'Jenin', location: 'Nazareth St.', coords: { lat: 32.4650, lng: 35.2980 }, visitors: 1400, type: 'Restaurant' },
    { id: 'i3', name: 'The Farmhouse Kitchen', city: 'Jenin', location: 'Rural Outskirts', coords: { lat: 32.4700, lng: 35.3050 }, visitors: 850, type: 'Restaurant' },

    // Tulkarm (West Bank)
    { id: 't1', name: 'Al-Salam Cafe', city: 'Tulkarm', location: 'Central Square', coords: { lat: 32.3110, lng: 35.0310 }, visitors: 1300, type: 'Cafe' },
    { id: 't2', name: 'Coastal Diner', city: 'Tulkarm', location: 'Main Highway', coords: { lat: 32.3150, lng: 35.0350 }, visitors: 1000, type: 'Restaurant' },

    // Qalqilya
    { id: 'q1', name: 'Qalqilya Zoo Cafe', city: 'Qalqilya', location: 'Zoo Area', coords: { lat: 32.1930, lng: 34.9860 }, visitors: 1600, type: 'Cafe' },
    { id: 'q2', name: 'The Orange Grove Eatery', city: 'Qalqilya', location: 'Agricultural Rd', coords: { lat: 32.1950, lng: 34.9900 }, visitors: 900, type: 'Restaurant' },

    // Tubas
    { id: 'u1', name: 'Tubas Heritage Cafe', city: 'Tubas', location: 'City Center', coords: { lat: 32.3270, lng: 35.4050 }, visitors: 700, type: 'Cafe' },
    { id: 'u2', name: 'Northern Valley Grill', city: 'Tubas', location: 'Valley Road', coords: { lat: 32.3300, lng: 35.4100 }, visitors: 650, type: 'Restaurant' },

    // Salfit
    { id: 's1', name: 'Salfit Olive Oil Bistro', city: 'Salfit', location: 'Industrial Zone', coords: { lat: 32.0730, lng: 35.0400 }, visitors: 800, type: 'Restaurant' },
    { id: 's2', name: 'Sunset View Cafe', city: 'Salfit', location: 'High Point', coords: { lat: 32.0750, lng: 35.0450 }, visitors: 950, type: 'Cafe' },

    // Bethlehem/Beit Jala/Beit Sahour Area (Extended)
    { id: 'bj1', name: 'Beit Jala Winery & Dine', city: 'Beit Jala', location: 'Wadi Ahmad', coords: { lat: 31.7200, lng: 35.1850 }, visitors: 1800, type: 'Restaurant' },
    { id: 'bs1', name: 'Shepherds Field Grill', city: 'Beit Sahour', location: 'Shepherds Field', coords: { lat: 31.6900, lng: 35.2200 }, visitors: 1400, type: 'Restaurant' },

    // Ramallah/Al-Bireh Area (Extended)
    { id: 'rb1', name: 'Birzeit Heritage Cafe', city: 'Birzeit', location: 'Birzeit University', coords: { lat: 31.9720, lng: 35.1870 }, visitors: 1600, type: 'Cafe' },
    { id: 'rb2', name: 'Rawabi Hills Restaurant', city: 'Rawabi', location: 'City Center', coords: { lat: 32.0005, lng: 35.1780 }, visitors: 2000, type: 'Restaurant' },
    { id: 'ra1', name: 'Arafat Museum Cafe', city: 'Ramallah', location: 'Museum Site', coords: { lat: 31.9055, lng: 35.2015 }, visitors: 1100, type: 'Cafe' },
    { id: 'ra2', name: 'The Mandarin Garden', city: 'Ramallah', location: 'Al-Masyoun', coords: { lat: 31.9065, lng: 35.2130 }, visitors: 2300, type: 'Restaurant' },
    { id: 'ra3', name: 'Taybeh Brewing Co. Pub', city: 'Taybeh', location: 'Village Center', coords: { lat: 31.9300, lng: 35.3200 }, visitors: 1500, type: 'Pub/Restaurant' },
    { id: 'ra4', name: 'Beitunia Pizza', city: 'Beitunia', location: 'Industrial Area', coords: { lat: 31.8900, lng: 35.1600 }, visitors: 900, type: 'Restaurant' },

    // Total 50 entries
    { id: 'n6', name: 'Misk Al-Lail Cafe', city: 'Nablus', location: 'City Park', coords: { lat: 32.2220, lng: 35.2540 }, visitors: 1150, type: 'Cafe' },
    { id: 'h6', name: 'Old Souk Bakery', city: 'Hebron', location: 'Souk Area', coords: { lat: 31.5300, lng: 35.0970 }, visitors: 1250, type: 'Cafe' },
    { id: 'e4', name: 'Dead Sea Panorama', city: 'Jericho', location: 'Dead Sea Road', coords: { lat: 31.8300, lng: 35.4800 }, visitors: 1700, type: 'Restaurant' },
    { id: 'g6', name: 'The Lighthouse Coffee', city: 'Gaza', location: 'Coast Guard', coords: { lat: 31.5200, lng: 34.4510 }, visitors: 1300, type: 'Cafe' },
    { id: 'i4', name: 'Jenin Grand Hotel Cafe', city: 'Jenin', location: 'Hotel Lobby', coords: { lat: 32.4640, lng: 35.2960 }, visitors: 1450, type: 'Cafe' },
    { id: 't3', name: 'Tulkarm Street Food', city: 'Tulkarm', location: 'Main Market', coords: { lat: 32.3120, lng: 35.0320 }, visitors: 1150, type: 'Restaurant' },
    { id: 'q3', name: 'The Green Spot Bistro', city: 'Qalqilya', location: 'University Road', coords: { lat: 32.1940, lng: 34.9880 }, visitors: 850, type: 'Restaurant' },
    { id: 'u3', name: 'Tubas Spring Cafe', city: 'Tubas', location: 'Natural Spring', coords: { lat: 32.3250, lng: 35.4040 }, visitors: 750, type: 'Cafe' },
    { id: 's3', name: 'Salfit Hilltop Grill', city: 'Salfit', location: 'Overlook', coords: { lat: 32.0760, lng: 35.0460 }, visitors: 1000, type: 'Restaurant' },
    { id: 'j6', name: 'Bab Al-Amoud Sweets', city: 'Jerusalem', location: 'Damascus Gate', coords: { lat: 31.7820, lng: 35.2340 }, visitors: 2600, type: 'Cafe' },
    { id: 'b6', name: 'Jacir Palace Cafe', city: 'Bethlehem', location: 'Jacir Palace', coords: { lat: 31.7000, lng: 35.2000 }, visitors: 1850, type: 'Cafe' },
];

// Mock Menu Data Generator to ensure every location has prices for comparison
const generateMockMenus = (eateries) => {
    const menus = {};
    const cafeItems = [
        { name: 'Turkish Coffee', cat: 'Hot Drinks', price: 8, desc: 'Traditional thick Turkish coffee.' },
        { name: 'Iced Latte', cat: 'Cold Drinks', price: 18, desc: 'Espresso with cold milk and ice.' },
        { name: 'Knafeh Nabulsiya', cat: 'Desserts', price: 35, desc: 'The famous cheese pastry.' },
        { name: 'Chicken Panini', cat: 'Sandwiches', price: 42, desc: 'Grilled chicken sandwich.' },
        { name: 'Mint Tea', cat: 'Hot Drinks', price: 6, desc: 'Refreshing black tea with fresh mint.' },
        { name: 'Fresh Juice', cat: 'Cold Drinks', price: 20, desc: 'Freshly squeezed fruit juice.' },
        { name: 'Croissant', cat: 'Desserts', price: 15, desc: 'Flaky pastry served with jam.' },
        { name: 'Halloumi Sandwich', cat: 'Sandwiches', price: 38, desc: 'Grilled Halloumi cheese and vegetables.' },
    ];
    const restaurantItems = [
        { name: 'Mansaf (Lamb)', cat: 'Main Courses', price: 95, desc: 'Traditional rice and lamb dish with jameed.' },
        { name: 'Tabbouleh', cat: 'Salads', price: 25, desc: 'Finely chopped parsley salad.' },
        { name: 'Hummus', cat: 'Appetizers', price: 18, desc: 'Creamy hummus served with pita bread.' },
        { name: 'Mixed Grill Plate', cat: 'Main Courses', price: 80, desc: 'Kebab, Shish Tawook, and Lamb Chops.' },
        { name: 'Lentil Soup', cat: 'Appetizers', price: 15, desc: 'Hearty lentil soup.' },
        { name: 'Fattoush Salad', cat: 'Salads', price: 30, desc: 'Mixed greens with toasted bread.' },
        { name: 'Fish Sayadieh', cat: 'Main Courses', price: 75, desc: 'Gazan fish dish with caramelized onions.' },
        { name: 'Mahalabiya', cat: 'Desserts', price: 20, desc: 'Sweet milk pudding.' },
    ];
    const pubItems = [
        { name: 'Local Lager', cat: 'Drinks', price: 28, desc: 'Palestinian craft beer.' },
        { name: 'Red Wine Glass', cat: 'Drinks', price: 35, desc: 'Glass of local Palestinian red wine.' },
        { name: 'Nachos Grande', cat: 'Appetizers', price: 55, desc: 'Loaded tortilla chips.' },
        { name: 'Burger & Fries', cat: 'Main Courses', price: 65, desc: 'Classic beef burger with side of fries.' },
        { name: 'Chicken Wings (6)', cat: 'Appetizers', price: 45, desc: 'Spicy BBQ chicken wings.' },
    ];

    eateries.forEach(eatery => {
        let baseItems = [];
        if (eatery.type === 'Cafe') {
            baseItems = cafeItems.slice(Math.floor(Math.random() * 3), 6); // 3-6 items
        } else if (eatery.type === 'Restaurant') {
            baseItems = restaurantItems.slice(Math.floor(Math.random() * 3), 7); // 4-7 items
        } else if (eatery.type === 'Pub/Restaurant') {
            baseItems = [...restaurantItems.slice(0, 3), ...pubItems];
        }

        // Apply a small price variance (+/- 5 ILS)
        menus[eatery.id] = baseItems.map(item => ({
            name: item.name,
            price: item.price + Math.floor(Math.random() * 11) - 5, // price +/- 5 ILS
            category: item.cat,
            description: item.desc,
        }));
    });

    return menus;
};

// Default contact info for all mock locations
const contactInfo = { 
    phone: '022987654', 
    email: 'info@priceo.ps',
};

export const menusData = generateMockMenus(eateriesData);
export const defaultContact = contactInfo;