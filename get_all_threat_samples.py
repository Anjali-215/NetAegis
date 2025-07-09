import pandas as pd
import json
import os

# Change to ML directory
os.chdir('Ml')

# Load the training data
df = pd.read_csv('cleaned_network_data.csv')

print("🎯 ALL 10 THREAT TYPE SAMPLES")
print("=" * 60)

# The 10 threat types from training data
threat_types = ['normal', 'scanning', 'ddos', 'injection', 'password', 'dos', 'backdoor', 'xss', 'ransomware', 'mitm']

def safe_convert(value, dtype, default):
    """Safely convert values, handle NaN and errors"""
    if pd.isna(value):
        return default
    try:
        return dtype(value)
    except:
        return default

def create_json_sample(sample_row, threat_name):
    """Convert a data row to JSON format"""
    return {
        "src_ip": "10.0.0.100",  # Use generic IP for testing
        "src_port": safe_convert(sample_row.get('src_port'), int, 80),
        "dst_ip": "192.168.1.200",  # Use generic IP for testing
        "dst_port": safe_convert(sample_row.get('dst_port'), int, 80),
        "proto": str(sample_row.get('proto', 'tcp')),
        "service": str(sample_row.get('service', '-')),
        "duration": safe_convert(sample_row.get('duration'), float, 0.001),
        "src_bytes": safe_convert(sample_row.get('src_bytes'), int, 0),
        "dst_bytes": safe_convert(sample_row.get('dst_bytes'), int, 0),
        "conn_state": str(sample_row.get('conn_state', 'SF')),
        "missed_bytes": safe_convert(sample_row.get('missed_bytes'), int, 0),
        "src_pkts": safe_convert(sample_row.get('src_pkts'), int, 1),
        "src_ip_bytes": safe_convert(sample_row.get('src_ip_bytes'), int, 0),
        "dst_pkts": safe_convert(sample_row.get('dst_pkts'), int, 0),
        "dst_ip_bytes": safe_convert(sample_row.get('dst_ip_bytes'), int, 0),
        "dns_query": safe_convert(sample_row.get('dns_query'), int, 0),
        "dns_qclass": safe_convert(sample_row.get('dns_qclass'), int, 0),
        "dns_qtype": safe_convert(sample_row.get('dns_qtype'), int, 0),
        "dns_rcode": safe_convert(sample_row.get('dns_rcode'), int, 0),
        "dns_AA": str(sample_row.get('dns_AA', 'none')),
        "dns_RD": str(sample_row.get('dns_RD', 'none')),
        "dns_RA": str(sample_row.get('dns_RA', 'none')),
        "dns_rejected": str(sample_row.get('dns_rejected', 'none')),
        "http_request_body_len": safe_convert(sample_row.get('http_request_body_len'), int, 0),
        "http_response_body_len": safe_convert(sample_row.get('http_response_body_len'), int, 0),
        "http_status_code": safe_convert(sample_row.get('http_status_code'), int, 0),
        "label": 1
    }

# Extract samples for each threat type
all_samples = {}

for threat_type in threat_types:
    samples = df[df['type'] == threat_type]
    
    if len(samples) > 0:
        # Get the first sample
        sample = samples.iloc[0]
        
        # Convert to JSON
        json_sample = create_json_sample(sample, threat_type)
        all_samples[threat_type] = json_sample
        
        print(f"\n🎯 {threat_type.upper()} ({len(samples)} samples)")
        print(f"Key characteristics:")
        print(f"   proto: {sample.get('proto')}")
        print(f"   service: {sample.get('service')}")
        print(f"   duration: {sample.get('duration')}")
        print(f"   src_bytes: {sample.get('src_bytes')}")
        print(f"   dst_bytes: {sample.get('dst_bytes')}")
        print(f"   src_pkts: {sample.get('src_pkts')}")
        print(f"   dst_pkts: {sample.get('dst_pkts')}")
        print(f"   conn_state: {sample.get('conn_state')}")
        
        print(f"\nJSON for {threat_type.upper()}:")
        print(json.dumps(json_sample, indent=2))
        print("-" * 40)
    else:
        print(f"❌ No samples found for {threat_type}")

print(f"\n📝 SUMMARY: Generated {len(all_samples)} threat samples")
print("Test each JSON above to verify the model detects the correct threat type!")

# Optional: Save all samples to a file
with open('../all_threat_samples.json', 'w') as f:
    json.dump(all_samples, f, indent=2)
    
print(f"\n💾 All samples saved to: all_threat_samples.json") 