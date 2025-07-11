
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  result_id: number;
  testcase_name: string;
  tc_id: string;
  test_mode: string;
  status: 'PASS' | 'FAIL';
  total_steps: number;
  passed_steps: number;
  failed_steps: number;
  execution_time: string;
  test_data: string;
  step_results: string;
  error_message: string;
}

interface TestResultsDashboardProps {
  selectedTestCase: any;
  onBack: () => void;
}

const TestResultsDashboard: React.FC<TestResultsDashboardProps> = ({ 
  selectedTestCase, 
  onBack 
}) => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading test results from database
    setTimeout(() => {
      const mockResults: TestResult[] = [
        {
          result_id: 1,
          testcase_name: selectedTestCase?.name || 'Sample Test',
          tc_id: 'TC001',
          test_mode: 'Automated',
          status: 'PASS',
          total_steps: 5,
          passed_steps: 5,
          failed_steps: 0,
          execution_time: '00:02:34',
          test_data: 'Delhi to Mumbai, 2024-01-20',
          step_results: '1:PASS,2:PASS,3:PASS,4:PASS,5:PASS',
          error_message: ''
        },
        {
          result_id: 2,
          testcase_name: selectedTestCase?.name || 'Sample Test',
          tc_id: 'TC002',
          test_mode: 'Automated',
          status: 'FAIL',
          total_steps: 4,
          passed_steps: 2,
          failed_steps: 2,
          execution_time: '00:01:45',
          test_data: 'Bangalore to Chennai, 2024-01-21',
          step_results: '1:PASS,2:PASS,3:FAIL,4:FAIL',
          error_message: 'Element not found: flight-search-button'
        }
      ];
      setTestResults(mockResults);
      setIsLoading(false);
    }, 1500);
  }, [selectedTestCase]);

  const calculateSummary = () => {
    const totalTests = testResults.length;
    const passedTests = testResults.filter(r => r.status === 'PASS').length;
    const failedTests = totalTests - passedTests;
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    return { totalTests, passedTests, failedTests, passRate };
  };

  const summary = calculateSummary();

  const handleExportResults = () => {
    toast({
      title: "Export Started",
      description: "Test results are being exported to CSV...",
    });
    // TODO: Implement actual export functionality
  };

  const handleRerunTests = () => {
    toast({
      title: "Test Re-execution",
      description: "Starting test re-execution...",
    });
    // TODO: Implement rerun functionality
  };

  if (isLoading) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-purple-300">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading test results...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span>Test Results Dashboard</span>
              </CardTitle>
              <p className="text-purple-300 mt-2">View detailed test execution results and analytics</p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleExportResults} variant="outline" className="border-purple-500/20 text-purple-300">
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
              <Button onClick={handleRerunTests} className="bg-blue-500 hover:bg-blue-600">
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-run Tests
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">Total Tests</p>
                <p className="text-2xl font-bold text-white">{summary.totalTests}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">Passed</p>
                <p className="text-2xl font-bold text-white">{summary.passedTests}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-sm border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm">Failed</p>
                <p className="text-2xl font-bold text-white">{summary.failedTests}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Pass Rate</p>
                <p className="text-2xl font-bold text-white">{summary.passRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pass Rate Progress */}
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Overall Test Pass Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-purple-300">Success Rate</span>
              <span className="text-white">{summary.passRate.toFixed(1)}%</span>
            </div>
            <Progress value={summary.passRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results Table */}
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Detailed Test Results</CardTitle>
          <p className="text-purple-300 text-sm">Results stored in {selectedTestCase?.name}_Results table</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="text-left py-3 px-2 text-purple-300">Result ID</th>
                  <th className="text-left py-3 px-2 text-purple-300">TC ID</th>
                  <th className="text-left py-3 px-2 text-purple-300">Status</th>
                  <th className="text-left py-3 px-2 text-purple-300">Steps</th>
                  <th className="text-left py-3 px-2 text-purple-300">Duration</th>
                  <th className="text-left py-3 px-2 text-purple-300">Test Data</th>
                  <th className="text-left py-3 px-2 text-purple-300">Error</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((result) => (
                  <tr key={result.result_id} className="border-b border-purple-500/10 hover:bg-purple-500/5">
                    <td className="py-3 px-2 text-white">{result.result_id}</td>
                    <td className="py-3 px-2 text-white">{result.tc_id}</td>
                    <td className="py-3 px-2">
                      <Badge className={
                        result.status === 'PASS' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }>
                        {result.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-white">
                      <div className="flex items-center space-x-1">
                        <span className="text-green-400">{result.passed_steps}</span>
                        <span className="text-purple-300">/</span>
                        <span className="text-white">{result.total_steps}</span>
                        {result.failed_steps > 0 && (
                          <>
                            <span className="text-purple-300">|</span>
                            <span className="text-red-400">{result.failed_steps} failed</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-white">{result.execution_time}</td>
                    <td className="py-3 px-2 text-purple-300 max-w-xs truncate">{result.test_data}</td>
                    <td className="py-3 px-2 text-red-400 max-w-xs truncate">
                      {result.error_message || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack} className="border-purple-500/20 text-purple-300">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Summary
        </Button>

        <div className="text-sm text-purple-300">
          Results automatically saved to database: {selectedTestCase?.name}_Results
        </div>
      </div>
    </div>
  );
};

export default TestResultsDashboard;
