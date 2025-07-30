# File Persistence Feature

## Overview
The CSV upload functionality now includes file persistence, allowing uploaded files to be saved and accessed later. Files are stored in the MongoDB database and can be retrieved across browser sessions.

## New Backend Endpoints

### 1. Save CSV File
```http
POST /api/save-csv-file
Content-Type: application/json

{
  "name": "threat_data.csv",
  "size": "2.4 MB",
  "status": "completed",
  "uploadDate": "2024-01-15T10:30:00.000Z",
  "records": 1247,
  "errors": 0,
  "warnings": 3,
  "data": [...]
}
```

**Response:**
```json
{
  "message": "CSV file saved successfully",
  "file_id": "507f1f77bcf86cd799439011",
  "filename": "threat_data.csv"
}
```

### 2. Get Saved CSV Files
```http
GET /api/saved-csv-files
```

**Response:**
```json
{
  "files": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "threat_data.csv",
      "size": "2.4 MB",
      "status": "completed",
      "uploadDate": "2024-01-15T10:30:00.000Z",
      "records": 1247,
      "errors": 0,
      "warnings": 3,
      "data": [...]
    }
  ]
}
```

### 3. Delete Saved CSV File
```http
DELETE /api/saved-csv-files/{file_id}
```

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

## Frontend Changes

### New API Functions
- `saveCSVFile(fileData)` - Saves file data to backend
- `getSavedCSVFiles()` - Retrieves all saved files
- `deleteSavedCSVFile(fileId)` - Deletes a specific file

### Component Updates
1. **CSVUpload.jsx** now loads saved files on component mount
2. **File upload** automatically saves files to backend
3. **File deletion** removes files from both frontend and backend
4. **Loading states** added for better user experience

## Database Schema

### Collection: `saved_csv_files`
```javascript
{
  "_id": ObjectId,
  "filename": String,
  "size": String,
  "status": String,
  "upload_date": DateTime,
  "records": Number,
  "errors": Number,
  "warnings": Number,
  "data": Array,  // The actual CSV data
  "created_at": DateTime
}
```

## Features

### ✅ Implemented
- [x] Save uploaded CSV files to database
- [x] Save JSON data files to database
- [x] Load saved files on page refresh
- [x] Delete files from both frontend and backend
- [x] Loading states and error handling
- [x] Automatic file persistence across sessions

### 🔄 User Experience
- Files are automatically saved when uploaded
- Files persist across browser sessions
- Loading indicator shows when files are being retrieved
- Error handling for failed saves/deletions
- Empty state when no files are uploaded

## Usage

1. **Upload a CSV file** - File is automatically saved
2. **Refresh the page** - Files are loaded from database
3. **Delete a file** - Removed from both frontend and backend
4. **Process with ML** - Works with saved files

## Error Handling

- If file save fails, file is still added to local state
- If file deletion fails, local state is still updated
- Network errors are logged and user is notified
- Graceful degradation when backend is unavailable

## Testing

To test the feature:

1. Start the backend: `uvicorn main:app --reload`
2. Start the frontend: `npm run dev`
3. Upload a CSV file
4. Refresh the page - file should still be there
5. Delete the file - should be removed permanently 