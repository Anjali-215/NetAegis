from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def get_database() -> AsyncIOMotorClient:
    return db.client[settings.database_name]

async def connect_to_mongo():
    try:
        # Enhanced MongoDB connection with better timeout and SSL settings
        connection_string = settings.mongodb_url
        
        # Add connection options to handle timeouts and SSL issues
        connection_options = {
            "serverSelectionTimeoutMS": 30000,  # 30 seconds
            "connectTimeoutMS": 30000,          # 30 seconds
            "socketTimeoutMS": 30000,           # 30 seconds
            "maxPoolSize": 10,                  # Connection pool size
            "retryWrites": True,                # Enable retry writes
            "retryReads": True,                 # Enable retry reads
        }
        
        logger.info("Connecting to MongoDB Atlas...")
        db.client = AsyncIOMotorClient(connection_string, **connection_options)
        
        # Test the connection
        await db.client.admin.command('ping')
        logger.info("✅ Successfully connected to MongoDB Atlas!")
        
    except Exception as e:
        logger.error(f"❌ Failed to connect to MongoDB: {str(e)}")
        raise e

async def close_mongo_connection():
    if db.client:
        db.client.close()
        logger.info("Disconnected from MongoDB!") 