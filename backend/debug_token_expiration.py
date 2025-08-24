#!/usr/bin/env python3
"""
Debug script to test token expiration parsing logic
"""
import asyncio
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

async def debug_token_expiration():
    """Debug the token expiration parsing logic"""
    
    # Test different datetime formats that might be stored in MongoDB
    test_cases = [
        # Case 1: ISO format string with Z suffix
        "2024-01-01T12:00:00Z",
        
        # Case 2: ISO format string with timezone offset
        "2024-01-01T12:00:00+00:00",
        
        # Case 3: ISO format string without timezone (naive)
        "2024-01-01T12:00:00",
        
        # Case 4: RFC 3339 format
        "2024-01-01 12:00:00",
        
        # Case 5: Already a datetime object
        datetime.now(timezone.utc) + timedelta(hours=1),
        
        # Case 6: Naive datetime object
        datetime.now() + timedelta(hours=1),
        
        # Case 7: String with different format
        "2024-01-01T12:00:00.000Z",
    ]
    
    print("Testing datetime parsing logic...")
    print("=" * 50)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest Case {i}: {test_case} (type: {type(test_case)})")
        print("-" * 30)
        
        try:
            expires_at_raw = test_case
            
            # Handle different datetime formats
            if isinstance(expires_at_raw, str):
                # Handle ISO format strings
                try:
                    if expires_at_raw.endswith('Z'):
                        # UTC time with Z suffix
                        expires_at = datetime.fromisoformat(expires_at_raw.replace('Z', '+00:00'))
                        print(f"  ✓ Parsed Z-suffix string: {expires_at}")
                    elif '+' in expires_at_raw or expires_at_raw.endswith('UTC'):
                        # Timezone-aware string
                        expires_at = datetime.fromisoformat(expires_at_raw)
                        print(f"  ✓ Parsed timezone-aware string: {expires_at}")
                    else:
                        # Assume UTC if no timezone info
                        expires_at = datetime.fromisoformat(expires_at_raw + '+00:00')
                        print(f"  ✓ Parsed naive string + UTC: {expires_at}")
                except ValueError as parse_error:
                    print(f"  ✗ Failed to parse datetime string: {expires_at_raw}, error: {parse_error}")
                    # Try alternative parsing methods
                    try:
                        # Try parsing as RFC 3339 format
                        from email.utils import parsedate_to_datetime
                        expires_at = parsedate_to_datetime(expires_at_raw)
                        print(f"  ✓ Parsed with RFC 3339 parser: {expires_at}")
                    except Exception as e:
                        print(f"  ✗ RFC 3339 parsing also failed: {e}")
                        continue
            elif isinstance(expires_at_raw, datetime):
                # Already a datetime object
                expires_at = expires_at_raw
                # Ensure it's timezone-aware
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                    print(f"  ✓ Added timezone to naive datetime: {expires_at}")
                else:
                    print(f"  ✓ Already timezone-aware datetime: {expires_at}")
            else:
                print(f"  ✗ Unknown type: {type(expires_at_raw)}")
                continue
            
            # Test comparison
            current_time = datetime.now(timezone.utc)
            print(f"  Current time: {current_time}")
            print(f"  Expires at: {expires_at}")
            print(f"  Is expired: {current_time > expires_at}")
            
        except Exception as e:
            print(f"  ✗ Error processing test case: {e}")
            import traceback
            traceback.print_exc()

async def test_mongodb_connection():
    """Test MongoDB connection and check actual data format"""
    try:
        print("\n" + "=" * 50)
        print("Testing MongoDB connection...")
        
        # Connect to MongoDB
        client = AsyncIOMotorClient(settings.mongodb_url)
        db = client[settings.database_name]
        
        # Test connection
        await db.admin.command('ping')
        print("✓ MongoDB connection successful")
        
        # Check if password_reset_tokens collection exists and has data
        collection = db.get_collection("password_reset_tokens")
        count = await collection.count_documents({})
        print(f"✓ Found {count} password reset tokens")
        
        if count > 0:
            # Get a sample token to see the actual format
            sample_token = await collection.find_one({})
            print(f"Sample token data:")
            print(f"  Email: {sample_token.get('email')}")
            print(f"  Token: {sample_token.get('token')[:10]}...")
            print(f"  Expires at: {sample_token.get('expires_at')} (type: {type(sample_token.get('expires_at'))})")
            
            # Try to parse the expires_at field
            expires_at_raw = sample_token.get('expires_at')
            if expires_at_raw:
                print(f"\nTesting actual data parsing:")
                try:
                    if isinstance(expires_at_raw, str):
                        if expires_at_raw.endswith('Z'):
                            expires_at = datetime.fromisoformat(expires_at_raw.replace('Z', '+00:00'))
                        elif '+' in expires_at_raw:
                            expires_at = datetime.fromisoformat(expires_at_raw)
                        else:
                            expires_at = datetime.fromisoformat(expires_at_raw + '+00:00')
                        print(f"  ✓ Successfully parsed: {expires_at}")
                    elif isinstance(expires_at_raw, datetime):
                        expires_at = expires_at_raw
                        if expires_at.tzinfo is None:
                            expires_at = expires_at.replace(tzinfo=timezone.utc)
                        print(f"  ✓ Successfully processed datetime: {expires_at}")
                    else:
                        print(f"  ✗ Unknown type: {type(expires_at_raw)}")
                except Exception as e:
                    print(f"  ✗ Parsing failed: {e}")
        
        client.close()
        
    except Exception as e:
        print(f"✗ MongoDB connection failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("NetAegis Token Expiration Debug Script")
    print("=" * 50)
    
    # Run the tests
    asyncio.run(debug_token_expiration())
    asyncio.run(test_mongodb_connection())
    
    print("\n" + "=" * 50)
    print("Debug script completed!")
