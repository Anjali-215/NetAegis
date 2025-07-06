# NetAegis Backend

A FastAPI-based backend for the NetAegis network security platform.

## Features

- User authentication with JWT tokens
- Password hashing with bcrypt
- MongoDB integration with Motor (async)
- CORS support for frontend integration
- Pydantic models for data validation

## Setup

### Prerequisites

1. Python 3.8+
2. MongoDB (running locally or remotely)
3. pip (Python package manager)

### Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   Create a `.env` file in the backend directory:
   ```
   MONGODB_URL=mongodb://localhost:27017
   DATABASE_NAME=netaegis
   SECRET_KEY=your-secret-key-here-change-in-production
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

3. **Start MongoDB:**
   Make sure MongoDB is running on your system.

### Running the Application

1. **Start the server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Access the API:**
   - API: http://localhost:8000
   - Interactive docs: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user info (requires authentication)

### Example Usage

#### Register a new user:
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

## Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── config.py            # Configuration settings
├── database.py          # MongoDB connection
├── requirements.txt     # Python dependencies
├── models/              # Pydantic models
│   └── user.py         # User-related models
├── services/            # Business logic
│   └── user_service.py # User operations
├── utils/               # Utility functions
│   └── auth.py         # Authentication utilities
└── api/                 # API routes
    └── auth.py         # Authentication endpoints
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS protection
- Input validation with Pydantic
- Environment variable configuration

## Development

The server runs with auto-reload enabled, so changes to the code will automatically restart the server. 