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

# Set ML directory to backend folder
ml_dir = Path(__file__).parent

def load_models():
    """Load only the Random Forest model"""
    try:
        rf_path = ml_dir / "random_forest_model.pkl"
        if rf_path.exists():
            with open(rf_path, 'rb') as f:
                models['random_forest'] = pickle.load(f)
            logger.info(f"Random Forest model loaded from {rf_path}")
        else:
            logger.error(f"Random Forest model not found at: {rf_path}")
        # Optionally load classification reports if needed
        perf_path = ml_dir / "classification_reports.json"
        if perf_path.exists():
            with open(perf_path, 'r') as f:
                model_performance.update(json.load(f))
            logger.info("Model performance data loaded successfully")
        else:
            logger.warning(f"Classification reports not found at: {perf_path}")
        return 'random_forest' in models
    except Exception as e:
        logger.error(f"Error loading Random Forest model: {e}")
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
    """Make threat predictions using only the Random Forest model"""
    try:
        # Convert input data to DataFrame
        if isinstance(data, dict):
            df = pd.DataFrame([data])
        elif isinstance(data, list):
            df = pd.DataFrame(data)
        else:
            raise HTTPException(status_code=400, detail="Invalid data format")
        # Ensure all required features are present
        required_features = [
            'duration', 'protocol_type', 'service', 'flag', 'src_bytes', 
            'dst_bytes', 'land', 'wrong_fragment', 'urgent', 'hot', 
            'num_failed_logins', 'logged_in', 'num_compromised', 
            'root_shell', 'su_attempted', 'num_root', 'num_file_creations', 
            'num_shells', 'num_access_files', 'num_outbound_cmds', 
            'is_host_login', 'is_guest_login', 'count', 'srv_count', 
            'serror_rate', 'srv_serror_rate', 'rerror_rate', 
            'srv_rerror_rate', 'same_srv_rate', 'diff_srv_rate', 
            'srv_diff_host_rate', 'dst_host_count', 'dst_host_srv_count', 
            'dst_host_same_srv_rate', 'dst_host_diff_srv_rate', 
            'dst_host_same_src_port_rate', 'dst_host_srv_diff_host_rate', 
            'dst_host_serror_rate', 'dst_host_srv_serror_rate', 
            'dst_host_rerror_rate', 'dst_host_srv_rerror_rate'
        ]
        for feature in required_features:
            if feature not in df.columns:
                df[feature] = 0
        df = df[required_features]
        # Only use Random Forest
        if 'random_forest' not in models:
            raise HTTPException(status_code=500, detail="Random Forest model not loaded")
        model = models['random_forest']
        try:
            pred = model.predict(df)[0]
            prob = model.predict_proba(df)[0] if hasattr(model, 'predict_proba') else None
        except Exception as e:
            logger.error(f"Error with Random Forest: {e}")
            raise HTTPException(status_code=500, detail=f"Prediction error: {e}")
        # Map prediction to threat type
        threat_types = {
            0: "normal",
            1: "scanning", 
            2: "ddos",
            3: "injection",
            4: "backdoor",
            5: "xss",
            6: "ransomware",
            7: "mitm"
        }
        threat_type = threat_types.get(pred, "unknown")
        # Determine threat level based on type
        high_threat_types = ["ddos", "ransomware", "backdoor", "mitm"]
        medium_threat_types = ["injection", "xss", "scanning"]
        if threat_type in high_threat_types:
            threat_level = "Critical"
        elif threat_type in medium_threat_types:
            threat_level = "High"
        elif threat_type == "normal":
            threat_level = "Normal"
        else:
            threat_level = "Unknown"
        return {
            "input_data": data,
            "prediction": int(pred),
            "probabilities": prob.tolist() if prob is not None else None,
            "threat_type": threat_type,
            "threat_level": threat_level,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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