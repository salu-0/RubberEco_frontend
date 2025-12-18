import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { weatherAPI } from '../utils/api';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import KeralaMap from '../components/KeralaMap';
import {
  CloudRain,
  MapPin,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

const KERALA_DISTRICTS = [
  'Thiruvananthapuram',
  'Kollam',
  'Pathanamthitta',
  'Alappuzha',
  'Kottayam',
  'Idukki',
  'Ernakulam',
  'Thrissur',
  'Palakkad',
  'Malappuram',
  'Kozhikode',
  'Wayanad',
  'Kannur',
  'Kasaragod'
];

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

const Weather = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecast, setForecast] = useState(null);
  
  // Form state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDistrict, setSelectedDistrict] = useState('Kottayam');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchForecast = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await weatherAPI.getDistrictForecast(selectedMonth, selectedDistrict, selectedYear);
      setForecast(data);
    } catch (err) {
      setError(err.message || 'Failed to load weather forecast');
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchForecast();
  };

  // Generate year options (current year and next few years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear + i);

  // Calculate chart data and styling only when forecast exists
  const chartData = forecast ? (forecast.series || []).map((item) => ({
    year: item.year,
    rainfall: item.rainfall,
    riskLevel: item.riskLevel,
    isForecast: item.isForecast
  })) : [];

  const ratio = forecast ? (forecast.percentOfAverage || 1) : 1;
  const percentOfAverage = Math.round(ratio * 100);
  const clampedRatio = Math.min(Math.max(ratio, 0), 2); // 0–200% range
  const barWidth = `${clampedRatio * 50}%`; // 1.0 => 50%, 2.0 => 100%

  const riskColor = forecast
    ? forecast.riskLevel === 'High'
      ? 'bg-error-100 text-error-700 border-error-300'
      : forecast.riskLevel === 'Low'
      ? 'bg-info-100 text-info-700 border-info-300'
      : 'bg-success-100 text-success-700 border-success-300'
    : 'bg-gray-100 text-gray-700 border-gray-300';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <CloudRain className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-3">
            Rainfall Forecast for Rubber Tapping
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select a month and district to get AI-based rainfall forecast for planning your tapping days.
          </p>
        </motion.div>

        {/* Forecast Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card p-6 lg:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              <div>
                <label className="form-label flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-600" />
                  Select Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="form-input"
                  required
                >
                  {MONTHS.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  Select District
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="form-input"
                  required
                >
                  {KERALA_DISTRICTS.map(district => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-600" />
                  Select Year (Optional)
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="form-input"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full md:w-auto"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CloudRain className="w-5 h-5" />
                  Get Forecast
                </span>
              )}
            </button>
          </form>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-error-50 border border-error-200 text-error-600 px-6 py-4 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-error-700">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Forecast Results */}
        {forecast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card p-6 lg:p-8 space-y-6"
          >
            <div className="flex flex-wrap justify-between items-start gap-6 pb-6 border-b border-gray-200">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-2">Forecast for</p>
                <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">
                  {forecast.monthName} {forecast.year}
                </h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    <span className="font-medium">{forecast.district}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    <span className="font-medium">{forecast.season}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 mb-2">Predicted Rainfall</p>
                <p className="text-4xl font-display font-bold text-primary-600 mb-1">
                  {forecast.predictedRainfall.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">mm</p>
                <p className="text-xs text-gray-400 mt-2">Model: {forecast.model}</p>
              </div>
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border-2 ${riskColor}`}>
              {forecast.riskLevel === 'High' && <AlertCircle className="w-4 h-4" />}
              {forecast.riskLevel === 'Normal' && <CheckCircle className="w-4 h-4" />}
              {forecast.riskLevel === 'Low' && <Info className="w-4 h-4" />}
              <span>Risk level: {forecast.riskLevel}</span>
            </div>

            {forecast.historicalAverage && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">
                    Compared to long-term average for {forecast.district}
                  </span>
                  <span className="font-bold text-primary-600">{percentOfAverage}% of normal</span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: barWidth }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-info-400 via-primary-500 to-error-500 rounded-full"
                  ></motion.div>
                </div>
              </div>
            )}

            <div className={`p-4 rounded-lg border-l-4 ${
              forecast.riskLevel === 'High'
                ? 'bg-error-50 border-error-500'
                : forecast.riskLevel === 'Low'
                ? 'bg-info-50 border-info-500'
                : 'bg-success-50 border-success-500'
            }`}>
              <div className="flex items-start gap-3">
                {forecast.riskLevel === 'High' && <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />}
                {forecast.riskLevel === 'Normal' && <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />}
                {forecast.riskLevel === 'Low' && <Info className="w-5 h-5 text-info-600 flex-shrink-0 mt-0.5" />}
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Recommendation</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {forecast.riskLevel === 'High' && (
                      <>
                        Heavy monsoon rainfall expected. Avoid scheduling new tapping panels on days with
                        strong rain; prioritize rain-guarding and drainage.
                      </>
                    )}
                    {forecast.riskLevel === 'Normal' && (
                      <>
                        Rainfall is expected to be near normal. You can plan regular tapping, but still check
                        local daily weather before work.
                      </>
                    )}
                    {forecast.riskLevel === 'Low' && (
                      <>
                        Below-average rainfall expected. Good conditions for tapping, but monitor trees for
                        any signs of moisture stress.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Line chart: rainfall trend with risk markers */}
        {forecast && chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card p-6 lg:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900">
                  {forecast.district} Rainfall Trend
                </h2>
                <p className="text-sm text-gray-500">
                  Historical comparison with risk level indicators
                </p>
              </div>
            </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  label={{
                    value: 'Rainfall (mm)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: 10, fill: '#6B7280' }
                  }}
                />
                <Tooltip
                  formatter={(value, name, entry) => {
                    if (name === 'rainfall') {
                      return [`${value.toLocaleString()} mm`, 'Rainfall'];
                    }
                    return value;
                  }}
                  labelFormatter={(label, payload) => {
                    const point = payload && payload[0] && payload[0].payload;
                    if (point) {
                      return `${label} • ${point.isForecast ? 'Forecast' : 'History'} • ${point.riskLevel} risk`;
                    }
                    return label;
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rainfall"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const color =
                      payload.riskLevel === 'High'
                        ? '#ef4444'
                        : payload.riskLevel === 'Low'
                        ? '#3b82f6'
                        : '#22c55e';
                    return (
                      <circle cx={cx} cy={cy} r={5} fill={color} stroke="#ffffff" strokeWidth={2} />
                    );
                  }}
                  activeDot={(props) => {
                    const { cx, cy, payload } = props;
                    const color =
                      payload.riskLevel === 'High'
                        ? '#ef4444'
                        : payload.riskLevel === 'Low'
                        ? '#3b82f6'
                        : '#22c55e';
                    return (
                      <g>
                        <circle cx={cx} cy={cy} r={7} fill={color} stroke="#ffffff" strokeWidth={2} />
                      </g>
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        )}
      </div>
    </div>
  );
};

export default Weather;


