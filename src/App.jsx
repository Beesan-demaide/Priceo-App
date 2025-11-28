import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Coffee, BarChart, MessageCircle, Home, Users, Search, Loader, Zap, ChevronDown, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

// --- Global Setup ---
// Gemini API configuration remains, as it is separate from Firebase
const API_KEY = ""; // Placeholder for Gemini API Key
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;


// --- Simulated Application Data (Mock Backend) ---
const mockCafes = [
    { id: 'c1', name: 'Al-Bustan Coffee', city: 'Ramallah', location: 'Old City', coords: { lat: 31.9021, lng: 35.2081 }, visitors: 1200 },
    { id: 'c2', name: 'Sindbad Restaurant', city: 'Hebron', location: 'Ain Sara', coords: { lat: 31.5322, lng: 35.0991 }, visitors: 850 },
    { id: 'c3', name: 'Al-Yaqout Cafe', city: 'Nablus', location: 'University Street', coords: { lat: 32.2201, lng: 35.2501 }, visitors: 1550 },
    { id: 'c4', name: 'Jerusalem Coffee House', city: 'Jerusalem', location: 'Damascus Gate', coords: { lat: 31.7833, lng: 35.2167 }, visitors: 2000 },
];

const mockMenus = {
    c1: [
        { name: 'Espresso', price: 10, category: 'Hot Drinks' },
        { name: 'Caesar Salad', price: 45, category: 'Salads' },
        { name: 'Mint Lemonade', price: 18, category: 'Cold Drinks' },
        { name: 'Chocolate Cake', price: 25, category: 'Desserts' },
    ],
    c2: [
        { name: 'Knafeh', price: 30, category: 'Desserts' },
        { name: 'Hummus Plate', price: 15, category: 'Appetizers' },
        { name: 'Tea', price: 5, category: 'Hot Drinks' },
        { name: 'Tabbouleh Salad', price: 35, category: 'Salads' },
    ],
    c3: [
        { name: 'Latte', price: 15, category: 'Hot Drinks' },
        { name: 'Milkshake', price: 22, category: 'Cold Drinks' },
        { name: 'Halloumi Salad', price: 50, category: 'Salads' },
        { name: 'Chicken Sandwich', price: 38, category: 'Main Courses' },
    ],
    c4: [
        { name: 'Turkish Coffee', price: 8, category: 'Hot Drinks' },
        { name: 'American Coffee', price: 12, category: 'Hot Drinks' },
        { name: 'Green Salad', price: 30, category: 'Salads' },
        { name: 'Foul and Hummus', price: 20, category: 'Main Courses' },
        { name: 'Soft Drink', price: 7, category: 'Cold Drinks' },
    ],
};

const totalCafes = mockCafes.length;
const totalLocations = new Set(mockCafes.map(c => c.city)).size;
const totalVisitors = mockCafes.reduce((sum, c) => sum + c.visitors, 0);

// --- Component: PriceoChatbot ---

const ChatMessage = ({ message, sender }) => (
    <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-3/4 p-3 rounded-xl shadow-md ${
            sender === 'user' ? 'bg-sky-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
        }`}>
            <p className="whitespace-pre-wrap">{message}</p>
        </div>
    </div>
);

const PriceoChatbot = ({ cafes, menus }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm the Priceo Chatbot. I can help you compare prices. Try asking: 'Which cafe has the cheapest coffee?' or 'Which cafe has the most options?'", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Exponential Backoff implementation
    const fetchWithRetry = useCallback(async (url, options, retries = 3) => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response;
            } catch (error) {
                if (i === retries - 1) throw error;
                const delay = Math.pow(2, i) * 1000;
                // console.log(`Retrying in ${delay / 1000}s...`); // Removed console logging for backoff
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }, []);

    // Local logic to answer data-specific questions without calling the API
    const processLocalQuery = (query) => {
        const lowerQuery = query.toLowerCase();

        // Query 1: Cheapest item
        if (lowerQuery.includes('cheapest') || lowerQuery.includes('lowest price')) {
            const allItems = Object.values(menus).flatMap((menu, index) =>
                menu.map(item => ({
                    ...item,
                    cafeName: cafes[index]?.name || 'Unknown',
                    cafeId: cafes[index]?.id,
                }))
            );
            if (allItems.length === 0) return "Sorry, I currently don't have price data.";
            
            const cheapestItem = allItems.reduce((min, item) => (item.price < min.price ? item : min), allItems[0]);
            return `The cheapest item is ${cheapestItem.name} at ${cheapestItem.price} ILS, available at ${cheapestItem.cafeName}.`;
        }

        // Query 2: Most options
        if (lowerQuery.includes('most options') || lowerQuery.includes('most items')) {
            const cafeOptions = cafes.map(cafe => ({
                name: cafe.name,
                count: menus[cafe.id]?.length || 0
            }));
            if (cafeOptions.length === 0) return "Sorry, I currently don't have data on cafes.";

            const mostOptionsCafe = cafeOptions.reduce((max, cafe) => (cafe.count > max.count ? cafe : max), cafeOptions[0]);
            return `${mostOptionsCafe.name} has the most options with ${mostOptionsCafe.count} items on its menu.`;
        }

        // Query 3: Cheapest coffee
        if (lowerQuery.includes('cheapest coffee') || lowerQuery.includes('cheapest hot drink')) {
            const allCoffees = Object.values(menus).flatMap((menu, index) =>
                menu
                    .filter(item => item.category === 'Hot Drinks' && (item.name.toLowerCase().includes('coffee') || item.name.toLowerCase().includes('espresso') || item.name.toLowerCase().includes('latte') || item.name.toLowerCase().includes('tea')))
                    .map(item => ({
                        ...item,
                        cafeName: cafes[index]?.name || 'Unknown',
                    }))
            );
            if (allCoffees.length === 0) return "Sorry, I couldn't find any coffee or hot drink prices currently.";

            const cheapestCoffee = allCoffees.reduce((min, item) => (item.price < min.price ? item : min), allCoffees[0]);
            return `The cheapest coffee or hot drink available is ${cheapestCoffee.name} at ${cheapestCoffee.price} ILS, found at ${cheapestCoffee.cafeName}.`;
        }
        
        return null; // Fallback to Gemini API
    };

    const fetchGeminiResponse = useCallback(async (userQuery) => {
        // System instruction guides the model's persona and logic flow
        const systemPrompt = "You are the 'Priceo' Chatbot, designed to help compare prices of cafes and restaurants in Palestine. Answer in a friendly and professional tone. Use search (Google Search Grounding) for general questions about Palestine or dining. If the question is related to the data available in the Priceo app (e.g., specific price comparisons or menu items), answer based on that local data first. If you cannot answer locally, provide a general answer using search.";

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            tools: [{ "google_search": {} }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        };

        try {
            const response = await fetchWithRetry(API_URL, options);
            const result = await response.json();

            const candidate = result.candidates?.[0];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                const text = candidate.content.parts[0].text;
                return text;
            } else {
                return "Sorry, I encountered an issue connecting to the AI engine. Please try again.";
            }

        } catch (error) {
            console.error("Gemini API Error:", error);
            return "An unexpected error occurred. There might be a network issue or an API problem.";
        }
    }, [fetchWithRetry]);


    const handleSend = useCallback(async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const newUserMessage = { id: Date.now(), text: input.trim(), sender: 'user' };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);

        // 1. Try to answer locally using mock data
        const localResponse = processLocalQuery(newUserMessage.text);
        let aiResponseText = '';

        if (localResponse) {
            aiResponseText = localResponse;
        } else {
            // 2. Fallback to Gemini API for general queries or those that couldn't be resolved locally
            aiResponseText = await fetchGeminiResponse(newUserMessage.text);
        }

        const newAiMessage = { id: Date.now() + 1, text: aiResponseText, sender: 'ai' };
        setMessages(prev => [...prev, newAiMessage]);
        setIsLoading(false);
    }, [input, isLoading, fetchGeminiResponse]);

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-2xl p-4 md:p-6">
            <h2 className="text-2xl font-bold text-sky-700 mb-4 border-b pb-2">Priceo Chatbot <Zap className="inline-block w-5 h-5 ml-1 text-yellow-500" /></h2>
            <div className="flex-grow overflow-y-auto space-y-4 mb-4 pl-2 custom-scrollbar" style={{ maxHeight: '500px' }}>
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg.text} sender={msg.sender} />
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 p-3 rounded-xl rounded-tl-none shadow-md flex items-center">
                            <Loader className="w-5 h-5 animate-spin text-sky-500 mr-2" />
                            <span className="text-gray-600">Priceo is thinking...</span>
                        </div>
                    </div>
                )}
                <div className="h-4" /> {/* Spacer */}
            </div>
            <form onSubmit={handleSend} className="flex space-x-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Priceo about prices or cafes..."
                    className="flex-grow p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150"
                    disabled={isLoading}
                    dir="ltr"
                />
                <button
                    type="submit"
                    className="bg-sky-500 text-white p-3 rounded-xl hover:bg-sky-600 transition duration-300 disabled:opacity-50 flex items-center justify-center shadow-lg"
                    disabled={isLoading}
                >
                    <Zap className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};


// --- Component: PriceComparisonList ---
const PriceComparisonList = ({ cafes, menus, searchItem, cityFilter }) => {
    const filteredItems = useMemo(() => {
        if (!searchItem) return [];

        const term = searchItem.toLowerCase();
        const results = [];

        cafes.forEach(cafe => {
            if (cityFilter && cafe.city !== cityFilter) return;

            const menu = menus[cafe.id] || [];
            menu.forEach(item => {
                // Check if item name or category includes the search term
                if (item.name.toLowerCase().includes(term) || item.category.toLowerCase().includes(term)) {
                    results.push({
                        ...item,
                        cafeName: cafe.name,
                        cafeCity: cafe.city,
                        cafeLocation: cafe.location,
                    });
                }
            });
        });

        // Sort by price (cheapest first)
        return results.sort((a, b) => a.price - b.price);
    }, [cafes, menus, searchItem, cityFilter]);

    if (!searchItem) {
        return <p className="text-center text-gray-500 p-4">Please enter an item name to search and compare prices.</p>;
    }

    if (filteredItems.length === 0) {
        return <p className="text-center text-red-500 p-4">Sorry, the item "{searchItem}" was not found in any cafe {cityFilter ? `in ${cityFilter}` : ''}.</p>;
    }

    const cities = [...new Set(cafes.map(c => c.city))];

    return (
        <div className="overflow-x-auto">
            <h3 className="text-xl font-semibold mb-4 text-sky-700">Price Comparison Results: "{searchItem}"</h3>
            <table className="min-w-full bg-white rounded-xl shadow-lg border border-sky-100">
                <thead className="bg-sky-500 text-white">
                    <tr>
                        <th className="py-3 px-4 text-left">Item</th>
                        <th className="py-3 px-4 text-left">Price (ILS)</th>
                        <th className="py-3 px-4 text-left">Cafe/Restaurant</th>
                        <th className="py-3 px-4 text-left">City</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {filteredItems.map((item, index) => (
                        <tr key={index} className={`hover:bg-sky-50 ${index === 0 ? 'bg-green-100 font-bold text-green-800' : ''}`}>
                            <td className="py-3 px-4 whitespace-nowrap">{item.name}</td>
                            <td className="py-3 px-4 whitespace-nowrap">{item.price.toFixed(2)}</td>
                            <td className="py-3 px-4 whitespace-nowrap">{item.cafeName}</td>
                            <td className="py-3 px-4 whitespace-nowrap">{item.cafeCity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredItems.length > 0 && (
                <p className="mt-4 text-sm text-gray-600">
                    <Zap className="inline-block w-4 h-4 text-green-500 mr-1" />
                    The lowest price is {filteredItems[0].price.toFixed(2)} ILS at {filteredItems[0].cafeName} in {filteredItems[0].cafeCity}.
                </p>
            )}
        </div>
    );
};


// --- Component: MapPage ---
const MapPage = ({ cafes, menus }) => {
    const [selectedCafe, setSelectedCafe] = useState(null);
    const [searchItem, setSearchItem] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const cities = [...new Set(cafes.map(c => c.city))];

    const handleSearch = (e) => {
        e.preventDefault();
        // The PriceComparisonList component automatically updates based on searchItem/cityFilter state
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen" dir="ltr">
            <h1 className="text-4xl font-extrabold text-sky-800 mb-2">Map & Price Comparison</h1>
            <p className="text-gray-600 mb-8">Search for specific items and compare their prices across different cafes, or click on a marker to view its menu.</p>

            {/* Price Comparison Search Section */}
            <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-sky-100">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-grow">
                        <label htmlFor="search-item" className="block text-sm font-medium text-gray-700 mb-1">Search for an item (e.g., Coffee, Salad)</label>
                        <div className="relative">
                            <input
                                id="search-item"
                                type="text"
                                value={searchItem}
                                onChange={(e) => setSearchItem(e.target.value)}
                                placeholder="Item name..."
                                className="w-full p-3 border border-gray-300 rounded-xl pl-10 focus:ring-sky-500 focus:border-sky-500"
                                dir="ltr"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="city-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by City</label>
                        <select
                            id="city-filter"
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                            className="w-full p-3 border border-gray-300 bg-white rounded-xl focus:ring-sky-500 focus:border-sky-500 appearance-none"
                            dir="ltr"
                        >
                            <option value="">All Cities</option>
                            {cities.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="sm:mt-auto bg-sky-600 text-white p-3 rounded-xl hover:bg-sky-700 transition duration-300 shadow-md"
                    >
                        Compare Prices
                    </button>
                </form>
                <PriceComparisonList cafes={cafes} menus={menus} searchItem={searchItem} cityFilter={cityFilter} />
            </div>

            {/* Simulated Map & Cafe Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-sky-100 p-4 md:p-6 rounded-2xl shadow-inner relative h-[400px]">
                    <h3 className="text-xl font-bold text-sky-700 mb-4">Map View (Simulation)</h3>
                    <div className="w-full h-full bg-sky-200/50 flex items-center justify-center text-sky-700 font-semibold rounded-xl border-4 border-dashed border-sky-300">
                        Interactive Map Display (Google Maps/Mapbox API Placeholder)
                    </div>

                    {/* Cafe Markers (Mocked position) */}
                    {cafes.map(cafe => (
                        <div
                            key={cafe.id}
                            className={`absolute p-2 rounded-full cursor-pointer transition duration-300 ${selectedCafe?.id === cafe.id ? 'bg-red-500 ring-4 ring-red-300' : 'bg-sky-700 hover:bg-sky-500'}`}
                            style={{
                                // Simple mock positioning based on data array index
                                top: `${15 + (parseInt(cafe.id.slice(-1)) * 20)}%`,
                                left: `${15 + (parseInt(cafe.id.slice(-1)) * 20)}%`,
                            }}
                            onClick={() => setSelectedCafe(cafe)}
                            title={cafe.name}
                        >
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                    ))}
                </div>

                {/* Cafe Details / Menu */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-xl border border-sky-100">
                    <h3 className="text-xl font-bold text-sky-700 mb-4 border-b pb-2">Cafe/Restaurant Details</h3>
                    {selectedCafe ? (
                        <div>
                            <p className="text-2xl font-bold mb-2 text-sky-900">{selectedCafe.name}</p>
                            <div className="text-gray-600 mb-4 space-y-1">
                                <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-sky-500" /> {selectedCafe.location}, {selectedCafe.city}</p>
                                <p className="flex items-center"><Users className="w-4 h-4 mr-2 text-sky-500" /> {selectedCafe.visitors.toLocaleString()} Visitors (Est.)</p>
                            </div>
                            
                            <h4 className="font-semibold mt-4 mb-2 text-lg text-sky-700">Menu & Prices:</h4>
                            <div className="max-h-64 overflow-y-auto pl-2 custom-scrollbar">
                                {(menus[selectedCafe.id] || []).map((item, index) => (
                                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                        <span className="font-medium text-gray-800">{item.name}</span>
                                        <span className="text-sky-600 font-bold">{item.price} ILS</span>
                                    </div>
                                ))}
                                {(!menus[selectedCafe.id] || menus[selectedCafe.id].length === 0) && (
                                    <p className="text-gray-500 italic">No menu available for this location yet.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-12">Click a cafe marker on the map to view its menu.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Component: DashboardPage ---
const DashboardPage = ({ totalCafes, totalLocations, totalVisitors }) => {
    const Card = ({ title, value, icon: Icon, color }) => (
        <div className={`bg-white p-6 rounded-xl shadow-lg border-b-4 ${color} transform hover:scale-[1.02] transition duration-300`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{value.toLocaleString()}</p>
                </div>
                <Icon className={`w-10 h-10 ${color.replace('border-', 'text-')} opacity-70`} />
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen" dir="ltr">
            <h1 className="text-4xl font-extrabold text-sky-800 mb-8 border-b pb-2">Priceo Dashboard</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card 
                    title="Total Cafes & Restaurants" 
                    value={totalCafes} 
                    icon={Coffee} 
                    color="border-sky-500" 
                />
                <Card 
                    title="Cities Covered" 
                    value={totalLocations} 
                    icon={MapPin} 
                    color="border-green-500" 
                />
                <Card 
                    title="Total Visitors (Estimated)" 
                    value={totalVisitors} 
                    icon={Users} 
                    color="border-yellow-500" 
                />
            </div>

            <div className="mt-12 bg-white p-6 rounded-xl shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold text-sky-700 mb-4">Data Analysis (Simulation)</h2>
                <div className="space-y-4 text-gray-700">
                    <p>Interactive charts (using libraries like Recharts in a real app) could be displayed here to show price comparison by category or cafe distribution by city.</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Most Expensive Category:</strong> Main Courses</li>
                        <li><strong>Cheapest Category:</strong> Hot Drinks</li>
                        <li><strong>Cafe Distribution:</strong> {mockCafes.map(c => c.city).join(', ')}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};


// --- Component: ServicesSection ---
const ServiceCard = ({ icon: Icon, title, description }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-sky-100 text-center hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
        <div className="mx-auto w-12 h-12 flex items-center justify-center bg-sky-100 rounded-full mb-4">
            <Icon className="w-6 h-6 text-sky-600" />
        </div>
        <h3 className="text-xl font-semibold text-sky-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

// --- Component: TestimonialCard ---
const TestimonialCard = ({ quote, name, city }) => (
    <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-sky-500">
        <p className="italic text-gray-700 mb-4">"{quote}"</p>
        <div className="font-semibold text-sky-600">- {name}</div>
        <div className="text-sm text-gray-500">{city}</div>
    </div>
);


// --- Component: HomePage ---
const HomePage = () => {
    const services = [
        { icon: MapPin, title: 'Location Tracking', description: 'Find nearby cafes and restaurants or search across any Palestinian city.' },
        { icon: Search, title: 'Smart Price Comparison', description: 'Compare prices of specific items (e.g., coffee, salad) to find the best deal.' },
        { icon: Zap, title: 'Priceo AI Chatbot', description: 'Get instant answers to your questions about prices and options via chat.' },
        { icon: BarChart, title: 'Data Analytics', description: 'View statistics on cafes and visitors for a comprehensive market overview.' },
    ];
    
    const testimonials = [
        { quote: "Priceo made my lunch decision easy. I found the cheapest salad in the city!", name: 'Ahmad Mahmoud', city: 'Ramallah' },
        { quote: "The design is very clean, and the ability to compare Turkish coffee prices was extremely helpful. Great app.", name: 'Sarah Ali', city: 'Hebron' },
        { quote: "I loved the smart robot idea; it answers complex menu questions quickly.", name: 'Khalid Nasser', city: 'Nablus' },
    ];

    return (
        <div className="min-h-screen bg-white" dir="ltr">
            {/* Hero Section */}
            <header className="bg-sky-500/10 py-24 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-sky-800 mb-4 animate-fadeIn">
                        Compare Prices, Save More, Live Smarter.
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Priceo is your smart application for comparing food and beverage prices at Palestinian cafes and restaurants based on geographic location.
                    </p>
                    <a href="#/map" className="bg-sky-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-sky-700 transition duration-300 transform hover:scale-105 inline-flex items-center">
                        Explore Cafes Now <ChevronDown className="w-5 h-5 ml-2" />
                    </a>
                </div>
            </header>

            {/* Services/Features Section */}
            <section id="features" className="py-16 md:py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-sky-800 mb-4">What We Offer</h2>
                    <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
                        We provide a comprehensive set of tools to help you make the best decisions regarding dining out.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((service, index) => (
                            <ServiceCard key={index} {...service} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-sky-800 mb-12">What Our Users Say</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <TestimonialCard key={index} {...testimonial} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-sky-600 py-16 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Stop Guessing, Start Saving!</h2>
                    <p className="text-xl text-sky-100 mb-8">Begin comparing prices now and save money.</p>
                    <button onClick={() => window.location.hash = '#/map'} className="bg-white text-sky-600 font-bold py-3 px-8 rounded-full shadow-xl hover:bg-gray-100 transition duration-300 transform hover:scale-105">
                        Go to Map
                    </button>
                </div>
            </section>
        </div>
    );
};


// --- Component: Footer ---
const Footer = () => (
    <footer className="bg-gray-800 text-white py-10" dir="ltr">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-gray-700 pb-8">
            {/* About */}
            <div>
                <h3 className="text-xl font-bold text-sky-400 mb-4">Priceo</h3>
                <p className="text-gray-400 text-sm">Our mission is to provide transparency to the Palestinian consumer by making price comparison easy and smart.</p>
            </div>
            
            {/* Quick Links */}
            <div>
                <h3 className="text-xl font-bold text-sky-400 mb-4">Quick Links</h3>
                <ul className="space-y-2 text-gray-400">
                    <li><a href="#/map" className="hover:text-sky-300 transition">Map & Comparison</a></li>
                    <li><a href="#/dashboard" className="hover:text-sky-300 transition">Dashboard</a></li>
                    <li><a href="#" className="hover:text-sky-300 transition">About Us</a></li>
                    <li><a href="#" className="hover:text-sky-300 transition">Terms of Service</a></li>
                </ul>
            </div>

            {/* Contact Info */}
            <div>
                <h3 className="text-xl font-bold text-sky-400 mb-4">Contact</h3>
                <ul className="space-y-2 text-gray-400">
                    <li className="flex items-center"><Phone className="w-4 h-4 mr-2" /> (00970) 59X-XXX-XXX</li>
                    <li className="flex items-center"><Mail className="w-4 h-4 mr-2" /> info@priceo.ps</li>
                    <li className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Ramallah, Palestine</li>
                </ul>
            </div>

            {/* Social Media */}
            <div>
                <h3 className="text-xl font-bold text-sky-400 mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                    <a href="#" aria-label="Facebook"><Facebook className="w-6 h-6 text-gray-400 hover:text-sky-400 transition" /></a>
                    <a href="#" aria-label="Instagram"><Instagram className="w-6 h-6 text-gray-400 hover:text-sky-400 transition" /></a>
                    <a href="#" aria-label="Twitter"><Twitter className="w-6 h-6 text-gray-400 hover:text-sky-400 transition" /></a>
                </div>
            </div>
        </div>
        <div className="container mx-auto px-4 pt-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Priceo. All Rights Reserved.
        </div>
    </footer>
);


// --- Component: Navbar ---
const Navbar = ({ activePage, setActivePage }) => {
    const navItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Map & Prices', path: '/map', icon: MapPin },
        { name: 'Dashboard', path: '/dashboard', icon: BarChart },
        { name: 'Priceo Chatbot', path: '/chatbot', icon: MessageCircle },
    ];

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50" dir="ltr">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="text-2xl font-extrabold text-sky-600">Priceo</div>
                
                {/* Desktop Navigation */}
                <div className="hidden md:flex space-x-6">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => setActivePage(item.path)}
                            className={`flex items-center text-lg font-medium transition duration-300 py-1 border-b-2 ${
                                activePage === item.path
                                    ? 'text-sky-600 border-sky-600'
                                    : 'text-gray-600 border-transparent hover:text-sky-500 hover:border-sky-500'
                            }`}
                        >
                            <item.icon className="w-5 h-5 mr-2" />
                            {item.name}
                        </button>
                    ))}
                </div>

                {/* Mobile Navigation - Simple dropdown for demonstration */}
                <div className="md:hidden">
                     <select
                        value={activePage}
                        onChange={(e) => setActivePage(e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg bg-white appearance-none text-center text-gray-700 font-medium"
                        dir="ltr"
                    >
                        {navItems.map(item => (
                            <option key={item.path} value={item.path}>{item.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </nav>
    );
};

// --- Main App Component ---
const App = () => {
    const [activePage, setActivePage] = useState('/');
    
    // Simple routing based on state
    const renderPage = () => {
        switch (activePage) {
            case '/map':
                return <MapPage cafes={mockCafes} menus={mockMenus} />;
            case '/dashboard':
                return <DashboardPage totalCafes={totalCafes} totalLocations={totalLocations} totalVisitors={totalVisitors} />;
            case '/chatbot':
                // The chatbot handles its own directionality for text input
                return <div className="p-4 md:p-8 bg-gray-50 min-h-screen" dir="ltr"><PriceoChatbot cafes={mockCafes} menus={mockMenus} /></div>;
            case '/':
            default:
                return <HomePage />;
        }
    };
    
    // Sync state with URL hash for better navigation handling
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash.startsWith('/')) {
                setActivePage(hash);
            } else {
                setActivePage('/');
            }
        };
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Initial check
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        // Update URL hash when state changes
        if (window.location.hash !== `#${activePage}`) {
            window.location.hash = activePage;
        }
    }, [activePage]);

    return (
        // Set default text direction to LTR for an English app
        <div className="min-h-screen flex flex-col font-sans text-left" dir="ltr">
            {/* Custom Scrollbar Styling & Font Import */}
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: #f4f7f9;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #94a3b8; /* slate-400 */
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9; /* slate-100 */
                }
                .animate-fadeIn {
                    animation: fadeIn 1s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>
            
            <Navbar activePage={activePage} setActivePage={setActivePage} />
            
            <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
                {renderPage()}
            </main>
            
            <Footer />
        </div>
    );
};

export default App;