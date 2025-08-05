from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import pickle
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import os
from datetime import datetime
import logging
from sklearn.preprocessing import LabelEncoder
from motor.motor_asyncio import AsyncIOMotorDatabase
from contextlib import asynccontextmanager
from pydantic import BaseModel
from models.ml_results import MLResultCreate, MLResultResponse, MLResultSummary
from models.user import UserResponse
from api.auth import get_current_user

# Backend imports for DB and Auth
from database import connect_to_mongo, close_mongo_connection, get_database
from api.auth import router as auth_router
from api import phishing_router, reports_router
from utils.email_service import EmailService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="NetAegis API",
    description="Backend API for NetAegis - Network Security Platform with ML and Auth",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],  # Allow all for debug, restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication router
app.include_router(auth_router)
# Include phishing detection/chatbot router
app.include_router(phishing_router)
# Include reports generation router
app.include_router(reports_router, prefix="/api")

# --- ML API SECTION ---
models = {}
model_performance = {}
label_encoder = None
feature_encoders = {}
ml_dir = Path(__file__).parent

def preprocess_input_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Preprocess input data to match training format exactly"""
    
    # Step 1: Convert to DataFrame (like training)
    df = pd.DataFrame([data])
    
    # Step 2: Drop columns that were dropped during training
    columns_to_drop = ['Flow ID', 'Source IP', 'Destination IP', 'Timestamp']
    existing_columns_to_drop = [col for col in columns_to_drop if col in df.columns]
    if existing_columns_to_drop:
        df = df.drop(existing_columns_to_drop, axis=1)
    
    # Step 3: Separate features (drop 'type' if present)
    if 'type' in df.columns:
        df = df.drop('type', axis=1)
    
    # Step 4: Convert object columns to category (exactly like training)
    for col in df.select_dtypes(include='object').columns:
        df[col] = df[col].astype('category')
    
    # Step 5: Load feature encoders if not already loaded
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
    
    # Step 6: Apply LabelEncoder to categorical columns (exactly like training)
    for col in df.select_dtypes(include=['object', 'category']).columns:
        if col in feature_encoders:
            encoder = feature_encoders[col]
            value = df[col].iloc[0]
            
            # Convert to string for consistency
            if isinstance(value, (int, float)):
                value = str(value)
            elif value is None:
                value = "none"
            
            # Apply encoder
            if value in encoder.classes_:
                df[col] = encoder.transform([value])[0]
            else:
                # Handle unknown values - use index 0 (most common)
                df[col] = 0
                logger.warning(f"Unknown value '{value}' for field '{col}', using default")
        else:
            # Fallback for missing encoders
            logger.warning(f"No encoder found for column '{col}', using default encoding")
            df[col] = 0
    
    # Step 7: Ensure all numeric columns are properly typed
    numeric_columns = df.select_dtypes(include=[np.number]).columns
    for col in numeric_columns:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
    
    # Step 8: Return as dictionary with exact same structure
    result = df.iloc[0].to_dict()
    
    return result

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

# --- Startup/Shutdown Events ---
@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    logger.info("Starting NetAegis API...")
    # Load ML models
    if not load_models():
        logger.error("Failed to load models. ML API may not function properly.")
    
    # Connect to MongoDB with retry logic
    max_retries = 3
    retry_delay = 5  # seconds
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempting to connect to MongoDB (attempt {attempt + 1}/{max_retries})...")
            await connect_to_mongo()
            logger.info("✅ MongoDB connection established successfully!")
            break
        except Exception as e:
            logger.error(f"❌ MongoDB connection attempt {attempt + 1} failed: {str(e)}")
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                import asyncio
                await asyncio.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
            else:
                logger.error("❌ All MongoDB connection attempts failed. API may not function properly.")
                # Don't raise the exception to allow the API to start
                # Users will get connection errors when trying to use auth features

@app.on_event("shutdown")
async def shutdown_event():
    """Close MongoDB connection on shutdown"""
    await close_mongo_connection()

# --- Endpoints ---
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "NetAegis API is running",
        "version": "1.0.0",
        "available_models": list(models.keys()),
        "ml_status": "ok" if 'random_forest' in models else "not loaded"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test MongoDB connection
        from database import db
        if db.client:
            await db.client.admin.command('ping')
            db_status = "connected"
        else:
            db_status = "not_connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "models_loaded": len(models),
        "mongodb_status": db_status,
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

# Initialize email service
email_service = EmailService()

class PredictionRequest(BaseModel):
    data: Dict[str, Any]
    user_email: Optional[str] = None
    user_name: Optional[str] = None



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

@app.post("/test-email")
async def test_email():
    """Test email notification functionality"""
    try:
        result = await email_service.send_threat_alert(
            "test@example.com",
            "Test User",
            {
                "threat_type": "ddos",
                "confidence": 85.5,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "threat_level": "Critical"
            }
        )
        return {"success": result, "message": "Test email sent successfully"}
    except Exception as e:
        logger.error(f"Test email failed: {e}")
        return {"success": False, "error": str(e)}

@app.get("/debug/requests")
async def debug_requests():
    """Debug endpoint to check if requests are being made"""
    logger.info(f"=== DEBUG REQUEST RECEIVED ===")
    logger.info(f"Timestamp: {datetime.now().isoformat()}")
    logger.info(f"=============================")
    return {"message": "Debug request received", "timestamp": datetime.now().isoformat()}

@app.get("/debug/auth")
async def debug_auth(current_user: UserResponse = Depends(get_current_user)):
    """Debug endpoint to check authentication"""
    logger.info(f"=== AUTH DEBUG ===")
    logger.info(f"User: {current_user.email}")
    logger.info(f"Role: {current_user.role}")
    logger.info(f"=============================")
    return {
        "message": "Authentication successful",
        "user": {
            "email": current_user.email,
            "name": current_user.name,
            "role": current_user.role
        },
        "timestamp": datetime.now().isoformat()
    }

@app.post("/predict")
async def predict_threat(request: PredictionRequest):
    """
    Predict threat type from network data
    """
    try:
        data = request.data
        user_email = request.user_email
        user_name = request.user_name
        
        logger.info(f"Received prediction request with data: {data}")
        
        # Step 1: Preprocess the input data (matches training exactly)
        processed_data = preprocess_input_data(data)
        logger.info(f"Preprocessed data: {processed_data}")
        
        # Step 2: Convert to DataFrame (like training)
        df = pd.DataFrame([processed_data])
        
        # Step 3: Get the expected feature columns from training
        # These are the columns after preprocessing in training (excluding 'type')
        expected_features = [
            'src_ip', 'src_port', 'dst_ip', 'dst_port', 'proto', 'service', 'duration', 'src_bytes', 'dst_bytes',
            'conn_state', 'missed_bytes', 'src_pkts', 'src_ip_bytes', 'dst_pkts', 'dst_ip_bytes', 'dns_query', 
            'dns_qclass', 'dns_qtype', 'dns_rcode', 'dns_AA', 'dns_RD', 'dns_RA', 'dns_rejected', 
            'http_request_body_len', 'http_response_body_len', 'http_status_code', 'label'
        ]
        
        # Step 4: Add missing features with default values (like training handles missing data)
        for feature in expected_features:
            if feature not in df.columns:
                df[feature] = 0
                logger.info(f"Added missing feature '{feature}' with default value 0")
        
        # Step 5: Reorder columns to match training data exactly
        df = df[expected_features]
        logger.info(f"Final DataFrame shape: {df.shape}")
        logger.info(f"DataFrame columns: {list(df.columns)}")
        logger.info(f"DataFrame values: {df.iloc[0].to_dict()}")
        
        # Step 6: Check if model is loaded
        if 'random_forest' not in models:
            raise HTTPException(status_code=500, detail="Random Forest model not loaded")
        
        model = models['random_forest']
        logger.info(f"Using model with {len(model.classes_)} classes: {model.classes_}")
        
        # Step 7: Make prediction (exactly like training)
        try:
            pred = model.predict(df)[0]
            prob = model.predict_proba(df)[0] if hasattr(model, 'predict_proba') else None
            logger.info(f"Model prediction: {pred}, probabilities: {prob}")
        except Exception as e:
            logger.error(f"Error during model prediction: {e}")
            logger.error(f"DataFrame dtypes: {df.dtypes}")
            logger.error(f"DataFrame shape: {df.shape}")
            raise HTTPException(status_code=500, detail=f"Prediction error: {e}")
        
        # Step 8: Map prediction to threat type using label encoder (exactly like training)
        if label_encoder is not None and hasattr(label_encoder, 'classes_'):
            threat_type = label_encoder.classes_[pred] if pred < len(label_encoder.classes_) else "unknown"
        else:
            # Fallback mapping (matches training order)
            threat_types = {
                0: "backdoor", 1: "ddos", 2: "dos", 3: "injection", 4: "mitm",
                5: "normal", 6: "password", 7: "ransomware", 8: "scanning", 9: "xss"
            }
            threat_type = threat_types.get(pred, "unknown")
        
        logger.info(f"Threat type: {threat_type}")
        
        # Step 9: Determine threat level
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
        
        # Send email notification if threat is detected
        if threat_type != "normal" and user_email and user_name:
            try:
                threat_details = {
                    "threat_type": threat_type,
                    "confidence": float(prob[pred]) if prob is not None else None,
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "threat_level": threat_level
                }
                
                # Send email notification
                email_sent = await email_service.send_threat_alert(
                    user_email, user_name, threat_details
                )
                
                if email_sent:
                    logger.info(f"Threat alert email sent to {user_email}")
                    result["email_sent"] = True
                else:
                    logger.warning(f"Failed to send threat alert email to {user_email}")
                    result["email_sent"] = False
                    
            except Exception as e:
                logger.error(f"Error sending email notification: {e}")
                result["email_sent"] = False
        else:
            result["email_sent"] = False
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in prediction: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/send-csv-summary")
async def send_csv_summary_email(request: dict):
    """
    Send summary email for CSV processing results
    """
    try:
        user_email = request.get('user_email')
        user_name = request.get('user_name')
        summary_data = request.get('summary_data', {})
        
        if not user_email or not user_name:
            raise HTTPException(status_code=400, detail="User email and name are required")
        
        # Send summary email
        email_sent = await email_service.send_csv_summary_alert(
            user_email, user_name, summary_data
        )
        
        if email_sent:
            logger.info(f"CSV summary email sent to {user_email}")
            return {"success": True, "message": "Summary email sent successfully"}
        else:
            logger.warning(f"Failed to send CSV summary email to {user_email}")
            return {"success": False, "message": "Failed to send summary email"}
            
    except Exception as e:
        logger.error(f"Error sending CSV summary email: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send summary email: {str(e)}")

# --- ML Results Database Endpoints ---

@app.post("/ml-results", response_model=MLResultResponse)
async def save_ml_results(
    result_data: MLResultCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Save ML processing results to database"""
    try:
        db = await get_database()
        collection = db["ml_results"]
        
        # Convert to dict for MongoDB
        result_dict = result_data.model_dump()
        
        # Ensure users can only save data for themselves
        if current_user.role != "admin":
            result_dict["user_email"] = current_user.email
            result_dict["user_name"] = current_user.name
        
        # Set the created_at timestamp to current local time
        result_dict["created_at"] = datetime.now()
        
        # Insert into database
        result = await collection.insert_one(result_dict)
        
        # Get the inserted document
        inserted_doc = await collection.find_one({"_id": result.inserted_id})
        
        logger.info(f"ML results saved to database with ID: {result.inserted_id}")
        return MLResultResponse(**inserted_doc)
        
    except Exception as e:
        logger.error(f"Error saving ML results: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save ML results: {str(e)}")

@app.get("/ml-results", response_model=List[MLResultSummary])
async def get_ml_results(
    user_email: Optional[str] = None, 
    limit: int = 50,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get ML processing results from database"""
    try:
        db = await get_database()
        collection = db["ml_results"]
        
        # Build query - ensure users can only access their own data
        query = {}
        if current_user.role == "admin":
            # Admins can see all data or filter by specific user
            if user_email:
                query["user_email"] = user_email
        else:
            # Regular users can only see their own data
            query["user_email"] = current_user.email
        
        # Get results, sorted by creation date (newest first)
        cursor = collection.find(query).sort("created_at", -1).limit(limit)
        results = await cursor.to_list(length=limit)
        
        # Convert to response models
        response_results = []
        for result in results:
            try:
                # Create summary without the detailed results
                # Handle missing fields with defaults
                summary = MLResultSummary(
                    _id=result.get("_id"),  # Use _id to match the alias
                    user_email=result.get("user_email", "unknown@example.com"),
                    user_name=result.get("user_name", "Unknown User"),
                    file_name=result.get("file_name", "Unknown File"),
                    total_records=result.get("total_records", 0),
                    processed_records=result.get("processed_records", 0),
                    failed_records=result.get("failed_records", 0),
                    threat_summary=result.get("threat_summary", {}),
                    processing_duration=result.get("processing_duration", 0.0),
                    created_at=result.get("created_at", datetime.now())
                )
                response_results.append(summary)
            except Exception as e:
                logger.warning(f"Skipping malformed result document: {e}")
                continue
        
        logger.info(f"Retrieved {len(response_results)} ML results")
        return response_results
        
    except Exception as e:
        logger.error(f"Error retrieving ML results: {e}")
        if "user_email" in str(e):
            raise HTTPException(status_code=500, detail="Database contains malformed ML result records. Please contact administrator.")
        else:
            raise HTTPException(status_code=500, detail=f"Failed to retrieve ML results: {str(e)}")

@app.get("/ml-results/{result_id}", response_model=MLResultResponse)
async def get_ml_result_detail(
    result_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get detailed ML processing result by ID"""
    try:
        from bson import ObjectId
        
        db = await get_database()
        collection = db["ml_results"]
        
        # Find the specific result
        result = await collection.find_one({"_id": ObjectId(result_id)})
        
        if not result:
            raise HTTPException(status_code=404, detail="ML result not found")
        
        # Ensure users can only access their own data
        if current_user.role != "admin" and result.get("user_email") != current_user.email:
            raise HTTPException(status_code=403, detail="Access denied")
        
        logger.info(f"Retrieved ML result detail for ID: {result_id}")
        return MLResultResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving ML result detail: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve ML result detail: {str(e)}")

@app.delete("/ml-results/{result_id}")
async def delete_ml_result(
    result_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Delete ML processing result by ID"""
    try:
        from bson import ObjectId
        
        # Validate ObjectId format
        try:
            object_id = ObjectId(result_id)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid result ID format: {result_id}")
        
        db = await get_database()
        collection = db["ml_results"]
        
        # Check if the document exists first
        existing_doc = await collection.find_one({"_id": object_id})
        if not existing_doc:
            raise HTTPException(status_code=404, detail="ML result not found")
        
        # Ensure users can only delete their own data
        if current_user.role != "admin" and existing_doc.get("user_email") != current_user.email:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Delete the result
        result = await collection.delete_one({"_id": object_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="ML result not found")
        
        return {"message": "ML result deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting ML result: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete ML result: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
