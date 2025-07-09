#!/usr/bin/env python3
"""
Run the essential cells from network_threat_prediction notebook
This generates fresh Random Forest model files for the backend
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')

print("🚀 Running Network Threat Prediction Training")
print("=" * 60)

# Cell 1: Load data
print("📁 Loading data...")
df = pd.read_csv("Ml/cleaned_network_data.csv")
print(f"✅ Loaded {len(df)} rows")
print(df.head())

# Cell 2: Check label distribution  
print("\n📊 Checking label distribution...")
from sklearn.preprocessing import LabelEncoder

y_raw = df['type']
le = LabelEncoder()
y = le.fit_transform(y_raw)
unique, counts = np.unique(y, return_counts=True)
for label, count in zip(le.inverse_transform(unique), counts):
    print(f"Class '{label}' has {count} samples")

# Cell 3: Clean data
print("\n🧹 Cleaning data...")
df = df[df['type'].notna()]                    
df = df[df['type'].str.lower() != 'nan']       
print(f"✅ After cleaning: {len(df)} rows")

# Cell 4: Prepare data for training
print("\n🔧 Preparing data...")
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# Drop unnecessary columns
columns_to_drop = ['Flow ID', 'Source IP', 'Destination IP', 'Timestamp']
existing_columns_to_drop = [col for col in columns_to_drop if col in df.columns]
df = df.drop(existing_columns_to_drop, axis=1)

# Separate features (X) and target (y)
X = df.drop('type', axis=1)
y = df['type']

# Convert target variable to numerical labels
le = LabelEncoder()
y = le.fit_transform(y)
print(f"✅ Features shape: {X.shape}")
print(f"✅ Target classes: {le.classes_}")

# Cell 5: Convert object columns to category
print("\n🔄 Converting object columns...")
for col in X.select_dtypes(include='object').columns:
    X[col] = X[col].astype('category')
    print(f"   Converted {col} to category")

# Cell 9: Train Random Forest (skipping XGBoost)
print("\n🌲 Training Random Forest...")
from sklearn.ensemble import RandomForestClassifier

# Encode object or category columns
for col in X.select_dtypes(include=['object', 'category']).columns:
    le_col = LabelEncoder()
    X[col] = le_col.fit_transform(X[col])
    print(f"   Encoded {col}")

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"✅ Train: {len(X_train)}, Test: {len(X_test)}")

# Train RandomForest model
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)
print("✅ Random Forest training completed!")

# Evaluate
y_pred = rf_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
report = classification_report(y_test, y_pred, target_names=le.classes_)

print(f"\n📊 Model Performance:")
print(f"Accuracy: {accuracy:.4f}")
print("\nClassification Report:")
print(report)

# Cell 10: Save model files
print("\n💾 Saving model files...")
import joblib
import pickle
import os

# Change to ML directory
os.chdir("Ml")

# Save Random Forest model
joblib.dump(rf_model, 'random_forest_model.pkl')
print("✅ Random Forest model saved with joblib")

with open("random_forest_model.pkl", "wb") as f:
    pickle.dump(rf_model, f)
print("✅ Random Forest model saved with pickle")

# Save label encoder
with open("label_encoder.pkl", "wb") as f:
    pickle.dump(le, f)
print("✅ Label encoder saved")

print(f"Model classes: {rf_model.classes_}")
print(f"Label encoder classes: {le.classes_}")

# Cell 11: Copy to backend directory
print("\n📂 Copying files to backend...")
import shutil
os.chdir("..")  # Go back to project root

backend_dir = "backend"
if not os.path.exists(backend_dir):
    os.makedirs(backend_dir)

# Copy Random Forest model
shutil.copy("Ml/random_forest_model.pkl", os.path.join(backend_dir, "random_forest_model.pkl"))
print("✅ Random Forest model copied to backend directory!")

# Copy label encoder
shutil.copy("Ml/label_encoder.pkl", os.path.join(backend_dir, "label_encoder.pkl"))
print("✅ Label encoder copied to backend directory!")

# Create classification report for backend
import json
y_pred_rf = rf_model.predict(X_test)
rf_report = classification_report(y_test, y_pred_rf, target_names=le.classes_, output_dict=True)

results = {
    'RandomForest': rf_report
}

with open(os.path.join(backend_dir, 'classification_reports.json'), 'w') as f:
    json.dump(results, f, indent=2)
print("✅ Classification reports saved to backend directory!")

print("\n🎉 All files ready for API use!")

# Cell 12: Test some predictions
print("\n🧪 Testing sample predictions...")
test_indices = [0, 100, 200, 300, 400]
for i in test_indices:
    if i < len(X_test):
        sample = X_test.iloc[i:i+1]
        pred = rf_model.predict(sample)[0]
        true_class = le.inverse_transform([y_test[i]])[0]
        pred_class = le.inverse_transform([pred])[0]
        print(f"   Sample {i}: True={true_class}, Predicted={pred_class}")

print("\n✅ Fresh model files generated!")
print("🔄 Now restart your backend server to load the new models")
print("🚀 Then test your JSON samples!") 