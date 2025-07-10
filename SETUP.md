# NetAegis - Complete Setup Guide

This guide will help you set up both the frontend and backend for the NetAegis network security platform.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Python** (3.8 or higher)
3. **MongoDB** (running locally or remotely)
4. **npm** or **yarn** (for frontend dependencies)

## Quick Start

### 1. Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create environment file:**
   Create a `.env` file in the backend directory:
   ```
   MONGODB_URL=mongodb://localhost:27017
   DATABASE_NAME=netaegis
   SECRET_KEY=your-secret-key-here-change-in-production
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system.

5. **Start the backend server:**
   ```bash
   # Option 1: Using the start script
   python ../start_backend.py
   
   # Option 2: Direct command
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The backend will be available at: http://localhost:8000
   API documentation: http://localhost:8000/docs

### 2. Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at: http://localhost:5173

## Testing the Setup

### 1. Register a New User

1. Go to http://localhost:5173/signup
2. Fill in the registration form:
   - Full Name: John Doe
   - Company Name: Tech Corp
   - Email: john@example.com
   - Password: password123
   - Confirm Password: password123
3. Click "Sign Up"
4. You should be redirected to the admin dashboard

### 2. Login with Existing User

1. Go to http://localhost:5173/login
2. Enter your credentials:
   - Email: john@example.com
   - Password: password123
3. Click "Login"
4. You should be redirected to the admin dashboard

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user info (requires authentication)

### Example API Calls

#### Register:
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "company": "Tech Corp",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Login:
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Features Implemented

### Backend
- ✅ FastAPI with async support
- ✅ MongoDB integration with Motor
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ CORS support for frontend
- ✅ Pydantic models for validation
- ✅ User registration and login
- ✅ Token-based authentication

### Frontend
- ✅ React with Vite
- ✅ User registration form
- ✅ User login form
- ✅ API service integration
- ✅ Token storage in localStorage
- ✅ Automatic redirect to admin dashboard
- ✅ Loading states and error handling

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Tokens**: Secure token-based authentication
- **CORS Protection**: Configured for frontend integration
- **Input Validation**: Pydantic models ensure data integrity
- **Environment Variables**: Sensitive data stored in .env files

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Make sure MongoDB is running
   - Check the MONGODB_URL in your .env file

2. **Port Already in Use:**
   - Change the port in the uvicorn command
   - Update the API_BASE_URL in frontend/src/services/api.js

3. **CORS Errors:**
   - Check that the frontend URL is in the CORS allow_origins list
   - Verify the frontend is running on the expected port

4. **Module Import Errors:**
   - Make sure all requirements are installed
   - Check that you're in the correct directory

### Getting Help

- Check the API documentation at http://localhost:8000/docs
- Review the console logs for error messages
- Ensure all dependencies are properly installed

## Next Steps

With the basic authentication system working, you can now:

1. Add more API endpoints for the admin features
2. Implement role-based access control
3. Add real-time features with WebSockets
4. Implement the threat detection system
5. Add file upload functionality for CSV files
6. Create data visualization endpoints

## Development

- Backend auto-reloads on code changes
- Frontend hot-reloads on code changes
- API documentation is automatically generated
- Use the interactive docs at http://localhost:8000/docs for testing 