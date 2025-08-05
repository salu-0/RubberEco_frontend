# RubberEco Backend Setup & User Management

## Quick Start

### 1. Start the Backend Server

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already installed)
npm install

# Start the development server
npm run dev
```

The backend server will start on `http://localhost:5000`

### 2. Start the Frontend

```bash
# In a new terminal, navigate to the root directory
cd RubberEco

# Start the frontend development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Access Admin Dashboard

1. Open your browser and go to `http://localhost:5173`
2. Navigate to the Admin Dashboard
3. Go to "Manage Users" section
4. Click the "Refresh" button to fetch users from your MongoDB Register collection

## API Endpoints

The backend now provides the following user management endpoints:

### User Management APIs

- `GET /api/users/all` - Get all users from Register collection
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/:id` - Get specific user by ID
- `PUT /api/users/:id` - Update user information
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/role/:role` - Get users by role

### Health Check

- `GET /api/health` - Check server and database status

## Database Configuration

The backend is configured to connect to your MongoDB database:

- **Database Name**: RubberEco
- **Collection**: Register
- **Connection**: `mongodb://127.0.0.1:27017/RubberEco`

## Features in Admin Dashboard

### User Management Features:

1. **Real-time Data Fetching**: Fetches users from your MongoDB Register collection
2. **User Statistics**: Shows total users, verified users, users by role
3. **Search & Filter**: Search by name/email and filter by role
4. **User Actions**: View, Edit, Delete users
5. **Export Functionality**: Export user data to CSV
6. **Refresh Button**: Manually refresh user data
7. **Database Status**: Shows MongoDB connection status

### User Information Displayed:

- User avatar (auto-generated)
- Name and email
- Role (farmer, broker, field_officer, admin)
- Provider (email/google)
- Verification status
- Join date and last activity
- Action buttons for management

## Testing the Setup

1. **Check Backend Health**:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Test User API**:
   ```bash
   curl http://localhost:5000/api/users/all \
     -H "Authorization: Bearer dummy-token"
   ```

3. **Check Frontend**: 
   - Go to Admin Dashboard → Manage Users
   - Click "Refresh" button
   - Verify users from your Register collection are displayed

## Troubleshooting

### Backend Issues:
- Ensure MongoDB is running on your system
- Check if port 5000 is available
- Verify the MongoDB connection string in `.env`

### Frontend Issues:
- Ensure backend is running on port 5000
- Check browser console for any errors
- Verify the API calls are reaching the backend

### Database Issues:
- Confirm MongoDB is running: `mongosh`
- Check if RubberEco database exists
- Verify Register collection has data

## Sample Data Structure

Your Register collection should have documents like:
```json
{
  "_id": "ObjectId",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "role": "farmer",
  "isVerified": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Next Steps

1. Start both backend and frontend servers
2. Navigate to Admin Dashboard → Manage Users
3. Click "Refresh" to load your Register collection data
4. Test the user management features
5. Verify all functionality works as expected

The system now successfully connects to your MongoDB Register collection and displays the data in a beautiful, interactive admin dashboard!
