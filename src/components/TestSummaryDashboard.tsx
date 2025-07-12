
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, ArrowLeft, CheckCircle, AlertCircle, Clock, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestStep {
  id: number;
  tc_id: string;
  step_no: number;
  test_step_description: string;
  element_name: string;
  action_type: string;
  xpath: string;
  values: string;
}

interface TestSummaryDashboardProps {
  selectedProject: any;
  selectedTestCase: any;
  testSteps: TestStep[];
  onExecute: () => void;
  onBack: () => void;
}

const TestSummaryDashboard: React.FC<TestSummaryDashboardProps> = ({ 
  selectedProject, 
  selectedTestCase, 
  testSteps,
  onExecute, 
  onBack 
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const saveTestStepsToDatabase = async () => {
    try {
      console.log('Saving test steps to database...');
      setExecutionLogs(prev => [...prev, 'Saving test steps to database table: ' + selectedTestCase.name]);
      
      // Save each test step to the database table named after test case
      for (const step of testSteps) {
        const response = await fetch(`http://localhost:5000/api/teststeps/${selectedTestCase.name}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tc_id: step.tc_id,
            step_no: step.step_no,
            test_step_description: step.test_step_description,
            element_name: step.element_name,
            action_type: step.action_type,
            xpath: step.xpath,
            values: step.values
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to save step ${step.step_no}: ${errorText}`);
        }
      }
      
      setExecutionLogs(prev => [...prev, `✅ Successfully saved ${testSteps.length} test steps to ${selectedTestCase.name} table`]);
      return true;
    } catch (error) {
      console.error('Error saving test steps:', error);
      setExecutionLogs(prev => [...prev, `❌ Error saving test steps: ${error}`]);
      return false;
    }
  };

  const executeSeleniumTest = async () => {
    try {
      console.log('Starting Selenium test execution...');
      setExecutionLogs(prev => [...prev, 'Starting real Selenium test execution...']);
      setExecutionLogs(prev => [...prev, 'Reading test steps from database...']);
      setExecutionLogs(prev => [...prev, 'Launching Chrome browser...']);
      
      const response = await fetch(`http://localhost:5000/api/execute/${selectedTestCase.name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to execute test: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setExecutionLogs(prev => [...prev, '✅ Test execution completed successfully']);
        setExecutionLogs(prev => [...prev, `Overall Status: ${result.status}`]);
        setExecutionLogs(prev => [...prev, `Total Steps Executed: ${result.total_steps}`]);
        setExecutionLogs(prev => [...prev, `Steps Passed: ${result.passed_steps}`]);
        setExecutionLogs(prev => [...prev, `Steps Failed: ${result.failed_steps}`]);
        setExecutionLogs(prev => [...prev, `Execution Time: ${result.execution_time}`]);
        setExecutionLogs(prev => [...prev, `Results saved to ${selectedTestCase.name}_Results table in database`]);
        
        toast({
          title: "Test Execution Completed",
          description: `${result.status}: ${result.passed_steps}/${result.total_steps} steps passed`,
        });
      } else {
        throw new Error(result.error || 'Test execution failed');
      }

      return result;
    } catch (error) {
      console.error('Error executing test:', error);
      setExecutionLogs(prev => [...prev, `❌ Error executing test: ${error}`]);
      
      toast({
        title: "Test Execution Failed",
        description: `Error: ${error}`,
        variant: "destructive"
      });
      
      return null;
    }
  };

  const handleExecuteTests = async () => {
    if (!selectedTestCase) {
      toast({
        title: "Error",
        description: "No test case selected",
        variant: "destructive"
      });
      return;
    }

    if (testSteps.length === 0) {
      toast({
        title: "Error",
        description: "No test steps configured",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    setExecutionProgress(0);
    setExecutionLogs([]);

    try {
      // Step 1: Save test steps to database
      setExecutionProgress(20);
      setExecutionLogs(prev => [...prev, `Preparing to save ${testSteps.length} test steps...`]);
      const savedSuccessfully = await saveTestStepsToDatabase();
      
      if (!savedSuccessfully) {
        throw new Error('Failed to save test steps to database');
      }

      // Step 2: Execute Selenium test
      setExecutionProgress(40);
      setExecutionLogs(prev => [...prev, 'Initiating Selenium WebDriver...']);
      const executionResult = await executeSeleniumTest();
      
      if (!executionResult) {
        throw new Error('Test execution failed');
      }

      setExecutionProgress(100);
      setExecutionLogs(prev => [...prev, 'Test execution workflow completed successfully!']);
      
      // Navigate to results after a short delay
      setTimeout(() => {
        onExecute();
      }, 2000);

    } catch (error) {
      setIsExecuting(false);
      setExecutionProgress(0);
      
      toast({
        title: "Execution Failed",
        description: `Error: ${error}`,
        variant: "destructive"
      });
    }
  };

  if (!selectedProject || !selectedTestCase) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
        <CardContent className="p-8 text-center">
          <p className="text-purple-300">Please complete previous steps first</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <span>Test Execution Summary</span>
          </CardTitle>
          <p className="text-purple-300 mt-2">Review your test configuration before execution</p>
        </CardHeader>
      </Card>

      {/* Project & Test Case Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-400" />
              <span>Project Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-blue-300">Project Name</p>
                <p className="text-white font-medium">{selectedProject.name}</p>
              </div>
              <div>
                <p className="text-sm text-blue-300">Description</p>
                <p className="text-white">{selectedProject.description}</p>
              </div>
              <div>
                <p className="text-sm text-blue-300">Status</p>
                <Badge className="bg-green-500/20 text-green-400">{selectedProject.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-purple-400" />
              <span>Test Case Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-purple-300">Test Case Name</p>
                <p className="text-white font-medium">{selectedTestCase.name}</p>
              </div>
              <div>
                <p className="text-sm text-purple-300">Description</p>
                <p className="text-white">{selectedTestCase.description}</p>
              </div>
              <div>
                <p className="text-sm text-purple-300">Priority</p>
                <Badge className="bg-yellow-500/20 text-yellow-400">{selectedTestCase.priority}</Badge>
              </div>
              <div>
                <p className="text-sm text-purple-300">Total Steps</p>
                <p className="text-white font-bold text-lg">{testSteps.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Configuration */}
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm border-green-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-green-400" />
            <span>Database Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-green-300">Server</p>
              <p className="text-white font-mono">LPT2084-B1</p>
            </div>
            <div>
              <p className="text-green-300">Database</p>
              <p className="text-white font-mono">Ixigo_TestAutomation</p>
            </div>
            <div>
              <p className="text-green-300">Test Table</p>
              <p className="text-white font-mono">{selectedTestCase.name.replace(' ', '_').replace('-', '_')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Steps Preview */}
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Configured Test Steps</CardTitle>
        </CardHeader>
        <CardContent>
          {testSteps.length > 0 ? (
            <div className="space-y-3">
              {testSteps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-4 p-3 bg-purple-500/5 rounded-lg border border-purple-500/10">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step_no}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{step.test_step_description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs">{step.action_type}</Badge>
                      <span className="text-purple-300 text-xs">{step.element_name}</span>
                      {step.values && <span className="text-green-400 text-xs">→ {step.values}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-purple-300">
              <p className="text-lg font-medium">No test steps configured</p>
              <p className="text-sm mt-2">Please go back to the configuration step and add test steps</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Execution Section */}
      {isExecuting && (
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-sm border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-400 animate-spin" />
              <span>Real Test Execution in Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${executionProgress}%` }}
                ></div>
              </div>
              <p className="text-center text-white">{executionProgress}% Complete</p>
              
              {/* Execution Logs */}
              <div className="bg-black/50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <h4 className="text-white font-medium mb-2">Live Execution Logs:</h4>
                {executionLogs.map((log, index) => (
                  <p key={index} className="text-sm text-gray-300 font-mono mb-1">{log}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack} className="border-purple-500/20 text-purple-300">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Configuration
        </Button>

        <Button 
          onClick={handleExecuteTests}
          disabled={isExecuting || testSteps.length === 0}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
        >
          <Play className="w-4 h-4 mr-2" />
          {isExecuting ? 'Executing Real Tests...' : 'Run Test Cases'}
        </Button>
      </div>
    </div>
  );
};

export default TestSummaryDashboard;
