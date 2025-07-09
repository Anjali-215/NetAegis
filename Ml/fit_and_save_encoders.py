import pandas as pd
import pickle
from sklearn.preprocessing import LabelEncoder

# Load your training data
TRAIN_DATA_PATH = 'cleaned_network_data.csv'
df = pd.read_csv(TRAIN_DATA_PATH)

print(df.columns.tolist())  # For debugging

# Fit encoders for each categorical column
proto_encoder = LabelEncoder()
service_encoder = LabelEncoder()
conn_state_encoder = LabelEncoder()

proto_encoder.fit(df['proto'])
service_encoder.fit(df['service'])
conn_state_encoder.fit(df['conn_state'])

# Save encoders
with open('proto_encoder.pkl', 'wb') as f:
    pickle.dump(proto_encoder, f)
with open('service_encoder.pkl', 'wb') as f:
    pickle.dump(service_encoder, f)
with open('conn_state_encoder.pkl', 'wb') as f:
    pickle.dump(conn_state_encoder, f)

print("Encoders fitted and saved as proto_encoder.pkl, service_encoder.pkl, conn_state_encoder.pkl.") 