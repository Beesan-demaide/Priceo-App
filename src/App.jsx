import React, { useState, useEffect } from "react";
import {
  MapPin,
  BarChart,
  MessageCircle,
  Home,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { PriceoChatbot, MapPage, DashboardPage, HomePage } from "./components";

// --- API Configuration ---
const API_BASE_URL = "http://localhost:3000";

// --- Component: Footer ---
const Footer = () => (
  <footer className="bg-gray-800 text-white py-10" dir="ltr">
    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-gray-700 pb-8">
      {/* About */}
      <div>
        <h3 className="text-xl font-bold text-sky-400 mb-4">Priceo</h3>
        <p className="text-gray-400 text-sm">
          Our mission is to provide transparency to the Palestinian consumer by
          making price comparison easy and smart.
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-xl font-bold text-sky-400 mb-4">Quick Links</h3>
        <ul className="space-y-2 text-gray-400">
          <li>
            <a href="#/map" className="hover:text-sky-300 transition">
              Map & Comparison
            </a>
          </li>
          <li>
            <a href="#/dashboard" className="hover:text-sky-300 transition">
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-sky-300 transition">
              About Us
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-sky-300 transition">
              Terms of Service
            </a>
          </li>
        </ul>
      </div>

      {/* Contact Info */}
      <div>
        <h3 className="text-xl font-bold text-sky-400 mb-4">Contact</h3>
        <ul className="space-y-2 text-gray-400">
          <li className="flex items-center">
            <Phone className="w-4 h-4 mr-2" /> (00970) 59X-XXX-XXX
          </li>
          <li className="flex items-center">
            <Mail className="w-4 h-4 mr-2" /> info@priceo.ps
          </li>
          <li className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" /> Ramallah, Palestine
          </li>
        </ul>
      </div>

      {/* Social Media */}
      <div>
        <h3 className="text-xl font-bold text-sky-400 mb-4">Follow Us</h3>
        <div className="flex space-x-4">
          <a href="#" aria-label="Facebook">
            <Facebook className="w-6 h-6 text-gray-400 hover:text-sky-400 transition" />
          </a>
          <a href="#" aria-label="Instagram">
            <Instagram className="w-6 h-6 text-gray-400 hover:text-sky-400 transition" />
          </a>
          <a href="#" aria-label="Twitter">
            <Twitter className="w-6 h-6 text-gray-400 hover:text-sky-400 transition" />
          </a>
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
    { name: "Home", path: "/", icon: Home },
    { name: "Map & Prices", path: "/map", icon: MapPin },
    { name: "Dashboard", path: "/dashboard", icon: BarChart },
    { name: "Priceo Chatbot", path: "/chatbot", icon: MessageCircle },
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
                  ? "text-sky-600 border-sky-600"
                  : "text-gray-600 border-transparent hover:text-sky-500 hover:border-sky-500"
              }`}
            >
              <item.icon className="w-5 h-5 mr-2" />
              {item.name}
            </button>
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <select
            value={activePage}
            onChange={(e) => setActivePage(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg bg-white appearance-none text-center text-gray-700 font-medium"
            dir="ltr"
          >
            {navItems.map((item) => (
              <option key={item.path} value={item.path}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
};

// --- Main App Component ---
const App = () => {
  const [activePage, setActivePage] = useState("/");
  const [cafes, setCafes] = useState([]);
  const [menus, setMenus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from MongoDB backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching data from:", `${API_BASE_URL}/eateries`);

        const response = await fetch(`${API_BASE_URL}/eateries`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Received data:", data);

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("No eateries data received from server");
        }

        // Transform MongoDB data to match the app's expected format
        const transformedCafes = data.map((eatery) => ({
          id: eatery._id || eatery.id,
          name: eatery.name,
          city: eatery.city,
          location: eatery.location,
          coords: eatery.coords || { lat: 0, lng: 0 },
          visitors: eatery.visitors || 0,
          type: eatery.type || "Restaurant",
        }));

        // Transform menus - fetch from separate endpoint if available
        const transformedMenus = {};

        // Try to fetch menus for each eatery
        await Promise.all(
          transformedCafes.map(async (cafe) => {
            try {
              const menuResponse = await fetch(
                `${API_BASE_URL}/eateries/${cafe.id}/menu`
              );
              if (menuResponse.ok) {
                const menuData = await menuResponse.json();
                transformedMenus[cafe.id] = menuData;
              } else {
                // If no menu endpoint, check if menu is in the main data
                const originalEatery = data.find(
                  (e) => (e._id || e.id) === cafe.id
                );
                transformedMenus[cafe.id] = originalEatery?.menu || [];
              }
            } catch (err) {
              console.warn(`No menu found for ${cafe.name}`);
              transformedMenus[cafe.id] = [];
            }
          })
        );

        console.log("Transformed cafes:", transformedCafes);
        console.log("Transformed menus:", transformedMenus);

        setCafes(transformedCafes);
        setMenus(transformedMenus);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          `Failed to load cafes data: ${err.message}. Make sure your server is running on ${API_BASE_URL}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Simple routing based on state
  const renderPage = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cafes data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-red-50 p-6 rounded-lg">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    switch (activePage) {
      case "/map":
        return <MapPage cafes={cafes} menus={menus} />;
      case "/dashboard":
        return <DashboardPage cafes={cafes} menus={menus} />;
      case "/chatbot":
        return (
          <div className="p-4 md:p-8 bg-gray-50 min-h-screen" dir="ltr">
            <PriceoChatbot cafes={cafes} menus={menus} />
          </div>
        );
      case "/":
      default:
        return <HomePage />;
    }
  };

  // Sync state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash.startsWith("/")) {
        setActivePage(hash);
      } else {
        setActivePage("/");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (window.location.hash !== `#${activePage}`) {
      window.location.hash = activePage;
    }
  }, [activePage]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-left" dir="ltr">
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
            background-color: #94a3b8;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
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
