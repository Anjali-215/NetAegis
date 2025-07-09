import pandas as pd
import json
import os

# Change to ML directory
os.chdir('Ml')

# Load the training data
df = pd.read_csv('cleaned_network_data.csv')

print("🔍 Real DDoS vs DoS Analysis")
print("=" * 50)

# Check the 'type' column (not 'label')
print(f"Total rows: {len(df)}")
print(f"Columns: {df.columns.tolist()}")

if 'type' in df.columns:
    print("\n📊 Type Distribution:")
    type_counts = df['type'].value_counts()
    print(type_counts)
    
    # Get actual DDoS and DoS samples
    ddos_samples = df[df['type'] == 'ddos']
    dos_samples = df[df['type'] == 'dos']
    
    print(f"\n🔴 DDoS samples: {len(ddos_samples)}")
    print(f"🔵 DoS samples: {len(dos_samples)}")
    
    if len(ddos_samples) > 0:
        print("\n🔴 Real DDoS Sample Features:")
        ddos_sample = ddos_samples.iloc[0]
        
        # Show key distinguishing features
        key_features = ['src_pkts', 'dst_pkts', 'src_bytes', 'dst_bytes', 'duration', 'conn_state', 'service', 'proto']
        for feature in key_features:
            if feature in ddos_sample.index:
                print(f"   {feature}: {ddos_sample[feature]}")
        
        # Create real DDoS JSON
        print("\n🎯 REAL DDOS JSON (from actual training data):")
        
        # Handle NaN values safely
        def safe_convert(value, dtype, default):
            if pd.isna(value):
                return default
            try:
                return dtype(value)
            except:
                return default
        
        real_ddos_json = {
            "src_ip": "10.0.0.100",
            "src_port": safe_convert(ddos_sample.get('src_port'), int, 80),
            "dst_ip": "192.168.1.200",
            "dst_port": safe_convert(ddos_sample.get('dst_port'), int, 80),
            "proto": str(ddos_sample.get('proto', 'tcp')),
            "service": str(ddos_sample.get('service', 'http')),
            "duration": safe_convert(ddos_sample.get('duration'), float, 0.001),
            "src_bytes": safe_convert(ddos_sample.get('src_bytes'), int, 40),
            "dst_bytes": safe_convert(ddos_sample.get('dst_bytes'), int, 0),
            "conn_state": str(ddos_sample.get('conn_state', 'S0')),
            "missed_bytes": safe_convert(ddos_sample.get('missed_bytes'), int, 0),
            "src_pkts": safe_convert(ddos_sample.get('src_pkts'), int, 50000),
            "src_ip_bytes": safe_convert(ddos_sample.get('src_ip_bytes'), int, 2000000),
            "dst_pkts": safe_convert(ddos_sample.get('dst_pkts'), int, 0),
            "dst_ip_bytes": safe_convert(ddos_sample.get('dst_ip_bytes'), int, 0),
            "dns_query": safe_convert(ddos_sample.get('dns_query'), int, 0),
            "dns_qclass": safe_convert(ddos_sample.get('dns_qclass'), int, 0),
            "dns_qtype": safe_convert(ddos_sample.get('dns_qtype'), int, 0),
            "dns_rcode": safe_convert(ddos_sample.get('dns_rcode'), int, 0),
            "dns_AA": str(ddos_sample.get('dns_AA', 'none')),
            "dns_RD": str(ddos_sample.get('dns_RD', 'none')),
            "dns_RA": str(ddos_sample.get('dns_RA', 'none')),
            "dns_rejected": str(ddos_sample.get('dns_rejected', 'none')),
            "http_request_body_len": safe_convert(ddos_sample.get('http_request_body_len'), int, 0),
            "http_response_body_len": safe_convert(ddos_sample.get('http_response_body_len'), int, 0),
            "http_status_code": safe_convert(ddos_sample.get('http_status_code'), int, 0),
            "label": 1
        }
        
        print(json.dumps(real_ddos_json, indent=2))
        
        # Show the actual values for comparison
        print("\n🔍 Key DDoS characteristics from training data:")
        print(f"   src_pkts: {ddos_sample.get('src_pkts')}")
        print(f"   dst_pkts: {ddos_sample.get('dst_pkts')}")
        print(f"   src_bytes: {ddos_sample.get('src_bytes')}")
        print(f"   dst_bytes: {ddos_sample.get('dst_bytes')}")
        print(f"   duration: {ddos_sample.get('duration')}")
        print(f"   conn_state: {ddos_sample.get('conn_state')}")
        print(f"   service: {ddos_sample.get('service')}")
        print(f"   proto: {ddos_sample.get('proto')}")
    
    if len(dos_samples) > 0:
        print("\n🔵 Real DoS Sample Features:")
        dos_sample = dos_samples.iloc[0]
        
        for feature in key_features:
            if feature in dos_sample.index:
                print(f"   {feature}: {dos_sample[feature]}")
        
        print("\n🔍 Key DoS characteristics from training data:")
        print(f"   src_pkts: {dos_sample.get('src_pkts')}")
        print(f"   dst_pkts: {dos_sample.get('dst_pkts')}")
        print(f"   src_bytes: {dos_sample.get('src_bytes')}")
        print(f"   dst_bytes: {dos_sample.get('dst_bytes')}")
        print(f"   duration: {dos_sample.get('duration')}")
        print(f"   conn_state: {dos_sample.get('conn_state')}")
        print(f"   service: {dos_sample.get('service')}")
        print(f"   proto: {dos_sample.get('proto')}")
        
        # Compare DDoS vs DoS
        if len(ddos_samples) > 0:
            print(f"\n⚔️  DDoS vs DoS Comparison:")
            print(f"   DDoS avg src_pkts: {ddos_samples['src_pkts'].mean():.0f}")
            print(f"   DoS avg src_pkts: {dos_samples['src_pkts'].mean():.0f}")
            print(f"   DDoS avg duration: {ddos_samples['duration'].mean():.4f}")
            print(f"   DoS avg duration: {dos_samples['duration'].mean():.4f}")
            print(f"   DDoS avg src_bytes: {ddos_samples['src_bytes'].mean():.0f}")
            print(f"   DoS avg src_bytes: {dos_samples['src_bytes'].mean():.0f}")

else:
    print("\n❌ No 'type' column found! Only 'label' column exists.")
    print("This means the CSV file has been processed and only has binary labels.") 