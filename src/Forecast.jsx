/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useRef, useState } from 'react';
import Axios from 'axios';
import { IoSearchCircleSharp, IoChevronForward } from "react-icons/io5";
import weatherIcon from './Assets/weather-Icon2.png';
import { IoMdSunny, IoMdCloudy, IoMdRainy, IoMdSnow, IoMdThunderstorm, IoMdPartlySunny, IoMdWarning } from "react-icons/io";
import { BsCloudHaze2Fill, BsCloudDrizzleFill, BsCloudFogFill, BsFillCloudLightningRainFill } from "react-icons/bs";
import { IoCalendarSharp, IoTimeSharp } from "react-icons/io5";
import { MdLocationOn } from "react-icons/md";
import humidity from './Assets/humidity-icon.webp';
import wind from './Assets/wind-icon.webp';
import pressure from './Assets/pressure.png';
import sunrise from './Assets/sunrise.png';
import sunset from './Assets/sunset.png';
import AQI from './Assets/AQI.png';
import visibility from './Assets/Visibility.png';


const KEY1 = `3dfffadc777aa4b73d574502ed5b0886`;
const KEY2 = `7c689c6296574eccb3c143404243110`;

const defaultVideo = "https://videos.pexels.com/video-files/855679/855679-hd_1920_1080_30fps.mp4"

const weatherVideoMap = {
  Clear: "https://videos.pexels.com/video-files/1526909/1526909-hd_1920_1080_30fps.mp4", // Clear sunny sky with bright sunlight
  Clouds: "https://videos.pexels.com/video-files/1738997/1738997-hd_1920_1080_30fps.mp4", // Cloudy sky with moving clouds
  Rain: "https://videos.pexels.com/video-files/2041466/2041466-hd_1920_1080_30fps.mp4", // Rainfall with water droplets
  Snow: "https://videos.pexels.com/video-files/855610/855610-hd_1920_1080_30fps.mp4", // Snowfall in a winter scene
  Thunderstorm: "https://videos.pexels.com/video-files/1763149/1763149-hd_1920_1080_30fps.mp4", // Thunderstorm with lightning
  Drizzle: "https://videos.pexels.com/video-files/2041466/2041466-hd_1920_1080_30fps.mp4", // Light rain (same as Rain for consistency)
  lightintensitydrizzle: "https://videos.pexels.com/video-files/2041466/2041466-hd_1920_1080_30fps.mp4", // Light rain (same as Rain/Drizzle)
  Haze: "https://videos.pexels.com/video-files/3044257/3044257-hd_1920_1080_30fps.mp4", // Foggy/hazy landscape
  Fog: "https://videos.pexels.com/video-files/3044257/3044257-hd_1920_1080_30fps.mp4", // Foggy scene (same as Haze)
  Mist: "https://videos.pexels.com/video-files/3044257/3044257-hd_1920_1080_30fps.mp4", // Mist (same as Fog/Haze)
  Smoke: "https://videos.pexels.com/video-files/3044257/3044257-hd_1920_1080_30fps.mp4", // Smoke (using foggy video as proxy)
  Dust: "https://videos.pexels.com/video-files/3044257/3044257-hd_1920_1080_30fps.mp4", // Dust (using foggy video as proxy)
  Sand: "https://videos.pexels.com/video-files/3044257/3044257-hd_1920_1080_30fps.mp4", // Sand (using foggy video as proxy)
  Ash: "https://videos.pexels.com/video-files/3044257/3044257-hd_1920_1080_30fps.mp4", // Ash (using foggy video as proxy)
  Squall: "https://videos.pexels.com/video-files/1763149/1763149-hd_1920_1080_30fps.mp4", // Squall (using thunderstorm video)
  Tornado: "https://videos.pexels.com/video-files/1763149/1763149-hd_1920_1080_30fps.mp4", // Tornado (using thunderstorm video as proxy)
  Default: "https://videos.pexels.com/video-files/855679/855679-hd_1920_1080_30fps.mp4", // Default (unchanged from original)
};

function Forecast() {
  const [city, setCity] = useState('');
  const [openWeatherData, setOpenWeatherData] = useState(null);
  const [weatherAPIData, setWeatherAPIData] = useState(null);
  const [sunriseSunsetData, setSunriseSunsetData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [displayedDayIndex, setDisplayedDayIndex] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [displayedHourIndex, setDisplayedHourIndex] = useState(0);
  const [selectedDayData, setSelectedDayData] = useState(null);

  const [bgVideo, setBgVideo] = useState(defaultVideo);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRef = useRef();
  const HOURS_PER_VIEW = 5;

  const filterUpcomingHours = (hours, localTime) => {
    if (!hours || !localTime) return [];

    const currentTime = new Date(localTime);
    const currentHour = currentTime.getHours();

    return hours.filter(hour => {
      const hourTime = new Date(hour.time);
      return hourTime >= currentTime ||
             (hourTime.getDate() === currentTime.getDate() &&
              hourTime.getHours() >= currentHour);
    });
  };

  const SearchData = async (cityName) => {
    if (!cityName) return;

    try {
      const response1 = await Axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${KEY1}&units=Metric`);
      setOpenWeatherData(response1.data);

      const response2 = await Axios.get(`https://api.weatherapi.com/v1/current.json?key=${KEY2}&q=${cityName}&aqi=yes&includeAstronomy=true`);
      setWeatherAPIData(response2.data);
      setSelectedDayData(response2.data);

      const lat = response1.data.coord.lat;
      const lon = response1.data.coord.lon;
      const response3 = await Axios.get(`https://api.sunrisesunset.io/json?lat=${lat}&lng=${lon}`);
      setSunriseSunsetData(response3.data.results);

      const response4 = await Axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${KEY2}&q=${cityName}&days=7`);
      const forecastDays = response4.data?.forecast?.forecastday ?? [];

      const paddedForecastDays = forecastDays.length >= 5
        ? forecastDays.slice(0, 5)
        : [...forecastDays, ...Array(5 - forecastDays.length).fill({
            date: "N/A",
            day: { avgtemp_c: "N/A", condition: { text: "Data unavailable" } },
            hour: []
          })];

      setForecastData(paddedForecastDays);
      const filteredHours = filterUpcomingHours(paddedForecastDays[0]?.hour, response2.data?.location?.localtime);
      setHourlyData(filteredHours);
      setDisplayedDayIndex(0);
      setSelectedDayIndex(0);
      setDisplayedHourIndex(0);

      const weatherCondition = response1.data.weather[0].main;
      setBgVideo(weatherVideoMap[weatherCondition] || defaultVideo);
      setShowSuggestions(false);
    } catch (error) {
      console.log('API error:', error);
    }
  };

  useEffect(() => {
    SearchData("Vienna");
  }, []);

  const handleCity = (e) => {
    const value = e.target.value;
    setCity(value);
    fetchCitySuggestions(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      SearchData(city);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const fullCityName = suggestion.state
      ? `${suggestion.name}, ${suggestion.state}, ${suggestion.country}`
      : `${suggestion.name}, ${suggestion.country}`;
    setCity(fullCityName);
    SearchData(suggestion.name);
    setShowSuggestions(false);
  };

  const fetchCitySuggestions = async (query) => {
    if (!query || query.length < 2) {
      setCitySuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await Axios.get(
        `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${KEY1}`
      );

      const suggestions = response.data.map(city => ({
        name: city.name,
        country: city.country,
        state: city.state,
        lat: city.lat,
        lon: city.lon
      }));

      setCitySuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.log('City suggestion error:', error);
      setCitySuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleDayChange = async (index) => {
    setSelectedDayIndex(index);
    const filteredHours = index === 0
      ? filterUpcomingHours(forecastData[index]?.hour, weatherAPIData?.location?.localtime)
      : forecastData[index]?.hour ?? [];
    setHourlyData(filteredHours);
    setDisplayedHourIndex(0);

    if (index === 0) {
      setSelectedDayData(weatherAPIData);
    } else {
      setSelectedDayData({
        current: {
          temp_c: forecastData[index].day.avgtemp_c,
          humidity: forecastData[index].day.avghumidity,
          wind_kph: forecastData[index].day.maxwind_kph,
          pressure_mb: forecastData[index].day.avgvis_mb || weatherAPIData?.current?.pressure_mb,
          vis_km: forecastData[index].day.avgvis_km,
          air_quality: index === 0 ? weatherAPIData?.current?.air_quality : null,
        }
      });

      const date = new Date(forecastData[index].date);
      try {
        const sunriseSunsetResponse = await Axios.get(`https://api.sunrisesunset.io/json?lat=${openWeatherData.coord.lat}&lng=${openWeatherData.coord.lon}&date=${date.toISOString().split('T')[0]}`);
        setSunriseSunsetData(sunriseSunsetResponse.data.results);
      } catch (error) {
        console.log('Sunrise/Sunset API error:', error);
      }
    }
  };

  const handlePreviousDay = () => {
    const prevIndex = (displayedDayIndex - 1 + 5) % 5;
    setDisplayedDayIndex(prevIndex);
    setSelectedDayIndex(prevIndex);
    handleDayChange(prevIndex);
  };

  const handleNextDay = () => {
    const nextIndex = (displayedDayIndex + 1) % 5;
    setDisplayedDayIndex(nextIndex);
    setSelectedDayIndex(nextIndex);
    handleDayChange(nextIndex);
  };

  const handlePreviousHours = () => {
    const prevIndex = Math.max(0, displayedHourIndex - 1);
    setDisplayedHourIndex(prevIndex);
  };

  const handleNextHours = () => {
    const maxIndex = Math.max(0, hourlyData.length - 1);
    const nextIndex = Math.min(maxIndex, displayedHourIndex + 1);
    setDisplayedHourIndex(nextIndex);
  };

  let icon;
  if (openWeatherData?.weather && openWeatherData.weather[0]) {
    switch (openWeatherData.weather[0].main) {
      case "Clear":
        icon = <IoMdSunny className="text-5xl text-yellow-300 sm:text-6xl md:text-8xl lg:text-9xl" />;
        break;
      case "Clouds":
        icon = <IoMdCloudy className="text-5xl text-blue-200 sm:text-6xl md:text-8xl lg:text-9xl" />;
        break;
      case "Rain":
        icon = <IoMdRainy className="text-5xl text-blue-400 sm:text-6xl md:text-8xl lg:text-9xl" />;
        break;
      case "Snow":
        icon = <IoMdSnow className="text-5xl text-white sm:text-6xl md:text-8xl lg:text-9xl" />;
        break;
      case "Thunderstorm":
        icon = <IoMdThunderstorm className="text-5xl text-yellow-500 sm:text-6xl md:text-8xl lg:text-9xl" />;
        break;
      case "Drizzle":
        icon = <BsCloudDrizzleFill className="text-5xl text-blue-300 sm:text-6xl md:text-8xl lg:text-9xl" />;
        break;
      case "Haze":
        icon = <BsCloudHaze2Fill className="text-5xl text-gray-400 sm:text-6xl md:text-8xl lg:text-9xl" />;
        break;
      case "Fog":
        icon = <BsCloudFogFill className="text-5xl text-gray-300 sm:text-6xl md:text-8xl lg:text-9xl" />;
        break;
      case "Mist":
        icon = <BsCloudFogFill className="text-5xl text-gray-200 sm:text-6xl md:text-8xl lg:text-9xl" />;
        break;
      case "Smoke":
        icon = <BsCloudHaze2Fill className="text-5xl text-gray-500 sm:text-6xl md:text-8xl lg:text-9xl" />;
        break;
      case "Dust":
        icon = <BsCloudHaze2Fill className="text-5xl text-yellow-500 sm:text-6xl md:text-8xl lg:text-9xl" />;
        break;
      case "Sand":
        icon = <BsCloudHaze2Fill className="text-5xl text-yellow-600 sm:text-6xl md:text-8xl lg:text-9xl" />;
        break;
      case "Ash":
        icon = <BsCloudHaze2Fill className="text-5xl text-gray-600 sm:text-6xl md:text-8xl lg:text-9xl" />;
        break;
      case "Squall":
        icon = <BsFillCloudLightningRainFill className="text-5xl text-indigo-500 sm:text-6xl md:text-8xl lg:text-9xl" />;
        break;
      case "Tornado":
        icon = <IoMdWarning className="text-5xl text-red-500 sm:text-6xl md:text-8xl lg:text-9xl" />;
        break;
      default:
        icon = <IoMdPartlySunny className="text-5xl text-yellow-300 sm:text-6xl md:text-8xl lg:text-9xl" />;
        break;
    }
  }

  return (
    <div className="relative min-h-screen">
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 object-cover w-full h-full -z-10"
      >
        <source src={bgVideo} type="video/mp4" />
      </video>

      <div className="flex flex-col w-full min-h-screen md:flex-row">
        {/* Left Sidebar */}
        <div className="w-full p-4 md:w-1/3 lg:w-1/4 bg-black/20 md:p-6 lg:p-8">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <img src={weatherIcon} alt="logo" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-200">
              Weather Forecast
            </div>
          </div>

          <div className="relative flex w-full bg-[#f0f8ff] group mt-4">
            <input
              ref={inputRef}
              type="text"
              value={city}
              onChange={handleCity}
              placeholder="Search city"
              onKeyDown={handleKeyDown}
              onFocus={() => fetchCitySuggestions(city)}
              className="w-full p-2 text-sm text-gray-500 bg-transparent border-none outline-none sm:text-base md:text-lg"
            />
            <button
              className="grid w-8 text-xl text-gray-500 transition-colors duration-200 cursor-pointer place-items-center sm:w-10 sm:text-2xl md:w-12 md:text-4xl hover:text-blue-500"
              onClick={() => SearchData(city)}
            >
              <IoSearchCircleSharp />
            </button>
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-200 origin-left"></div>

            {showSuggestions && citySuggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 overflow-auto bg-white rounded-md shadow-lg max-h-60 top-8">
                {citySuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.name}
                    {suggestion.state && `, ${suggestion.state}`}
                    , {suggestion.country}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 md:mt-6 lg:mt-8">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
                <div>{icon}</div>
                <p className="text-3xl text-white sm:text-4xl md:text-6xl lg:text-8xl">
                  {weatherAPIData?.current?.temp_c ? `${weatherAPIData.current.temp_c.toFixed()}°C` : "Loading..."}
                </p>
              </div>
              <div className="mt-2 text-base text-center text-white sm:text-lg md:text-xl lg:text-2xl">
                {openWeatherData?.weather?.[0]?.description || "Loading..."}
              </div>
            </div>

            <div className="flex items-center justify-center mt-4 space-x-2 md:mt-6 lg:mt-8">
              <MdLocationOn className="w-6 h-6 text-white transition duration-300 ease-in-out sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 hover:-translate-y-1 hover:scale-110" />
              <p className="text-2xl text-white sm:text-3xl md:text-4xl lg:text-5xl">{openWeatherData?.name}</p>
            </div>

            <div className="mt-2 text-base text-center text-white sm:text-lg md:text-xl lg:text-2xl">
              {weatherAPIData?.location?.region ? `${weatherAPIData.location.region}, ${weatherAPIData.location.country}` : "Loading location..."}
            </div>

            <div className="flex items-center justify-center mt-3 space-x-2 md:mt-4 lg:mt-6">
              <IoCalendarSharp className="w-5 h-5 text-white sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
              <p className="text-base text-white sm:text-lg md:text-xl lg:text-2xl">
                {weatherAPIData?.location?.localtime
                  ? new Date(weatherAPIData.location.localtime).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })
                  : "Loading date..."}
              </p>
            </div>

            <div className="flex items-center justify-center mt-2 space-x-2 md:mt-3 lg:mt-4">
              <IoTimeSharp className="w-5 h-5 text-white sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
              <p className="text-base text-white sm:text-lg md:text-xl lg:text-2xl">
                {weatherAPIData?.location?.localtime
                  ? new Date(weatherAPIData.location.localtime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                  : "Loading time..."}
              </p>
            </div>

            <h3 className="mt-8 text-xl text-white sm:text-2xl md:text-3xl lg:text-4xl">5-Day Forecast</h3>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={handlePreviousDay}
                disabled={displayedDayIndex === 0}
                className={`p-2 text-white rounded-lg bg-black/30 ${
                  displayedDayIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'
                }`}
              >
                <IoChevronForward className="text-xl transform rotate-180" />
              </button>

              {forecastData[displayedDayIndex] && (
                <button
                  onClick={() => handleDayChange(displayedDayIndex)}
                  className="p-2 text-center rounded-lg bg-black/30 w-96 hover:bg-white/20"
                >
                  <p className="text-sm text-white sm:text-base md:text-lg lg:text-xl">
                    {forecastData[displayedDayIndex].date === "N/A"
                      ? "N/A"
                      : new Date(forecastData[displayedDayIndex].date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                  </p>
                  <p className="mt-1 text-base text-white sm:text-lg md:text-xl lg:text-2xl">
                    {forecastData[displayedDayIndex].day.avgtemp_c}°C
                  </p>
                  <p className="mt-1 text-xs text-white sm:text-sm md:text-base lg:text-lg">
                    {forecastData[displayedDayIndex].day.condition.text}
                  </p>
                </button>
              )}

              <button
                onClick={handleNextDay}
                disabled={displayedDayIndex === 4}
                className={`p-2 text-white rounded-lg bg-black/30 ${
                  displayedDayIndex === 4 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'
                }`}
              >
                <IoChevronForward className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-full p-4 md:w-2/3 lg:w-3/4 md:p-6 lg:p-8">
          <div className="flex flex-col mb-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-xl text-white sm:text-2xl md:text-3xl lg:text-4xl">
              {selectedDayIndex === 0 ? "Today's Highlights" : `Highlights for ${new Date(forecastData[selectedDayIndex]?.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}`}
            </h3>
            <div className="flex flex-row gap-2 mt-2 md:mt-0 md:flex-row sm:flex-row">
              {forecastData.slice(0).map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDayChange(index + 1)}
                  className={`px-3 py-1 text-sm text-white bg-green-700 rounded-lg ${
                    selectedDayIndex === index + 1 ? 'bg-white/20' : ''
                  } hover:bg-white/20`}
                >
                  {day.date === "N/A"
                    ? "N/A"
                    : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-4 md:grid md:grid-cols-2 md:gap-6 lg:gap-8 md:mt-6 lg:mt-8">
            <div className="p-4 bg-black/20">
              <p className="text-lg text-white sm:text-xl md:text-2xl lg:text-3xl">Air Quality Index</p>
              <div className="flex justify-center mt-2 md:mt-3">
                <img src={AQI} alt="Air Quality Index" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-white sm:grid-cols-4 sm:text-sm md:text-base lg:text-lg">
                {selectedDayData?.current?.air_quality ? (
                  <>
                    <div>
                      <p className="font-bold">CO</p>
                      <p>{selectedDayData.current.air_quality.co.toFixed(2)} µg/m³</p>
                    </div>
                    <div>
                      <p className="font-bold">NO₂</p>
                      <p>{selectedDayData.current.air_quality.no2.toFixed(2)} µg/m³</p>
                    </div>
                    <div>
                      <p className="font-bold">SO₂</p>
                      <p>{selectedDayData.current.air_quality.so2.toFixed(2)} µg/m³</p>
                    </div>
                    <div>
                      <p className="font-bold">O₃</p>
                      <p>{selectedDayData.current.air_quality.o3.toFixed(2)} µg/m³</p>
                    </div>
                  </>
                ) : (
                  <p>AQI data not available for this day</p>
                )}
              </div>
            </div>

            <div className="p-4 bg-black/20">
              <p className="text-lg text-white sm:text-xl md:text-2xl lg:text-3xl">Sunrise & Sunset</p>
              <div className="flex justify-around mt-3 text-xs text-white sm:text-sm md:mt-4 md:text-base lg:text-lg">
                <div className="text-center">
                  <img src={sunrise} alt="sunrise" className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20" />
                  <p>{sunriseSunsetData?.sunrise ? sunriseSunsetData.sunrise.replace(/:\d{2}\s/, ' ') : "Loading..."}</p>
                </div>
                <div className="text-center">
                  <img src={sunset} alt="sunset" className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20" />
                  <p>{sunriseSunsetData?.sunset ? `${sunriseSunsetData.sunset.replace(/:\d{2}\s/, ' ')}` : "Loading..."}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 lg:gap-8 md:mt-6 lg:mt-8">
            <div className="p-4 bg-black/20">
              <p className="text-lg text-center text-white sm:text-xl md:text-2xl lg:text-3xl">Humidity</p>
              <div className="flex justify-center mt-3 md:mt-4">
                <img src={humidity} alt="humidity" className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20" />
              </div>
              <p className="mt-2 text-base text-center text-white sm:text-lg md:text-xl lg:text-2xl">
                {selectedDayData?.current?.humidity ? `${selectedDayData.current.humidity}%` : "Loading..."}
              </p>
            </div>

            <div className="p-4 bg-black/20">
              <p className="text-lg text-center text-white sm:text-xl md:text-2xl lg:text-3xl">Wind</p>
              <div className="flex justify-center mt-3 md:mt-4">
                <img src={wind} alt="windspeed" className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20" />
              </div>
              <p className="mt-2 text-base text-center text-white sm:text-lg md:text-xl lg:text-2xl">
                {selectedDayData?.current?.wind_kph ? `${selectedDayData.current.wind_kph} km/h` : "Loading..."}
              </p>
            </div>

            <div className="p-4 bg-black/20">
              <p className="text-lg text-center text-white sm:text-xl md:text-2xl lg:text-3xl">Pressure</p>
              <div className="flex justify-center mt-3 md:mt-4">
                <img src={pressure} alt="pressure" className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20" />
              </div>
              <p className="mt-2 text-base text-center text-white sm:text-lg md:text-xl lg:text-2xl">
                {selectedDayData?.current?.pressure_mb ? `${selectedDayData.current.pressure_mb} hPa` : "Loading..."}
              </p>
            </div>

            <div className="p-4 bg-black/20">
              <p className="text-lg text-center text-white sm:text-xl md:text-2xl lg:text-3xl">Visibility</p>
              <div className="flex justify-center mt-3 md:mt-4">
                <img src={visibility} alt="visibility" className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20" />
              </div>
              <p className="mt-2 text-base text-center text-white sm:text-lg md:text-xl lg:text-2xl">
                {selectedDayData?.current?.vis_km ? `${selectedDayData.current.vis_km} km` : "Loading..."}
              </p>
            </div>
          </div>
    {/* Hourly Forecast Section */}
    <h3 className="mt-8 text-xl text-white sm:text-2xl md:text-3xl lg:text-4xl">
            Hourly Forecast ({forecastData[selectedDayIndex]?.date === "N/A"
              ? "N/A"
              : new Date(forecastData[selectedDayIndex]?.date || Date.now()).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })})
          </h3>
          <div className="flex items-center justify-between w-full pb-4 mt-4">
            <button
              onClick={handlePreviousHours}
              disabled={displayedHourIndex === 0}
              className={`p-2 text-white rounded-lg bg-black/30 ${
                displayedHourIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'
              }`}
            >
              <IoChevronForward className="text-xl transform rotate-180" />
            </button>

            <div className="flex justify-between w-full gap-4 overflow-x-auto">
              {hourlyData.length > 0 ? (
                hourlyData
                  .slice(displayedHourIndex, displayedHourIndex + HOURS_PER_VIEW)
                  .map((hour, index) => (
                    <div key={index} className="p-4 text-center bg-black/20 flex-1 min-w-[120px]  ">
                      
                      <p className="text-sm text-white sm:text-base md:text-lg lg:text-xl">
                        {new Date(hour.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="mt-2 text-lg text-white sm:text-xl md:text-2xl lg:text-3xl">
                        {hour.temp_c}°C
                      </p>
                      <p className="mt-1 text-xs text-white sm:text-sm md:text-base lg:text-lg">
                        {hour.condition.text}
                      </p>
                    </div>
                  ))
              ) : (
                <p className="flex-1 text-center text-white">No hourly data available</p>
              )}
            </div>

            <button
              onClick={handleNextHours}
              disabled={displayedHourIndex + HOURS_PER_VIEW >= hourlyData.length}
              className={`p-2 text-white rounded-lg bg-black/30 ${
                displayedHourIndex + HOURS_PER_VIEW >= hourlyData.length ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'
              }`}
            >
              <IoChevronForward className="text-xl" />
            </button>
          </div>


          
        </div>
      </div>
    </div>
  );
}

export default Forecast;