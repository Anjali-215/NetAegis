import pandas as pd
import os

# Change to ML directory
os.chdir('Ml')

print("🔍 Checking Training Data Files")
print("=" * 50)

# Check cleaned_network_data.csv
print("\n📁 File: cleaned_network_data.csv")
try:
    df1 = pd.read_csv('cleaned_network_data.csv')
    print(f"   Shape: {df1.shape}")
    print(f"   Label distribution:")
    print(df1['label'].value_counts())
    print(f"   Sample labels: {df1['label'].unique()[:10]}")
except Exception as e:
    print(f"   Error: {e}")

# Check train_test_network.csv
print("\n📁 File: train_test_network.csv")
try:
    df2 = pd.read_csv('train_test_network.csv')
    print(f"   Shape: {df2.shape}")
    print(f"   Label distribution:")
    print(df2['label'].value_counts())
    print(f"   Sample labels: {df2['label'].unique()[:10]}")
    
    # Check if this has the 10-class labels
    has_ddos = 'ddos' in df2['label'].values
    has_dos = 'dos' in df2['label'].values
    
    print(f"\n🎯 Has 'ddos' label: {has_ddos}")
    print(f"🎯 Has 'dos' label: {has_dos}")
    
    if has_ddos and has_dos:
        print("\n✅ This file has the 10-class labels!")
        
        # Get DDoS and DoS samples
        ddos_samples = df2[df2['label'] == 'ddos']
        dos_samples = df2[df2['label'] == 'dos']
        
        print(f"\n🔴 DDoS samples: {len(ddos_samples)}")
        print(f"🔵 DoS samples: {len(dos_samples)}")
        
        if len(ddos_samples) > 0:
            print("\n🔴 First DDoS sample:")
            first_ddos = ddos_samples.iloc[0]
            features = ['src_pkts', 'dst_pkts', 'src_bytes', 'dst_bytes', 'duration', 'conn_state', 'service', 'proto']
            for feature in features:
                if feature in first_ddos.index:
                    print(f"   {feature}: {first_ddos[feature]}")
            
            # Create better DDoS JSON
            print("\n🎯 PROPER DDOS JSON (from 10-class training data):")
            
            ddos_json = {
                "src_ip": "10.0.0.100",
                "src_port": int(first_ddos.get('src_port', 80)),
                "dst_ip": "192.168.1.200",
                "dst_port": int(first_ddos.get('dst_port', 80)),
                "proto": str(first_ddos.get('proto', 'tcp')),
                "service": str(first_ddos.get('service', 'http')),
                "duration": float(first_ddos.get('duration', 0.001)),
                "src_bytes": int(first_ddos.get('src_bytes', 40)),
                "dst_bytes": int(first_ddos.get('dst_bytes', 0)),
                "conn_state": str(first_ddos.get('conn_state', 'S0')),
                "missed_bytes": int(first_ddos.get('missed_bytes', 0)),
                "src_pkts": int(first_ddos.get('src_pkts', 50000)),
                "src_ip_bytes": int(first_ddos.get('src_ip_bytes', 2000000)),
                "dst_pkts": int(first_ddos.get('dst_pkts', 0)),
                "dst_ip_bytes": int(first_ddos.get('dst_ip_bytes', 0)),
                "dns_query": int(first_ddos.get('dns_query', 0)),
                "dns_qclass": int(first_ddos.get('dns_qclass', 0)),
                "dns_qtype": int(first_ddos.get('dns_qtype', 0)),
                "dns_rcode": int(first_ddos.get('dns_rcode', 0)),
                "dns_AA": str(first_ddos.get('dns_AA', 'none')),
                "dns_RD": str(first_ddos.get('dns_RD', 'none')),
                "dns_RA": str(first_ddos.get('dns_RA', 'none')),
                "dns_rejected": str(first_ddos.get('dns_rejected', 'none')),
                "http_request_body_len": int(first_ddos.get('http_request_body_len', 0)),
                "http_response_body_len": int(first_ddos.get('http_response_body_len', 0)),
                "http_status_code": int(first_ddos.get('http_status_code', 0)),
                "label": 1
            }
            
            import json
            print(json.dumps(ddos_json, indent=2))
        
        if len(dos_samples) > 0:
            print("\n🔵 First DoS sample:")
            first_dos = dos_samples.iloc[0]
            for feature in features:
                if feature in first_dos.index:
                    print(f"   {feature}: {first_dos[feature]}")
    
except Exception as e:
    print(f"   Error: {e}")

print("\n💡 Summary:")
print("We need to use the file with 10-class labels for proper DDoS vs DoS distinction!") 