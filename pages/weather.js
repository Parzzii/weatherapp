// app/weather.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion"; // Importing motion for animations
import { WiDaySunny, WiRain, WiSnow } from "react-icons/wi";
import ReactAnimatedWeather from "react-animated-weather";
import Particles from "react-tsparticles";
import { loadSnowPreset } from "tsparticles-preset-snow";

// Mapping OpenWeatherMap weather conditions to animated icons
const weatherToIcon = {
  Clear: "CLEAR_DAY",
  Clouds: "CLOUDY",
  Rain: "RAIN",
  Snow: "SNOW",
  Drizzle: "SLEET",
  Thunderstorm: "WIND",
  Mist: "FOG",
  Smoke: "FOG",
  Haze: "FOG",
  Dust: "FOG",
  Fog: "FOG",
  Sand: "FOG",
  Ash: "FOG",
  Squall: "WIND",
  Tornado: "WIND",
};

export default function Weather() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // State for dark mode
  const [suggestions, setSuggestions] = useState([]);
  const [activeCity, setActiveCity] = useState(null);
  const [pinnedCities, setPinnedCities] = useState([]); // State for pinned cities

  const togglePinCity = (data) => {
    const isPinned = pinnedCities.some((c) => c.name === data.name);
    if (isPinned) {
      setPinnedCities(pinnedCities.filter((c) => c.name !== data.name));
    } else {
      setPinnedCities([...pinnedCities, data]);
      setActiveCity(null);
    }
  };

  // Initialize particles for snow effect
  const particlesInit = useCallback(async (engine) => {
    await loadSnowPreset(engine);
  }, []);

  // Function to fetch weather data for the current city
  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setWeatherData(null); // Reset weather data before fetching new data
    try {
      const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=810a339ed1584e6e90f162232251707&q=${city}`);
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      setActiveCity(data); // Store the fetched weather data
    } catch (error) {
      alert(error.message); // Alert the user if there's an error
      setActiveCity(null); // Reset weather data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleCityChange = async (e) => {
    const input = e.target.value;
    setCity(input);
    if (input.length > 2) {
      const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=320dc1d0e813a3168294b81ced24f086`);
      const data = await res.json();
      setSuggestions(data);
    } else {
      setSuggestions([]);
    }
  };

  // Convert UNIX time to local time
  const formatTime = (unix) => {
    return new Date(unix * 1000).toLocaleTimeString();
  };

  // WeatherCard component to display individual weather cards
  function WeatherCard({ data, pinned, togglePinCity }) {
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 100 }} className="bg-white/10 backdrop-blur-md shadow-2xl rounded-2xl border border-white/30-lg p-6 text-center w-[300px] dark:bg-white/10 text-black dark:text-white">
        <ReactAnimatedWeather icon={weatherToIcon[data.current.condition.code] || "PARTLY_CLOUDY_DAY"} color="goldenrod" size={64} animate={true} />
        <button onClick={() => togglePinCity(data)} className="text-sm mb-2">
          {pinned ? "Unpin 📍" : "Pin 📌"}
        </button>
        <h2 className="text-4xl font-bold mb-4">
          {data.location.name}, {data.location.region}
        </h2>
        <p className="text-2xl mb-2">
          {Math.round(data.current.temp_c)}°C | {Math.round(data.current.temp_f)}°F
        </p>
        <p className="text-xl mb-4">{data.current.condition.text}</p>
        <p className="text-lg">Humidity: {data.current.humidity}%</p>
        <p className="text-lg">Wind Speed: {data.current.wind_kph}</p>
        <p className="text-lg">Cloudiness: {data.current.cloud}%</p>
        <p className="text-lg">Visibility: {data.current.vis_km} km</p>
        <p className="text-lg">Pressure: {data.current.pressure_mb} hPa</p>
        <p className="text-lg">Sunrise: {new Date(data.current.sunrise * 1000).toLocaleTimeString()}</p>
        <p className="text-lg">Sunset: {new Date(data.current.sunset * 1000).toLocaleTimeString()}</p>
        <p className="text-lg">Feels like: {Math.round(data.current.feelslike_c)}°C</p>
      </motion.div>
    );
  }
  // Load pinned cities from localStorage on initial load
  useEffect(() => {
    const storedCities = localStorage.getItem("pinnedCities");
    if (storedCities) {
      setPinnedCities(JSON.parse(storedCities));
    }
  }, []);

  // Save pinned cities to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("pinnedCities", JSON.stringify(pinnedCities));
  }, [pinnedCities]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-blue-200 dark:from-gray-900 dark:to-black text-black dark:text-white">
      {weatherData?.weather[0].main === "Snow" && (
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            preset: "snow",
            fullScreen: { enable: true, zIndex: -1 },
          }}
        />
      )}
      {/* Navbar */}
      <nav className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 bg-white/60 dark:bg-white/10">
        {/* Logo */}
        <div className="flex justify-center md:justify-start w-full md:w-auto">
          <h1 className="text-2xl font-bold">🌦️ Weather App</h1>
        </div>

        {/* Search Bar + Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center w-full md:w-auto gap-2">
          <div className="relative w-full sm:w-[300px] md:w-[400px]">
            <input
              type="text"
              placeholder="Enter city..."
              className="pl-12 pr-4 py-3 w-full bg-white/10 dark:bg-white/10 backdrop-blur-lg
         text-black placeholder-black/70 dark:text-white dark:placeholder-white/70
         rounded-2xl border border-white/30
         shadow-[inset_1px_1px_4px_rgba(255,255,255,0.1),_1px_1px_10px_rgba(0,0,0,0.2)]
         focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
              value={city}
              onChange={handleCityChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  fetchWeather();
                }
              }}
            />

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <ul className="absolute z-50 bg-white dark:bg-gray-800 w-full mt-1 rounded-md shadow-lg">
                {suggestions.map((s, idx) => (
                  <li
                    key={idx}
                    onClick={() => {
                      setCity(s.name);
                      setSuggestions([]);
                      fetchWeather();
                    }}
                    className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer text-black dark:text-white"
                  >
                    {s.name}, {s.state && `${s.state}, `}
                    {s.country}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button onClick={fetchWeather} className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
            Search
          </button>
        </div>

        {/* Dark mode toggle */}
        <div className="w-full md:w-auto flex justify-center md:justify-end">
          <button onClick={() => setDarkMode(!darkMode)} className={`w-16 h-8 flex items-center px-1 rounded-full transition-transform duration-300 ${darkMode ? "bg-gray-700" : "bg-yellow-400"}`}>
            <div className={`w-6 h-6 bg-white rounded-full transform transition-transform duration-300 ${darkMode ? "translate-x-8" : "translate-x-0"} flex items-center justify-center text-sm`}>{darkMode ? "🌙" : "☀️"}</div>
          </button>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="flex justify-center mt-20">
        {loading ? (
          <p className="text-2xl">Loading...</p>
        ) : pinnedCities.length === 0 && !activeCity ? (
          <h2 className="text-3xl">Search for a city to see the weather ☁️</h2>
        ) : (
          <div className="flex gap-6 flex-wrap justify-center">
            {/* Pinned cities */}
            {pinnedCities.map((data, idx) => (
              <WeatherCard key={`pinned-${idx}`} data={data} pinned togglePinCity={togglePinCity} />
            ))}

            {/* Active (un-pinned) city */}
            {activeCity && <WeatherCard data={activeCity} pinned={false} togglePinCity={togglePinCity} />}
          </div>
        )}
      </section>
    </main>
  );
}
