from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
import pandas as pd
from database import get_database
from bson import ObjectId
import logging
import io
import base64
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

logger = logging.getLogger(__name__)

router = APIRouter()

class ReportRequest(BaseModel):
    report_type: str
    date_range: str
    threat_type: str = "all"
    format: str = "pdf"
    include_charts: bool = True
    include_details: bool = True
    user_id: Optional[str] = None

class ReportResponse(BaseModel):
    report_id: str
    status: str
    download_url: Optional[str] = None
    message: str

class FileUploadResponse(BaseModel):
    file_id: str
    filename: str
    message: str

def serialize_mongo_document(doc):
    """Serialize MongoDB document by converting ObjectId and datetime fields"""
    if not doc:
        return doc
    
    serialized = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            serialized[key] = str(value)
        elif isinstance(value, datetime):
            serialized[key] = value.isoformat()
        elif isinstance(value, dict):
            serialized[key] = serialize_mongo_document(value)
        elif isinstance(value, list):
            serialized[key] = [serialize_mongo_document(item) if isinstance(item, dict) else item for item in value]
        else:
            serialized[key] = value
    return serialized

def serialize_mongo_documents(docs):
    """Serialize a list of MongoDB documents"""
    return [serialize_mongo_document(doc) for doc in docs]

@router.post("/generate-report", response_model=ReportResponse)
async def generate_report(request: ReportRequest):
    """Generate comprehensive threat analysis report"""
    try:
        db = await get_database()
        
        # Calculate date range
        end_date = datetime.now()
        if request.date_range == "7":
            start_date = end_date - timedelta(days=7)
        elif request.date_range == "30":
            start_date = end_date - timedelta(days=30)
        elif request.date_range == "90":
            start_date = end_date - timedelta(days=90)
        elif request.date_range == "365":
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=30)  # Default to 30 days
        
        # Generate report ID
        report_id = str(ObjectId())
        
        # Collect data based on report type
        report_data = await collect_report_data(
            db, request.report_type, start_date, end_date, 
            request.threat_type, request.user_id
        )
        
        # Generate report content
        report_content = generate_report_content(
            report_data, request.report_type, start_date, end_date, 
            request.include_charts, request.include_details
        )
        
        # Save report to database
        report_doc = {
            "_id": ObjectId(report_id),
            "report_type": request.report_type,
            "date_range": request.date_range,
            "threat_type": request.threat_type,
            "format": request.format,
            "include_charts": request.include_charts,
            "include_details": request.include_details,
            "user_id": request.user_id,
            "generated_date": datetime.now(),
            "start_date": start_date,
            "end_date": end_date,
            "status": "completed",
            "content": report_content,
            "download_url": f"/api/reports/download/{report_id}"
        }
        
        await db.reports.insert_one(report_doc)
        
        return ReportResponse(
            report_id=report_id,
            status="completed",
            download_url=f"/api/reports/download/{report_id}",
            message="Report generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@router.get("/reports")
async def get_reports(user_id: Optional[str] = None, limit: int = 50):
    """Get list of generated reports"""
    try:
        db = await get_database()
        
        query = {}
        if user_id:
            query["user_id"] = user_id
        
        reports = await db.reports.find(query).sort("generated_date", -1).limit(limit).to_list(length=limit)
        
        # Serialize reports for JSON response
        serialized_reports = serialize_mongo_documents(reports)
        
        return {"reports": serialized_reports}
        
    except Exception as e:
        logger.error(f"Error fetching reports: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch reports: {str(e)}")

@router.get("/download/{report_id}")
async def download_report(report_id: str):
    """Download generated report"""
    try:
        db = await get_database()
        
        report = await db.reports.find_one({"_id": ObjectId(report_id)})
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Generate downloadable content based on format
        if report["format"] == "pdf":
            # Generate PDF report
            pdf_content = generate_pdf_report(report["content"], f"report_{report_id}.pdf")
            return {
                "content": base64.b64encode(pdf_content).decode('utf-8'),
                "filename": f"netaegis_report_{report_id}.pdf",
                "content_type": "application/pdf"
            }
        elif report["format"] == "csv":
            # Convert to CSV format
            csv_content = convert_to_csv(report["content"])
            return {
                "content": csv_content,
                "filename": f"netaegis_report_{report_id}.csv",
                "content_type": "text/csv"
            }
        else:
            return {
                "content": json.dumps(report["content"], indent=2),
                "filename": f"netaegis_report_{report_id}.json",
                "content_type": "application/json"
            }
            
    except Exception as e:
        logger.error(f"Error downloading report: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to download report: {str(e)}")

@router.delete("/reports/{report_id}")
async def delete_report(report_id: str):
    """Delete a generated report"""
    try:
        db = await get_database()
        
        result = await db.reports.delete_one({"_id": ObjectId(report_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return {"message": "Report deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting report: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete report: {str(e)}")

@router.post("/create-test-data")
async def create_test_data():
    """Create sample data for testing report generation"""
    try:
        db = await get_database()
        
        # Create sample threat detections
        sample_threats = [
            {
                "timestamp": datetime.now() - timedelta(days=1),
                "threat_type": "ddos",
                "source_ip": "192.168.1.100",
                "destination_ip": "192.168.1.200",
                "severity": "high",
                "confidence": 0.95
            },
            {
                "timestamp": datetime.now() - timedelta(days=2),
                "threat_type": "scanning",
                "source_ip": "10.0.0.50",
                "destination_ip": "10.0.0.100",
                "severity": "medium",
                "confidence": 0.87
            },
            {
                "timestamp": datetime.now() - timedelta(days=3),
                "threat_type": "normal",
                "source_ip": "172.16.0.10",
                "destination_ip": "172.16.0.20",
                "severity": "low",
                "confidence": 0.99
            }
        ]
        
        # Insert sample threats
        await db.threat_detections.insert_many(sample_threats)
        
        # Create sample users
        sample_users = [
            {
                "_id": ObjectId(),
                "username": "admin",
                "email": "admin@netaegis.com",
                "role": "admin",
                "created_at": datetime.now() - timedelta(days=30)
            },
            {
                "_id": ObjectId(),
                "username": "user1",
                "email": "user1@netaegis.com",
                "role": "user",
                "created_at": datetime.now() - timedelta(days=15)
            }
        ]
        
        # Insert sample users
        await db.users.insert_many(sample_users)
        
        # Create sample model performance
        sample_performance = {
            "timestamp": datetime.now(),
            "accuracy": 0.95,
            "precision": 0.92,
            "recall": 0.88,
            "f1_score": 0.90
        }
        
        await db.model_performance.insert_one(sample_performance)
        
        return {"message": "Test data created successfully", "threats": len(sample_threats), "users": len(sample_users)}
        
    except Exception as e:
        logger.error(f"Error creating test data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create test data: {str(e)}")

@router.post("/upload-file", response_model=FileUploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload a file for analysis"""
    try:
        db = await get_database()
        file_content = await file.read()
        file_id = str(ObjectId())
        filename = file.filename
        
        # Store file in MongoDB
        await db.uploaded_files.insert_one({
            "_id": ObjectId(file_id),
            "filename": filename,
            "content": base64.b64encode(file_content).decode('utf-8'),
            "uploaded_at": datetime.now()
        })
        
        return FileUploadResponse(file_id=file_id, filename=filename, message="File uploaded successfully")
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@router.post("/save-csv-file")
async def save_csv_file(file_data: Dict[str, Any]):
    """Save CSV file data with metadata for later access"""
    try:
        db = await get_database()
        file_id = str(ObjectId())
        
        # Store file data in MongoDB
        file_doc = {
            "_id": ObjectId(file_id),
            "filename": file_data.get("name", "unknown.csv"),
            "size": file_data.get("size", "0 MB"),
            "status": file_data.get("status", "completed"),
            "upload_date": datetime.fromisoformat(file_data.get("uploadDate", datetime.now().isoformat())),
            "records": file_data.get("records", 0),
            "errors": file_data.get("errors", 0),
            "warnings": file_data.get("warnings", 0),
            "data": file_data.get("data", []),  # Store the actual CSV data
            "created_at": datetime.now()
        }
        
        await db.saved_csv_files.insert_one(file_doc)
        
        return {
            "message": "CSV file saved successfully",
            "file_id": file_id,
            "filename": file_doc["filename"]
        }
        
    except Exception as e:
        logger.error(f"Error saving CSV file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save CSV file: {str(e)}")

@router.get("/saved-csv-files")
async def get_saved_csv_files():
    """Get list of saved CSV files"""
    try:
        db = await get_database()
        files = await db.saved_csv_files.find({}).sort("created_at", -1).to_list(length=100)
        
        # Serialize files for JSON response
        serialized_files = []
        for file in files:
            serialized_files.append({
                "id": str(file["_id"]),
                "name": file["filename"],
                "size": file["size"],
                "status": file["status"],
                "uploadDate": file["upload_date"].isoformat(),
                "records": file["records"],
                "errors": file["errors"],
                "warnings": file["warnings"],
                "data": file.get("data", [])  # Include the actual data
            })
        
        return {"files": serialized_files}
        
    except Exception as e:
        logger.error(f"Error fetching saved CSV files: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch saved CSV files: {str(e)}")

@router.delete("/saved-csv-files/{file_id}")
async def delete_saved_csv_file(file_id: str):
    """Delete a saved CSV file"""
    try:
        db = await get_database()
        
        # Check if file exists
        file = await db.saved_csv_files.find_one({"_id": ObjectId(file_id)})
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Delete the file
        await db.saved_csv_files.delete_one({"_id": ObjectId(file_id)})
        
        return {"message": "File deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting saved CSV file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete saved CSV file: {str(e)}")

@router.post("/save-visualization")
async def save_visualization(visualization_data: Dict[str, Any]):
    """Save threat visualization data"""
    try:
        db = await get_database()
        visualization_id = str(ObjectId())
        
        # Store visualization data in MongoDB
        visualization_doc = {
            "_id": ObjectId(visualization_id),
            "user_id": visualization_data.get("userId", "default-user"),
            "file_meta": visualization_data.get("fileMeta", {}),
            "results": visualization_data.get("results", []),
            "charts_data": visualization_data.get("chartsData", {}),
            "created_at": datetime.now(),
            "title": visualization_data.get("title", "Threat Analysis"),
            "description": visualization_data.get("description", "")
        }
        
        await db.saved_visualizations.insert_one(visualization_doc)
        
        return {
            "message": "Visualization saved successfully",
            "visualization_id": visualization_id
        }
        
    except Exception as e:
        logger.error(f"Error saving visualization: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save visualization: {str(e)}")

@router.get("/saved-visualizations/{user_id}")
async def get_saved_visualizations(user_id: str):
    """Get saved visualizations for a user"""
    try:
        db = await get_database()
        visualizations = await db.saved_visualizations.find({"user_id": user_id}).sort("created_at", -1).to_list(length=50)
        
        # Serialize visualizations for JSON response
        serialized_visualizations = []
        for vis in visualizations:
            serialized_visualizations.append({
                "id": str(vis["_id"]),
                "fileMeta": vis["file_meta"],
                "results": vis["results"],
                "chartsData": vis.get("charts_data", {}),
                "createdAt": vis["created_at"].isoformat(),
                "title": vis.get("title", "Threat Analysis"),
                "description": vis.get("description", "")
            })
        
        return {"visualizations": serialized_visualizations}
        
    except Exception as e:
        logger.error(f"Error fetching saved visualizations: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch saved visualizations: {str(e)}")

@router.delete("/saved-visualizations/{visualization_id}")
async def delete_saved_visualization(visualization_id: str):
    """Delete a saved visualization"""
    try:
        db = await get_database()
        
        # Check if visualization exists
        visualization = await db.saved_visualizations.find_one({"_id": ObjectId(visualization_id)})
        if not visualization:
            raise HTTPException(status_code=404, detail="Visualization not found")
        
        # Delete the visualization
        await db.saved_visualizations.delete_one({"_id": ObjectId(visualization_id)})
        
        return {"message": "Visualization deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting saved visualization: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete saved visualization: {str(e)}")

@router.post("/admin/store-ml-results")
async def store_ml_results(data: Dict[str, Any]):
    """Store ML processing results for report generation"""
    try:
        db = await get_database()
        
        # Store the processed data
        ml_result_id = str(ObjectId())
        ml_result_doc = {
            "_id": ObjectId(ml_result_id),
            "processed_data": data.get("processedData", []),
            "file_name": data.get("fileName", "Unknown"),
            "total_records": data.get("totalRecords", 0),
            "processed_records": data.get("processedRecords", 0),
            "errors": data.get("errors", 0),
            "warnings": data.get("warnings", 0),
            "upload_date": datetime.fromisoformat(data.get("uploadDate", datetime.now().isoformat())),
            "created_at": datetime.now()
        }
        
        await db.ml_results.insert_one(ml_result_doc)
        
        return {"message": "ML results stored successfully", "result_id": ml_result_id}
        
    except Exception as e:
        logger.error(f"Error storing ML results: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to store ML results: {str(e)}")

@router.get("/ml-results")
async def get_ml_results():
    """Get list of ML processing results"""
    try:
        db = await get_database()
        results = await db.ml_results.find({}).sort("created_at", -1).to_list(length=100)
        
        # Serialize results for JSON response
        serialized_results = []
        for result in results:
            serialized_results.append({
                "_id": str(result["_id"]),
                "file_name": result["file_name"],
                "total_records": result["total_records"],
                "processed_records": result["processed_records"],
                "errors": result["errors"],
                "warnings": result["warnings"],
                "upload_date": result["upload_date"].isoformat(),
                "created_at": result["created_at"].isoformat()
            })
        
        return {"results": serialized_results}
        
    except Exception as e:
        logger.error(f"Error fetching ML results: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch ML results: {str(e)}")

async def collect_report_data(db, report_type: str, start_date: datetime, end_date: datetime, 
                            threat_type: str, user_id: Optional[str] = None) -> Dict[str, Any]:
    """Collect data for report generation"""
    
    data = {
        "summary": {},
        "threats": [],
        "users": [],
        "system_stats": {},
        "charts_data": {}
    }
    
    try:
        # Always get ML results from database (from CSV upload processing)
        ml_results = await db.ml_results.find({}).sort("created_at", -1).to_list(length=1000)
        
        if ml_results:
            # Convert ML results to threat format
            threats = []
            for result in ml_results:
                for processed_record in result.get("processed_data", []):
                    # Determine threat type based on ML prediction
                    threat_type_detected = "normal"
                    severity = "low"
                    confidence = 75.0
                    
                    # You can add logic here to determine threat type based on ML features
                    # For now, using some basic heuristics
                    if processed_record.get("label", 0) == 1:
                        threat_type_detected = "network_anomaly"
                        severity = "medium"
                        confidence = 85.0
                    
                    # Check for suspicious patterns
                    if processed_record.get("duration", 0) > 100:
                        threat_type_detected = "ddos"
                        severity = "high"
                        confidence = 90.0
                    
                    if processed_record.get("src_bytes", 0) > 1000000:
                        threat_type_detected = "data_exfiltration"
                        severity = "high"
                        confidence = 88.0
                    
                    threat = {
                        "source_ip": processed_record.get("src_ip", "N/A"),
                        "destination_ip": processed_record.get("dst_ip", "N/A"),
                        "threat_type": threat_type_detected,
                        "severity": severity,
                        "confidence": confidence,
                        "timestamp": result.get("created_at", datetime.now()),
                        "file_name": result.get("file_name", "Unknown"),
                        "protocol": processed_record.get("proto", "tcp"),
                        "service": processed_record.get("service", "-"),
                        "duration": processed_record.get("duration", 0),
                        "src_bytes": processed_record.get("src_bytes", 0),
                        "dst_bytes": processed_record.get("dst_bytes", 0),
                        "src_pkts": processed_record.get("src_pkts", 0),
                        "dst_pkts": processed_record.get("dst_pkts", 0)
                    }
                    threats.append(threat)
            
            data["threats"] = serialize_mongo_documents(threats)
            logger.info(f"Found {len(threats)} threats from ML results")
        else:
            # Fallback to threat_detections collection if no ML results
            threat_query = {
                "timestamp": {
                    "$gte": start_date,
                    "$lte": end_date
                }
            }
            
            if threat_type != "all":
                threat_query["threat_type"] = threat_type
            
            if user_id:
                threat_query["user_id"] = user_id
            
            threats = await db.threat_detections.find(threat_query).to_list(length=1000)
            data["threats"] = serialize_mongo_documents(threats)
            logger.info(f"Found {len(threats)} threats from threat_detections collection")
        
        # Get user data
        collections = await db.list_collection_names()
        if "users" in collections:
            if user_id:
                try:
                    user = await db.users.find_one({"_id": ObjectId(user_id)})
                    if user:
                        data["users"].append(serialize_mongo_document(user))
                except:
                    logger.warning(f"Invalid user_id: {user_id}")
            else:
                users = await db.users.find({}).to_list(length=100)
                data["users"] = serialize_mongo_documents(users)
        else:
            data["users"] = []
            logger.warning("users collection not found")
        
    except Exception as e:
        logger.error(f"Error collecting report data: {e}")
        data["threats"] = []
        data["users"] = []
    
    # Calculate summary statistics
    data["summary"] = calculate_summary_stats(data["threats"])
    
    # Get system statistics
    data["system_stats"] = await get_system_stats(db, start_date, end_date)
    
    # Prepare charts data
    data["charts_data"] = prepare_charts_data(data["threats"], start_date, end_date)
    
    return data

def calculate_summary_stats(threats: List[Dict]) -> Dict[str, Any]:
    """Calculate summary statistics from threat data"""
    
    if not threats:
        return {
            "total_threats": 0,
            "threat_types": {},
            "severity_levels": {},
            "top_sources": [],
            "top_destinations": []
        }
    
    threat_types = {}
    severity_levels = {}
    sources = {}
    destinations = {}
    
    for threat in threats:
        # Count threat types
        threat_type = threat.get("threat_type", "unknown")
        threat_types[threat_type] = threat_types.get(threat_type, 0) + 1
        
        # Count severity levels
        severity = threat.get("severity", "medium")
        severity_levels[severity] = severity_levels.get(severity, 0) + 1
        
        # Count sources
        source = threat.get("source_ip", "unknown")
        sources[source] = sources.get(source, 0) + 1
        
        # Count destinations
        dest = threat.get("destination_ip", "unknown")
        destinations[dest] = destinations.get(dest, 0) + 1
    
    return {
        "total_threats": len(threats),
        "threat_types": threat_types,
        "severity_levels": severity_levels,
        "top_sources": sorted(sources.items(), key=lambda x: x[1], reverse=True)[:10],
        "top_destinations": sorted(destinations.items(), key=lambda x: x[1], reverse=True)[:10]
    }

async def get_system_stats(db, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
    """Get system performance and usage statistics"""
    
    try:
        # Get total users
        total_users = await db.users.count_documents({})
    except:
        total_users = 0
        logger.warning("Could not count users")
    
    try:
        # Get ML results statistics
        ml_results = await db.ml_results.find({}).to_list(length=1000)
        total_ml_processed = len(ml_results)
        total_records_processed = sum(result.get("processed_records", 0) for result in ml_results)
        total_errors = sum(result.get("errors", 0) for result in ml_results)
        total_warnings = sum(result.get("warnings", 0) for result in ml_results)
    except:
        total_ml_processed = 0
        total_records_processed = 0
        total_errors = 0
        total_warnings = 0
        logger.warning("Could not fetch ML results")
    
    try:
        # Get total threat detections
        total_threats = await db.threat_detections.count_documents({
            "timestamp": {
                "$gte": start_date,
                "$lte": end_date
            }
        })
    except:
        total_threats = 0
        logger.warning("Could not count threat detections")
    
    try:
        # Get model performance stats
        model_stats = await db.model_performance.find_one({}, sort=[("timestamp", -1)])
    except:
        model_stats = None
        logger.warning("Could not fetch model performance stats")
    
    return {
        "total_users": total_users,
        "total_threats": total_threats,
        "total_ml_processed": total_ml_processed,
        "total_records_processed": total_records_processed,
        "total_errors": total_errors,
        "total_warnings": total_warnings,
        "model_accuracy": model_stats.get("accuracy", 0) if model_stats else 0,
        "model_precision": model_stats.get("precision", 0) if model_stats else 0,
        "model_recall": model_stats.get("recall", 0) if model_stats else 0
    }

def prepare_charts_data(threats: List[Dict], start_date: datetime, end_date: datetime) -> Dict[str, Any]:
    """Prepare data for charts and visualizations"""
    
    # Daily threat counts
    daily_counts = {}
    current_date = start_date
    while current_date <= end_date:
        daily_counts[current_date.strftime("%Y-%m-%d")] = 0
        current_date += timedelta(days=1)
    
    for threat in threats:
        threat_date = threat.get("timestamp", datetime.now()).strftime("%Y-%m-%d")
        if threat_date in daily_counts:
            daily_counts[threat_date] += 1
    
    # Threat type distribution
    threat_types = {}
    for threat in threats:
        threat_type = threat.get("threat_type", "unknown")
        threat_types[threat_type] = threat_types.get(threat_type, 0) + 1
    
    return {
        "daily_threats": list(daily_counts.items()),
        "threat_type_distribution": list(threat_types.items()),
        "severity_distribution": {},
        "hourly_distribution": {}
    }

def generate_report_content(data: Dict[str, Any], report_type: str, start_date: datetime, 
                           end_date: datetime, include_charts: bool, include_details: bool) -> Dict[str, Any]:
    """Generate comprehensive report content"""
    
    report_content = {
        "title": f"NetAegis {report_type.replace('_', ' ').title()} Report",
        "generated_date": datetime.now().isoformat(),
        "date_range": f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}",
        "summary": data.get("summary", {}),
        "threats": data.get("threats", []),
        "users": data.get("users", []),
        "system_stats": data.get("system_stats", {}),
        "charts_data": data.get("charts_data", {}) if include_charts else {}
    }
    
    return report_content

def generate_pdf_report(report_data: Dict[str, Any], filename: str) -> bytes:
    """Generate PDF report using ReportLab"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=1,  # Center alignment
        textColor=colors.darkblue
    )
    story.append(Paragraph(report_data["title"], title_style))
    story.append(Spacer(1, 20))
    
    # Report metadata
    meta_style = ParagraphStyle(
        'MetaInfo',
        parent=styles['Normal'],
        fontSize=12,
        spaceAfter=20
    )
    story.append(Paragraph(f"Generated: {report_data['generated_date']}", meta_style))
    story.append(Paragraph(f"Date Range: {report_data['date_range']}", meta_style))
    story.append(Spacer(1, 20))
    
    # Summary section
    if report_data.get("summary"):
        story.append(Paragraph("Executive Summary", styles['Heading2']))
        story.append(Spacer(1, 12))
        
        summary = report_data["summary"]
        summary_data = [
            ["Metric", "Value"],
            ["Total Threats Detected", str(summary.get("total_threats", 0))],
            ["High Severity Threats", str(summary.get("high_severity", 0))],
            ["Medium Severity Threats", str(summary.get("medium_severity", 0))],
            ["Low Severity Threats", str(summary.get("low_severity", 0))],
            ["Most Common Threat Type", summary.get("most_common_type", "N/A")],
            ["Average Confidence Score", f"{summary.get('avg_confidence', 0):.2f}%"]
        ]
        
        summary_table = Table(summary_data)
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 20))
    
    # System statistics
    if report_data.get("system_stats"):
        story.append(Paragraph("System Performance", styles['Heading2']))
        story.append(Spacer(1, 12))
        
        stats = report_data["system_stats"]
        stats_data = [
            ["Metric", "Value"],
            ["Total Users", str(stats.get("total_users", 0))],
            ["Total ML Processing Sessions", str(stats.get("total_ml_processed", 0))],
            ["Total Records Processed", str(stats.get("total_records_processed", 0))],
            ["Total Processing Errors", str(stats.get("total_errors", 0))],
            ["Total Processing Warnings", str(stats.get("total_warnings", 0))],
            ["Model Accuracy", f"{stats.get('model_accuracy', 0):.2f}%"],
            ["Model Precision", f"{stats.get('model_precision', 0):.2f}%"],
            ["Model Recall", f"{stats.get('model_recall', 0):.2f}%"]
        ]
        
        stats_table = Table(stats_data)
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightblue),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(stats_table)
        story.append(Spacer(1, 20))
    
    # Detailed threat data
    if report_data.get("threats"):
        story.append(Paragraph("Detailed Threat Analysis", styles['Heading2']))
        story.append(Spacer(1, 12))
        
        threats = report_data["threats"][:10]  # Show first 10 threats
        if threats:
            threat_headers = ["Source IP", "Destination IP", "Threat Type", "Severity", "Confidence"]
            threat_data = [threat_headers]
            
            for threat in threats:
                threat_data.append([
                    threat.get("source_ip", "N/A"),
                    threat.get("destination_ip", "N/A"),
                    threat.get("threat_type", "N/A"),
                    threat.get("severity", "N/A"),
                    f"{threat.get('confidence', 0):.2f}%"
                ])
            
            threat_table = Table(threat_data)
            threat_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 10)
            ]))
            story.append(threat_table)
            story.append(Spacer(1, 20))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

def create_threat_visualization(threats: List[Dict]) -> str:
    """Create threat visualization chart and return as base64 string"""
    if not threats:
        return ""
    
    # Create threat type distribution
    threat_types = {}
    severities = {}
    
    for threat in threats:
        threat_type = threat.get("threat_type", "Unknown")
        severity = threat.get("severity", "Unknown")
        
        threat_types[threat_type] = threat_types.get(threat_type, 0) + 1
        severities[severity] = severities.get(severity, 0) + 1
    
    # Create pie chart
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 6))
    
    if threat_types:
        ax1.pie(threat_types.values(), labels=threat_types.keys(), autopct='%1.1f%%')
        ax1.set_title('Threat Type Distribution')
    
    if severities:
        ax2.pie(severities.values(), labels=severities.keys(), autopct='%1.1f%%')
        ax2.set_title('Threat Severity Distribution')
    
    plt.tight_layout()
    
    # Save to buffer
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
    buffer.seek(0)
    plt.close()
    
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

def convert_to_csv(content: Dict[str, Any]) -> str:
    """Convert report content to CSV format"""
    output = io.StringIO()
    
    # Write header
    output.write("NetAegis Security Report\n")
    output.write(f"Generated: {content.get('generated_date', 'N/A')}\n")
    output.write(f"Date Range: {content.get('date_range', 'N/A')}\n\n")
    
    # Write summary
    if content.get("summary"):
        output.write("Summary\n")
        output.write("Metric,Value\n")
        summary = content["summary"]
        output.write(f"Total Threats,{summary.get('total_threats', 0)}\n")
        output.write(f"High Severity,{summary.get('high_severity', 0)}\n")
        output.write(f"Medium Severity,{summary.get('medium_severity', 0)}\n")
        output.write(f"Low Severity,{summary.get('low_severity', 0)}\n")
        output.write(f"Most Common Type,{summary.get('most_common_type', 'N/A')}\n")
        output.write(f"Average Confidence,{summary.get('avg_confidence', 0):.2f}%\n\n")
    
    # Write threat details
    if content.get("threats"):
        output.write("Threat Details\n")
        output.write("Source IP,Destination IP,Threat Type,Severity,Confidence\n")
        for threat in content["threats"]:
            output.write(f"{threat.get('source_ip', 'N/A')},{threat.get('destination_ip', 'N/A')},{threat.get('threat_type', 'N/A')},{threat.get('severity', 'N/A')},{threat.get('confidence', 0):.2f}%\n")
    
    return output.getvalue() 