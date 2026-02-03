import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Area, AreaChart, ReferenceLine, Legend 
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, BarChart3, Calendar, 
  AlertCircle, RefreshCw, ChevronRight, ArrowUp, ArrowDown,
  Sparkles, Target, Info, Clock, DollarSign, Activity
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { priceForecastAPI } from '../utils/api';

const PricePrediction = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('6M');
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    fetchPriceData();
  }, [selectedTimeframe]);

  const fetchPriceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch forecast based on timeframe
      const months = selectedTimeframe === '3M' ? 3 : selectedTimeframe === '6M' ? 6 : 12;
      const [forecastRes, analysisRes] = await Promise.all([
        priceForecastAPI.getCurrentForecast(months),
        priceForecastAPI.getPriceAnalysis()
      ]);

      setForecastData(forecastRes);
      setAnalysisData(analysisRes);
    } catch (err) {
      console.error('Error fetching price data:', err);
      setError(err.message || 'Failed to load price predictions');
    } finally {
      setLoading(false);
    }
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-emerald-100">
          <p className="font-semibold text-gray-900 mb-2">{data.monthName} {data.year}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Predicted:</span>
              <span className="font-bold text-emerald-600">₹{data.predictedPrice?.toFixed(2)}/kg</span>
            </div>
            {data.lowerCI && data.upperCI && (
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-gray-500">95% CI:</span>
                <span className="text-gray-600">₹{data.lowerCI?.toFixed(2)} - ₹{data.upperCI?.toFixed(2)}</span>
              </div>
            )}
            {data.trend && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                {data.trend === 'Rising' && <ArrowUp className="w-4 h-4 text-green-500" />}
                {data.trend === 'Falling' && <ArrowDown className="w-4 h-4 text-red-500" />}
                {data.trend === 'Stable' && <Minus className="w-4 h-4 text-gray-500" />}
                <span className={`text-sm font-medium ${
                  data.trend === 'Rising' ? 'text-green-600' : 
                  data.trend === 'Falling' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {data.trend} {data.percentChange !== 0 && `(${data.percentChange > 0 ? '+' : ''}${data.percentChange}%)`}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Format chart data
  const formatChartData = () => {
    if (!forecastData?.forecasts) return [];
    
    return forecastData.forecasts.map(f => ({
      ...f,
      monthLabel: `${f.monthName?.substring(0, 3)} '${String(f.year).slice(-2)}`,
    }));
  };

  // Get outlook icon
  const getOutlookIcon = (outlook) => {
    switch (outlook) {
      case 'Bullish': return <TrendingUp className="w-6 h-6 text-green-500" />;
      case 'Bearish': return <TrendingDown className="w-6 h-6 text-red-500" />;
      default: return <Minus className="w-6 h-6 text-gray-500" />;
    }
  };

  // Get trend color
  const getTrendColor = (trend) => {
    switch (trend) {
      case 'Rising': return 'text-green-600 bg-green-50';
      case 'Falling': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-emerald-100 animate-pulse"></div>
            <RefreshCw className="w-8 h-8 text-emerald-600 absolute top-4 left-4 animate-spin" />
          </div>
          <p className="mt-4 text-emerald-700 font-medium">Loading AI Price Predictions...</p>
          <p className="text-sm text-gray-500 mt-1">Analyzing market patterns with SARIMA model</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 via-white to-orange-50 rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <p className="text-red-700 font-medium">{error}</p>
          <button 
            onClick={fetchPriceData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const chartData = formatChartData();

  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300 font-medium">AI-Powered Predictions</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Market Price Forecast
          </h2>
          <p className="text-xl text-emerald-100/80 max-w-2xl mx-auto">
            SARIMA-powered predictions for rubber prices based on historical patterns and seasonal trends
          </p>
        </motion.div>

        {/* Current Price & Quick Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Current Price Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm mb-1">Current Market Price</p>
                <p className="text-4xl font-bold">₹{forecastData?.currentPrice?.toFixed(2)}</p>
                <p className="text-emerald-100 text-sm mt-1">/kg (RSS-4 Grade)</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
              <span className="text-sm text-emerald-100">Kottayam Market</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                Updated: {new Date(forecastData?.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-gray-300 text-sm">Avg Forecast</span>
            </div>
            <p className="text-2xl font-bold text-white">₹{forecastData?.statistics?.averagePrice?.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">Next {selectedTimeframe}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-gray-300 text-sm">Volatility</span>
            </div>
            <p className="text-2xl font-bold text-white">{forecastData?.statistics?.volatility?.toFixed(1)}%</p>
            <p className="text-xs text-gray-400 mt-1">Price range variance</p>
          </div>
        </motion.div>

        {/* Main Chart Section */}
        <motion.div 
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Chart Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                Price Prediction Chart
              </h3>
              <p className="text-gray-400 text-sm mt-1">SARIMA(1,1,1)(1,1,1,12) Model</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Confidence Interval Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showConfidenceInterval}
                  onChange={() => setShowConfidenceInterval(!showConfidenceInterval)}
                  className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-300">Show 95% CI</span>
              </label>

              {/* Timeframe Selector */}
              <div className="flex bg-white/10 rounded-lg p-1">
                {['3M', '6M', '12M'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      selectedTimeframe === tf 
                        ? 'bg-emerald-500 text-white shadow-lg' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button 
                onClick={fetchPriceData}
                className="p-2 text-gray-300 hover:text-emerald-400 hover:bg-white/10 rounded-lg transition-colors"
                title="Refresh predictions"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="monthLabel" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Confidence Interval */}
                {showConfidenceInterval && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="upperCI"
                      stroke="none"
                      fill="url(#confidenceGradient)"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="lowerCI"
                      stroke="none"
                      fill="#1e293b"
                      fillOpacity={1}
                    />
                  </>
                )}
                
                {/* Main Price Line */}
                <Area
                  type="monotone"
                  dataKey="predictedPrice"
                  stroke="#10B981"
                  strokeWidth={3}
                  fill="url(#priceGradient)"
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: 'white' }}
                />
                
                {/* Reference line for current price */}
                {forecastData?.currentPrice && (
                  <ReferenceLine 
                    y={forecastData.currentPrice} 
                    stroke="#F59E0B" 
                    strokeDasharray="5 5"
                    label={{ value: 'Current', position: 'right', fill: '#F59E0B', fontSize: 12 }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-emerald-500 rounded"></div>
              <span className="text-sm text-gray-400">Predicted Price</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-yellow-500 rounded" style={{ borderStyle: 'dashed' }}></div>
              <span className="text-sm text-gray-400">Current Price</span>
            </div>
            {showConfidenceInterval && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-indigo-500/30 rounded"></div>
                <span className="text-sm text-gray-400">95% Confidence</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Insights & Analysis */}
        {analysisData && (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Market Outlook */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                {getOutlookIcon(analysisData.analysis?.outlook)}
                <div>
                  <h4 className="font-semibold text-white">Market Outlook</h4>
                  <p className="text-sm text-gray-400">Next 12 months</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Outlook</span>
                  <span className={`font-bold ${
                    analysisData.analysis?.outlook === 'Bullish' ? 'text-green-400' :
                    analysisData.analysis?.outlook === 'Bearish' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {analysisData.analysis?.outlook}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Expected Change</span>
                  <span className={`font-medium ${
                    analysisData.analysis?.outlookChangePercent > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {analysisData.analysis?.outlookChangePercent > 0 ? '+' : ''}{analysisData.analysis?.outlookChangePercent}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">YoY Change</span>
                  <span className={`font-medium ${
                    analysisData.analysis?.yearOverYearChange > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {analysisData.analysis?.yearOverYearChange > 0 ? '+' : ''}{analysisData.analysis?.yearOverYearChange}%
                  </span>
                </div>
              </div>
            </div>

            {/* Seasonality Insights */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-blue-400" />
                <div>
                  <h4 className="font-semibold text-white">Seasonal Patterns</h4>
                  <p className="text-sm text-gray-400">Historical trends</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-green-500/10 rounded-lg p-3">
                  <p className="text-xs text-green-400 mb-1">Best Month Historically</p>
                  <p className="text-white font-semibold">{analysisData.analysis?.bestMonth?.month}</p>
                  <p className="text-green-400 text-sm">₹{analysisData.analysis?.bestMonth?.averagePrice}/kg avg</p>
                </div>
                <div className="bg-red-500/10 rounded-lg p-3">
                  <p className="text-xs text-red-400 mb-1">Lowest Month Historically</p>
                  <p className="text-white font-semibold">{analysisData.analysis?.worstMonth?.month}</p>
                  <p className="text-red-400 text-sm">₹{analysisData.analysis?.worstMonth?.averagePrice}/kg avg</p>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <div>
                  <h4 className="font-semibold text-white">AI Insights</h4>
                  <p className="text-sm text-gray-400">Key observations</p>
                </div>
              </div>
              <div className="space-y-3">
                {analysisData.insights?.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <Info className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-300">{insight.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Forecast Table */}
        <motion.div 
          className="mt-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            Detailed Price Forecast
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Month</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Predicted Price</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium hidden sm:table-cell">95% CI Range</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">Trend</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium hidden md:table-cell">Change</th>
                </tr>
              </thead>
              <tbody>
                {forecastData?.forecasts?.map((forecast, index) => (
                  <motion.tr 
                    key={index}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="py-4 px-4">
                      <span className="text-white font-medium">{forecast.monthName}</span>
                      <span className="text-gray-500 ml-2">{forecast.year}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-emerald-400 font-bold">₹{forecast.predictedPrice?.toFixed(2)}</span>
                      <span className="text-gray-500 text-sm">/kg</span>
                    </td>
                    <td className="py-4 px-4 text-right hidden sm:table-cell">
                      <span className="text-gray-400 text-sm">
                        ₹{forecast.lowerCI?.toFixed(2)} - ₹{forecast.upperCI?.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(forecast.trend)}`}>
                        {forecast.trend === 'Rising' && <ArrowUp className="w-3 h-3" />}
                        {forecast.trend === 'Falling' && <ArrowDown className="w-3 h-3" />}
                        {forecast.trend === 'Stable' && <Minus className="w-3 h-3" />}
                        {forecast.trend}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right hidden md:table-cell">
                      <span className={`text-sm font-medium ${
                        forecast.percentChange > 0 ? 'text-green-400' : 
                        forecast.percentChange < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {forecast.percentChange > 0 ? '+' : ''}{forecast.percentChange}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Model Info */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span>Model: {forecastData?.model}</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Market: {forecastData?.market}</span>
                <span>Grade: {forecastData?.grade}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            <AlertCircle className="w-4 h-4 inline-block mr-1" />
            Predictions are generated using SARIMA time series analysis on historical data. 
            Actual market prices may vary due to external factors. Use forecasts as guidance only.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricePrediction;

