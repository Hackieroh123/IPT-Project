import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Weather.css';

// Importing icons for different weather conditions
import search_icon from '../assets/search.png';
import clear_icon from '../assets/clear.png';
import cloud_icon from '../assets/cloud.png';
import drizzle_icon from '../assets/drizzle.png';
import rain_icon from '../assets/rain.png';
import snow_icon from '../assets/snow.png';
import wind_icon from '../assets/wind.png';
import humidity_icon from '../assets/humidity.png';

// Main Weather component
const Weather = () => {
    const inputRef = useRef(); // Reference for the search input field
    const [weatherData, setWeatherData] = useState(null); // State to store weather information

    // Mapping weather condition codes to corresponding icons
    const weatherIcons = {
        "01d": clear_icon, "01n": clear_icon, // Clear sky
        "02d": cloud_icon, "02n": cloud_icon, // Few clouds
        "03d": cloud_icon, "03n": cloud_icon, // Scattered clouds
        "04d": drizzle_icon, "04n": drizzle_icon, // Broken clouds
        "09d": rain_icon, "09n": rain_icon, // Shower rain
        "10d": rain_icon, "10n": rain_icon, // Rain
        "13d": snow_icon, "13n": snow_icon, // Snow
    };

    /**
     * Fetches weather data from OpenWeatherMap API based on city name.
     * @param {string} city - The name of the city to fetch weather data for.
     */
    const searchWeather = async (city) => {
        if (!city) {
            alert("Please enter a city name!");
            return;
        }
        try {
            // Construct the API URL with the entered city name
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                alert(data.message); // Show error if city is not found
                return;
            }

            // Update state with fetched weather data
            setWeatherData({
                humidity: data.main.humidity, // Humidity percentage
                windSpeed: data.wind.speed, // Wind speed in Km/h
                temperature: Math.floor(data.main.temp), // Current temperature
                location: data.name, // City name
                lat: data.coord.lat, // Latitude for the map
                lon: data.coord.lon, // Longitude for the map
                icon: weatherIcons[data.weather[0].icon] || clear_icon // Weather icon
            });
        } catch (error) {
            console.error("Error fetching weather data:", error);
        }
    };

    /**
     * Component to update the map location based on new coordinates.
     * @param {number} lat - Latitude of the searched city.
     * @param {number} lon - Longitude of the searched city.
     */
    const MapUpdater = ({ lat, lon }) => {
        const map = useMap(); // Get map instance

        useEffect(() => {
            if (lat && lon) {
                map.setView([lat, lon], 10); // Move map to new location
            }
        }, [lat, lon, map]); // Re-run effect when lat/lon changes

        return null; // This component does not render anything
    };

    return (
        <div className="weather-container">
            <div className="weather-card">
                <h1 className="title">Weathering Map API☀</h1>

                {/* Search bar input */}
                <div className="search-bar">
                    <input ref={inputRef} type="text" placeholder="Enter city name..." />
                    <img src={search_icon} alt="search" onClick={() => searchWeather(inputRef.current.value)} />
                </div>

                {/* Display weather details only if data is available */}
                {weatherData && (
                    <>
                        <img src={weatherData.icon} alt="weather icon" className="weather-icon" />
                        <p className="temperature">{weatherData.temperature}°C</p>
                        <p className="location">{weatherData.location}</p>

                        {/* Display humidity and wind speed */}
                        <div className="weather-data">
                            <div className="col">
                                <img src={humidity_icon} alt="humidity icon" />
                                <div>
                                    <p>{weatherData.humidity} %</p>
                                    <span>Humidity</span>
                                </div>
                            </div>
                            <div className="col">
                                <img src={wind_icon} alt="wind icon" />
                                <div>
                                    <p>{weatherData.windSpeed} Km/h</p>
                                    <span>Wind Speed</span>
                                </div>
                            </div>
                        </div>

                        {/* Leaflet Map Container */}
                        <MapContainer center={[weatherData.lat, weatherData.lon]} zoom={10} className="map">
                            <MapUpdater lat={weatherData.lat} lon={weatherData.lon} />
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={[weatherData.lat, weatherData.lon]}>
                                <Popup>{weatherData.location}</Popup>
                            </Marker>
                        </MapContainer>
                    </>
                )}
            </div>
        </div>
    );
};

export default Weather;
