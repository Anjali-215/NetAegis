import requests
import time
import json
from datetime import datetime

def identify_request_source():
    """Identify what's making the continuous requests"""
    
    print("🔍 Identifying request source...")
    print("=" * 50)
    
    # Test the blocked endpoint to see what data is being sent
    url = "http://localhost:8000/predict"
    
    try:
        # Make a test request to see what the blocked endpoint returns
        response = requests.post(url, json={"test": "data"})
        print(f"Blocked endpoint response: {response.status_code}")
        print(f"Response: {response.text}")
        
        print("\n📋 Next steps to identify the source:")
        print("1. Close all browser tabs with your frontend")
        print("2. Check if React dev server is running")
        print("3. Look for any components making automatic API calls")
        print("4. Check browser developer tools for network requests")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    identify_request_source() 