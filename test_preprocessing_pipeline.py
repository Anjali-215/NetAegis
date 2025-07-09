import pandas as pd
import numpy as np
import pickle
import requests
import json
from sklearn.preprocessing import LabelEncoder

def test_preprocessing_pipeline():
    """Test that backend preprocessing matches training exactly"""
    print("🔍 Testing Preprocessing Pipeline Consistency")
    print("=" * 60)
    
    # 1. Load training data and recreate training preprocessing
    print("\n1. Loading training data...")
    df = pd.read_csv("Ml/cleaned_network_data.csv")
    
    # 2. Replicate exact training preprocessing
    print("\n2. Replicating training preprocessing...")
    
    # Drop columns (same as training)
    columns_to_drop = ['Flow ID', 'Source IP', 'Destination IP', 'Timestamp']
    existing_columns_to_drop = [col for col in columns_to_drop if col in df.columns]
    df_training = df.drop(existing_columns_to_drop, axis=1)
    
    # Separate features
    X_training = df_training.drop('type', axis=1)
    y_training = df_training['type']
    
    # Convert object columns to category
    for col in X_training.select_dtypes(include='object').columns:
        X_training[col] = X_training[col].astype('category')
    
    # Apply LabelEncoder (exactly like training)
    encoders = {}
    for col in X_training.select_dtypes(include=['object', 'category']).columns:
        le_col = LabelEncoder()
        X_training[col] = le_col.fit_transform(X_training[col])
        encoders[col] = le_col
    
    print(f"   Training data shape: {X_training.shape}")
    print(f"   Training columns: {list(X_training.columns)}")
    print(f"   Encoders created for: {list(encoders.keys())}")
    
    # 3. Save encoders (like our check script did)
    print("\n3. Saving encoders...")
    with open("backend/feature_encoders.pkl", "wb") as f:
        pickle.dump(encoders, f)
    print("   ✅ Encoders saved to backend/feature_encoders.pkl")
    
    # 4. Test with sample data
    print("\n4. Testing with sample data...")
    
    # Get first normal sample from training data
    normal_sample = df[df['type'] == 'normal'].iloc[0]
    
    # Create JSON test data
    test_data = {
        "src_ip": str(normal_sample['src_ip']),
        "src_port": int(normal_sample['src_port']),
        "dst_ip": str(normal_sample['dst_ip']),
        "dst_port": int(normal_sample['dst_port']),
        "proto": str(normal_sample['proto']),
        "service": str(normal_sample['service']),
        "duration": float(normal_sample['duration']),
        "src_bytes": int(normal_sample['src_bytes']),
        "dst_bytes": int(normal_sample['dst_bytes']),
        "conn_state": str(normal_sample['conn_state']),
        "missed_bytes": int(normal_sample['missed_bytes']),
        "src_pkts": int(normal_sample['src_pkts']),
        "src_ip_bytes": int(normal_sample['src_ip_bytes']),
        "dst_pkts": int(normal_sample['dst_pkts']),
        "dst_ip_bytes": int(normal_sample['dst_ip_bytes']),
        "dns_query": str(normal_sample['dns_query']),
        "dns_qclass": int(normal_sample['dns_qclass']),
        "dns_qtype": int(normal_sample['dns_qtype']),
        "dns_rcode": int(normal_sample['dns_rcode']),
        "dns_AA": str(normal_sample['dns_AA']),
        "dns_RD": str(normal_sample['dns_RD']),
        "dns_RA": str(normal_sample['dns_RA']),
        "dns_rejected": str(normal_sample['dns_rejected']),
        "http_request_body_len": int(normal_sample['http_request_body_len']),
        "http_response_body_len": int(normal_sample['http_response_body_len']),
        "http_status_code": int(normal_sample['http_status_code']),
        "label": int(normal_sample['label'])
    }
    
    print("   Sample data created:")
    print(f"   - Type: {normal_sample['type']}")
    print(f"   - Proto: {test_data['proto']}")
    print(f"   - Service: {test_data['service']}")
    print(f"   - Conn_state: {test_data['conn_state']}")
    
    # 5. Test manual preprocessing (simulate backend)
    print("\n5. Testing manual preprocessing...")
    
    # Convert to DataFrame
    df_test = pd.DataFrame([test_data])
    
    # Drop columns
    if 'type' in df_test.columns:
        df_test = df_test.drop('type', axis=1)
    
    # Convert object to category
    for col in df_test.select_dtypes(include='object').columns:
        df_test[col] = df_test[col].astype('category')
    
    # Apply encoders
    for col in df_test.select_dtypes(include=['object', 'category']).columns:
        if col in encoders:
            encoder = encoders[col]
            value = df_test[col].iloc[0]
            
            if isinstance(value, (int, float)):
                value = str(value)
            elif value is None:
                value = "none"
            
            if value in encoder.classes_:
                df_test[col] = encoder.transform([value])[0]
            else:
                df_test[col] = 0
                print(f"   ⚠️  Unknown value '{value}' for column '{col}'")
    
    # Ensure correct column order
    expected_features = [
        'src_ip', 'src_port', 'dst_ip', 'dst_port', 'proto', 'service', 'duration', 'src_bytes', 'dst_bytes',
        'conn_state', 'missed_bytes', 'src_pkts', 'src_ip_bytes', 'dst_pkts', 'dst_ip_bytes', 'dns_query', 
        'dns_qclass', 'dns_qtype', 'dns_rcode', 'dns_AA', 'dns_RD', 'dns_RA', 'dns_rejected', 
        'http_request_body_len', 'http_response_body_len', 'http_status_code', 'label'
    ]
    
    for feature in expected_features:
        if feature not in df_test.columns:
            df_test[feature] = 0
    
    df_test = df_test[expected_features]
    
    print(f"   Manual preprocessing result:")
    print(f"   - Shape: {df_test.shape}")
    print(f"   - Proto encoded: {df_test['proto'].iloc[0]}")
    print(f"   - Service encoded: {df_test['service'].iloc[0]}")
    print(f"   - Conn_state encoded: {df_test['conn_state'].iloc[0]}")
    
    # 6. Compare with training sample
    print("\n6. Comparing with training sample...")
    
    # Get the same row from training (after preprocessing)
    training_row_idx = normal_sample.name
    if training_row_idx < len(X_training):
        training_encoded = X_training.iloc[training_row_idx]
        
        print("   Training vs Backend preprocessing:")
        for col in ['proto', 'service', 'conn_state']:
            if col in df_test.columns and col in training_encoded:
                training_val = training_encoded[col]
                backend_val = df_test[col].iloc[0]
                match = "✅" if training_val == backend_val else "❌"
                print(f"   {col}: Training={training_val}, Backend={backend_val} {match}")
    
    print("\n7. Testing API endpoint...")
    
    # Save test data for API call
    with open("test_normal_sample.json", "w") as f:
        json.dump(test_data, f, indent=2)
    
    print("   ✅ Test data saved to test_normal_sample.json")
    print("   📡 Ready to test API endpoint")
    print(f"   🎯 Expected result: 'normal' (not 'scanning')")
    
    return test_data

def test_api_with_samples():
    """Test the API with the processed samples"""
    print("\n🚀 Testing API with processed samples...")
    
    # Load test data
    with open("test_normal_sample.json", "r") as f:
        test_data = json.load(f)
    
    try:
        # Test API call
        response = requests.post("http://localhost:8000/predict", json=test_data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ API Response: {result['threat_type']}")
            print(f"   📊 Confidence: {result.get('confidence', 'N/A')}")
            
            if result['threat_type'] == 'normal':
                print("   🎉 SUCCESS: Normal traffic detected correctly!")
            else:
                print(f"   ❌ FAILED: Expected 'normal', got '{result['threat_type']}'")
        else:
            print(f"   ❌ API Error: {response.status_code}")
            print(f"   📝 Response: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Connection Error: {e}")
        print("   📝 Make sure backend is running on localhost:8000")

if __name__ == "__main__":
    print("🔧 NetAegis Preprocessing Pipeline Test")
    print("=" * 60)
    
    # Test preprocessing pipeline
    test_data = test_preprocessing_pipeline()
    
    # Test API
    print("\n" + "=" * 60)
    test_api_with_samples()
    
    print("\n🏁 Test complete!")
    print("   📋 If normal traffic shows as 'scanning', the preprocessing doesn't match training")
    print("   🎯 If normal traffic shows as 'normal', the preprocessing is correct!") 