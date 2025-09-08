# Clear Dummy Data Instructions

If you're still seeing dummy entries like "Green Valley Plantation" or "Riverside Farm" in the land registration system, follow these steps to clear them:

## Option 1: Run Database Cleanup Script

1. **Navigate to backend directory:**
   ```bash
   cd RubberEco/backend
   ```

2. **Run the cleanup script:**
   ```bash
   node scripts/clearDummyData.js
   ```

3. **Restart the backend server:**
   ```bash
   npm start
   ```

## Option 2: Manual Database Cleanup

If you have MongoDB Compass or mongo shell access:

1. **Connect to your MongoDB database** (usually `RubberEco`)

2. **Delete dummy land registrations:**
   ```javascript
   db.landregistrations.deleteMany({
     "landTitle": { $in: ["Green Valley Plantation", "Riverside Farm", "Highland Estate"] }
   })
   ```

3. **Delete dummy tenancy offerings:**
   ```javascript
   db.tenancyofferings.deleteMany({
     "landTitle": { $in: ["Green Valley Plantation", "Riverside Farm", "Highland Estate"] }
   })
   ```

## Option 3: Clear Browser Cache

Sometimes the issue is cached data in the browser:

1. **Clear browser cache and localStorage:**
   - Open Developer Tools (F12)
   - Go to Application/Storage tab
   - Clear localStorage and sessionStorage
   - Hard refresh the page (Ctrl+Shift+R)

2. **Or use incognito/private browsing mode** to test without cache

## Verification

After clearing the data:

1. **Check the browser console** for API response logs (added debugging)
2. **Use the refresh button** next to "My Registered Lands" tab
3. **Verify empty state** - should show "No Registered Lands" message

## What Was Removed

The cleanup removes all entries with these dummy titles:
- ✅ Green Valley Plantation
- ✅ Riverside Farm  
- ✅ Highland Estate
- ✅ Any entries with dummy IDs (LR001, LR002, LR003, etc.)

## Expected Result

After cleanup, the land registration system should:
- ✅ Show empty arrays for new users
- ✅ Load real data from API calls
- ✅ Display "No Registered Lands" when no data exists
- ✅ Only show actual user-created land registrations

## Troubleshooting

If dummy data still appears:
1. Check if there are multiple database instances
2. Verify the correct MongoDB connection string
3. Check if there's cached data in the frontend
4. Look for any remaining hardcoded data in components
