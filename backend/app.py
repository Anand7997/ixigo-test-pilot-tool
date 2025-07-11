
from flask import Flask, request, jsonify
from flask_cors import CORS
import pyodbc
import json
from datetime import datetime
import traceback

app = Flask(__name__)
CORS(app)

# Database configuration
DB_CONFIG = {
    'server': 'LPT2084-B1',
    'database': 'Ixigo_TestAutomation',
    'driver': 'ODBC Driver 17 for SQL Server',
    'trusted_connection': 'yes'
}

def get_db_connection():
    """Get database connection"""
    try:
        conn_str = f"DRIVER={{{DB_CONFIG['driver']}}};SERVER={DB_CONFIG['server']};DATABASE={DB_CONFIG['database']};Trusted_Connection={DB_CONFIG['trusted_connection']};"
        conn = pyodbc.connect(conn_str)
        return conn
    except Exception as e:
        print(f"Database connection error: {str(e)}")
        raise

# Projects API
@app.route('/api/projects', methods=['GET'])
def get_projects():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create Projects table if not exists
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Projects' AND xtype='U')
            CREATE TABLE Projects (
                id INT IDENTITY(1,1) PRIMARY KEY,
                name NVARCHAR(255) NOT NULL,
                description NVARCHAR(500),
                status NVARCHAR(50) DEFAULT 'Active',
                created_date DATETIME DEFAULT GETDATE()
            )
        """)
        
        cursor.execute("SELECT id, name, description, status, created_date FROM Projects")
        projects = []
        for row in cursor.fetchall():
            projects.append({
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'status': row[3],
                'created_date': row[4].isoformat() if row[4] else None
            })
        
        conn.close()
        return jsonify(projects)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/projects', methods=['POST'])
def create_project():
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO Projects (name, description, status)
            VALUES (?, ?, ?)
        """, (data['name'], data['description'], data.get('status', 'Active')))
        
        conn.commit()
        project_id = cursor.execute("SELECT @@IDENTITY").fetchone()[0]
        conn.close()
        
        return jsonify({'id': project_id, 'message': 'Project created successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE Projects 
            SET name = ?, description = ?, status = ?
            WHERE id = ?
        """, (data['name'], data['description'], data.get('status', 'Active'), project_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Project updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM Projects WHERE id = ?", (project_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Project deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Test Cases API
@app.route('/api/testcases/<int:project_id>', methods=['GET'])
def get_testcases(project_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create TestCases table if not exists
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='TestCases' AND xtype='U')
            CREATE TABLE TestCases (
                id INT IDENTITY(1,1) PRIMARY KEY,
                project_id INT,
                name NVARCHAR(255) NOT NULL,
                description NVARCHAR(500),
                priority NVARCHAR(50) DEFAULT 'Medium',
                status NVARCHAR(50) DEFAULT 'Active',
                created_date DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (project_id) REFERENCES Projects(id)
            )
        """)
        
        cursor.execute("SELECT id, name, description, priority, status, created_date FROM TestCases WHERE project_id = ?", (project_id,))
        testcases = []
        for row in cursor.fetchall():
            testcases.append({
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'priority': row[3],
                'status': row[4],
                'created_date': row[5].isoformat() if row[5] else None
            })
        
        conn.close()
        return jsonify(testcases)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/testcases', methods=['POST'])
def create_testcase():
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert test case
        cursor.execute("""
            INSERT INTO TestCases (project_id, name, description, priority, status)
            VALUES (?, ?, ?, ?, ?)
        """, (data['project_id'], data['name'], data['description'], data.get('priority', 'Medium'), data.get('status', 'Active')))
        
        testcase_id = cursor.execute("SELECT @@IDENTITY").fetchone()[0]
        
        # Create test case table
        table_name = data['name'].replace(' ', '_').replace('-', '_')
        cursor.execute(f"""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='{table_name}' AND xtype='U')
            CREATE TABLE [{table_name}] (
                id INT IDENTITY(1,1) PRIMARY KEY,
                tc_id NVARCHAR(50),
                step_no INT,
                test_step_description NVARCHAR(500),
                element_name NVARCHAR(255),
                action_type NVARCHAR(100),
                xpath NVARCHAR(1000),
                values NVARCHAR(500),
                expected_result NVARCHAR(500),
                actual_result NVARCHAR(500),
                status NVARCHAR(20) DEFAULT 'Not Executed'
            )
        """)
        
        # Create results table
        results_table_name = f"{table_name}_Results"
        cursor.execute(f"""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='{results_table_name}' AND xtype='U')
            CREATE TABLE [{results_table_name}] (
                result_id INT IDENTITY(1,1) PRIMARY KEY,
                testcase_name NVARCHAR(255),
                tc_id NVARCHAR(50),
                test_mode NVARCHAR(50) DEFAULT 'Automated',
                status NVARCHAR(20),
                total_steps INT,
                passed_steps INT,
                failed_steps INT,
                execution_time NVARCHAR(50),
                test_data NVARCHAR(1000),
                step_results NVARCHAR(2000),
                error_message NVARCHAR(1000),
                execution_date DATETIME DEFAULT GETDATE()
            )
        """)
        
        conn.commit()
        conn.close()
        
        return jsonify({'id': testcase_id, 'message': 'Test case and tables created successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Test Steps API
@app.route('/api/teststeps/<testcase_name>', methods=['GET'])
def get_teststeps(testcase_name):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        table_name = testcase_name.replace(' ', '_').replace('-', '_')
        cursor.execute(f"SELECT id, tc_id, step_no, test_step_description, element_name, action_type, xpath, values FROM [{table_name}] ORDER BY step_no")
        
        steps = []
        for row in cursor.fetchall():
            steps.append({
                'id': row[0],
                'tc_id': row[1],
                'step_no': row[2],
                'test_step_description': row[3],
                'element_name': row[4],
                'action_type': row[5],
                'xpath': row[6],
                'values': row[7]
            })
        
        conn.close()
        return jsonify(steps)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/teststeps/<testcase_name>', methods=['POST'])
def create_teststep(testcase_name):
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        
        table_name = testcase_name.replace(' ', '_').replace('-', '_')
        cursor.execute(f"""
            INSERT INTO [{table_name}] (tc_id, step_no, test_step_description, element_name, action_type, xpath, values)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (data['tc_id'], data['step_no'], data['test_step_description'], 
              data['element_name'], data['action_type'], data['xpath'], data['values']))
        
        step_id = cursor.execute("SELECT @@IDENTITY").fetchone()[0]
        conn.commit()
        conn.close()
        
        return jsonify({'id': step_id, 'message': 'Test step created successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/teststeps/<testcase_name>/<int:step_id>', methods=['PUT'])
def update_teststep(testcase_name, step_id):
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        
        table_name = testcase_name.replace(' ', '_').replace('-', '_')
        cursor.execute(f"""
            UPDATE [{table_name}] 
            SET tc_id = ?, step_no = ?, test_step_description = ?, element_name = ?, 
                action_type = ?, xpath = ?, values = ?
            WHERE id = ?
        """, (data['tc_id'], data['step_no'], data['test_step_description'], 
              data['element_name'], data['action_type'], data['xpath'], data['values'], step_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Test step updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/teststeps/<testcase_name>/<int:step_id>', methods=['DELETE'])
def delete_teststep(testcase_name, step_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        table_name = testcase_name.replace(' ', '_').replace('-', '_')
        cursor.execute(f"DELETE FROM [{table_name}] WHERE id = ?", (step_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Test step deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Test Execution API
@app.route('/api/execute/<testcase_name>', methods=['POST'])
def execute_testcase(testcase_name):
    try:
        from test_executor import TestExecutor
        
        executor = TestExecutor()
        result = executor.execute_test_case(testcase_name)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Results API
@app.route('/api/results/<testcase_name>', methods=['GET'])
def get_results(testcase_name):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        results_table_name = f"{testcase_name.replace(' ', '_').replace('-', '_')}_Results"
        cursor.execute(f"""
            SELECT result_id, testcase_name, tc_id, test_mode, status, total_steps, 
                   passed_steps, failed_steps, execution_time, test_data, step_results, 
                   error_message, execution_date 
            FROM [{results_table_name}] 
            ORDER BY execution_date DESC
        """)
        
        results = []
        for row in cursor.fetchall():
            results.append({
                'result_id': row[0],
                'testcase_name': row[1],
                'tc_id': row[2],
                'test_mode': row[3],
                'status': row[4],
                'total_steps': row[5],
                'passed_steps': row[6],
                'failed_steps': row[7],
                'execution_time': row[8],
                'test_data': row[9],
                'step_results': row[10],
                'error_message': row[11],
                'execution_date': row[12].isoformat() if row[12] else None
            })
        
        conn.close()
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
