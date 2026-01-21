import React, { useEffect, useState } from 'react';
import { weatherAPI } from '../utils/api';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import { Calendar } from 'lucide-react';
import KeralaRainfallMap from '../components/KeralaRainfallMap';

const Weather = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  // Initialize with next month
  useEffect(() => {
    const now = new Date();
    const nextMonth = ((now.getMonth() + 1) % 12) + 1;
    const nextYear = nextMonth <= now.getMonth() + 1 ? now.getFullYear() + 1 : now.getFullYear();
    setSelectedMonth(nextMonth);
    setSelectedYear(nextYear);
  }, []);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('weather.title')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('weather.subtitle')}
          </p>

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


