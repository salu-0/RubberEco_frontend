# Google Maps API Setup for Market Finder

## Overview
The Market Finder feature on the homepage uses Google Maps to display rubber sheet selling markets with interactive maps and location services.

## Setup Instructions

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Configure API Key (Vite Project)
This project uses Vite, so environment variables must be prefixed with `VITE_`.

The API key is already configured in the `.env` file:
- `VITE_GOOGLE_MAPS_API_KEY=AIzaSyCvA2lvGyVElRvl-vlnBg23qMq9IsMY5cs`

The code automatically uses this environment variable:
```javascript
script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
```

### 3. Environment Variables (Configured)
✅ **API Key Configured**: The `.env` file has been created with your API key:
```
VITE_GOOGLE_MAPS_API_KEY=AIzaSyCvA2lvGyVElRvl-vlnBg23qMq9IsMY5cs
```

✅ **Code Updated**: The application is configured to use Vite environment variables:
```javascript
script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
```

**Note**: This project uses Vite, so environment variables must be prefixed with `VITE_` instead of `REACT_APP_`.

### 4. Features Included
- **Location Search**: Users can type their location
- **Current Location**: GPS-based location detection
- **Interactive Map**: Clickable markers with market details
- **Market Information**: Prices, ratings, contact details
- **Responsive Design**: Works on all devices

### 5. Sample Data
The component currently uses sample market data. In production, replace with:
- Real market data from your backend API
- Live price updates
- Real-time availability status

### 6. Customization Options
- **Market Types**: Government, Private, Cooperative
- **Price Display**: Real-time pricing
- **Rating System**: User reviews and ratings
- **Contact Integration**: Direct calling and directions
- **Filter Options**: By price, distance, rating

## Security Notes
- Always restrict API keys to specific domains
- Monitor API usage to avoid unexpected charges
- Consider implementing rate limiting
- Use environment variables for sensitive data

## Testing the Integration

### 1. Restart Development Server
After adding the API key, restart your development server:
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
# or
yarn start
```

### 2. Test the Market Finder
1. Navigate to the homepage
2. Scroll down to the "Find Rubber Sheet Markets" section
3. Type a location (e.g., "Kerala", "Kottayam", "Thrissur")
4. Click "Find Markets" or use "Use Current Location"
5. Verify that:
   - Markets appear in the list
   - Interactive map loads with markers
   - Clicking markers shows info windows
   - Filter and sort controls work
   - "Get Directions" and "Call Now" buttons function

### 3. Expected Behavior
✅ **With API Key**: Full interactive Google Maps with custom markers
✅ **Without API Key**: Fallback map view with market list
✅ **Mobile Responsive**: Works on all device sizes
✅ **Real-time Updates**: Instant filtering and sorting

## Troubleshooting
- **Map doesn't load**: Check API key and enabled services in Google Cloud Console
- **Location doesn't work**: Ensure HTTPS for geolocation (use localhost for development)
- **Markers don't show**: Verify coordinates format and API key permissions
- **Console errors**: Check browser developer tools for specific error messages
- **Blank map**: Verify billing is enabled in Google Cloud Console

## API Usage Notes
- **Development**: Free tier includes 28,000 map loads per month
- **Production**: Monitor usage and set up billing alerts
- **Rate Limits**: API has daily quotas and rate limits
- **Security**: Restrict API key to your domain in production
