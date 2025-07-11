
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, ArrowLeft, CheckCircle, AlertCircle, Clock, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestSummaryDashboardProps {
  selectedProject: any;
  selectedTestCase: any;
  onExecute: () => void;
  onBack: () => void;
}

const TestSummaryDashboard: React.FC<TestSummaryDashboardProps> = ({ 
  selectedProject, 
  selectedTestCase, 
  onExecute, 
  onBack 
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const { toast } = useToast();

  // Mock test steps data - in real app, fetch from database
  const testSteps = [
    {
      id: 1,
      tc_id: 'TC001',
      step_no: 1,
      test_step_description: 'Open Ixigo website',
      element_name: 'Browser',
      action_type: 'OPEN_BROWSER',
      xpath: '',
      values: 'https://www.ixigo.com'
    },
    {
      id: 2,
      tc_id: 'TC001',
      step_no: 2,
      test_step_description: 'Click on Flights tab',
      element_name: 'FlightsTab',
      action_type: 'CLICK',
      xpath: '//div[@data-testid="flights-tab"]',
      values: ''
    },
    {
      id: 3,
      tc_id: 'TC001',
      step_no: 3,
      test_step_description: 'Select departure city',
      element_name: 'FromCity',
      action_type: 'CLICK_AND_SELECT',
      xpath: '//input[@placeholder="From"]',
      values: 'Delhi'
    }
  ];

  const handleExecuteTests = async () => {
    if (!selectedTestCase) {
      toast({
        title: "Error",
        description: "No test case selected",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    setExecutionProgress(0);

    try {
      // Simulate test execution progress
      for (let i = 0; i <= 100; i += 10) {
        setExecutionProgress(i);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: "Test Execution Started",
        description: "Chrome browser launched and test execution in progress...",
      });

      // Simulate completion
      setTimeout(() => {
        setIsExecuting(false);
        toast({
          title: "Tests Completed",
          description: `Results saved to ${selectedTestCase.name}_Results table`,
        });
        onExecute();
      }, 2000);

    } catch (error) {
      setIsExecuting(false);
      toast({
        title: "Execution Failed",
        description: "Error occurred during test execution",
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
              <p className="text-white font-mono">{selectedTestCase.name}</p>
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
        </CardContent>
      </Card>

      {/* Execution Section */}
      {isExecuting && (
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-sm border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-400 animate-spin" />
              <span>Test Execution in Progress</span>
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
              <p className="text-center text-orange-300 text-sm">Chrome browser is executing test steps...</p>
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
          disabled={isExecuting}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
        >
          <Play className="w-4 h-4 mr-2" />
          {isExecuting ? 'Executing...' : 'Run Test Cases'}
        </Button>
      </div>
    </div>
  );
};

export default TestSummaryDashboard;
