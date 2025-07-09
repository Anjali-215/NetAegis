import pandas as pd
import os

# Change to ML directory
os.chdir('Ml')

# Load the data
df = pd.read_csv('cleaned_network_data.csv')

print("🔍 Training Data Analysis")
print("=" * 50)
print(f"Total rows: {len(df)}")

# Check label distribution
print("\n📊 Label Distribution:")
label_counts = df['label'].value_counts()
print(label_counts)

# Check for DDoS and DoS
ddos_data = df[df['label'] == 'ddos']
dos_data = df[df['label'] == 'dos']

print(f"\n🎯 DDoS samples: {len(ddos_data)}")
print(f"🎯 DoS samples: {len(dos_data)}")

if len(ddos_data) > 0:
    print("\n🔴 First DDoS sample key features:")
    first_ddos = ddos_data.iloc[0]
    features = ['src_pkts', 'dst_pkts', 'src_bytes', 'dst_bytes', 'duration', 'conn_state', 'service', 'proto']
    for feature in features:
        print(f"   {feature}: {first_ddos[feature]}")
        
    print("\n🔴 DDoS averages:")
    numeric_cols = ['src_pkts', 'dst_pkts', 'src_bytes', 'dst_bytes', 'duration', 'src_ip_bytes', 'dst_ip_bytes']
    for col in numeric_cols:
        if col in ddos_data.columns:
            avg = ddos_data[col].mean()
            print(f"   {col}: {avg:,.2f}")

if len(dos_data) > 0:
    print("\n🔵 First DoS sample key features:")
    first_dos = dos_data.iloc[0]
    for feature in features:
        print(f"   {feature}: {first_dos[feature]}")
        
    print("\n🔵 DoS averages:")
    for col in numeric_cols:
        if col in dos_data.columns:
            avg = dos_data[col].mean()
            print(f"   {col}: {avg:,.2f}")

# Create a better DDoS JSON
if len(ddos_data) > 0:
    print("\n🎯 BETTER DDOS JSON (based on actual training data):")
    
    # Get a typical DDoS sample
    typical_ddos = ddos_data.iloc[0]
    
    ddos_json = {
        "src_ip": "10.0.0.100",
        "src_port": int(typical_ddos.get('src_port', 80)),
        "dst_ip": "192.168.1.200",
        "dst_port": int(typical_ddos.get('dst_port', 80)),
        "proto": str(typical_ddos.get('proto', 'tcp')),
        "service": str(typical_ddos.get('service', 'http')),
        "duration": float(typical_ddos.get('duration', 0.001)),
        "src_bytes": int(typical_ddos.get('src_bytes', 40)),
        "dst_bytes": int(typical_ddos.get('dst_bytes', 0)),
        "conn_state": str(typical_ddos.get('conn_state', 'S0')),
        "missed_bytes": int(typical_ddos.get('missed_bytes', 0)),
        "src_pkts": int(typical_ddos.get('src_pkts', 50000)),
        "src_ip_bytes": int(typical_ddos.get('src_ip_bytes', 2000000)),
        "dst_pkts": int(typical_ddos.get('dst_pkts', 0)),
        "dst_ip_bytes": int(typical_ddos.get('dst_ip_bytes', 0)),
        "dns_query": int(typical_ddos.get('dns_query', 0)),
        "dns_qclass": int(typical_ddos.get('dns_qclass', 0)),
        "dns_qtype": int(typical_ddos.get('dns_qtype', 0)),
        "dns_rcode": int(typical_ddos.get('dns_rcode', 0)),
        "dns_AA": str(typical_ddos.get('dns_AA', 'none')),
        "dns_RD": str(typical_ddos.get('dns_RD', 'none')),
        "dns_RA": str(typical_ddos.get('dns_RA', 'none')),
        "dns_rejected": str(typical_ddos.get('dns_rejected', 'none')),
        "http_request_body_len": int(typical_ddos.get('http_request_body_len', 0)),
        "http_response_body_len": int(typical_ddos.get('http_response_body_len', 0)),
        "http_status_code": int(typical_ddos.get('http_status_code', 0)),
        "label": 1
    }
    
    import json
    print(json.dumps(ddos_json, indent=2))
else:
    print("\n❌ No DDoS samples found in training data!") 