// app/weather.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion"; // Importing motion for animations

export default function Weather() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState("metric"); // Default to metric units
  const [darkMode, setDarkMode] = useState(false); // State for dark mode
  const [suggestions, setSuggestions] = useState([]);

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setWeatherData(null); // Reset weather data before fetching new data
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=320dc1d0e813a3168294b81ced24f086&units=${units}`);
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      setWeatherData(data); // Store the fetched weather data
    } catch (error) {
      alert(error.message); // Alert the user if there's an error
      setWeatherData(null); // Reset weather data on error
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (city) {
      fetchWeather();
    }
  }, [units]);

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-blue-200 dark:from-gray-900 dark:to-black text-black dark:text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white/60 dark:bg-white/10">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">🌦️ Weather App</h1>
        </div>

        <div className="flex-1 flex justify-center ">
          <div className="relative w-[400px] md:w-[500px]">
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
            />

            {suggestions.length > 0 && (
              <ul className="absolute z-50 bg-white dark:bg-gray-800 w-full mt-1 rounded-md shadow-lg">
                {suggestions.map((s, idx) => (
                  <li
                    key={idx}
                    onClick={() => {
                      setCity(s.name);
                      setSuggestions([]);
                      fetchWeather(); // Optional: auto-fetch on click
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

          <button onClick={fetchWeather} className="ml-2 px-8 rounded-full bg-blue-600 hover:bg-blue-700">
            Search
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className="ml-2 px-4 bg-gray-500 rounded-full text-white hover:bg-gray-600 transition duration-300">
            {darkMode ? "🌙" : "☀️"}
          </button>
        </div>

        {/* Units Toggle */}

        <div className="flex-1 flex justify-end items-center gap-2">
          <span className="text-sm">°C</span>
          <button onClick={() => setUnits(units === "metric" ? "imperial" : "metric")} className={`w-14 h-7 flex items-center bg-white rounded-full p-1 transition duration-300 ${units === "imperial" ? "justify-end bg-blue-600" : "justify-start bg-yellow-500"}`}>
            <div className="w-5 h-5 bg-blue-600 rounded-full transition duration-300"></div>
          </button>

          <span className="text-sm">°F</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center mt-20">
        {loading ? (
          <p className="text-2xl">Loading...</p>
        ) : !weatherData ? (
          <h2 className="text-3xl">Search for a city to see the weather ☁️</h2>
        ) : (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 100 }} className="bg-white/10 backdrop-blur-md shadow-2xl rounded-2xl border border-white/30-lg p-6 text-center w-[300px] mt-4 dark:bg-white/10 text-black dark:text-white  ">
            <h2 className="text-4xl font-bold mb-4">{weatherData.name}</h2>
            <p className="text-2xl mb-2">
              {Math.round(weatherData.main.temp)}°{units === "metric" ? "C" : "F"}
            </p>
            <p className="text-xl mb-4">{weatherData.weather[0].description}</p>
            <p className="text-lg">Humidity: {weatherData.main.humidity}%</p>
            <p className="text-lg">
              Wind Speed: {weatherData.wind.speed} {units === "metric" ? "m/s" : "mph"}
            </p>
            <p className="text-lg">Cloudiness: {weatherData.clouds.all}%</p>
            <p className="text-lg">Visibility: {weatherData.visibility / 1000} km</p>
            <p className="text-lg">Pressure: {weatherData.main.pressure} hPa</p>
            <p className="text-lg">Sunrise: {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}</p>
            <p className="text-lg">Sunset: {new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()}</p>
            <p className="text-lg">Feels like: {Math.round(weatherData.main.feels_like)}°C</p>
          </motion.div>
        )}
      </section>
    </main>
  );
}
