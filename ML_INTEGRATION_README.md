# NetAegis ML Integration Guide

This guide explains how to integrate your frontend with the machine learning models for real-time threat detection.

## 🏗️ Architecture Overview

```
┌─────────────────┐    HTTP/JSON    ┌─────────────────┐    Pickle Files    ┌─────────────────┐
│   Frontend      │ ◄─────────────► │   FastAPI       │ ◄─────────────────► │   ML Models     │
│   (React)       │                 │   Backend       │                    │   (Random Forest│
│   Port: 5173    │                 │   Port: 8000    │                    │   XGBoost, etc.)│
└─────────────────┘                 └─────────────────┘                    └─────────────────┘
```

## 🚀 Quick Start

### 1. Install Dependencies

#### Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Start the Development Environment

#### Option A: Using the Startup Script (Recommended)
```bash
python start_dev.py
```

#### Option B: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📊 ML Models Available

Your trained models can detect **8 different threat types**:

1. **Random Forest Classifier**
   - Accuracy: 100%
   - Best performing model
   - Fast prediction times

2. **XGBoost Classifier**
   - Accuracy: 99.99%
   - Good balance of speed and accuracy
   - Handles complex patterns well

3. **Neural Network (MLPClassifier)**
   - Accuracy: 97.88%
   - Good for non-linear patterns
   - Slightly slower but more flexible

### 🎯 Threat Types Detected:

- **Normal** - Legitimate network traffic
- **DDoS** - Distributed Denial of Service attacks
- **Scanning** - Port scanning and reconnaissance
- **Injection** - SQL injection attacks
- **Backdoor** - Backdoor and remote access attempts
- **XSS** - Cross-site scripting attacks
- **Ransomware** - Ransomware and encryption attacks
- **MITM** - Man-in-the-middle attacks

## 🔧 API Endpoints

### Health Check
```http
GET /health
```
Returns API status and loaded models count.

### Get Models Info
```http
GET /models
```
Returns information about available models and their performance metrics.

### Single Prediction
```http
POST /predict
Content-Type: application/json

{
  "duration": 0,
  "protocol_type": "tcp",
  "service": "http",
  "flag": "SF",
  "src_bytes": 181,
  "dst_bytes": 5450,
  // ... other features
}
```

### Batch Prediction
```http
POST /predict-batch
Content-Type: multipart/form-data

file: your_network_data.csv
```

### Model Performance
```http
GET /performance
```
Returns detailed performance metrics for all models.

## 🎯 Frontend Integration Features

### 1. Real-time ML Status
- API connection status indicator
- Model loading status
- Performance metrics display

### 2. Single Prediction Testing
- Test individual network connections
- View detailed prediction results
- See confidence scores from all models

### 3. Batch Processing
- Upload CSV files for bulk analysis
- View processing statistics
- Download results

### 4. Live Monitoring
- Simulate real-time threat detection
- Continuous prediction updates
- Historical prediction tracking

## 📁 File Structure

```
NetAegis/
├── backend/
│   ├── main.py                 # FastAPI application
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js          # API service functions
│   │   └── pages/admin/
│   │       └── ThreatVisualization.jsx  # ML integration UI
│   └── package.json
├── Ml/
│   ├── random_forest_model.pkl # Trained Random Forest model
│   ├── xgboost_model.pkl       # Trained XGBoost model
│   └── classification_reports.json  # Model performance data
└── start_dev.py               # Development startup script
```

## 🔍 Using the ML Features

### 1. Test Single Prediction
1. Navigate to **Threat Visualization** in the admin panel
2. Click **"Test Single Prediction"**
3. View results in the popup dialog
4. Analyze confidence scores from each model

### 2. Batch Analysis
1. Prepare a CSV file with network data
2. Click **"Upload CSV for Batch Prediction"**
3. Select your file
4. View processing results and statistics

### 3. Live Monitoring
1. Click **"Start Live Monitoring"**
2. Watch real-time predictions
3. Analyze threat patterns over time
4. Stop monitoring when done

## 📈 Understanding Predictions

### Prediction Output Format
```json
{
  "input_data": { /* original network data */ },
  "predictions": {
    "random_forest": 0,
    "xgboost": 0,
    "neural_network": 0
  },
  "probabilities": {
    "random_forest": {
      "normal": 0.95,
      "attack": 0.05
    }
  },
  "final_prediction": 0,
  "threat_level": "Normal",
  "timestamp": "2024-01-01T12:00:00"
}
```

### Threat Levels
- **Normal**: Legitimate network traffic
- **High**: Medium-risk threats (scanning, injection, XSS)
- **Critical**: High-risk threats (DDoS, ransomware, backdoor, MITM)

### Confidence Scores
- **0.0-0.3**: Low confidence
- **0.3-0.7**: Medium confidence  
- **0.7-1.0**: High confidence

## 🛠️ Troubleshooting

### Backend Issues

**Problem**: Models not loading
```bash
# Check if model files exist
ls -la Ml/*.pkl

# Verify file permissions
chmod 644 Ml/*.pkl
```

**Problem**: Port 8000 already in use
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9

# Or use a different port
uvicorn main:app --port 8001
```

### Frontend Issues

**Problem**: API connection failed
- Check if backend is running on port 8000
- Verify CORS settings in backend/main.py
- Check browser console for errors

**Problem**: Predictions failing
- Ensure all required features are present in input data
- Check API response format
- Verify model files are accessible

### Common Error Messages

```
"API is not available"
→ Backend server not running or not accessible

"Failed to fetch models"
→ Model files missing or corrupted

"Prediction failed"
→ Invalid input data format or missing features
```

## 🔧 Customization

### Adding New Models
1. Train your model and save as `.pkl` file
2. Add to `backend/main.py` load_models() function
3. Update frontend to handle new model predictions

### Modifying Feature Set
1. Update `required_features` list in `backend/main.py`
2. Ensure frontend sends all required features
3. Retrain models with new feature set

### Changing Prediction Logic
1. Modify prediction logic in `backend/main.py`
2. Update frontend to handle new response format
3. Test with sample data

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Scikit-learn Documentation](https://scikit-learn.org/)
- [XGBoost Documentation](https://xgboost.readthedocs.io/)

## 🤝 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review browser console and backend logs
3. Verify all dependencies are installed
4. Ensure model files are in the correct location

For additional help, check the API documentation at http://localhost:8000/docs when the backend is running. 