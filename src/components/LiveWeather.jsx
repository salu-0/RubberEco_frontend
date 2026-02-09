import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  CloudDrizzle, 
  CloudSnow, 
  Wind,
  Droplets,
  Eye,
  Gauge,
  Loader,
  AlertCircle,
  Calendar,
  MapPin,
  RefreshCw
} from 'lucide-react';

// Weather icon mapping
const weatherIcons = {
  'Sunny': Sun,
  'Clear': Sun,
  'Partly Cloudy': Cloud,
  'Cloudy': Cloud,
  'Clouds': Cloud,
  'Rainy': CloudRain,
  'Rain': CloudRain,
  'Light Rain': CloudDrizzle,
  'Drizzle': CloudDrizzle,
  'Thunderstorm': CloudRain,
  'Snow': CloudSnow,
  'Misty': Cloud,
  'Foggy': Cloud,
  'Hazy': Cloud
};

// Kerala districts
const KERALA_DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
  'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
  'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
];

const LiveWeather = ({ defaultDistrict = 'Kottayam' }) => {
  const { t } = useTranslation();
  const [selectedDistrict, setSelectedDistrict] = useState(defaultDistrict);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [useExactLocation, setUseExactLocation] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const fetchWeatherData = async (district, coordinates = null) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Build query parameters
      let currentQuery, forecastQuery;
      
      if (coordinates) {
        // Use exact GPS coordinates
        currentQuery = `lat=${coordinates.lat}&lon=${coordinates.lon}`;
        forecastQuery = `lat=${coordinates.lat}&lon=${coordinates.lon}&days=5`;
      } else {
        // Use district name
        currentQuery = `district=${district}`;
        forecastQuery = `district=${district}&days=5`;
      }

      // Fetch current weather and 5-day forecast in parallel
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/weather/current?${currentQuery}`, { headers }),
        fetch(`${API_BASE_URL}/api/weather/forecast?${forecastQuery}`, { headers })
      ]);

      if (!currentRes.ok || !forecastRes.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const currentData = await currentRes.json();
      const forecastData = await forecastRes.json();

      setCurrentWeather(currentData);
      setForecast(forecastData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError(err.message || 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  // Get user's current location
  const getUserLocation = () => {
    setGettingLocation(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please select a district manually.');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        setUserCoordinates(coords);
        setUseExactLocation(true);
        setGettingLocation(false);
        fetchWeatherData(null, coords);
      },
      (error) => {
        console.error('Error getting location:', error);
        setGettingLocation(false);
        
        // Provide specific error messages based on error code
        let errorMessage = '';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '📍 Location access denied. Please allow location access in your browser settings, or select a district manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '📍 Location information unavailable. Please check your device settings or select a district manually.';
            break;
          case error.TIMEOUT:
            errorMessage = '📍 Location request timed out. Please try again or select a district manually.';
            break;
          default:
            errorMessage = '📍 Unable to get your location. Please select a district manually.';
        }
        setError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 300000 // 5 minutes cache
      }
    );
  };

  useEffect(() => {
    if (useExactLocation && userCoordinates) {
      fetchWeatherData(null, userCoordinates);
    } else {
      fetchWeatherData(selectedDistrict);
    }
  }, [selectedDistrict, useExactLocation, userCoordinates]);

  const handleRefresh = () => {
    if (useExactLocation && userCoordinates) {
      fetchWeatherData(null, userCoordinates);
    } else {
      fetchWeatherData(selectedDistrict);
    }
  };

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setUseExactLocation(false);
    setUserCoordinates(null);
  };

  const getWeatherIcon = (weatherDescription) => {
    const IconComponent = weatherIcons[weatherDescription] || Cloud;
    return IconComponent;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <Loader className="w-8 h-8 animate-spin mx-auto text-primary-600" />
        <p className="mt-4 text-gray-600">Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Show district selector even when there's an error */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select District
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setError(null);
              setUseExactLocation(false);
              fetchWeatherData(e.target.value);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {KERALA_DISTRICTS.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>

        {/* Error message */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Weather Data Unavailable</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentWeather) return null;

  const WeatherIcon = getWeatherIcon(currentWeather.current.weather);

  return (
    <div className="space-y-6">
      {/* Location Selector */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Location
        </label>
        
        {/* Use My Location Button */}
        <button
          onClick={getUserLocation}
          disabled={gettingLocation}
          className="w-full mb-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MapPin className="w-5 h-5" />
          {gettingLocation ? 'Getting Your Location...' : useExactLocation ? '📍 Using Your Location' : '📍 Use My Current Location'}
        </button>

        {/* District Dropdown */}
        <div className="relative">
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={useExactLocation}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {KERALA_DISTRICTS.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          {useExactLocation && (
            <p className="text-xs text-blue-600 mt-1">
              Using your exact location. Click "Use My Current Location" again to update, or select a district to switch.
            </p>
          )}
        </div>
      </div>

      {/* Current Weather Card */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <div>
              <h2 className="text-2xl font-bold">
                {useExactLocation ? 'Your Location' : (currentWeather.district || currentWeather.location?.name || 'Weather')}
              </h2>
              {useExactLocation && currentWeather.coordinates ? (
                <p className="text-sm opacity-75">
                  📍 {currentWeather.coordinates.lat.toFixed(4)}°N, {currentWeather.coordinates.lon.toFixed(4)}°E
                  {currentWeather.location?.name && ` • Near ${currentWeather.location.name}`}
                </p>
              ) : currentWeather.district && (
                <p className="text-sm opacity-75">{currentWeather.district} District</p>
              )}
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Refresh weather data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <WeatherIcon className="w-20 h-20" />
              <div>
                <p className="text-6xl font-bold">{currentWeather.current.temperature}°C</p>
                <p className="text-xl mt-2 opacity-90">{currentWeather.current.weather}</p>
                <p className="text-sm opacity-75">
                  Feels like {currentWeather.current.feelsLike}°C
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center gap-3">
            <Droplets className="w-6 h-6 opacity-80" />
            <div>
              <p className="text-sm opacity-75">Humidity</p>
              <p className="text-lg font-semibold">{currentWeather.current.humidity}%</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Wind className="w-6 h-6 opacity-80" />
            <div>
              <p className="text-sm opacity-75">Wind</p>
              <p className="text-lg font-semibold">{currentWeather.current.windSpeed} m/s</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 opacity-80" />
            <div>
              <p className="text-sm opacity-75">Visibility</p>
              <p className="text-lg font-semibold">{currentWeather.current.visibility} km</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Gauge className="w-6 h-6 opacity-80" />
            <div>
              <p className="text-sm opacity-75">Pressure</p>
              <p className="text-lg font-semibold">{currentWeather.current.pressure} hPa</p>
            </div>
          </div>
        </div>

        {lastUpdated && (
          <p className="text-xs opacity-60 mt-4 text-center">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* 5-Day Forecast */}
      {forecast && forecast.forecast && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            5-Day Forecast
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {forecast.forecast.map((day, index) => {
              const DayWeatherIcon = getWeatherIcon(day.weather);
              const isToday = index === 0;

              return (
                <div
                  key={day.date}
                  className={`p-4 rounded-lg border-2 ${
                    isToday 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <p className="font-semibold text-gray-900 text-center">
                    {isToday ? 'Today' : day.dayOfWeek.substring(0, 3)}
                  </p>
                  <p className="text-xs text-gray-600 text-center mb-3">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>

                  <div className="flex justify-center mb-3">
                    <DayWeatherIcon className="w-12 h-12 text-blue-600" />
                  </div>

                  <p className="text-sm text-gray-700 text-center mb-2">
                    {day.weather}
                  </p>

                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {day.temperature.max}°
                    </p>
                    <p className="text-sm text-gray-600">
                      {day.temperature.min}°
                    </p>
                  </div>

                  {day.rainProbability > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <div className="flex items-center justify-center gap-1 text-blue-600">
                        <CloudRain className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {day.rainProbability}%
                        </span>
                      </div>
                      {day.rainfall > 0 && (
                        <p className="text-xs text-gray-600 text-center mt-1">
                          {day.rainfall}mm
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weather Tips for Rubber Farmers */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-md p-6 border border-green-200">
        <h3 className="text-lg font-bold text-green-900 mb-3">
          🌱 Tapping Recommendations
        </h3>
        
        {currentWeather.current.weather === 'Rainy' || 
         currentWeather.current.weather === 'Light Rain' || 
         currentWeather.current.weather === 'Thunderstorm' ? (
          <div className="bg-yellow-100 border-l-4 border-yellow-600 p-4 rounded">
            <p className="text-yellow-900 font-medium">⚠️ Not Ideal for Tapping</p>
            <p className="text-yellow-800 text-sm mt-2">
              Rainy conditions can dilute latex and make collection difficult. 
              Consider postponing tapping activities if possible.
            </p>
          </div>
        ) : currentWeather.current.weather === 'Sunny' || 
               currentWeather.current.weather === 'Clear' ? (
          <div className="bg-green-100 border-l-4 border-green-600 p-4 rounded">
            <p className="text-green-900 font-medium">✅ Excellent for Tapping</p>
            <p className="text-green-800 text-sm mt-2">
              Clear weather is ideal for rubber tapping. Latex flow will be optimal 
              and collection will be easier.
            </p>
          </div>
        ) : (
          <div className="bg-blue-100 border-l-4 border-blue-600 p-4 rounded">
            <p className="text-blue-900 font-medium">☁️ Good for Tapping</p>
            <p className="text-blue-800 text-sm mt-2">
              Cloudy conditions are acceptable for tapping. Monitor for rain and 
              complete collection promptly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveWeather;

