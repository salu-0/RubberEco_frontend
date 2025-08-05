# Vite Environment Variables Setup

## Overview
This project uses Vite as the build tool, which has different environment variable handling compared to Create React App.

## Key Differences from Create React App

### Environment Variable Prefix
- **Create React App**: `REACT_APP_*`
- **Vite**: `VITE_*`

### Accessing Environment Variables
- **Create React App**: `process.env.REACT_APP_VARIABLE_NAME`
- **Vite**: `import.meta.env.VITE_VARIABLE_NAME`

## Current Environment Variables

### .env File
```bash
# Google Maps API Configuration
VITE_GOOGLE_MAPS_API_KEY=AIzaSyCvA2lvGyVElRvl-vlnBg23qMq9IsMY5cs

# Backend API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Other Environment Variables
VITE_APP_NAME=RubberEco
VITE_VERSION=1.0.0
```

## Usage in Code

### Correct (Vite)
```javascript
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

### Incorrect (Create React App style)
```javascript
const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY; // ❌ Will cause "process is not defined" error
```

## Important Notes

1. **Restart Required**: After changing environment variables, restart the development server
2. **Public Variables**: All `VITE_*` variables are exposed to the client-side code
3. **Security**: Never put sensitive data in `VITE_*` variables as they're publicly accessible
4. **Build Time**: Environment variables are replaced at build time, not runtime

## Troubleshooting

### "process is not defined" Error
This error occurs when trying to use `process.env` in a Vite project. Solution:
- Replace `process.env.REACT_APP_*` with `import.meta.env.VITE_*`
- Update environment variable names to use `VITE_` prefix

### Environment Variables Not Working
1. Check variable names start with `VITE_`
2. Restart development server after changes
3. Verify `.env` file is in project root
4. Check for typos in variable names

## Migration from Create React App
If migrating from Create React App:
1. Rename all `REACT_APP_*` variables to `VITE_*`
2. Replace all `process.env.REACT_APP_*` with `import.meta.env.VITE_*`
3. Update any build scripts or deployment configurations
