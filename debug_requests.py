import requests
import time
import json
from datetime import datetime

def monitor_backend_requests():
    """Monitor backend requests to identify the source of continuous 422 errors"""
    
    print("🔍 Starting backend request monitor...")
    print("This will help identify what's causing the continuous 422 errors")
    print("=" * 60)
    
    # Test basic connectivity
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        print(f"✅ Backend is running - Health check: {response.status_code}")
    except Exception as e:
        print(f"❌ Backend not accessible: {e}")
        return
    
    # Monitor for a few minutes
    start_time = time.time()
    request_count = 0
    
    while time.time() - start_time < 120:  # Monitor for 2 minutes
        try:
            # Check if there are any active requests by looking at the logs
            # This is a simple way to detect if requests are being made
            response = requests.get("http://localhost:8000/health", timeout=1)
            
            if request_count % 10 == 0:  # Log every 10 seconds
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Backend is responding normally")
            
            request_count += 1
            time.sleep(1)
            
        except KeyboardInterrupt:
            print("\n🛑 Monitoring stopped by user")
            break
        except Exception as e:
            print(f"⚠️  Error during monitoring: {e}")
            time.sleep(1)
    
    print("\n📊 Monitoring Summary:")
    print(f"Total health checks: {request_count}")
    print(f"Monitoring duration: {time.time() - start_time:.1f} seconds")
    print("\n💡 If you're still seeing 422 errors in your backend logs,")
    print("   the issue might be coming from:")
    print("   1. Browser extensions or development tools")
    print("   2. Frontend components making automatic requests")
    print("   3. Other applications accessing the backend")
    print("   4. Network scanning tools")

if __name__ == "__main__":
    monitor_backend_requests() 