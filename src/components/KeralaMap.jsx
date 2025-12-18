import React from 'react';

const KeralaMap = ({ districts, onDistrictClick }) => {
  // Map district names to risk colors
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High':
        return '#ef4444'; // red-500
      case 'Low':
        return '#3b82f6'; // blue-500
      case 'Normal':
        return '#22c55e'; // green-500
      default:
        return '#9ca3af'; // gray-400
    }
  };

  // Create district map for quick lookup
  const districtMap = {};
  if (districts && Array.isArray(districts)) {
    districts.forEach(d => {
      districtMap[d.district] = d;
    });
  }

  // Simplified Kerala map SVG with district paths
  // This is a basic representation - you can replace with a more accurate SVG
  const getDistrictColor = (districtName) => {
    const district = districtMap[districtName];
    return district ? getRiskColor(district.riskLevel) : '#e5e7eb';
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Kerala District-wise Rainfall Risk</h3>
      <div className="relative">
        {/* Simplified Kerala Map SVG */}
        <svg
          viewBox="0 0 400 600"
          className="w-full h-auto"
          style={{ maxHeight: '500px' }}
        >
          {/* Kasaragod */}
          <path
            d="M 200 50 L 250 60 L 280 80 L 270 100 L 240 90 L 210 70 Z"
            fill={getDistrictColor('Kasaragod')}
            stroke="#fff"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onDistrictClick && onDistrictClick('Kasaragod')}
          />
          <text x="230" y="80" fontSize="10" fill="#000" textAnchor="middle">Kasaragod</text>

          {/* Kannur */}
          <path
            d="M 180 80 L 220 90 L 250 110 L 240 130 L 210 120 L 190 100 Z"
            fill={getDistrictColor('Kannur')}
            stroke="#fff"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onDistrictClick && onDistrictClick('Kannur')}
          />
          <text x="210" y="110" fontSize="10" fill="#000" textAnchor="middle">Kannur</text>

          {/* Wayanad */}
          <path
            d="M 200 140 L 240 150 L 260 170 L 250 190 L 220 180 L 200 160 Z"
            fill={getDistrictColor('Wayanad')}
            stroke="#fff"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onDistrictClick && onDistrictClick('Wayanad')}
          />
          <text x="225" y="170" fontSize="10" fill="#000" textAnchor="middle">Wayanad</text>

          {/* Kozhikode */}
          <path
            d="M 150 120 L 190 130 L 210 150 L 200 170 L 170 160 L 150 140 Z"
            fill={getDistrictColor('Kozhikode')}
            stroke="#fff"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onDistrictClick && onDistrictClick('Kozhikode')}
          />
          <text x="175" y="150" fontSize="10" fill="#000" textAnchor="middle">Kozhikode</text>

          {/* Malappuram */}
          <path
            d="M 140 180 L 180 190 L 200 210 L 190 230 L 160 220 L 140 200 Z"
            fill={getDistrictColor('Malappuram')}
            stroke="#fff"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onDistrictClick && onDistrictClick('Malappuram')}
          />
          <text x="170" y="210" fontSize="10" fill="#000" textAnchor="middle">Malappuram</text>

          {/* Palakkad */}
          <path
            d="M 100 200 L 140 210 L 160 230 L 150 250 L 120 240 L 100 220 Z"
            fill={getDistrictColor('Palakkad')}
            stroke="#fff"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onDistrictClick && onDistrictClick('Palakkad')}
          />
          <text x="130" y="230" fontSize="10" fill="#000" textAnchor="middle">Palakkad</text>

          {/* Thrissur */}
          <path
            d="M 120 260 L 160 270 L 180 290 L 170 310 L 140 300 L 120 280 Z"
            fill={getDistrictColor('Thrissur')}
            stroke="#fff"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onDistrictClick && onDistrictClick('Thrissur')}
          />
          <text x="150" y="290" fontSize="10" fill="#000" textAnchor="middle">Thrissur</text>

          {/* Ernakulam */}
          <path
            d="M 140 320 L 180 330 L 200 350 L 190 370 L 160 360 L 140 340 Z"
            fill={getDistrictColor('Ernakulam')}
            stroke="#fff"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onDistrictClick && onDistrictClick('Ernakulam')}
          />
          <text x="170" y="350" fontSize="10" fill="#000" textAnchor="middle">Ernakulam</text>

          {/* Idukki */}
          <path
            d="M 160 360 L 200 370 L 220 390 L 210 410 L 180 400 L 160 380 Z"
            fill={getDistrictColor('Idukki')}
            stroke="#fff"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onDistrictClick && onDistrictClick('Idukki')}
          />
          <text x="190" y="390" fontSize="10" fill="#000" textAnchor="middle">Idukki</text>

          {/* Kottayam */}
          <path
            d="M 180 400 L 220 410 L 240 430 L 230 450 L 200 440 L 180 420 Z"
            fill={getDistrictColor('Kottayam')}
            stroke="#fff"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onDistrictClick && onDistrictClick('Kottayam')}
          />
          <text x="210" y="430" fontSize="10" fill="#000" textAnchor="middle">Kottayam</text>

          {/* Alappuzha */}
          <path
            d="M 120 380 L 160 390 L 180 410 L 170 430 L 140 420 L 120 400 Z"
            fill={getDistrictColor('Alappuzha')}
            stroke="#fff"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onDistrictClick && onDistrictClick('Alappuzha')}
          />
          <text x="150" y="410" fontSize="10" fill="#000" textAnchor="middle">Alappuzha</text>

          {/* Pathanamthitta */}
          <path
            d="M 200 440 L 240 450 L 260 470 L 250 490 L 220 480 L 200 460 Z"
            fill={getDistrictColor('Pathanamthitta')}
            stroke="#fff"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onDistrictClick && onDistrictClick('Pathanamthitta')}
          />
          <text x="230" y="470" fontSize="10" fill="#000" textAnchor="middle">Pathanamthitta</text>

          {/* Kollam */}
          <path
            d="M 180 480 L 220 490 L 240 510 L 230 530 L 200 520 L 180 500 Z"
            fill={getDistrictColor('Kollam')}
            stroke="#fff"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onDistrictClick && onDistrictClick('Kollam')}
          />
          <text x="210" y="510" fontSize="10" fill="#000" textAnchor="middle">Kollam</text>

          {/* Thiruvananthapuram */}
          <path
            d="M 200 520 L 240 530 L 260 550 L 250 570 L 220 560 L 200 540 Z"
            fill={getDistrictColor('Thiruvananthapuram')}
            stroke="#fff"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onDistrictClick && onDistrictClick('Thiruvananthapuram')}
          />
          <text x="230" y="550" fontSize="10" fill="#000" textAnchor="middle">TVM</text>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span>High Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500"></div>
          <span>Low Risk</span>
        </div>
      </div>
    </div>
  );
};

export default KeralaMap;

