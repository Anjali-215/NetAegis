# CSV Upload and ML Prediction Test Guide

## Prerequisites
1. Backend running on `http://localhost:8000`
2. Frontend running on `http://localhost:5173`
3. ML models loaded in the backend

## Test Steps

### 1. Start Both Services
```bash
# Terminal 1 - Backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Test API Health
- Navigate to `http://localhost:5173/admin/csv-upload`
- Check that the "ML API Status" shows "Connected" (green chip)
- If it shows "Disconnected", check that backend is running

### 3. Test CSV Upload
1. **Prepare a test CSV file** with these columns:
   ```csv
   duration,protocol_type,service,flag,src_bytes,dst_bytes,land,wrong_fragment,urgent,hot,num_failed_logins,logged_in,num_compromised,root_shell,su_attempted,num_root,num_file_creations,num_shells,num_access_files,num_outbound_cmds,is_host_login,is_guest_login,count,srv_count,serror_rate,srv_serror_rate,rerror_rate,srv_rerror_rate,same_srv_rate,diff_srv_rate,srv_diff_host_rate,dst_host_count,dst_host_srv_count,dst_host_same_srv_rate,dst_host_diff_srv_rate,dst_host_same_src_port_rate,dst_host_srv_diff_host_rate,dst_host_serror_rate,dst_host_srv_serror_rate,dst_host_rerror_rate,dst_host_srv_rerror_rate
   0,tcp,http,SF,181,5450,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,8,8,0.0,0.0,0.0,0.0,1.0,0.0,0.0,19,19,1.0,0.0,0.05,0.0,0.0,0.0,0.0,0.0
   0,tcp,http,SF,181,5450,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,8,8,0.0,0.0,0.0,0.0,1.0,0.0,0.0,19,19,1.0,0.0,0.05,0.0,0.0,0.0,0.0,0.0
   ```

2. **Upload the CSV file**:
   - Drag and drop the CSV file onto the upload area
   - Or click to select the file
   - Wait for upload to complete (should show progress)

3. **Verify upload**:
   - File should appear in "Recent Uploads" list
   - Status should be "completed"
   - Record count should match your CSV rows

### 4. Test ML Processing
1. **Click the ML processing button** (refresh icon) next to your uploaded file
2. **Wait for processing**:
   - Button should show loading spinner
   - Processing will run for each row (limited to 50 rows for demo)
3. **View results**:
   - Results dialog should open showing:
     - Row number
     - Threat type (normal, ddos, scanning, etc.)
     - Threat level (Normal, High, Critical)
     - Final prediction
     - Status (Success/Error)

### 5. Expected Results
- **Normal traffic**: Should show "normal" threat type with "Normal" level
- **Attack traffic**: Should show specific attack type (ddos, scanning, etc.) with appropriate threat level
- **Processing time**: Should take a few seconds for 50 rows
- **Error handling**: Any malformed data should show as errors

## Troubleshooting

### API Not Connected
- Check backend is running: `http://localhost:8000/health`
- Check CORS settings in backend
- Check network connectivity

### Upload Fails
- Verify CSV format matches expected columns
- Check file size (should be under 50MB)
- Check browser console for errors

### ML Processing Fails
- Check backend logs for model loading errors
- Verify ML models are in the correct path
- Check that CSV data matches expected format

### No Predictions
- Verify CSV data has numeric values for all required fields
- Check that protocol_type, service, and flag have valid string values
- Ensure all required columns are present

## Sample Test Data
You can create different test scenarios by modifying the CSV data:

- **Normal traffic**: Use the sample data above
- **DDoS attack**: Set high values for count, srv_count, dst_host_count
- **Scanning**: Set moderate values for count and srv_count
- **Injection**: Set high num_failed_logins and low logged_in
- **Backdoor**: Set root_shell, num_root, num_shells to 1

The ML model will classify each row and provide threat type and level predictions. 