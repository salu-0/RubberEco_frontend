import React, { useState } from 'react';
import { MapPin, Droplet } from 'lucide-react';

const KeralaMap = ({ districts, selectedDistrict, selectedMonth, selectedYear, onDistrictClick }) => {
  const [hoveredDistrict, setHoveredDistrict] = useState(null);

  // Map district names to risk colors with opacity
  const getRiskColor = (riskLevel, isSelected = false, isHovered = false) => {
    let color;
    switch (riskLevel) {
      case 'High':
        color = '#ef4444'; // red-500
        break;
      case 'Low':
        color = '#3b82f6'; // blue-500
        break;
      case 'Normal':
        color = '#22c55e'; // green-500
        break;
      default:
        color = '#9ca3af'; // gray-400
    }
    
    // Add opacity for non-selected districts
    if (isSelected) return color;
    if (isHovered) return color;
    return color + 'CC'; // Add transparency
  };

  // Create district map for quick lookup
  const districtMap = {};
  if (districts && Array.isArray(districts)) {
    districts.forEach(d => {
      districtMap[d.district] = d;
    });
  }

  const getDistrictColor = (districtName) => {
    const district = districtMap[districtName];
    const isSelected = districtName === selectedDistrict;
    const isHovered = districtName === hoveredDistrict;
    return district ? getRiskColor(district.riskLevel, isSelected, isHovered) : '#e5e7eb';
  };

  const getDistrictData = (districtName) => {
    return districtMap[districtName] || null;
  };

  return (
    <div className="card p-6 lg:p-8 h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
          <MapPin className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h3 className="text-xl font-display font-bold text-gray-900">
            Kerala Rainfall Map
          </h3>
          {selectedMonth && selectedYear && (
            <p className="text-sm text-gray-500">
              {selectedMonth} {selectedYear}
            </p>
          )}
        </div>
      </div>

      <div className="relative bg-gray-50 rounded-lg p-4 mb-4">
        {/* Simplified Kerala Map SVG */}
        <svg
          viewBox="0 0 400 600"
          className="w-full h-auto"
          style={{ maxHeight: '500px' }}
        >
          {/* Kasaragod */}
          <g>
            <path
              d="M 200 50 L 250 60 L 280 80 L 270 100 L 240 90 L 210 70 Z"
              fill={getDistrictColor('Kasaragod')}
              stroke={selectedDistrict === 'Kasaragod' ? '#000' : '#fff'}
              strokeWidth={selectedDistrict === 'Kasaragod' ? '3' : '2'}
              className="cursor-pointer transition-all"
              onClick={() => onDistrictClick && onDistrictClick('Kasaragod')}
              onMouseEnter={() => setHoveredDistrict('Kasaragod')}
              onMouseLeave={() => setHoveredDistrict(null)}
            />
            <text 
              x="230" 
              y="80" 
              fontSize="9" 
              fill={selectedDistrict === 'Kasaragod' ? '#000' : '#374151'} 
              textAnchor="middle"
              fontWeight={selectedDistrict === 'Kasaragod' ? 'bold' : 'normal'}
            >
              {hoveredDistrict === 'Kasaragod' || selectedDistrict === 'Kasaragod' 
                ? getDistrictData('Kasaragod')?.predictedRainfall?.toFixed(1) + 'mm' 
                : 'Kasaragod'}
            </text>
          </g>

          {/* Helper function to render district */}
          {(['Kasaragod', 'Kannur', 'Wayanad', 'Kozhikode', 'Malappuram', 'Palakkad', 'Thrissur', 'Ernakulam', 'Idukki', 'Kottayam', 'Alappuzha', 'Pathanamthitta', 'Kollam', 'Thiruvananthapuram']).map((districtName, idx) => {
            const districtData = getDistrictData(districtName);
            const isSelected = districtName === selectedDistrict;
            const isHovered = districtName === hoveredDistrict;
            const showRainfall = isHovered || isSelected;
            
            // District coordinates (simplified positions)
            const coords = {
              'Kasaragod': { path: 'M 200 50 L 250 60 L 280 80 L 270 100 L 240 90 L 210 70 Z', text: { x: 230, y: 80 } },
              'Kannur': { path: 'M 180 80 L 220 90 L 250 110 L 240 130 L 210 120 L 190 100 Z', text: { x: 210, y: 110 } },
              'Wayanad': { path: 'M 200 140 L 240 150 L 260 170 L 250 190 L 220 180 L 200 160 Z', text: { x: 225, y: 170 } },
              'Kozhikode': { path: 'M 150 120 L 190 130 L 210 150 L 200 170 L 170 160 L 150 140 Z', text: { x: 175, y: 150 } },
              'Malappuram': { path: 'M 140 180 L 180 190 L 200 210 L 190 230 L 160 220 L 140 200 Z', text: { x: 170, y: 210 } },
              'Palakkad': { path: 'M 100 200 L 140 210 L 160 230 L 150 250 L 120 240 L 100 220 Z', text: { x: 130, y: 230 } },
              'Thrissur': { path: 'M 120 260 L 160 270 L 180 290 L 170 310 L 140 300 L 120 280 Z', text: { x: 150, y: 290 } },
              'Ernakulam': { path: 'M 140 320 L 180 330 L 200 350 L 190 370 L 160 360 L 140 340 Z', text: { x: 170, y: 350 } },
              'Idukki': { path: 'M 160 360 L 200 370 L 220 390 L 210 410 L 180 400 L 160 380 Z', text: { x: 190, y: 390 } },
              'Kottayam': { path: 'M 180 400 L 220 410 L 240 430 L 230 450 L 200 440 L 180 420 Z', text: { x: 210, y: 430 } },
              'Alappuzha': { path: 'M 120 380 L 160 390 L 180 410 L 170 430 L 140 420 L 120 400 Z', text: { x: 150, y: 410 } },
              'Pathanamthitta': { path: 'M 200 440 L 240 450 L 260 470 L 250 490 L 220 480 L 200 460 Z', text: { x: 230, y: 470 } },
              'Kollam': { path: 'M 180 480 L 220 490 L 240 510 L 230 530 L 200 520 L 180 500 Z', text: { x: 210, y: 510 } },
              'Thiruvananthapuram': { path: 'M 200 520 L 240 530 L 260 550 L 250 570 L 220 560 L 200 540 Z', text: { x: 230, y: 550 } }
            };
            
            const coord = coords[districtName];
            if (!coord) return null;
            
            return (
              <g key={districtName}>
                <path
                  d={coord.path}
                  fill={getDistrictColor(districtName)}
                  stroke={isSelected ? '#000' : '#fff'}
                  strokeWidth={isSelected ? '3' : '2'}
                  className="cursor-pointer transition-all"
                  onClick={() => onDistrictClick && onDistrictClick(districtName)}
                  onMouseEnter={() => setHoveredDistrict(districtName)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                />
                <text 
                  x={coord.text.x} 
                  y={coord.text.y} 
                  fontSize={showRainfall ? "8" : "9"} 
                  fill={isSelected ? '#000' : '#374151'} 
                  textAnchor="middle"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  className="pointer-events-none"
                >
                  {showRainfall && districtData?.predictedRainfall 
                    ? `${districtData.predictedRainfall.toFixed(1)}mm` 
                    : districtName === 'Thiruvananthapuram' ? 'TVM' : districtName}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend and Info */}
      <div className="space-y-4">
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-error-500"></div>
            <span className="font-medium">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success-500"></div>
            <span className="font-medium">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-info-500"></div>
            <span className="font-medium">Low Risk</span>
          </div>
        </div>
        
        {hoveredDistrict && getDistrictData(hoveredDistrict) && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2 mb-1">
              <Droplet className="w-4 h-4 text-primary-600" />
              <span className="font-semibold text-gray-900">{hoveredDistrict}</span>
            </div>
            <div className="text-gray-700">
              <p>Rainfall: <span className="font-bold">{getDistrictData(hoveredDistrict).predictedRainfall.toFixed(2)} mm</span></p>
              <p>Risk: <span className="font-semibold">{getDistrictData(hoveredDistrict).riskLevel}</span></p>
            </div>
          </div>
        )}
        
        <p className="text-xs text-gray-500 text-center">
          Click on any district to view detailed forecast
        </p>
      </div>
    </div>
  );
};

export default KeralaMap;

