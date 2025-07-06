# NetAegis Startup Guide

## 🚀 Quick Start (Separate Frontend & Backend)

### **Step 1: Start Backend (Terminal 1)**
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Random Forest model loaded successfully
INFO:     XGBoost model loaded successfully
INFO:     Model performance data loaded successfully
```

### **Step 2: Start Frontend (Terminal 2)**
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
Local:   http://localhost:5173/
Network: http://192.168.x.x:5173/
```

### **Step 3: Access Your Application**

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## 📁 File Structure

```
NetAegis/
├── Ml/                          # Your ML models (don't move)
│   ├── random_forest_model.pkl  # 31MB
│   ├── xgboost_model.pkl        # 5.1MB
│   └── classification_reports.json
├── backend/                     # FastAPI server
│   ├── main.py                 # API endpoints
│   └── requirements.txt        # Python dependencies
└── frontend/                   # React app
    ├── src/
    │   ├── services/api.js     # API calls
    │   └── pages/admin/
    │       ├── ThreatVisualization.jsx  # ML testing
    │       └── CSVUpload.jsx           # CSV uploads
    └── package.json
```

---

## 🎯 What Each Part Does

### **Backend (Port 8000)**
- Loads your ML models from `Ml/` folder
- Provides prediction API endpoints
- No file storage - just ML processing

### **Frontend (Port 5173)**
- User interface for testing ML models
- CSV uploads handled in `/admin/csv-upload`
- Real-time threat visualization

---

## 🔧 Testing ML Integration

1. **Go to:** http://localhost:5173
2. **Navigate to:** Admin → Threat Visualization
3. **Test Predictions:**
   - Select threat type from dropdown
   - Click "Test Prediction"
   - View results in popup dialog

4. **CSV Uploads:**
   - Go to Admin → CSV Upload
   - Upload your network data CSV
   - Process with ML models

---

## 🛠️ Troubleshooting

### **Backend Issues:**
```bash
# Check if models are loading
curl http://localhost:8000/health

# Check available models
curl http://localhost:8000/models
```

### **Frontend Issues:**
- Check browser console for errors
- Verify backend is running on port 8000
- Check CORS settings if needed

### **Model Loading Issues:**
- Verify path: `C:/Users/ANJALIKRISHNA/Desktop/NetAegis/Ml/`
- Check if `.pkl` files exist
- Ensure sufficient memory for large models

---

## 📊 ML Models Available

Your system can detect **8 threat types:**
- **Normal** - Legitimate traffic
- **DDoS** - Distributed attacks
- **Scanning** - Port scanning
- **Injection** - SQL injection
- **Backdoor** - Remote access
- **XSS** - Cross-site scripting
- **Ransomware** - Encryption attacks
- **MITM** - Man-in-the-middle

---

## 🎉 Success Indicators

✅ **Backend Running:** Models loaded successfully  
✅ **Frontend Running:** No console errors  
✅ **ML Working:** Can test predictions  
✅ **CSV Upload:** Works in CSV Upload page  

**You're all set!** 🚀 