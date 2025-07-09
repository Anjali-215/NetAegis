import pandas as pd
import numpy as np

def analyze_threat_patterns():
    """Analyze DDoS vs DoS patterns in training data"""
    
    print("🔍 Analyzing DDoS vs DoS patterns in training data")
    print("=" * 60)
    
    # Load the training data
    try:
        df = pd.read_csv('cleaned_network_data.csv')
        print(f"✅ Loaded {len(df)} rows of training data")
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return
    
    # Check unique labels
    print(f"\n📊 Label distribution:")
    label_counts = df['label'].value_counts()
    print(label_counts)
    
    # Check if DDoS and DoS exist
    has_ddos = 'ddos' in df['label'].values
    has_dos = 'dos' in df['label'].values
    
    print(f"\n🎯 DDoS exists: {has_ddos}")
    print(f"🎯 DoS exists: {has_dos}")
    
    if not has_ddos or not has_dos:
        print("\n⚠️  Missing DDoS or DoS labels in training data!")
        return
    
    # Get samples
    ddos_samples = df[df['label'] == 'ddos'].head(5)
    dos_samples = df[df['label'] == 'dos'].head(5)
    
    print(f"\n🔴 DDoS samples ({len(df[df['label'] == 'ddos'])} total):")
    key_features = ['src_pkts', 'dst_pkts', 'src_bytes', 'dst_bytes', 'duration', 'conn_state', 'service', 'proto']
    if not ddos_samples.empty:
        print(ddos_samples[key_features].to_string())
    
    print(f"\n🔵 DoS samples ({len(df[df['label'] == 'dos'])} total):")
    if not dos_samples.empty:
        print(dos_samples[key_features].to_string())
    
    # Statistical comparison
    if not ddos_samples.empty and not dos_samples.empty:
        print(f"\n📈 Statistical Comparison:")
        
        numeric_cols = ['src_pkts', 'dst_pkts', 'src_bytes', 'dst_bytes', 'duration', 'src_ip_bytes', 'dst_ip_bytes']
        
        ddos_stats = df[df['label'] == 'ddos'][numeric_cols].mean()
        dos_stats = df[df['label'] == 'dos'][numeric_cols].mean()
        
        print(f"\n🔴 DDoS averages:")
        for col in numeric_cols:
            if col in ddos_stats:
                print(f"   {col}: {ddos_stats[col]:,.2f}")
        
        print(f"\n🔵 DoS averages:")
        for col in numeric_cols:
            if col in dos_stats:
                print(f"   {col}: {dos_stats[col]:,.2f}")
        
        # Key differences
        print(f"\n🔍 Key differences (DDoS vs DoS):")
        for col in numeric_cols:
            if col in ddos_stats and col in dos_stats:
                diff = ddos_stats[col] - dos_stats[col]
                ratio = ddos_stats[col] / dos_stats[col] if dos_stats[col] != 0 else float('inf')
                print(f"   {col}: {diff:+,.2f} (ratio: {ratio:.2f}x)")

def create_better_ddos_json():
    """Create a better DDoS JSON based on training data analysis"""
    
    print(f"\n🎯 Recommended DDoS JSON based on training data:")
    
    # Try to load and analyze the data
    try:
        df = pd.read_csv('cleaned_network_data.csv')
        ddos_data = df[df['label'] == 'ddos']
        
        if not ddos_data.empty:
            # Get typical DDoS characteristics
            typical_ddos = ddos_data.iloc[0]  # First DDoS sample
            
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
            
            print(json.dumps(ddos_json, indent=2))
        else:
            print("❌ No DDoS samples found in training data")
            
    except Exception as e:
        print(f"❌ Error creating DDoS JSON: {e}")

if __name__ == "__main__":
    import json
    analyze_threat_patterns()
    create_better_ddos_json() 