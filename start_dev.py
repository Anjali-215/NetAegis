#!/usr/bin/env python3
"""
Development startup script for NetAegis
Starts both the backend API server and frontend development server
"""

import subprocess
import sys
import time
import os
from pathlib import Path

def check_python_dependencies():
    """Check if required Python packages are installed"""
    required_packages = [
        'fastapi', 'uvicorn', 'pandas', 'numpy', 'scikit-learn', 'xgboost'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing Python packages: {', '.join(missing_packages)}")
        print("Please install them using: pip install -r backend/requirements.txt")
        return False
    
    print("✅ All Python dependencies are installed")
    return True

def check_node_dependencies():
    """Check if Node.js dependencies are installed"""
    frontend_path = Path("frontend")
    if not (frontend_path / "node_modules").exists():
        print("❌ Frontend dependencies not installed")
        print("Please run: cd frontend && npm install")
        return False
    
    print("✅ Frontend dependencies are installed")
    return True

def start_backend():
    """Start the FastAPI backend server"""
    print("🚀 Starting backend API server...")
    
    backend_path = Path("backend")
    if not backend_path.exists():
        print("❌ Backend directory not found")
        return None
    
    try:
        # Change to backend directory and start server
        process = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
            cwd=backend_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a moment for server to start
        time.sleep(3)
        
        if process.poll() is None:
            print("✅ Backend API server started on http://localhost:8000")
            return process
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Backend server failed to start: {stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return None

def start_frontend():
    """Start the React frontend development server"""
    print("🚀 Starting frontend development server...")
    
    frontend_path = Path("frontend")
    if not frontend_path.exists():
        print("❌ Frontend directory not found")
        return None
    
    try:
        # Check if npm is available
        subprocess.run(["npm", "--version"], check=True, capture_output=True)
        
        # Start frontend development server
        process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=frontend_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a moment for server to start
        time.sleep(5)
        
        if process.poll() is None:
            print("✅ Frontend development server started on http://localhost:5173")
            return process
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Frontend server failed to start: {stderr}")
            return None
            
    except subprocess.CalledProcessError:
        print("❌ npm not found. Please install Node.js and npm")
        return None
    except Exception as e:
        print(f"❌ Error starting frontend: {e}")
        return None

def main():
    """Main function to start both servers"""
    print("🔧 NetAegis Development Environment Setup")
    print("=" * 50)
    
    # Check dependencies
    if not check_python_dependencies():
        return
    
    if not check_node_dependencies():
        return
    
    print("\n🚀 Starting NetAegis development environment...")
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        print("❌ Failed to start backend. Exiting.")
        return
    
    # Start frontend
    frontend_process = start_frontend()
    if not frontend_process:
        print("❌ Failed to start frontend. Stopping backend.")
        backend_process.terminate()
        return
    
    print("\n🎉 NetAegis is now running!")
    print("📊 Backend API: http://localhost:8000")
    print("🌐 Frontend: http://localhost:5173")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop both servers")
    
    try:
        # Keep the script running
        while True:
            time.sleep(1)
            
            # Check if processes are still running
            if backend_process.poll() is not None:
                print("❌ Backend server stopped unexpectedly")
                break
                
            if frontend_process.poll() is not None:
                print("❌ Frontend server stopped unexpectedly")
                break
                
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
        
        # Terminate processes
        if backend_process:
            backend_process.terminate()
            print("✅ Backend server stopped")
            
        if frontend_process:
            frontend_process.terminate()
            print("✅ Frontend server stopped")
            
        print("👋 Goodbye!")

if __name__ == "__main__":
    main() 