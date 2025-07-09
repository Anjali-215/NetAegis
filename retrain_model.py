import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
import pickle
import shutil
import os
import json

print("🔄 Retraining Random Forest Model")
print("=" * 50)

# Load the data
print("📁 Loading training data...")
df = pd.read_csv("Ml/cleaned_network_data.csv")
print(f"✅ Loaded {len(df)} rows")

# Check the 'type' column
print(f"📊 Type distribution:")
print(df['type'].value_counts())

# Clean the data
print("\n🧹 Cleaning data...")
df = df[df['type'].notna()]
df = df[df['type'].str.lower() != 'nan']
print(f"✅ After cleaning: {len(df)} rows")

# Drop unnecessary columns
columns_to_drop = ['Flow ID', 'Source IP', 'Destination IP', 'Timestamp']
existing_columns_to_drop = [col for col in columns_to_drop if col in df.columns]
df = df.drop(existing_columns_to_drop, axis=1)

# Separate features and target
X = df.drop('type', axis=1)
y = df['type']

# Encode target labels
print("\n🔤 Encoding labels...")
le = LabelEncoder()
y_encoded = le.fit_transform(y)
print(f"✅ Label classes: {le.classes_}")

# Encode categorical features
print("\n🔤 Encoding categorical features...")
for col in X.select_dtypes(include=['object', 'category']).columns:
    le_col = LabelEncoder()
    X[col] = le_col.fit_transform(X[col])
    print(f"   Encoded {col}")

# Split the data
print("\n✂️ Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)
print(f"✅ Train: {len(X_train)}, Test: {len(X_test)}")

# Train Random Forest model
print("\n🌲 Training Random Forest...")
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)
print("✅ Model trained successfully!")

# Evaluate the model
print("\n📊 Evaluating model...")
y_pred = rf_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
report = classification_report(y_test, y_pred, target_names=le.classes_)

print(f"✅ Accuracy: {accuracy:.4f}")
print("\n📋 Classification Report:")
print(report)

# Save the model in ML directory
print("\n💾 Saving model files...")
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

# Verify the model classes
print(f"\n🔍 Model classes: {rf_model.classes_}")
print(f"🔍 Label encoder classes: {le.classes_}")

# Copy to backend directory
print("\n📂 Copying files to backend...")
os.chdir("..")  # Go back to project root

backend_dir = "backend"
if not os.path.exists(backend_dir):
    os.makedirs(backend_dir)

# Copy Random Forest model
shutil.copy("Ml/random_forest_model.pkl", os.path.join(backend_dir, "random_forest_model.pkl"))
print("✅ Random Forest model copied to backend")

# Copy label encoder
shutil.copy("Ml/label_encoder.pkl", os.path.join(backend_dir, "label_encoder.pkl"))
print("✅ Label encoder copied to backend")

# Create classification report for backend
y_pred_rf = rf_model.predict(X_test)
rf_report = classification_report(y_test, y_pred_rf, target_names=le.classes_, output_dict=True)

results = {
    'RandomForest': rf_report
}

with open(os.path.join(backend_dir, 'classification_reports.json'), 'w') as f:
    json.dump(results, f, indent=2)
print("✅ Classification reports saved to backend")

print("\n🎉 Model retraining completed successfully!")
print("🚀 You can now test the model with the correct predictions!")

# Show some sample predictions for verification
print("\n🧪 Testing sample predictions...")
sample_indices = [0, 100, 200, 300, 400]
for i in sample_indices:
    if i < len(X_test):
        sample = X_test.iloc[i:i+1]
        pred = rf_model.predict(sample)
        true_label = le.inverse_transform([y_test.iloc[i]])[0]
        pred_label = le.inverse_transform(pred)[0]
        print(f"   Sample {i}: True={true_label}, Predicted={pred_label}")

print("\n✅ Ready to test with the JSON samples!") 