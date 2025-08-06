#!/usr/bin/env python3
"""
Test MongoDB Atlas connection
"""

import asyncio
import motor.motor_asyncio
from config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_mongodb_connection():
    """Test MongoDB Atlas connection"""
    
    print("🔍 Testing MongoDB Atlas Connection")
    print("=" * 50)
    
    try:
        # Connection options to handle timeouts and SSL issues
        connection_options = {
            "serverSelectionTimeoutMS": 30000,  # 30 seconds
            "connectTimeoutMS": 30000,          # 30 seconds
            "socketTimeoutMS": 30000,           # 30 seconds
            "maxPoolSize": 10,                  # Connection pool size
            "retryWrites": True,                # Enable retry writes
            "retryReads": True,                 # Enable retry reads
        }
        
        print(f"Connection string: {settings.mongodb_url}")
        print(f"Database name: {settings.database_name}")
        
        print("\n🔄 Attempting to connect...")
        client = motor.motor_asyncio.AsyncIOMotorClient(
            settings.mongodb_url, 
            **connection_options
        )
        
        # Test the connection
        print("Testing connection with ping...")
        await client.admin.command('ping')
        print("✅ Connection successful!")
        
        # Test database access
        print("Testing database access...")
        db = client[settings.database_name]
        
        # List collections
        collections = await db.list_collection_names()
        print(f"✅ Database accessible! Collections: {collections}")
        
        # Test users collection
        if 'users' in collections:
            user_count = await db.users.count_documents({})
            print(f"✅ Users collection accessible! User count: {user_count}")
        else:
            print("⚠️ Users collection not found")
        
        # Test password_reset_tokens collection
        if 'password_reset_tokens' in collections:
            token_count = await db.password_reset_tokens.count_documents({})
            print(f"✅ Password reset tokens collection accessible! Token count: {token_count}")
        else:
            print("⚠️ Password reset tokens collection not found")
        
        client.close()
        print("\n✅ All tests passed!")
        
    except Exception as e:
        print(f"\n❌ Connection failed: {str(e)}")
        print("\n🔧 Troubleshooting tips:")
        print("1. Check your internet connection")
        print("2. Verify MongoDB Atlas cluster is running")
        print("3. Check if your IP is whitelisted in Atlas")
        print("4. Verify username and password in connection string")
        print("5. Try increasing timeout values")
        
        # Try alternative connection options
        print("\n🔄 Trying alternative connection options...")
        try:
            # Try with minimal options
            alt_options = {
                "serverSelectionTimeoutMS": 60000,
                "connectTimeoutMS": 60000,
                "socketTimeoutMS": 60000,
            }
            
            client = motor.motor_asyncio.AsyncIOMotorClient(
                settings.mongodb_url, 
                **alt_options
            )
            
            await client.admin.command('ping')
            print("✅ Alternative connection successful!")
            client.close()
            
        except Exception as alt_error:
            print(f"❌ Alternative connection also failed: {str(alt_error)}")

if __name__ == "__main__":
    asyncio.run(test_mongodb_connection()) 