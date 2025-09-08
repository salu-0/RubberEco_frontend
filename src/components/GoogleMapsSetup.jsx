import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Copy, Check, AlertCircle, MapPin } from 'lucide-react';

const GoogleMapsSetup = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900">Enable Interactive Maps</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">Why Enable Interactive Maps?</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Interactive maps provide real-time directions, user location detection, and enhanced market discovery features.
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Google Cloud API Key</h3>
                <p className="text-gray-600 mb-3">
                  Visit the Google Cloud Console to create a new API key for Maps JavaScript API.
                </p>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <span>Open Google Cloud Console</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Enable Required APIs</h3>
                <p className="text-gray-600 mb-3">
                  Enable these APIs in your Google Cloud project:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 mb-3">
                  <li>Maps JavaScript API</li>
                  <li>Places API</li>
                  <li>Geocoding API (optional)</li>
                </ul>
                <a
                  href="https://console.cloud.google.com/apis/library"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <span>Enable APIs</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Update Environment File</h3>
                <p className="text-gray-600 mb-3">
                  Add your API key to the .env file in your project root:
                </p>
                <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800">VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</span>
                    <button
                      onClick={() => copyToClipboard('VITE_GOOGLE_MAPS_API_KEY=your_api_key_here')}
                      className="ml-2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Restart Development Server</h3>
                <p className="text-gray-600 mb-3">
                  After updating the .env file, restart your development server:
                </p>
                <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800">npm run dev</span>
                    <button
                      onClick={() => copyToClipboard('npm run dev')}
                      className="ml-2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-900 mb-2">What You'll Get</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Real-time user location detection</li>
              <li>• Interactive map with custom markers</li>
              <li>• Turn-by-turn directions to markets</li>
              <li>• Distance calculations and route planning</li>
              <li>• Enhanced search and filtering</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
            <a
              href="https://developers.google.com/maps/documentation/javascript/get-api-key"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <span>View Documentation</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GoogleMapsSetup;
