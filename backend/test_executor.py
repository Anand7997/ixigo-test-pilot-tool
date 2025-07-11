
import time
import os
import requests
import zipfile
import tempfile
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    NoSuchElementException, 
    TimeoutException, 
    StaleElementReferenceException,
    ElementClickInterceptedException
)
from webdriver_manager.chrome import ChromeDriverManager
import pyodbc
from datetime import datetime, timedelta
import re

class TestExecutor:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.fluent_wait = None
        self.actions = None
        
        # Database configuration
        self.db_config = {
            'server': 'LPT2084-B1',
            'database': 'Ixigo_TestAutomation',
            'driver': 'ODBC Driver 17 for SQL Server',
            'trusted_connection': 'yes'
        }

    def get_db_connection(self):
        """Get database connection"""
        try:
            conn_str = f"DRIVER={{{self.db_config['driver']}}};SERVER={self.db_config['server']};DATABASE={self.db_config['database']};Trusted_Connection={self.db_config['trusted_connection']};"
            conn = pyodbc.connect(conn_str)
            return conn
        except Exception as e:
            print(f"Database connection error: {str(e)}")
            raise

    def launch_browser(self):
        """Initialize WebDriver with optimized settings"""
        try:
            chrome_options = Options()
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-blink-features=AutomationControlled")
            chrome_options.add_argument("--remote-allow-origins=*")
            chrome_options.add_argument("--disable-web-security")
            chrome_options.add_argument("--allow-running-insecure-content")
            chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
            chrome_options.add_experimental_option('useAutomationExtension', False)
            
            # Get ChromeDriver path
            driver_path = None
            try:
                raw_path = ChromeDriverManager().install()
                if "THIRD_PARTY_NOTICES" in raw_path:
                    driver_dir = os.path.dirname(raw_path)
                    potential_paths = [
                        os.path.join(driver_dir, "chromedriver.exe"),
                        os.path.join(os.path.dirname(driver_dir), "chromedriver.exe"),
                        os.path.join(driver_dir, "chromedriver-win32", "chromedriver.exe")
                    ]
                    
                    for path in potential_paths:
                        if os.path.exists(path):
                            driver_path = path
                            break
                else:
                    driver_path = raw_path
            except Exception as e:
                print(f"ChromeDriver setup failed: {str(e)}")
                raise
            
            service = Service(driver_path)
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            
            # Configure timeouts
            self.driver.maximize_window()
            self.driver.implicitly_wait(5)
            self.driver.set_page_load_timeout(60)
            
            # Initialize wait objects
            self.wait = WebDriverWait(self.driver, 30)
            self.fluent_wait = WebDriverWait(self.driver, 45, poll_frequency=0.5, 
                ignored_exceptions=[NoSuchElementException, TimeoutException, StaleElementReferenceException])
            
            self.actions = ActionChains(self.driver)
            
            print("✓ Browser launched successfully")
            
        except Exception as e:
            print(f"✗ Error launching browser: {str(e)}")
            raise

    def read_test_steps_from_db(self, testcase_name):
        """Read test steps from database table"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            table_name = testcase_name.replace(' ', '_').replace('-', '_')
            cursor.execute(f"""
                SELECT tc_id, step_no, test_step_description, element_name, action_type, xpath, values
                FROM [{table_name}] 
                ORDER BY step_no
            """)
            
            test_steps = []
            for row in cursor.fetchall():
                test_steps.append({
                    'tc_id': row[0],
                    'step_no': row[1],
                    'test_step_description': row[2],
                    'element_name': row[3],
                    'action_type': row[4],
                    'xpath': row[5],
                    'values': row[6]
                })
            
            conn.close()
            return test_steps
            
        except Exception as e:
            print(f"✗ Error reading test steps from database: {str(e)}")
            raise

    def write_result_to_db(self, testcase_name, result_data):
        """Write test results to database"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            results_table_name = f"{testcase_name.replace(' ', '_').replace('-', '_')}_Results"
            cursor.execute(f"""
                INSERT INTO [{results_table_name}] 
                (testcase_name, tc_id, test_mode, status, total_steps, passed_steps, failed_steps, 
                 execution_time, test_data, step_results, error_message)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                result_data['testcase_name'],
                result_data['tc_id'],
                result_data['test_mode'],
                result_data['status'],
                result_data['total_steps'],
                result_data['passed_steps'],
                result_data['failed_steps'],
                result_data['execution_time'],
                result_data['test_data'],
                result_data['step_results'],
                result_data['error_message']
            ))
            
            conn.commit()
            conn.close()
            print("✓ Results written to database successfully")
            
        except Exception as e:
            print(f"✗ Error writing results to database: {str(e)}")
            raise

    def execute_test_case(self, testcase_name):
        """Execute test case by reading from database"""
        start_time = datetime.now()
        test_steps = []
        passed_steps = 0
        failed_steps = 0
        step_results = []
        error_message = ""
        
        try:
            print(f"🚀 Starting test execution for: {testcase_name}")
            
            # Read test steps from database
            test_steps = self.read_test_steps_from_db(testcase_name)
            
            if not test_steps:
                raise RuntimeError("No test steps found in database")
            
            print(f"📖 Found {len(test_steps)} test steps")
            
            # Execute each test step
            for step in test_steps:
                step_start_time = datetime.now()
                step_status = "FAIL"
                step_error = ""
                
                try:
                    self.print_test_step_info(
                        step['tc_id'], 
                        step['step_no'], 
                        step['test_step_description'], 
                        step['action_type'], 
                        step['values'], 
                        step['element_name']
                    )
                    
                    # Execute the action
                    self.execute_action(
                        step['action_type'], 
                        step['values'], 
                        step['xpath'], 
                        step['element_name']
                    )
                    
                    step_status = "PASS"
                    passed_steps += 1
                    print(f"✅ Step {step['step_no']} executed successfully")
                    
                except Exception as e:
                    step_status = "FAIL"
                    step_error = str(e)
                    failed_steps += 1
                    error_message += f"Step {step['step_no']}: {str(e)}; "
                    print(f"❌ Step {step['step_no']} failed: {str(e)}")
                
                step_results.append(f"{step['step_no']}:{step_status}")
                time.sleep(0.5)
            
            # Calculate execution time
            end_time = datetime.now()
            execution_time = str(end_time - start_time)
            
            # Determine overall status
            overall_status = "PASS" if failed_steps == 0 else "FAIL"
            
            # Prepare result data
            result_data = {
                'testcase_name': testcase_name,
                'tc_id': test_steps[0]['tc_id'] if test_steps else 'N/A',
                'test_mode': 'Automated',
                'status': overall_status,
                'total_steps': len(test_steps),
                'passed_steps': passed_steps,
                'failed_steps': failed_steps,
                'execution_time': execution_time,
                'test_data': 'Automated Test Data',
                'step_results': ','.join(step_results),
                'error_message': error_message.strip()
            }
            
            # Write results to database
            self.write_result_to_db(testcase_name, result_data)
            
            print(f"\n🎉 Test execution completed!")
            print(f"Status: {overall_status}")
            print(f"Total Steps: {len(test_steps)}")
            print(f"Passed: {passed_steps}")
            print(f"Failed: {failed_steps}")
            print(f"Execution Time: {execution_time}")
            
            return {
                'success': True,
                'status': overall_status,
                'total_steps': len(test_steps),
                'passed_steps': passed_steps,
                'failed_steps': failed_steps,
                'execution_time': execution_time,
                'message': f'Test execution completed. Results saved to {testcase_name}_Results table'
            }
            
        except Exception as e:
            error_msg = f"Critical error during test execution: {str(e)}"
            print(f"💥 {error_msg}")
            
            return {
                'success': False,
                'error': error_msg,
                'total_steps': len(test_steps),
                'passed_steps': passed_steps,
                'failed_steps': failed_steps + 1
            }
            
        finally:
            self.close_browser()

    # Keep all your existing methods from BaseClass and IxigoTestClass
    def find_element_with_advanced_wait(self, xpath_with_alternatives):
        """Find element with multiple XPath options and advanced waiting strategies"""
        if not xpath_with_alternatives or not xpath_with_alternatives.strip():
            raise RuntimeError("XPath is null or empty")
        
        xpaths = [xpath.strip() for xpath in xpath_with_alternatives.split('|')]
        
        for xpath in xpaths:
            try:
                element = self.wait.until(EC.element_to_be_clickable((By.XPATH, xpath)))
                if element.is_displayed() and element.is_enabled():
                    return element
            except Exception:
                try:
                    element = self.wait.until(EC.visibility_of_element_located((By.XPATH, xpath)))
                    return element
                except Exception:
                    try:
                        def find_element(driver):
                            try:
                                el = driver.find_element(By.XPATH, xpath)
                                return el if el and el.is_displayed() else None
                            except Exception:
                                return None
                        
                        element = self.fluent_wait.until(find_element)
                        if element:
                            return element
                    except Exception:
                        continue
        
        raise RuntimeError(f"Element not found with any XPath: {xpath_with_alternatives}")

    def wait_for_spa_ready(self):
        """Wait for SPA to be ready"""
        try:
            self.wait.until(lambda driver: driver.execute_script("return document.readyState") == "complete")
            time.sleep(1)
        except Exception:
            print("SPA ready wait completed")

    def perform_robust_click(self, element):
        """Enhanced click with fallback strategies"""
        for attempt in range(1, 4):
            try:
                self.scroll_to_element(element)
                time.sleep(0.2)
                
                if attempt == 1:
                    element.click()
                elif attempt == 2:
                    self.driver.execute_script("arguments[0].click();", element)
                elif attempt == 3:
                    self.actions.move_to_element(element).click().perform()
                
                print(f"✓ Click successful on attempt {attempt}")
                return
                
            except Exception as e:
                if attempt == 3:
                    raise RuntimeError(f"All click attempts failed: {str(e)}")
                time.sleep(0.3)

    def scroll_to_element(self, element):
        """Scroll to element"""
        try:
            self.driver.execute_script(
                "arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", 
                element
            )
            time.sleep(0.3)
        except Exception:
            print("Could not scroll to element")

    def perform_robust_text_input(self, element, text):
        """Enhanced text input for SPAs"""
        try:
            self.clear_input_field(element)
            time.sleep(0.2)
            
            for char in text:
                element.send_keys(char)
                time.sleep(0.05)
            
            self.driver.execute_script("""
                arguments[0].dispatchEvent(new Event('input', {bubbles: true}));
                arguments[0].dispatchEvent(new Event('change', {bubbles: true}));
            """, element)
            time.sleep(0.3)
            
        except Exception:
            self.driver.execute_script("""
                arguments[0].value = arguments[1];
                arguments[0].dispatchEvent(new Event('input', {bubbles: true}));
                arguments[0].dispatchEvent(new Event('change', {bubbles: true}));
            """, element, text)

    def clear_input_field(self, element):
        """Clear input field completely"""
        try:
            element.clear()
            element.send_keys(Keys.CONTROL + "a")
            element.send_keys(Keys.DELETE)
            self.driver.execute_script("arguments[0].value = '';", element)
        except Exception:
            print("Could not clear input field")

    def print_test_step_info(self, tc_id, step_no, description, action_type, values, element_name):
        """Print test step information"""
        print("\n" + "=" * 60)
        print(f"🔄 Test Case: {tc_id} | Step: {step_no}")
        print(f"📋 {description}")
        print(f"⚡ Action: {action_type} | Element: {element_name}")
        if values and values.upper() != "N/A":
            print(f"💾 Data: {values}")
        print("=" * 60)

    def close_browser(self):
        """Close browser"""
        try:
            if self.driver:
                self.driver.quit()
                print("✓ Browser closed successfully")
        except Exception as e:
            print(f"✗ Error closing browser: {str(e)}")

    def execute_action(self, action_type, test_data, xpath, element_name):
        """Execute specific action based on action type"""
        try:
            action_type = action_type.upper()

            if action_type == "OPEN_BROWSER":
                self.launch_browser()
                self.driver.get(test_data)
                self.wait_for_spa_ready()

            elif action_type == "CLICK_AND_SELECT":
                if element_name.upper() in ["FROM", "TO", "DESTINATION"]:
                    self.handle_city_selection_fast(test_data, xpath, element_name)
                else:
                    element = self.find_element_with_advanced_wait(xpath)
                    self.perform_robust_click(element)
                    time.sleep(0.3)

            elif action_type == "CLICK_AND_SELECT_DATE":
                self.handle_date_selection_fast(test_data, xpath, element_name)

            elif action_type == "CLICK_QUICK_DATE":
                if (test_data.upper() == "TODAY" or 
                    (test_data.upper() == "TOMORROW" and "bus" in element_name.lower())):
                    self.handle_bus_quick_date_selection(test_data, element_name)
                else:
                    self.handle_quick_date_selection(test_data, element_name)

            elif action_type == "CLICK_BUS_QUICK_DATE":
                self.handle_bus_quick_date_selection(test_data, element_name)

            elif action_type == "CLICK":
                click_element = self.find_element_with_advanced_wait(xpath)
                self.perform_robust_click(click_element)
                time.sleep(0.3)

            elif action_type == "SELECT_COUNT":
                self.handle_count_selection_fast(test_data, xpath, element_name)
            
            elif action_type == "CLICK_AND_SELECT_AGE":
                self.handle_age_selection(test_data, xpath, element_name)

            elif action_type == "HANDLE_CHECKBOX":
                self.handle_checkbox_action(test_data, xpath, element_name)

            else:
                print(f"⚠️ Unknown action type: {action_type}")

        except Exception as e:
            print(f"💥 Error executing action '{action_type}': {str(e)}")
            raise

    # Add placeholder methods for the actions referenced above
    def handle_city_selection_fast(self, test_data, xpath, element_name):
        """Handle city selection"""
        element = self.find_element_with_advanced_wait(xpath)
        self.perform_robust_click(element)
        time.sleep(1)
        self.perform_robust_text_input(element, test_data)
        time.sleep(1)

    def handle_date_selection_fast(self, test_data, xpath, element_name):
        """Handle date selection"""
        element = self.find_element_with_advanced_wait(xpath)
        self.perform_robust_click(element)
        time.sleep(1)

    def handle_bus_quick_date_selection(self, test_data, element_name):
        """Handle bus quick date selection"""
        print(f"Handling bus quick date: {test_data}")

    def handle_quick_date_selection(self, test_data, element_name):
        """Handle quick date selection"""
        print(f"Handling quick date: {test_data}")

    def handle_count_selection_fast(self, test_data, xpath, element_name):
        """Handle count selection"""
        element = self.find_element_with_advanced_wait(xpath)
        self.perform_robust_click(element)
        time.sleep(0.5)

    def handle_age_selection(self, test_data, xpath, element_name):
        """Handle age selection"""
        element = self.find_element_with_advanced_wait(xpath)
        self.perform_robust_click(element)
        time.sleep(0.5)

    def handle_checkbox_action(self, test_data, xpath, element_name):
        """Handle checkbox action"""
        element = self.find_element_with_advanced_wait(xpath)
        self.perform_robust_click(element)
        time.sleep(0.3)
