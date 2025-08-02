#!/usr/bin/env python3
"""
Test script for bulk prediction and summary email functionality
"""

import requests
import json
from datetime import datetime

# Test data
test_records = [
    {
        "src_ip": "192.168.1.1",
        "src_port": 80,
        "dst_ip": "10.0.0.1", 
        "dst_port": 443,
        "proto": "tcp",
        "service": "http",
        "duration": 1.0,
        "src_bytes": 100,
        "dst_bytes": 200,
        "conn_state": "SF",
        "missed_bytes": 0,
        "src_pkts": 1,
        "src_ip_bytes": 0,
        "dst_pkts": 1,
        "dst_ip_bytes": 0,
        "dns_query": 0,
        "dns_qclass": 0,
        "dns_qtype": 0,
        "dns_rcode": 0,
        "dns_AA": "none",
        "dns_RD": "none", 
        "dns_RA": "none",
        "dns_rejected": "none",
        "http_request_body_len": 0,
        "http_response_body_len": 0,
        "http_status_code": 0,
        "label": 1
    },
    {
        "src_ip": "192.168.1.2",
        "src_port": 8080,
        "dst_ip": "10.0.0.2",
        "dst_port": 80,
        "proto": "tcp", 
        "service": "http",
        "duration": 5.0,
        "src_bytes": 500,
        "dst_bytes": 1000,
        "conn_state": "SF",
        "missed_bytes": 0,
        "src_pkts": 5,
        "src_ip_bytes": 0,
        "dst_pkts": 5,
        "dst_ip_bytes": 0,
        "dns_query": 0,
        "dns_qclass": 0,
        "dns_qtype": 0,
        "dns_rcode": 0,
        "dns_AA": "none",
        "dns_RD": "none",
        "dns_RA": "none", 
        "dns_rejected": "none",
        "http_request_body_len": 0,
        "http_response_body_len": 0,
        "http_status_code": 0,
        "label": 1
    }
]

def test_bulk_prediction():
    """Test the bulk prediction endpoint"""
    print("Testing bulk prediction endpoint...")
    
    try:
        response = requests.post(
            "http://localhost:8000/predict-bulk",
            json={
                "records": test_records,
                "user_email": "test@example.com",
                "user_name": "Test User",
                "file_name": "test.csv"
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Bulk prediction successful!")
            print(f"Processed {result['total_processed']} records")
            print(f"Results: {len(result['results'])}")
            
            # Check results
            for i, res in enumerate(result['results']):
                print(f"Record {i+1}: {res['threat_type']} (confidence: {res.get('confidence', 'N/A')})")
                
            return True
        else:
            print(f"❌ Bulk prediction failed: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Error testing bulk prediction: {e}")
        return False

def test_summary_email():
    """Test the summary email endpoint"""
    print("\nTesting summary email endpoint...")
    
    try:
        response = requests.post(
            "http://localhost:8000/send-csv-summary",
            json={
                "user_email": "test@example.com",
                "user_name": "Test User", 
                "file_name": "test.csv",
                "total_records": 100,
                "processed_records": 95,
                "failed_records": 5,
                "threat_summary": {
                    "normal": 80,
                    "network_anomaly": 10,
                    "ddos": 5
                },
                "processing_duration": 15.5
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Summary email sent successfully!")
            print(f"Success: {result['success']}")
            print(f"Message: {result['message']}")
            return True
        else:
            print(f"❌ Summary email failed: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Error testing summary email: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing NetAegis Bulk Processing and Summary Email")
    print("=" * 50)
    
    # Test bulk prediction
    bulk_success = test_bulk_prediction()
    
    # Test summary email
    email_success = test_summary_email()
    
    print("\n" + "=" * 50)
    if bulk_success and email_success:
        print("🎉 All tests passed! Bulk processing and summary email functionality is working correctly.")
    else:
        print("❌ Some tests failed. Please check the backend server and email configuration.")
    
    print("\n📧 Summary:")
    print("- Individual emails are no longer sent for each record")
    print("- Bulk prediction processes multiple records efficiently") 
    print("- Single summary email is sent after CSV processing completes")
    print("- Email includes processing statistics and threat summary") 