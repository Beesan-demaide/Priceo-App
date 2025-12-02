import React, { useState, useCallback, useMemo } from "react";
import {
  MapPin,
  Coffee,
  Users,
  Search,
  Loader,
  Zap,
  ChevronDown,
} from "lucide-react";

// --- Gemini API Configuration ---
const API_KEY = ""; // Add your Gemini API Key here
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;

// --- Component: PriceoChatbot ---
const ChatMessage = ({ message, sender }) => (
  <div
    className={`flex ${
      sender === "user" ? "justify-end" : "justify-start"
    } mb-4`}
  >
    <div
      className={`max-w-3/4 p-3 rounded-xl shadow-md ${
        sender === "user"
          ? "bg-sky-500 text-white rounded-br-none"
          : "bg-gray-100 text-gray-800 rounded-tl-none"
      }`}
    >
      <p className="whitespace-pre-wrap">{message}</p>
    </div>
  </div>
);

export const PriceoChatbot = ({ cafes, menus }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm the Priceo Chatbot. I can help you compare prices. Try asking: 'Which cafe has the cheapest coffee?' or 'Which cafe has the most options?'",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }, []);

  const processLocalQuery = (query) => {
    const lowerQuery = query.toLowerCase();

    // Query 1: Cheapest item
    if (
      lowerQuery.includes("cheapest") ||
      lowerQuery.includes("lowest price")
    ) {
      const allItems = Object.entries(menus).flatMap(([cafeId, menu]) => {
        const cafe = cafes.find((c) => c.id === cafeId);
        return menu.map((item) => ({
          ...item,
          cafeName: cafe?.name || "Unknown",
          cafeId: cafeId,
        }));
      });

      if (allItems.length === 0)
        return "Sorry, I currently don't have price data.";

      const cheapestItem = allItems.reduce(
        (min, item) => (item.price < min.price ? item : min),
        allItems[0]
      );
      return `The cheapest item is ${cheapestItem.name} at ${cheapestItem.price} ILS, available at ${cheapestItem.cafeName}.`;
    }

    // Query 2: Most options
    if (
      lowerQuery.includes("most options") ||
      lowerQuery.includes("most items")
    ) {
      const cafeOptions = cafes.map((cafe) => ({
        name: cafe.name,
        count: menus[cafe.id]?.length || 0,
      }));
      if (cafeOptions.length === 0)
        return "Sorry, I currently don't have data on cafes.";

      const mostOptionsCafe = cafeOptions.reduce(
        (max, cafe) => (cafe.count > max.count ? cafe : max),
        cafeOptions[0]
      );
      return `${mostOptionsCafe.name} has the most options with ${mostOptionsCafe.count} items on its menu.`;
    }

    // Query 3: Cheapest coffee
    if (
      lowerQuery.includes("cheapest coffee") ||
      lowerQuery.includes("cheapest hot drink")
    ) {
      const allCoffees = Object.entries(menus).flatMap(([cafeId, menu]) => {
        const cafe = cafes.find((c) => c.id === cafeId);
        return menu
          .filter(
            (item) =>
              item.category === "Hot Drinks" &&
              (item.name.toLowerCase().includes("coffee") ||
                item.name.toLowerCase().includes("espresso") ||
                item.name.toLowerCase().includes("latte") ||
                item.name.toLowerCase().includes("tea"))
          )
          .map((item) => ({
            ...item,
            cafeName: cafe?.name || "Unknown",
          }));
      });

      if (allCoffees.length === 0)
        return "Sorry, I couldn't find any coffee or hot drink prices currently.";

      const cheapestCoffee = allCoffees.reduce(
        (min, item) => (item.price < min.price ? item : min),
        allCoffees[0]
      );
      return `The cheapest coffee or hot drink available is ${cheapestCoffee.name} at ${cheapestCoffee.price} ILS, found at ${cheapestCoffee.cafeName}.`;
    }

    return null;
  };

  const fetchGeminiResponse = useCallback(
    async (userQuery) => {
      const systemPrompt =
        "You are the 'Priceo' Chatbot, designed to help compare prices of cafes and restaurants in Palestine. Answer in a friendly and professional tone. Use search (Google Search Grounding) for general questions about Palestine or dining. If the question is related to the data available in the Priceo app (e.g., specific price comparisons or menu items), answer based on that local data first. If you cannot answer locally, provide a general answer using search.";

      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        tools: [{ google_search: {} }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
      };

      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      };

      try {
        const response = await fetchWithRetry(API_URL, options);
        const result = await response.json();

        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
          return candidate.content.parts[0].text;
        } else {
          return "Sorry, I encountered an issue connecting to the AI engine. Please try again.";
        }
      } catch (error) {
        console.error("Gemini API Error:", error);
        return "An unexpected error occurred. There might be a network issue or an API problem.";
      }
    },
    [fetchWithRetry]
  );

  const handleSend = useCallback(
    async (e) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      const newUserMessage = {
        id: Date.now(),
        text: input.trim(),
        sender: "user",
      };
      setMessages((prev) => [...prev, newUserMessage]);
      setInput("");
      setIsLoading(true);

      const localResponse = processLocalQuery(newUserMessage.text);
      let aiResponseText = "";

      if (localResponse) {
        aiResponseText = localResponse;
      } else {
        aiResponseText = await fetchGeminiResponse(newUserMessage.text);
      }

      const newAiMessage = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: "ai",
      };
      setMessages((prev) => [...prev, newAiMessage]);
      setIsLoading(false);
    },
    [input, isLoading, fetchGeminiResponse]
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-2xl p-4 md:p-6">
      <h2 className="text-2xl font-bold text-sky-700 mb-4 border-b pb-2">
        Priceo Chatbot{" "}
        <Zap className="inline-block w-5 h-5 ml-1 text-yellow-500" />
      </h2>
      <div
        className="flex-grow overflow-y-auto space-y-4 mb-4 pl-2 custom-scrollbar"
        style={{ maxHeight: "500px" }}
      >
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
        <div className="h-4" />
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

    cafes.forEach((cafe) => {
      if (cityFilter && cafe.city !== cityFilter) return;

      const menu = menus[cafe.id] || [];
      menu.forEach((item) => {
        if (
          item.name.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term)
        ) {
          results.push({
            ...item,
            cafeName: cafe.name,
            cafeCity: cafe.city,
            cafeLocation: cafe.location,
          });
        }
      });
    });

    return results.sort((a, b) => a.price - b.price);
  }, [cafes, menus, searchItem, cityFilter]);

  if (!searchItem) {
    return (
      <p className="text-center text-gray-500 p-4">
        Please enter an item name to search and compare prices.
      </p>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <p className="text-center text-red-500 p-4">
        Sorry, the item "{searchItem}" was not found in any cafe{" "}
        {cityFilter ? `in ${cityFilter}` : ""}.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <h3 className="text-xl font-semibold mb-4 text-sky-700">
        Price Comparison Results: "{searchItem}"
      </h3>
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
            <tr
              key={index}
              className={`hover:bg-sky-50 ${
                index === 0 ? "bg-green-100 font-bold text-green-800" : ""
              }`}
            >
              <td className="py-3 px-4 whitespace-nowrap">{item.name}</td>
              <td className="py-3 px-4 whitespace-nowrap">
                {item.price.toFixed(2)}
              </td>
              <td className="py-3 px-4 whitespace-nowrap">{item.cafeName}</td>
              <td className="py-3 px-4 whitespace-nowrap">{item.cafeCity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredItems.length > 0 && (
        <p className="mt-4 text-sm text-gray-600">
          <Zap className="inline-block w-4 h-4 text-green-500 mr-1" />
          The lowest price is {filteredItems[0].price.toFixed(2)} ILS at{" "}
          {filteredItems[0].cafeName} in {filteredItems[0].cafeCity}.
        </p>
      )}
    </div>
  );
};

// --- Component: MapPage ---
// --- Component: MapPage ---
export const MapPage = ({ cafes, menus }) => {
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [searchItem, setSearchItem] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const cities = [...new Set(cafes.map((c) => c.city))];

  // Fixed preset search items
  const presetItems = [
    "Coffee",
    "Salad",
    "Sandwich",
    "Tea",
    "Pizza",
    "Burger",
    "Juice",
    "Cake",
  ];

  // Fake coffee price data matching actual cafe names
  const coffeePriceData = [
    { cafe: "Zaman Cafe & Gallery", price: 18, city: "Ramallah" },
    { cafe: "Snowbar Restaurant", price: 25, city: "Ramallah" },
    { cafe: "The Jasmine Terrace", price: 15, city: "Ramallah" },
    { cafe: "Karaz Cafe", price: 16, city: "Ramallah" },
    { cafe: "Al-Quds Sweets & Cafe", price: 14, city: "Ramallah" },
    { cafe: "Al-Quds Rooftop Cafe", price: 22, city: "Jerusalem" },
    { cafe: "Hosh Al-Syrian Cafe", price: 20, city: "Jerusalem" },
    { cafe: "The Grotto Cafe", price: 12, city: "Bethlehem" },
    { cafe: "Abu Elias Cafe", price: 10, city: "Bethlehem" },
    { cafe: "Al-Aqsa Knafeh & Cafe", price: 30, city: "Nablus" },
    { cafe: "The Poet's Nook Cafe", price: 11, city: "Nablus" },
    { cafe: "Al-Haram Cafe", price: 13, city: "Hebron" },
    { cafe: "Qalandia Sweets", price: 14, city: "Hebron" },
    { cafe: "The Date Palm Cafe", price: 12, city: "Jericho" },
    { cafe: "The Coastal Cafe", price: 17, city: "Gaza" },
    { cafe: "Palestine Bakery", price: 15, city: "Gaza" },
    { cafe: "Jabal Al-Nur Cafe", price: 13, city: "Jenin" },
    { cafe: "Al-Salam Cafe", price: 14, city: "Tulkarm" },
    { cafe: "Qalqilya Zoo Cafe", price: 16, city: "Qalqilya" },
    { cafe: "Tubas Heritage Cafe", price: 12, city: "Tubas" },
    { cafe: "Sunset View Cafe", price: 18, city: "Salfit" },
    { cafe: "Birzeit Heritage Cafe", price: 17, city: "Birzeit" },
    { cafe: "Arafat Museum Cafe", price: 16, city: "Ramallah" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen" dir="ltr">
      <h1 className="text-4xl font-extrabold text-sky-800 mb-2">
        Map & Price Comparison
      </h1>
      <p className="text-gray-600 mb-8">
        Search for specific items and compare their prices across different
        cafes, or click on a marker to view its menu.
      </p>

      <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-sky-100">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="flex-grow">
            <label
              htmlFor="search-item"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search for an item (Select from fixed options)
            </label>
            <div className="relative">
              <select
                id="search-item"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-sky-500 focus:border-sky-500 appearance-none"
                dir="ltr"
              >
                <option value="">Select an item to compare...</option>
                {presetItems.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Preset item buttons */}
            <div className="mt-3 flex flex-wrap gap-2">
              {presetItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSearchItem(item)}
                  className={`px-3 py-1.5 text-sm rounded-full transition duration-300 ${
                    searchItem === item
                      ? "bg-sky-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="city-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by City
            </label>
            <select
              id="city-filter"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 bg-white rounded-xl focus:ring-sky-500 focus:border-sky-500 appearance-none"
              dir="ltr"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="sm:mt-auto bg-sky-600 text-white p-3 rounded-xl hover:bg-sky-700 transition duration-300 shadow-md"
          >
            Compare Prices
          </button>
        </form>

        {/* Fake Coffee Price Data Section */}
        {searchItem === "Coffee" && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2 flex items-center">
              <Coffee className="w-5 h-5 mr-2" /> Coffee Price Insights (Sample
              Data)
            </h3>
            <p className="text-yellow-700 mb-3">
              Here are coffee prices from actual cafes in the Priceo database:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {coffeePriceData
                .sort((a, b) => b.price - a.price)
                .slice(0, 6)
                .map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      index === 0
                        ? "bg-yellow-100 border border-yellow-300"
                        : "bg-white border"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">
                        {item.cafe}
                      </span>
                      <span className="font-bold text-sky-600">
                        {item.price} ILS
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {item.city}
                    </div>
                    {index === 0 && (
                      <div className="text-xs text-red-600 font-semibold mt-1">
                        Most Expensive Coffee
                      </div>
                    )}
                    {item.price === 10 && (
                      <div className="text-xs text-green-600 font-semibold mt-1">
                        Cheapest Coffee
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {/* Additional cafes in a scrollable section */}
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-yellow-700 mb-2">
                More Coffee Prices:
              </h4>
              <div className="max-h-40 overflow-y-auto bg-white rounded-lg border p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {coffeePriceData.slice(6).map((item, index) => (
                    <div
                      key={index + 6}
                      className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                    >
                      <div>
                        <span className="text-sm font-medium">{item.cafe}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({item.city})
                        </span>
                      </div>
                      <span className="text-sm font-bold text-sky-600">
                        {item.price} ILS
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-sky-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-sky-800">
                    Average Coffee Price
                  </p>
                  <p className="text-xs text-gray-600">
                    Based on {coffeePriceData.length} cafes
                  </p>
                </div>
                <div className="text-2xl font-bold text-sky-700">
                  {Math.round(
                    coffeePriceData.reduce((sum, item) => sum + item.price, 0) /
                      coffeePriceData.length
                  )}{" "}
                  ILS
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-600 mr-2">Price Range:</span>
                <span className="font-bold text-green-600">10 ILS</span>
                <span className="mx-2">→</span>
                <span className="font-bold text-red-600">30 ILS</span>
                <span className="ml-4 text-gray-600">
                  {coffeePriceData.length} cafes across{" "}
                  {
                    [...new Set(coffeePriceData.map((item) => item.city))]
                      .length
                  }{" "}
                  cities
                </span>
              </div>
            </div>
          </div>
        )}

        <PriceComparisonList
          cafes={cafes}
          menus={menus}
          searchItem={searchItem}
          cityFilter={cityFilter}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-sky-100 p-4 md:p-6 rounded-2xl shadow-inner relative h-[400px]">
          <h3 className="text-xl font-bold text-sky-700 mb-4">
            Map View (Simulation)
          </h3>
          <div className="w-full h-full bg-sky-200/50 flex items-center justify-center text-sky-700 font-semibold rounded-xl border-4 border-dashed border-sky-300">
            Interactive Map Display (Google Maps/Mapbox API Placeholder)
          </div>

          {cafes.map((cafe, index) => (
            <div
              key={cafe.id}
              className={`absolute p-2 rounded-full cursor-pointer transition duration-300 ${
                selectedCafe?.id === cafe.id
                  ? "bg-red-500 ring-4 ring-red-300"
                  : "bg-sky-700 hover:bg-sky-500"
              }`}
              style={{
                top: `${15 + (index % 4) * 20}%`,
                left: `${15 + (index % 4) * 20}%`,
              }}
              onClick={() => setSelectedCafe(cafe)}
              title={cafe.name}
            >
              <MapPin className="w-5 h-5 text-white" />
            </div>
          ))}
        </div>

        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-xl border border-sky-100">
          <h3 className="text-xl font-bold text-sky-700 mb-4 border-b pb-2">
            Cafe/Restaurant Details
          </h3>
          {selectedCafe ? (
            <div>
              <p className="text-2xl font-bold mb-2 text-sky-900">
                {selectedCafe.name}
              </p>
              <div className="text-gray-600 mb-4 space-y-1">
                <p className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-sky-500" />{" "}
                  {selectedCafe.location}, {selectedCafe.city}
                </p>
                <p className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-sky-500" />{" "}
                  {selectedCafe.visitors.toLocaleString()} Visitors (Est.)
                </p>
              </div>

              <h4 className="font-semibold mt-4 mb-2 text-lg text-sky-700">
                Menu & Prices:
              </h4>
              <div className="max-h-64 overflow-y-auto pl-2 custom-scrollbar">
                {(menus[selectedCafe.id] || []).map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b last:border-b-0"
                  >
                    <span className="font-medium text-gray-800">
                      {item.name}
                    </span>
                    <span className="text-sky-600 font-bold">
                      {item.price} ILS
                    </span>
                  </div>
                ))}
                {(!menus[selectedCafe.id] ||
                  menus[selectedCafe.id].length === 0) && (
                  <p className="text-gray-500 italic">
                    No menu available for this location yet.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">
              Click a cafe marker on the map to view its menu.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Component: DashboardPage ---
export const DashboardPage = ({ cafes, menus }) => {
  const totalCafes = cafes.length;
  const totalLocations = new Set(cafes.map((c) => c.city)).size;
  const totalVisitors = cafes.reduce((sum, c) => sum + c.visitors, 0);

  const Card = ({ title, value, icon: Icon, color }) => (
    <div
      className={`bg-white p-6 rounded-xl shadow-lg border-b-4 ${color} transform hover:scale-[1.02] transition duration-300`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">
            {value.toLocaleString()}
          </p>
        </div>
        <Icon
          className={`w-10 h-10 ${color.replace(
            "border-",
            "text-"
          )} opacity-70`}
        />
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen" dir="ltr">
      <h1 className="text-4xl font-extrabold text-sky-800 mb-8 border-b pb-2">
        Priceo Dashboard
      </h1>

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
        <h2 className="text-2xl font-bold text-sky-700 mb-4">Data Analysis</h2>
        <div className="space-y-4 text-gray-700">
          <p>
            Interactive charts could be displayed here to show price comparison
            by category or cafe distribution by city.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Total Menu Items:</strong>{" "}
              {Object.values(menus).reduce((sum, menu) => sum + menu.length, 0)}
            </li>
            <li>
              <strong>Cafe Distribution:</strong>{" "}
              {cafes.map((c) => c.city).join(", ")}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// --- Component: HomePage ---
const ServiceCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-sky-100 text-center hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
    <div className="mx-auto w-12 h-12 flex items-center justify-center bg-sky-100 rounded-full mb-4">
      <Icon className="w-6 h-6 text-sky-600" />
    </div>
    <h3 className="text-xl font-semibold text-sky-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const TestimonialCard = ({ quote, name, city }) => (
  <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-sky-500">
    <p className="italic text-gray-700 mb-4">"{quote}"</p>
    <div className="font-semibold text-sky-600">- {name}</div>
    <div className="text-sm text-gray-500">{city}</div>
  </div>
);

export const HomePage = () => {
  const services = [
    {
      icon: MapPin,
      title: "Location Tracking",
      description:
        "Find nearby cafes and restaurants or search across any Palestinian city.",
    },
    {
      icon: Search,
      title: "Smart Price Comparison",
      description:
        "Compare prices of specific items (e.g., coffee, salad) to find the best deal.",
    },
    {
      icon: Zap,
      title: "Priceo AI Chatbot",
      description:
        "Get instant answers to your questions about prices and options via chat.",
    },
    {
      icon: Coffee,
      title: "Data Analytics",
      description:
        "View statistics on cafes and visitors for a comprehensive market overview.",
    },
  ];

  const testimonials = [
    {
      quote:
        "Priceo made my lunch decision easy. I found the cheapest salad in the city!",
      name: "Ahmad Mahmoud",
      city: "Ramallah",
    },
    {
      quote:
        "The design is very clean, and the ability to compare Turkish coffee prices was extremely helpful. Great app.",
      name: "Sarah Ali",
      city: "Hebron",
    },
    {
      quote:
        "I loved the smart robot idea; it answers complex menu questions quickly.",
      name: "Khalid Nasser",
      city: "Nablus",
    },
  ];

  return (
    <div className="min-h-screen bg-white" dir="ltr">
      <header className="bg-sky-500/10 py-24 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-sky-800 mb-4 animate-fadeIn">
            Compare Prices, Save More, Live Smarter.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Priceo is your smart application for comparing food and beverage
            prices at Palestinian cafes and restaurants based on geographic
            location.
          </p>
          <a
            href="#/map"
            className="bg-sky-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-sky-700 transition duration-300 transform hover:scale-105 inline-flex items-center"
          >
            Explore Cafes Now <ChevronDown className="w-5 h-5 ml-2" />
          </a>
        </div>
      </header>

      <section id="features" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-sky-800 mb-4">
            What We Offer
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            We provide a comprehensive set of tools to help you make the best
            decisions regarding dining out.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-sky-800 mb-12">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sky-600 py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stop Guessing, Start Saving!
          </h2>
          <p className="text-xl text-sky-100 mb-8">
            Begin comparing prices now and save money.
          </p>
          <button
            onClick={() => (window.location.hash = "#/map")}
            className="bg-white text-sky-600 font-bold py-3 px-8 rounded-full shadow-xl hover:bg-gray-100 transition duration-300 transform hover:scale-105"
          >
            Go to Map
          </button>
        </div>
      </section>
    </div>
  );
};
