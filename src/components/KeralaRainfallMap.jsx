import React, { useState } from 'react';
import { MapPin, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Kerala districts with approximate SVG coordinates and rainfall characteristics
const KERALA_DISTRICTS = [
  { 
    name: 'Thiruvananthapuram', 
    id: 'tvm',
    x: 50, y: 95,
    rainfallMultiplier: 0.95, // Slightly below average (coastal south)
    elevation: 'low'
  },
  { 
    name: 'Kollam', 
    id: 'klm',
    x: 60, y: 85,
    rainfallMultiplier: 1.05, // Above average (coastal, receives good monsoon)
    elevation: 'low'
  },
  { 
    name: 'Pathanamthitta', 
    id: 'ptm',
    x: 70, y: 75,
    rainfallMultiplier: 1.15, // High rainfall (hilly, monsoon path)
    elevation: 'medium'
  },
  { 
    name: 'Alappuzha', 
    id: 'alp',
    x: 65, y: 65,
    rainfallMultiplier: 1.10, // Above average (coastal, backwaters)
    elevation: 'low'
  },
  { 
    name: 'Kottayam', 
    id: 'ktm',
    x: 75, y: 60,
    rainfallMultiplier: 1.20, // Very high (hilly, heavy monsoon)
    elevation: 'medium'
  },
  { 
    name: 'Idukki', 
    id: 'idk',
    x: 80, y: 50,
    rainfallMultiplier: 1.25, // Highest (high elevation, heavy monsoon)
    elevation: 'high'
  },
  { 
    name: 'Ernakulam', 
    id: 'ekm',
    x: 70, y: 45,
    rainfallMultiplier: 1.00, // Average (coastal central)
    elevation: 'low'
  },
  { 
    name: 'Thrissur', 
    id: 'tsr',
    x: 60, y: 40,
    rainfallMultiplier: 1.05, // Slightly above average
    elevation: 'low'
  },
  { 
    name: 'Palakkad', 
    id: 'pkd',
    x: 50, y: 35,
    rainfallMultiplier: 0.85, // Below average (rain shadow effect)
    elevation: 'low'
  },
  { 
    name: 'Malappuram', 
    id: 'mlp',
    x: 45, y: 30,
    rainfallMultiplier: 0.90, // Below average
    elevation: 'low'
  },
  { 
    name: 'Kozhikode', 
    id: 'kkd',
    x: 40, y: 25,
    rainfallMultiplier: 1.10, // Above average (coastal north)
    elevation: 'low'
  },
  { 
    name: 'Wayanad', 
    id: 'wyd',
    x: 50, y: 20,
    rainfallMultiplier: 1.15, // High (hilly, good monsoon)
    elevation: 'high'
  },
  { 
    name: 'Kannur', 
    id: 'knr',
    x: 35, y: 15,
    rainfallMultiplier: 1.05, // Above average (coastal)
    elevation: 'low'
  },
  { 
    name: 'Kasaragod', 
    id: 'ksd',
    x: 30, y: 10,
    rainfallMultiplier: 0.95, // Slightly below average (northern tip)
    elevation: 'low'
  }
];

// Calculate district-specific risk level based on base forecast and district characteristics
const calculateDistrictRisk = (baseRisk, baseRainfall, district, month, season) => {
  // Adjust rainfall based on district multiplier
  const adjustedRainfall = baseRainfall * district.rainfallMultiplier;
  
  // Seasonal adjustments
  let seasonalMultiplier = 1.0;
  if (season === 'Monsoon') {
    // High elevation districts get more rain during monsoon
    if (district.elevation === 'high') seasonalMultiplier = 1.15;
    else if (district.elevation === 'medium') seasonalMultiplier = 1.08;
  } else if (season === 'Summer') {
    // Coastal districts get slightly more summer rain
    if (district.elevation === 'low') seasonalMultiplier = 1.05;
  } else if (season === 'Winter') {
    // Northern districts get more winter rain
    if (['Kannur', 'Kasaragod', 'Wayanad', 'Kozhikode'].includes(district.name)) {
      seasonalMultiplier = 1.10;
    }
  }
  
  const finalRainfall = adjustedRainfall * seasonalMultiplier;
  
  // Calculate risk based on adjusted rainfall
  // Using a base average of 2000mm for Kerala
  const baseAverage = 2000;
  const percentOfAverage = (finalRainfall / baseAverage) * 100;
  
  if (percentOfAverage > 110) return 'High';
  if (percentOfAverage < 90) return 'Low';
  return 'Normal';
};

// Risk level colors
const RISK_COLORS = {
  High: '#ef4444',    // red-500
  Normal: '#10b981',  // green-500
  Low: '#3b82f6'      // blue-500
};

// Risk level icons
const RISK_ICONS = {
  High: AlertTriangle,
  Normal: CheckCircle,
  Low: Info
};

// Simplified Kerala shape SVG path (approximate)
const KERALA_SHAPE = "M 30 10 L 35 15 L 40 25 L 45 30 L 50 35 L 60 40 L 70 45 L 80 50 L 75 60 L 70 65 L 65 65 L 60 85 L 50 95 L 45 90 L 40 80 L 35 70 L 30 50 L 25 30 Z";

// Month names for display
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const KeralaRainfallMap = ({ forecast, selectedMonth, selectedYear }) => {
  const { t } = useTranslation();
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  
  // Month keys for translation
  const MONTH_KEYS = [
    'weather.months.january', 'weather.months.february', 'weather.months.march',
    'weather.months.april', 'weather.months.may', 'weather.months.june',
    'weather.months.july', 'weather.months.august', 'weather.months.september',
    'weather.months.october', 'weather.months.november', 'weather.months.december'
  ];
  
  // Get display month name from selectedMonth prop (1-12)
  const displayMonthName = selectedMonth ? t(MONTH_KEYS[selectedMonth - 1]) : forecast?.monthName;
  const displayYear = selectedYear || forecast?.year;

  // Calculate district-specific risk levels
  const districtsWithRisk = React.useMemo(() => {
    if (!forecast) return KERALA_DISTRICTS.map(d => ({ ...d, riskLevel: 'Normal', predictedRainfall: 0 }));
    
    const baseRisk = forecast.riskLevel || 'Normal';
    const baseRainfall = forecast.predictedSeasonRainfall || 2000;
    const season = forecast.season || 'Monsoon';
    const month = selectedMonth || new Date().getMonth() + 1;
    
    return KERALA_DISTRICTS.map(district => {
      const riskLevel = calculateDistrictRisk(
        baseRisk,
        baseRainfall,
        district,
        month,
        season
      );
      
      const adjustedRainfall = baseRainfall * district.rainfallMultiplier;
      
      return {
        ...district,
        riskLevel,
        predictedRainfall: Math.round(adjustedRainfall)
      };
    });
  }, [forecast, selectedMonth, selectedYear]);

  // Get overall state risk level for summary
  const overallRiskLevel = forecast?.riskLevel || 'Normal';
  const RiskIcon = RISK_ICONS[overallRiskLevel] || Info;
  
  // Count districts by risk level
  const riskCounts = districtsWithRisk.reduce((acc, district) => {
    acc[district.riskLevel] = (acc[district.riskLevel] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary-600" />
            {t('weather.map.title')}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {displayMonthName} {displayYear} - {t('weather.map.districtWiseRiskLevels')}
            {riskCounts.High && <span className="ml-2 text-red-600">{t('weather.map.high')}: {riskCounts.High}</span>}
            {riskCounts.Normal && <span className="ml-2 text-green-600">{t('weather.map.normal')}: {riskCounts.Normal}</span>}
            {riskCounts.Low && <span className="ml-2 text-blue-600">{t('weather.map.low')}: {riskCounts.Low}</span>}
          </p>
        </div>
        
        {/* SVG Map */}
        <div className="p-6 bg-gradient-to-br from-blue-50 to-green-50">
          <svg 
            viewBox="0 0 120 110" 
            className="w-full h-auto max-h-96"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Kerala State Outline */}
            <path
              d={KERALA_SHAPE}
              fill="#e0f2fe"
              stroke="#0ea5e9"
              strokeWidth="0.5"
              opacity="0.3"
            />

            {/* District Circles */}
              {districtsWithRisk.map((district) => {
              const isSelected = selectedDistrict?.id === district.id;
              const isHovered = hoveredDistrict?.id === district.id;
              const districtColor = RISK_COLORS[district.riskLevel] || RISK_COLORS.Normal;
              
              return (
                <g key={district.id}>
                  {/* District Circle */}
                  <circle
                    cx={district.x}
                    cy={district.y}
                    r={isSelected ? 4.5 : isHovered ? 4 : 3.5}
                    fill={districtColor}
                    fillOpacity={isSelected ? 0.9 : isHovered ? 0.8 : 0.7}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 1.5 : 1}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredDistrict(district)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                    onClick={() => setSelectedDistrict(district)}
                  />
                  
                  {/* District Label */}
                  <text
                    x={district.x}
                    y={district.y + (isSelected ? 7 : 6)}
                    fontSize={isSelected ? "2.5" : "2"}
                    fontWeight={isSelected ? "bold" : "normal"}
                    fill="#1f2937"
                    textAnchor="middle"
                    className="pointer-events-none select-none"
                  >
                    {district.name.substring(0, 3).toUpperCase()}
                  </text>
                </g>
              );
            })}

            {/* District Names (on hover/select) */}
            {(hoveredDistrict || selectedDistrict) && (
              <g>
                <rect
                  x={(hoveredDistrict || selectedDistrict).x - 15}
                  y={(hoveredDistrict || selectedDistrict).y - 12}
                  width="30"
                  height="8"
                  fill="rgba(0, 0, 0, 0.7)"
                  rx="2"
                />
                <text
                  x={(hoveredDistrict || selectedDistrict).x}
                  y={(hoveredDistrict || selectedDistrict).y - 6}
                  fontSize="2.5"
                  fill="#ffffff"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {(hoveredDistrict || selectedDistrict).name}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* District List */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {districtsWithRisk.map((district) => {
              const isSelected = selectedDistrict?.id === district.id;
              const districtColor = RISK_COLORS[district.riskLevel] || color;
              
              return (
                <button
                  key={district.id}
                  onClick={() => setSelectedDistrict(isSelected ? null : district)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-primary-50 border-primary-300 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-primary-200 hover:bg-primary-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: districtColor }}
                    />
                    <span className={`text-xs font-medium ${
                      isSelected ? 'text-primary-900' : 'text-gray-700'
                    }`}>
                      {district.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Info className="h-4 w-4" />
          {t('weather.map.riskLevelLegend')}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(RISK_COLORS).map(([level, levelColor]) => {
            const Icon = RISK_ICONS[level];
            const isActive = level === overallRiskLevel;
            const levelKey = level.toLowerCase();
            return (
              <div
                key={level}
                className={`flex items-center gap-2 p-2 rounded-lg border ${
                  isActive
                    ? 'bg-primary-50 border-primary-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: levelColor }}
                />
                <Icon className={`h-4 w-4 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${isActive ? 'text-primary-900' : 'text-gray-700'}`}>
                  {t(`weather.map.${levelKey}`)}
                </span>
                {isActive && (
                  <span className="ml-auto text-xs text-primary-600 font-medium">{t('weather.map.current')}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected District Info */}
      {selectedDistrict && forecast && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-primary-900 mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {selectedDistrict.name} {t('weather.map.district')}
              </h4>
              <div className="space-y-1 text-sm">
                <p className="text-primary-700">
                  <strong>{t('weather.map.expectedRainfall')}:</strong> {selectedDistrict.predictedRainfall?.toLocaleString() || forecast.predictedSeasonRainfall?.toLocaleString() || 'N/A'} mm
                </p>
                <p className="text-primary-600 text-xs mt-1">
                  ({t('weather.map.stateAverage')}: {forecast.predictedSeasonRainfall?.toLocaleString() || 'N/A'} mm)
                </p>
                <p className="text-primary-600">
                  <strong>{t('weather.map.period')}:</strong> {displayMonthName} {displayYear}
                </p>
                <p className="text-primary-600">
                  <strong>{t('weather.season')}:</strong> {forecast.season || 'N/A'}
                </p>
                <p className="text-primary-600">
                  <strong>{t('weather.riskLevel')}:</strong> <span className="font-semibold" style={{ color: RISK_COLORS[selectedDistrict.riskLevel] }}>
                    {t(`weather.map.${selectedDistrict.riskLevel.toLowerCase()}`)}
                  </span>
                </p>
                {forecast.percentOfAverage && (
                  <p className="text-primary-600">
                    <strong>{t('weather.map.vsAverage')}:</strong> {Math.round(forecast.percentOfAverage * 100)}% {t('weather.ofNormal')}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedDistrict(null)}
              className="text-primary-600 hover:text-primary-800 ml-4"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Forecast Summary */}
      {forecast && (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">{t('weather.map.forecastSummary')}</h4>
          <p className="text-sm text-gray-600 mb-2">
            {t('weather.map.stateWideAverage')} {displayMonthName} {displayYear}: <strong className="text-gray-900">
            {forecast.predictedSeasonRainfall?.toLocaleString()} mm</strong> ({t(`weather.map.${overallRiskLevel.toLowerCase()}`)} {t('weather.map.risk')}).
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• {t('weather.map.districtNote1')}</p>
            <p>• {t('weather.map.districtNote2')}</p>
            <p>• {t('weather.map.districtNote3')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeralaRainfallMap;
