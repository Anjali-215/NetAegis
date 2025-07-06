# Environment Setup for MongoDB Atlas

## Step 1: Create .env file

Create a file named `.env` in the `backend` directory with the following content:

```env
# MongoDB Atlas Connection String
# Replace <db_password> with your actual MongoDB Atlas password
MONGODB_URL=mongodb+srv://arunmp192000:<db_password>@netaegis.p12sfv3.mongodb.net/

# Database name
DATABASE_NAME=netaegis

# JWT Secret Key (change this in production)
SECRET_KEY=your-secret-key-here-change-in-production

# JWT Algorithm
ALGORITHM=HS256

# Token expiration time in minutes
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Step 2: Replace the placeholder

Replace `<db_password>` with your actual MongoDB Atlas password.

For example, if your password is `mypassword123`, your connection string should look like:
```
MONGODB_URL=mongodb+srv://arunmp192000:mypassword123@netaegis.p12sfv3.mongodb.net/
```

## Step 3: Security Note

- Never commit the `.env` file to version control
- Keep your database password secure
- Use a strong secret key in production

## Step 4: Test Connection

After setting up the `.env` file, start the backend server:

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see "Connected to MongoDB!" in the console if the connection is successful. 