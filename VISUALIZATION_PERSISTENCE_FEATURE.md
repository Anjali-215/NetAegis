# Visualization Persistence Feature

## Overview
The Threat Visualization functionality now includes automatic persistence, allowing users to save and access threat analysis visualizations across sessions. Visualizations are stored in the MongoDB database and can be retrieved from the Threat Visualization page.

## New Backend Endpoints

### 1. Save Visualization
```http
POST /api/save-visualization
Content-Type: application/json

{
  "userId": "user123",
  "fileMeta": {
    "name": "threat_data.csv",
    "size": "2.4 MB",
    "records": 1247
  },
  "results": [...],
  "chartsData": {
    "threatTypeData": [...],
    "threatLevelPerType": [...],
    "statusData": [...],
    "topThreatTypes": [...],
    "timeData": [...]
  },
  "title": "Threat Analysis - threat_data.csv",
  "description": "Analysis of 1247 records with 45 threats detected"
}
```

**Response:**
```json
{
  "message": "Visualization saved successfully",
  "visualization_id": "507f1f77bcf86cd799439011"
}
```

### 2. Get Saved Visualizations
```http
GET /api/saved-visualizations/{user_id}
```

**Response:**
```json
{
  "visualizations": [
    {
      "id": "507f1f77bcf86cd799439011",
      "fileMeta": {...},
      "results": [...],
      "chartsData": {...},
      "createdAt": "2024-01-15T10:30:00.000Z",
      "title": "Threat Analysis - threat_data.csv",
      "description": "Analysis of 1247 records with 45 threats detected"
    }
  ]
}
```

### 3. Delete Saved Visualization
```http
DELETE /api/saved-visualizations/{visualization_id}
```

**Response:**
```json
{
  "message": "Visualization deleted successfully"
}
```

## Frontend Changes

### New API Functions
- `saveVisualization(visualizationData)` - Saves visualization data
- `getSavedVisualizations(userId)` - Retrieves saved visualizations
- `deleteSavedVisualization(visualizationId)` - Deletes a visualization

### Component Updates

#### 1. ThreatVisualization.jsx
- **Auto-load**: Saved visualizations are loaded on component mount
- **Save button**: "Save Visualization" button appears when results are available
- **Enhanced display**: Saved visualizations shown as cards with delete functionality
- **Loading states**: Better UX with loading indicators

#### 2. CSVUpload.jsx
- **Auto-save**: "Save Visualization" button in ML results dialog
- **Integration**: Seamless workflow from upload → process → save → view

## Database Schema

### Collection: `saved_visualizations`
```javascript
{
  "_id": ObjectId,
  "user_id": String,
  "file_meta": Object,
  "results": Array,
  "charts_data": Object,
  "created_at": DateTime,
  "title": String,
  "description": String
}
```

## Features

### ✅ Implemented
- [x] Save visualizations with complete data and metadata
- [x] Load saved visualizations on Threat Visualization page
- [x] Delete visualizations from both frontend and backend
- [x] Auto-save option from CSV upload results
- [x] Manual save option from Threat Visualization page
- [x] Enhanced UI with cards and hover effects
- [x] Loading states and error handling
- [x] Cross-session persistence

### 🔄 User Experience
- **From CSV Upload**: Process → Save → View in Threat Visualization
- **From Threat Visualization**: View → Save → Access later
- **Persistent Access**: All saved visualizations available on page load
- **Easy Management**: Delete unwanted visualizations
- **Rich Metadata**: Title, description, record count, creation date

## Usage Workflows

### Workflow 1: CSV Upload → Save → View
1. **Upload CSV file** in CSV Upload page
2. **Process with ML** - Get results
3. **Click "Save Visualization"** in results dialog
4. **Navigate to Threat Visualization** page
5. **View saved visualization** in the saved visualizations section

### Workflow 2: Direct Save from Visualization
1. **Navigate to Threat Visualization** with results
2. **Click "Save Visualization"** button
3. **Visualization saved** and appears in saved list
4. **Access anytime** from the saved visualizations section

### Workflow 3: View Saved Visualizations
1. **Open Threat Visualization** page
2. **Scroll to "Saved Visualizations"** section
3. **Click "View"** on any saved visualization
4. **Full visualization restored** with all charts and data

## UI Enhancements

### Saved Visualizations Display
- **Card Layout**: Clean, organized display
- **Hover Effects**: Subtle animations
- **Delete Button**: Easy removal of unwanted visualizations
- **Metadata Display**: Title, description, record count, date
- **Action Buttons**: View and delete options

### Save Button Integration
- **CSV Upload**: "Save Visualization" button in ML results dialog
- **Threat Visualization**: "Save Visualization" button in header
- **Loading States**: Visual feedback during save operations
- **Success/Error Messages**: Clear user feedback

## Error Handling

- **Save Failures**: Graceful degradation with user notification
- **Load Failures**: Fallback to empty state with helpful message
- **Delete Failures**: Local state updated even if backend fails
- **Network Issues**: Clear error messages and retry options

## Testing

To test the feature:

1. **Start backend**: `uvicorn main:app --reload`
2. **Start frontend**: `npm run dev`
3. **Upload CSV file** and process with ML
4. **Save visualization** from results dialog
5. **Navigate to Threat Visualization** page
6. **View saved visualization** in the saved section
7. **Test deletion** by clicking delete button
8. **Refresh page** - visualizations should persist

## Benefits

- **Data Persistence**: No loss of analysis work
- **Easy Access**: All visualizations in one place
- **Collaboration**: Share saved visualizations with team
- **Historical Analysis**: Compare different time periods
- **Workflow Efficiency**: Seamless save and access process 