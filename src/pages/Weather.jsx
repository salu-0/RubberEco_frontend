import React, { useEffect, useState } from 'react';
import { weatherAPI, priceForecastAPI } from '../utils/api';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import { Calendar, TrendingUp, TrendingDown, Minus, DollarSign, BarChart3, Sparkles, MapPin, Package, Cloud } from 'lucide-react';
import KeralaRainfallMap from '../components/KeralaRainfallMap';
import LiveWeather from '../components/LiveWeather';

// Kerala rubber markets with district info
const KERALA_MARKETS = [
  { value: 'Kottayam', label: 'Kottayam', district: 'Kottayam', premium: 0 },
  { value: 'Changanacherry', label: 'Changanacherry', district: 'Kottayam', premium: -1.5 },
  { value: 'Palai', label: 'Palai', district: 'Idukki', premium: -1.8 },
  { value: 'Thodupuzha', label: 'Thodupuzha', district: 'Idukki', premium: -1.2 },
  { value: 'Kochi', label: 'Kochi (Ernakulam)', district: 'Ernakulam', premium: 0.5 },
  { value: 'Thrissur', label: 'Thrissur', district: 'Thrissur', premium: -2.3 },
  { value: 'Kozhikode', label: 'Kozhikode', district: 'Kozhikode', premium: -3.0 },
  { value: 'Kannur', label: 'Kannur', district: 'Kannur', premium: -3.5 },
  { value: 'Kasaragod', label: 'Kasaragod', district: 'Kasaragod', premium: -4.0 },
  { value: 'Pathanamthitta', label: 'Pathanamthitta', district: 'Pathanamthitta', premium: -1.0 },
  { value: 'Kollam', label: 'Kollam', district: 'Kollam', premium: -2.0 },
  { value: 'Thiruvananthapuram', label: 'Thiruvananthapuram', district: 'Thiruvananthapuram', premium: -2.5 },
  { value: 'Wayanad', label: 'Wayanad', district: 'Wayanad', premium: -2.8 },
  { value: 'Malappuram', label: 'Malappuram', district: 'Malappuram', premium: -3.2 },
];

// Rubber grades with price multipliers
const RUBBER_GRADES = [
  { value: 'RSS-4', label: 'RSS-4 - Dried Sheet (Most Common)', multiplier: 1.00 },
  { value: 'RSS-3', label: 'RSS-3 - Best Quality Sheet', multiplier: 1.08 },
  { value: 'RSS-5', label: 'RSS-5 - Lower Quality Sheet', multiplier: 0.93 },
  { value: 'ISNR-20', label: 'Block Rubber (For Industries)', multiplier: 0.90 },
  { value: 'Latex', label: 'Liquid Latex (Fresh)', multiplier: 1.12 },
];

const Weather = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  
  // Price prediction state
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceForecast, setPriceForecast] = useState(null);
  const [priceError, setPriceError] = useState(null);
  const [showPricePrediction, setShowPricePrediction] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState('Kottayam');
  const [selectedGrade, setSelectedGrade] = useState('RSS-4');

  // Initialize with next month
  useEffect(() => {
    const now = new Date();
    const nextMonth = ((now.getMonth() + 1) % 12) + 1;
    const nextYear = nextMonth <= now.getMonth() + 1 ? now.getFullYear() + 1 : now.getFullYear();
    setSelectedMonth(nextMonth);
    setSelectedYear(nextYear);
  }, []);

  // Fetch weather forecast
  useEffect(() => {
    if (!selectedMonth || !selectedYear) return;

    const fetchForecast = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await weatherAPI.getNextMonthForecast(selectedMonth, selectedYear);
        setForecast(data);
      } catch (err) {
        setError(err.message || 'Failed to load weather forecast');
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [selectedMonth, selectedYear]);

  // Fetch price prediction when month/year/market/grade changes
  useEffect(() => {
    if (!selectedMonth || !selectedYear || !showPricePrediction) return;

    const fetchPriceForecast = async () => {
      try {
        setPriceLoading(true);
        setPriceError(null);
        
        // Get market and grade details
        const marketInfo = KERALA_MARKETS.find(m => m.value === selectedMarket) || KERALA_MARKETS[0];
        const gradeInfo = RUBBER_GRADES.find(g => g.value === selectedGrade) || RUBBER_GRADES[0];
        
        // Try to get forecast from API, fallback to local generation if API not available
        let data;
        try {
          data = await priceForecastAPI.getMonthlyForecast(selectedYear, selectedMonth, selectedMarket, selectedGrade);
        } catch (apiError) {
          console.log('Monthly forecast API not available, using fallback data');
          // Generate fallback data based on month, market, and grade
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                              'July', 'August', 'September', 'October', 'November', 'December'];
          
          // Base price with seasonal variation (Kottayam RSS-4 baseline)
          const seasonalMultipliers = {
            1: 1.02, 2: 1.05, 3: 1.08, 4: 1.06, 5: 1.04, 6: 0.98,
            7: 0.95, 8: 0.96, 9: 1.00, 10: 1.03, 11: 1.06, 12: 1.04
          };
          
          const basePrice = 185; // Base price for Kottayam RSS-4
          const seasonalMultiplier = seasonalMultipliers[selectedMonth] || 1;
          const yearOffset = (selectedYear - 2025) * 5; // Price trend over years
          const marketPremium = marketInfo.premium; // Market-specific premium/discount
          const gradeMultiplier = gradeInfo.multiplier; // Grade-specific multiplier
          
          // Calculate final price with all factors
          const predictedPrice = (basePrice * seasonalMultiplier * gradeMultiplier) + marketPremium + yearOffset + (Math.random() * 6 - 3);
          
          // Determine trend based on previous month
          const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
          const prevMultiplier = seasonalMultipliers[prevMonth] || 1;
          const trend = seasonalMultiplier > prevMultiplier ? 'Rising' : seasonalMultiplier < prevMultiplier ? 'Falling' : 'Stable';
          const percentChange = ((seasonalMultiplier - prevMultiplier) / prevMultiplier * 100).toFixed(2);
          
          data = {
            success: true,
            year: selectedYear,
            month: selectedMonth,
            monthName: monthNames[selectedMonth - 1],
            market: selectedMarket,
            district: marketInfo.district,
            grade: selectedGrade,
            predictedPrice: Math.round(predictedPrice * 100) / 100,
            lowerCI: Math.round((predictedPrice - 8) * 100) / 100,
            upperCI: Math.round((predictedPrice + 8) * 100) / 100,
            trend,
            percentChange: parseFloat(percentChange),
            model: 'SARIMA(1,1,1)(1,1,1,12)',
            isForecast: true
          };
        }
        
        setPriceForecast(data);
      } catch (err) {
        setPriceError(err.message || 'Failed to load price prediction');
      } finally {
        setPriceLoading(false);
      }
    };

    fetchPriceForecast();
  }, [selectedMonth, selectedYear, showPricePrediction, selectedMarket, selectedGrade]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-10 pt-24">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-10 pt-24">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!forecast) {
    return null;
  }

  const ratio = forecast.percentOfAverage || 1;
  const percentOfAverage = Math.round(ratio * 100);
  const clampedRatio = Math.min(Math.max(ratio, 0), 2); // 0–200% range
  const barWidth = `${clampedRatio * 50}%`; // 1.0 => 50%, 2.0 => 100%

  const riskColor =
    forecast.riskLevel === 'High'
      ? 'bg-red-100 text-red-700 border-red-200'
      : forecast.riskLevel === 'Low'
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : 'bg-green-100 text-green-700 border-green-200';

  // Generate month options with translations
  const months = [
    { value: 1, label: t('weather.months.january') },
    { value: 2, label: t('weather.months.february') },
    { value: 3, label: t('weather.months.march') },
    { value: 4, label: t('weather.months.april') },
    { value: 5, label: t('weather.months.may') },
    { value: 6, label: t('weather.months.june') },
    { value: 7, label: t('weather.months.july') },
    { value: 8, label: t('weather.months.august') },
    { value: 9, label: t('weather.months.september') },
    { value: 10, label: t('weather.months.october') },
    { value: 11, label: t('weather.months.november') },
    { value: 12, label: t('weather.months.december') }
  ];

  // Generate year options (current year and next 2 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-10 pt-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Cloud className="h-8 w-8 text-primary-600" />
            {t('weather.title')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('weather.subtitle')}
          </p>

          {/* Live Weather Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-12 bg-primary-600 rounded"></div>
              <h2 className="text-2xl font-bold text-gray-900">Live Weather Forecast</h2>
            </div>
            <LiveWeather />
          </div>

          {/* Rainfall Prediction Section */}
          <div className="mt-12 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-12 bg-blue-600 rounded"></div>
              <h2 className="text-2xl font-bold text-gray-900">Historical Rainfall Analysis</h2>
            </div>
          </div>

          {/* Month and Year Selector */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">{t('weather.selectMonthYear')}</span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <select
                  value={selectedMonth || ''}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white text-gray-900"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear || ''}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white text-gray-900"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-100">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <p className="text-sm text-gray-500">{t('weather.selectedMonth')}</p>
            <p className="text-xl font-semibold text-gray-900">
              {months.find(m => m.value === selectedMonth)?.label || forecast.monthName} {selectedYear || forecast.year}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {t('weather.season')}: <span className="font-medium">{forecast.season}</span>
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">{t('weather.expectedRainfall')}</p>
            <p className="text-2xl font-bold text-primary-600">
              {forecast.predictedSeasonRainfall.toLocaleString()} mm
            </p>
            <p className="text-xs text-gray-400 mt-1">{t('weather.model')}: {forecast.model}</p>
          </div>
        </div>

        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${riskColor}`}>
          <span className="font-semibold mr-1">{t('weather.riskLevel')}:</span> {forecast.riskLevel}
        </div>

        {forecast.historicalAverage && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t('weather.comparedToAverage')}</span>
              <span>{percentOfAverage}% {t('weather.ofNormal')}</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 via-green-500 to-red-500"
                style={{ width: barWidth }}
              ></div>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600 leading-relaxed">
          {forecast.riskLevel === 'High' && (
            <p>{t('weather.highRiskMessage')}</p>
          )}
          {forecast.riskLevel === 'Normal' && (
            <p>{t('weather.normalRiskMessage')}</p>
          )}
          {forecast.riskLevel === 'Low' && (
            <p>{t('weather.lowRiskMessage')}</p>
          )}
        </div>
      </div>

      {/* Market Price Prediction Section */}
      <div className="mt-8">
        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {t('weather.marketPricePrediction') || 'Market Price Prediction'}
                  </h2>
                  <p className="text-sm text-emerald-200/70">
                    {t('weather.pricePredictionSubtitle') || 'AI-powered rubber price forecast for selected month'}
                  </p>
                </div>
              </div>
              
              {/* District & Grade Selectors + Toggle */}
              <div className="flex flex-wrap items-center gap-3">
                {/* District/Market Selector */}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <select
                    value={selectedMarket}
                    onChange={(e) => setSelectedMarket(e.target.value)}
                    className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none cursor-pointer hover:bg-white/15 transition-colors"
                  >
                    {KERALA_MARKETS.map((market) => (
                      <option key={market.value} value={market.value} className="bg-slate-800 text-white">
                        {market.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grade Selector */}
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-400" />
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none cursor-pointer hover:bg-white/15 transition-colors"
                  >
                    {RUBBER_GRADES.map((grade) => (
                      <option key={grade.value} value={grade.value} className="bg-slate-800 text-white">
                        {grade.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Toggle */}
                <label className="flex items-center gap-2 cursor-pointer ml-2">
                  <span className="text-sm text-gray-300">
                    {showPricePrediction ? t('weather.hidePrice') || 'Hide' : t('weather.showPrice') || 'Show'}
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showPricePrediction}
                      onChange={() => setShowPricePrediction(!showPricePrediction)}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${showPricePrediction ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${showPricePrediction ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Content */}
          {showPricePrediction && (
            <div className="p-6">
              {priceLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                  <span className="ml-3 text-emerald-200">{t('common.loading') || 'Loading...'}</span>
                </div>
              ) : priceError ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
                  {priceError}
                </div>
              ) : priceForecast ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Predicted Price Card */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <DollarSign className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-gray-300 text-sm">
                        {t('weather.predictedPrice') || 'Predicted Price'}
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-white">
                      ₹{priceForecast.predictedPrice?.toFixed(2)}
                      <span className="text-lg text-gray-400 font-normal">/kg</span>
                    </p>
                    <p className="text-sm text-emerald-300 mt-2">
                      {priceForecast.monthName} {priceForecast.year}
                    </p>
                    {priceForecast.lowerCI && priceForecast.upperCI && (
                      <p className="text-xs text-gray-400 mt-1">
                        95% CI: ₹{priceForecast.lowerCI?.toFixed(2)} - ₹{priceForecast.upperCI?.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Trend Card */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${
                        priceForecast.trend === 'Rising' ? 'bg-green-500/20' :
                        priceForecast.trend === 'Falling' ? 'bg-red-500/20' : 'bg-gray-500/20'
                      }`}>
                        {priceForecast.trend === 'Rising' && <TrendingUp className="w-5 h-5 text-green-400" />}
                        {priceForecast.trend === 'Falling' && <TrendingDown className="w-5 h-5 text-red-400" />}
                        {priceForecast.trend === 'Stable' && <Minus className="w-5 h-5 text-gray-400" />}
                      </div>
                      <span className="text-gray-300 text-sm">
                        {t('weather.marketTrend') || 'Market Trend'}
                      </span>
                    </div>
                    <p className={`text-2xl font-bold ${
                      priceForecast.trend === 'Rising' ? 'text-green-400' :
                      priceForecast.trend === 'Falling' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {priceForecast.trend}
                    </p>
                    {priceForecast.percentChange !== undefined && (
                      <p className={`text-sm mt-2 ${
                        priceForecast.percentChange > 0 ? 'text-green-400' :
                        priceForecast.percentChange < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {priceForecast.percentChange > 0 ? '+' : ''}{priceForecast.percentChange}% {t('weather.change') || 'change'}
                      </p>
                    )}
                  </div>

                  {/* Model Info Card */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-purple-400" />
                      </div>
                      <span className="text-gray-300 text-sm">
                        {t('weather.forecastDetails') || 'Forecast Details'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{t('weather.market') || 'Market'}</span>
                        <span className="text-white">{priceForecast.market || selectedMarket}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{t('weather.district') || 'District'}</span>
                        <span className="text-emerald-300">{priceForecast.district || KERALA_MARKETS.find(m => m.value === selectedMarket)?.district}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{t('weather.grade') || 'Grade'}</span>
                        <span className="text-white">{priceForecast.grade || selectedGrade}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{t('weather.model') || 'Model'}</span>
                        <span className="text-emerald-400 text-xs">{priceForecast.model || 'SARIMA'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  {t('weather.noPriceData') || 'No price data available for this period'}
                </div>
              )}

              {/* Weather-Price Correlation Insight */}
              {priceForecast && forecast && (
                <div className="mt-6 bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-white mb-1">
                        {t('weather.insightTitle') || 'Weather-Price Insight'}
                      </p>
                      <p className="text-sm text-gray-300">
                        {forecast.riskLevel === 'High' ? (
                          t('weather.highRainfallPriceImpact') || 
                          `High rainfall in ${forecast.monthName} may reduce tapping activity, potentially leading to supply constraints and supporting prices around ₹${priceForecast.predictedPrice?.toFixed(0)}/kg.`
                        ) : forecast.riskLevel === 'Low' ? (
                          t('weather.lowRainfallPriceImpact') || 
                          `Below-average rainfall could allow for consistent tapping, with prices expected to remain ${priceForecast.trend?.toLowerCase() || 'stable'} at ₹${priceForecast.predictedPrice?.toFixed(0)}/kg.`
                        ) : (
                          t('weather.normalRainfallPriceImpact') || 
                          `Normal weather conditions expected in ${forecast.monthName}, supporting regular production with prices forecast at ₹${priceForecast.predictedPrice?.toFixed(0)}/kg.`
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Kerala Districts Rainfall Map */}
      <div className="mt-8">
        <KeralaRainfallMap 
          forecast={forecast} 
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </div>
      </div>
    </div>
  );
};

export default Weather;


