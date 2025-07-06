import pandas as pd
import numpy as np

def analyze_data_patterns():
    """Analyze why most columns contain 0s and hyphens"""
    print("Loading dataset...")
    df = pd.read_csv('train_test_network.csv')
    
    print(f"\nDataset shape: {df.shape}")
    print(f"Total cells: {df.shape[0] * df.shape[1]:,}")
    
    # Analyze each column
    print("\n" + "="*80)
    print("COLUMN ANALYSIS - Understanding 0s and Hyphens")
    print("="*80)
    
    for col in df.columns:
        print(f"\n{col}:")
        
        # Count different values
        value_counts = df[col].value_counts().head(5)
        total_values = len(df[col])
        
        # Count zeros and hyphens
        zeros = (df[col] == 0).sum()
        hyphens = (df[col] == '-').sum()
        nulls = df[col].isnull().sum()
        
        print(f"  Total values: {total_values:,}")
        print(f"  Zeros: {zeros:,} ({zeros/total_values*100:.1f}%)")
        print(f"  Hyphens: {hyphens:,} ({hyphens/total_values*100:.1f}%)")
        print(f"  Nulls: {nulls:,} ({nulls/total_values*100:.1f}%)")
        
        # Show top 5 values
        print(f"  Top 5 values:")
        for val, count in value_counts.items():
            print(f"    '{val}': {count:,} ({count/total_values*100:.1f}%)")
        
        # Data type
        print(f"  Data type: {df[col].dtype}")
        
        # Unique values
        unique_count = df[col].nunique()
        print(f"  Unique values: {unique_count:,}")
        
        if unique_count <= 10:
            print(f"  All unique values: {sorted(df[col].unique())}")
        
        print("-" * 60)

def explain_network_data_structure():
    """Explain why network data has this structure"""
    print("\n" + "="*80)
    print("WHY NETWORK DATA HAS 0s AND HYPHENS")
    print("="*80)
    
    print("""
This is a network traffic dataset from a security monitoring tool (likely Zeek/Bro). 
The structure explains the 0s and hyphens:

1. **Protocol-Specific Fields**: 
   - DNS fields (dns_query, dns_qclass, etc.) are only populated for DNS traffic
   - SSL fields (ssl_version, ssl_cipher, etc.) are only populated for SSL/TLS traffic  
   - HTTP fields (http_method, http_uri, etc.) are only populated for HTTP traffic
   - For other protocols, these fields are set to '-' or 0

2. **Connection-Level Data**:
   - Each row represents a network connection
   - Basic fields (src_ip, dst_ip, proto, duration) are always populated
   - Protocol-specific fields are only relevant for that specific protocol

3. **Security Labels**:
   - 'label': Binary classification (0=normal, 1=attack)
   - 'type': Specific attack type (backdoor, normal, etc.)

4. **Sparse Data Pattern**:
   - Most connections use only a few protocols
   - Fields for unused protocols are set to default values
   - This creates a sparse matrix pattern common in network security data

5. **Data Collection Process**:
   - Network monitoring tools capture all traffic
   - Protocol analyzers extract relevant fields
   - Unused fields are filled with placeholders
""")

def show_protocol_distribution():
    """Show how different protocols populate different fields"""
    print("\n" + "="*80)
    print("PROTOCOL DISTRIBUTION AND FIELD POPULATION")
    print("="*80)
    
    df = pd.read_csv('train_test_network.csv')
    
    if 'proto' in df.columns:
        print("\nProtocol distribution:")
        proto_counts = df['proto'].value_counts()
        print(proto_counts)
        
        print(f"\nPercentage of each protocol:")
        for proto, count in proto_counts.items():
            print(f"  {proto}: {count:,} ({count/len(df)*100:.1f}%)")
        
        # Show how different protocols populate specific fields
        print(f"\nField population by protocol:")
        
        # Check DNS fields
        if 'dns_query' in df.columns:
            dns_protocols = df[df['dns_query'] != '-']['proto'].value_counts()
            print(f"\nDNS query field populated for:")
            for proto, count in dns_protocols.items():
                print(f"  {proto}: {count:,}")
        
        # Check SSL fields  
        if 'ssl_version' in df.columns:
            ssl_protocols = df[df['ssl_version'] != '-']['proto'].value_counts()
            print(f"\nSSL version field populated for:")
            for proto, count in ssl_protocols.items():
                print(f"  {proto}: {count:,}")
        
        # Check HTTP fields
        if 'http_method' in df.columns:
            http_protocols = df[df['http_method'] != '-']['proto'].value_counts()
            print(f"\nHTTP method field populated for:")
            for proto, count in http_protocols.items():
                print(f"  {proto}: {count:,}")

if __name__ == "__main__":
    analyze_data_patterns()
    explain_network_data_structure()
    show_protocol_distribution() 