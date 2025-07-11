
#!/usr/bin/env python3
"""
Startup script for the Selenium Test Automation Framework Backend
"""

import os
import sys
import subprocess

def install_requirements():
    """Install required packages"""
    print("🔧 Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Packages installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install packages: {e}")
        return False
    return True

def test_database_connection():
    """Test database connection"""
    print("🔍 Testing database connection...")
    try:
        import pyodbc
        conn_str = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=LPT2084-B1;DATABASE=Ixigo_TestAutomation;Trusted_Connection=yes;"
        conn = pyodbc.connect(conn_str)
        conn.close()
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("📋 Please ensure:")
        print("  - SQL Server is running")
        print("  - Database 'Ixigo_TestAutomation' exists")
        print("  - ODBC Driver 17 for SQL Server is installed")
        return False

def start_flask_app():
    """Start Flask application"""
    print("🚀 Starting Flask application...")
    try:
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        print(f"❌ Failed to start Flask app: {e}")

if __name__ == "__main__":
    print("🏁 Starting Selenium Test Automation Framework Backend")
    print("=" * 60)
    
    # Install requirements
    if not install_requirements():
        sys.exit(1)
    
    # Test database connection
    if not test_database_connection():
        print("⚠️  Database connection failed, but starting Flask app anyway...")
    
    # Start Flask application
    start_flask_app()
