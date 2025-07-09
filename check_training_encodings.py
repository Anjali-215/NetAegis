import pandas as pd
from sklearn.preprocessing import LabelEncoder
import pickle
import os

print("🔍 Checking Training Data Encodings")
print("=" * 50)

# Load training data
df = pd.read_csv("Ml/cleaned_network_data.csv")

# Drop unnecessary columns (same as training)
columns_to_drop = ['Flow ID', 'Source IP', 'Destination IP', 'Timestamp']
existing_columns_to_drop = [col for col in columns_to_drop if col in df.columns]
df = df.drop(existing_columns_to_drop, axis=1)

# Prepare features
X = df.drop('type', axis=1)
y = df['type']

print("📊 Original data types:")
for col in X.select_dtypes(include=['object']).columns:
    unique_vals = sorted(X[col].unique())
    print(f"   {col}: {unique_vals}")

print("\n🔤 LabelEncoder mappings (what training uses):")

# Convert object columns to category (like training)
for col in X.select_dtypes(include='object').columns:
    X[col] = X[col].astype('category')

# Apply LabelEncoder (like training) and show mappings
encoders = {}
for col in X.select_dtypes(include=['object', 'category']).columns:
    le_col = LabelEncoder()
    X[col] = le_col.fit_transform(X[col])
    encoders[col] = le_col
    
    # Show the mapping
    print(f"\n   {col}:")
    for i, class_name in enumerate(le_col.classes_):
        print(f"      '{class_name}' -> {i}")

print("\n🔧 Backend hardcoded mappings (current):")
print("   proto_mapping = {'tcp': 0, 'udp': 1, 'icmp': 2}")
print("   service_mapping = {'-': 0, 'http': 1, 'dns': 2, 'ssl': 3, 'ftp': 4}")
print("   conn_state_mapping = {'SF': 0, 'S0': 1, 'REJ': 2, 'RSTR': 3, 'RSTO': 4, 'S1': 5}")

print(f"\n🎯 Column order in training data:")
feature_columns = list(X.columns)
print(feature_columns)

print(f"\n📂 Backend required_features order:")
backend_features = [
    'src_ip', 'src_port', 'dst_ip', 'dst_port', 'proto', 'service', 'duration', 'src_bytes', 'dst_bytes',
    'conn_state', 'missed_bytes', 'src_pkts', 'src_ip_bytes', 'dst_pkts', 'dst_ip_bytes', 'dns_query', 
    'dns_qclass', 'dns_qtype', 'dns_rcode', 'dns_AA', 'dns_RD', 'dns_RA', 'dns_rejected', 
    'http_request_body_len', 'http_response_body_len', 'http_status_code', 'label'
]
print(backend_features)

print(f"\n❌ Column order matches: {feature_columns == backend_features[:-1]}")  # exclude 'label'

# Save the correct encoders for backend use
os.makedirs("backend", exist_ok=True)
with open("backend/feature_encoders.pkl", "wb") as f:
    pickle.dump(encoders, f)
print(f"\n💾 Saved correct encoders to backend/feature_encoders.pkl")

print(f"\n🚨 PROBLEM IDENTIFIED:")
print("   Backend uses hardcoded mappings that don't match LabelEncoder!")
print("   Need to update backend preprocessing to use the same encodings as training.") 