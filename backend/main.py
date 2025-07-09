from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import pickle
import json
from pathlib import Path
from typing import List, Dict, Any
import os
from datetime import datetime
import logging
from sklearn.preprocessing import LabelEncoder

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="NetAegis ML API",
    description="API for network threat detection using machine learning models",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for loaded models
models = {}
model_performance = {}
label_encoder = None
feature_encoders = {}  # Will store the correct encoders from training

# Set ML directory to backend folder
ml_dir = Path(__file__).parent

def preprocess_input_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Preprocess input data to match training format exactly"""
    processed = data.copy()
    
    # Load feature encoders if not already loaded
    if not feature_encoders:
        try:
            encoder_path = ml_dir / "feature_encoders.pkl"
            if encoder_path.exists():
                with open(encoder_path, 'rb') as f:
                    feature_encoders.update(pickle.load(f))
                logger.info("Feature encoders loaded successfully")
            else:
                logger.warning(f"Feature encoders not found at: {encoder_path}")
        except Exception as e:
            logger.error(f"Error loading feature encoders: {e}")
    
    # Use correct encoders from training
    categorical_fields = ['proto', 'service', 'conn_state', 'dns_query', 'dns_AA', 'dns_RD', 'dns_RA', 'dns_rejected']
    
    for field in categorical_fields:
        if field in processed and field in feature_encoders:
            encoder = feature_encoders[field]
            value = processed[field]
            
            # Convert to string for consistency
            if isinstance(value, (int, float)):
                value = str(value)
            elif value is None:
                value = "none"
            
            # Check if value is in encoder classes
            if value in encoder.classes_:
                processed[field] = encoder.transform([value])[0]
            else:
                # Handle unknown values - use the most common value (index 0)
                processed[field] = 0
                logger.warning(f"Unknown value '{value}' for field '{field}', using default")
    
    # IP address encoding (hash based on training data structure)
    for ip_field in ['src_ip', 'dst_ip']:
        if isinstance(processed.get(ip_field), str):
            if ip_field in feature_encoders:
                encoder = feature_encoders[ip_field]
                ip_value = processed[ip_field]
                
                # If IP is in training data, use its encoding
                if ip_value in encoder.classes_:
                    processed[ip_field] = encoder.transform([ip_value])[0]
                else:
                    # For new IPs, use a consistent hash
                    hash_val = hash(ip_value) % len(encoder.classes_)
                    processed[ip_field] = abs(hash_val)
            else:
                # Fallback to simple hash
                hash_val = hash(processed[ip_field]) % 1000
                processed[ip_field] = abs(hash_val)
    
    # Ensure numeric fields are numeric
    numeric_fields = [
        'src_ip', 'src_port', 'dst_ip', 'dst_port', 'duration', 'src_bytes', 'dst_bytes', 
        'missed_bytes', 'src_pkts', 'src_ip_bytes', 'dst_pkts', 'dst_ip_bytes', 'dns_query', 
        'dns_qclass', 'dns_qtype', 'dns_rcode', 'http_request_body_len', 'http_response_body_len', 
        'http_status_code', 'label'
    ]
    
    for field in numeric_fields:
        if field in processed:
            try:
                processed[field] = float(processed[field])
            except (ValueError, TypeError):
                processed[field] = 0.0
    
    return processed

def load_models():
    """Load the Random Forest model and label encoder"""
    global label_encoder
    try:
        # Load Random Forest model
        rf_path = ml_dir / "random_forest_model.pkl"
        if rf_path.exists():
            with open(rf_path, 'rb') as f:
                models['random_forest'] = pickle.load(f)
            logger.info(f"Random Forest model loaded from {rf_path}")
        else:
            logger.error(f"Random Forest model not found at: {rf_path}")
        
        # Load label encoder
        le_path = ml_dir / "label_encoder.pkl"
        if le_path.exists():
            with open(le_path, 'rb') as f:
                label_encoder = pickle.load(f)
            logger.info(f"Label encoder loaded from {le_path}")
        else:
            logger.warning(f"Label encoder not found at: {le_path}")
            
        # Load classification reports
        perf_path = ml_dir / "classification_reports.json"
        if perf_path.exists():
            with open(perf_path, 'r') as f:
                model_performance.update(json.load(f))
            logger.info("Model performance data loaded successfully")
        else:
            logger.warning(f"Classification reports not found at: {perf_path}")
            
        return 'random_forest' in models
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        return False

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    logger.info("Starting NetAegis ML API...")
    if not load_models():
        logger.error("Failed to load models. API may not function properly.")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "NetAegis ML API is running",
        "version": "1.0.0",
        "available_models": list(models.keys())
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": len(models),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/models")
async def get_models():
    """Get information about available models"""
    model_info = {}
    for name, model in models.items():
        model_info[name] = {
            "type": type(model).__name__,
            "parameters": getattr(model, 'get_params', lambda: {})()
        }
    
    return {
        "available_models": model_info,
        "performance": model_performance
    }

@app.post("/predict")
async def predict_threat(data: Dict[str, Any]):
    """Make threat predictions using the Random Forest model"""
    try:
        logger.info(f"Received prediction request with data: {data}")
        
        # Preprocess the input data
        processed_data = preprocess_input_data(data)
        logger.info(f"Preprocessed data: {processed_data}")
        
        # Convert to DataFrame
        df = pd.DataFrame([processed_data])
        
        # Ensure all required features are present
        required_features = [
            'src_ip', 'src_port', 'dst_ip', 'dst_port', 'proto', 'service', 'duration', 'src_bytes', 'dst_bytes',
            'conn_state', 'missed_bytes', 'src_pkts', 'src_ip_bytes', 'dst_pkts', 'dst_ip_bytes', 'dns_query', 
            'dns_qclass', 'dns_qtype', 'dns_rcode', 'dns_AA', 'dns_RD', 'dns_RA', 'dns_rejected', 
            'http_request_body_len', 'http_response_body_len', 'http_status_code', 'label'
        ]
        
        # Add missing features with default values
        for feature in required_features:
            if feature not in df.columns:
                df[feature] = 0
        
        # Reorder columns to match training data
        df = df[required_features]
        logger.info(f"Final DataFrame shape: {df.shape}")
        logger.info(f"DataFrame values: {df.iloc[0].to_dict()}")
        
        # Check if model is loaded
        if 'random_forest' not in models:
            raise HTTPException(status_code=500, detail="Random Forest model not loaded")
        
        model = models['random_forest']
        logger.info(f"Using model with {len(model.classes_)} classes: {model.classes_}")
        
        # Make prediction
        try:
            pred = model.predict(df)[0]
            prob = model.predict_proba(df)[0] if hasattr(model, 'predict_proba') else None
            logger.info(f"Model prediction: {pred}, probabilities: {prob}")
        except Exception as e:
            logger.error(f"Error during model prediction: {e}")
            raise HTTPException(status_code=500, detail=f"Prediction error: {e}")
        
        # Map prediction to threat type using label encoder if available
        if label_encoder is not None and hasattr(label_encoder, 'classes_'):
            threat_type = label_encoder.classes_[pred] if pred < len(label_encoder.classes_) else "unknown"
        else:
            # Fallback mapping
            threat_types = {
                0: "backdoor", 1: "ddos", 2: "dos", 3: "injection", 4: "mitm",
                5: "normal", 6: "password", 7: "ransomware", 8: "scanning", 9: "xss"
            }
            threat_type = threat_types.get(pred, "unknown")
        
        logger.info(f"Threat type: {threat_type}")
        
        # Determine threat level
        high_threat_types = ["ddos", "ransomware", "backdoor", "mitm", "dos"]
        medium_threat_types = ["injection", "xss", "scanning", "password"]
        
        if threat_type in high_threat_types:
            threat_level = "Critical"
        elif threat_type in medium_threat_types:
            threat_level = "High"
        elif threat_type == "normal":
            threat_level = "Normal"
        else:
            threat_level = "Unknown"
        
        result = {
            "input_data": data,
            "preprocessed_data": processed_data,
            "prediction": int(pred),
            "probabilities": prob.tolist() if prob is not None else None,
            "threat_type": threat_type,
            "threat_level": threat_level,
            "confidence": float(prob[pred]) if prob is not None else None,
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"Final prediction result: {result}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in prediction: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Batch prediction removed - CSV uploads handled in frontend

@app.get("/performance")
async def get_model_performance():
    """Get model performance metrics"""
    return {
        "model_performance": model_performance,
        "summary": {
            "total_models": len(model_performance),
            "best_accuracy": max(
                [perf.get('accuracy', 0) for perf in model_performance.values()],
                default=0
            )
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 