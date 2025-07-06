import pandas as pd
import numpy as np
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import classification_report, accuracy_score
from sklearn.model_selection import train_test_split
import warnings
warnings.filterwarnings('ignore')

# Try to import xgboost, handle if not installed
try:
    from xgboost import XGBClassifier
    xgb_available = True
except ImportError:
    xgb_available = False
    print("[WARNING] XGBoost is not installed. Skipping XGBoost model.")

def load_ml_data():
    with open('ml_data.pkl', 'rb') as f:
        ml_data = pickle.load(f)
    return ml_data

def train_and_evaluate_models():
    print("Loading ML-ready data...")
    ml_data = load_ml_data()

    # Use label classification (attack/normal)
    X_train = ml_data['label_data']['X_train']
    X_test = ml_data['label_data']['X_test']
    y_train = ml_data['label_data']['y_train']
    y_test = ml_data['label_data']['y_test']

    print(f"Train shape: {X_train.shape}, Test shape: {X_test.shape}")

    results = {}

    # 1. Random Forest
    print("\n=== Random Forest ===")
    rf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    y_pred_rf = rf.predict(X_test)
    print(classification_report(y_test, y_pred_rf, digits=4))
    results['RandomForest'] = classification_report(y_test, y_pred_rf, output_dict=True)

    # 2. XGBoost
    if xgb_available:
        print("\n=== XGBoost ===")
        xgb = XGBClassifier(n_estimators=100, random_state=42, n_jobs=-1, use_label_encoder=False, eval_metric='logloss')
        xgb.fit(X_train, y_train)
        y_pred_xgb = xgb.predict(X_test)
        print(classification_report(y_test, y_pred_xgb, digits=4))
        results['XGBoost'] = classification_report(y_test, y_pred_xgb, output_dict=True)
    else:
        print("[XGBoost not available]")

    # 3. Neural Network (MLPClassifier)
    print("\n=== Neural Network (MLPClassifier) ===")
    mlp = MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=30, random_state=42, verbose=True)
    mlp.fit(X_train, y_train)
    y_pred_mlp = mlp.predict(X_test)
    print(classification_report(y_test, y_pred_mlp, digits=4))
    results['NeuralNetwork'] = classification_report(y_test, y_pred_mlp, output_dict=True)

    # Save results
    with open('classification_reports.json', 'w') as f:
        import json
        json.dump(results, f, indent=2)
    print("\nSaved classification reports to classification_reports.json")

if __name__ == "__main__":
    train_and_evaluate_models() 