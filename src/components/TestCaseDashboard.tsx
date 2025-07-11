
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, TestTube, ArrowRight, ArrowLeft, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestCase {
  id: number;
  name: string;
  description: string;
  project_id: number;
  created_date: string;
  status: string;
  priority: string;
}

interface TestCaseDashboardProps {
  selectedProject: any;
  onTestCaseSelect: (testCase: TestCase) => void;
  onNext: () => void;
  onBack: () => void;
}

const TestCaseDashboard: React.FC<TestCaseDashboardProps> = ({ 
  selectedProject, 
  onTestCaseSelect, 
  onNext, 
  onBack 
}) => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    priority: 'Medium' 
  });
  const { toast } = useToast();

  useEffect(() => {
    if (selectedProject) {
      // Mock data - replace with actual API call
      const mockTestCases: TestCase[] = [
        {
          id: 1,
          name: "Login Functionality Test",
          description: "Test user login with valid and invalid credentials",
          project_id: selectedProject.id,
          created_date: "2024-01-16",
          status: "Active",
          priority: "High"
        },
        {
          id: 2,
          name: "Search Flight Test",
          description: "Test flight search functionality with various parameters",
          project_id: selectedProject.id,
          created_date: "2024-01-16",
          status: "Active",
          priority: "Medium"
        }
      ];
      setTestCases(mockTestCases);
    }
  }, [selectedProject]);

  const handleCreateTestCase = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Test case name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      // TODO: Replace with actual API call to create table in database
      const newTestCase: TestCase = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        project_id: selectedProject.id,
        created_date: new Date().toISOString().split('T')[0],
        status: "Active",
        priority: formData.priority
      };

      setTestCases([...testCases, newTestCase]);
      setFormData({ name: '', description: '', priority: 'Medium' });
      setIsCreateModalOpen(false);
      
      toast({
        title: "Success",
        description: `Test case created and table "${formData.name}" created in Ixigo_TestAutomation database!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test case",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTestCase = async (testCaseId: number) => {
    try {
      setTestCases(testCases.filter(tc => tc.id !== testCaseId));
      toast({
        title: "Success",
        description: "Test case deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete test case",
        variant: "destructive"
      });
    }
  };

  const handleTestCaseSelect = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    onTestCaseSelect(testCase);
  };

  const handleProceed = () => {
    if (!selectedTestCase) {
      toast({
        title: "Error",
        description: "Please select a test case to proceed",
        variant: "destructive"
      });
      return;
    }
    onNext();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (!selectedProject) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
        <CardContent className="p-8 text-center">
          <p className="text-purple-300">Please select a project first</p>
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
                <TestTube className="w-6 h-6 text-purple-400" />
                <span>Test Cases for "{selectedProject.name}"</span>
              </CardTitle>
              <p className="text-purple-300 mt-2">Create and manage test cases for your project</p>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Test Case
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-purple-500/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Test Case</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-purple-300">Test Case Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter test case name"
                      className="bg-slate-700 border-purple-500/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-purple-300">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter test case description"
                      className="bg-slate-700 border-purple-500/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-purple-300">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full bg-slate-700 border border-purple-500/20 rounded-md px-3 py-2 text-white"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTestCase} className="bg-gradient-to-r from-purple-500 to-pink-500">
                      Create Test Case
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Database Info */}
      <Card className="bg-blue-500/10 backdrop-blur-sm border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-blue-300">
            <Database className="w-4 h-4" />
            <span className="text-sm">Database: Ixigo_TestAutomation | Server: LPT2084-B1</span>
          </div>
        </CardContent>
      </Card>

      {/* Test Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testCases.map((testCase) => (
          <Card 
            key={testCase.id} 
            className={`
              cursor-pointer transition-all duration-200 hover:scale-105
              ${selectedTestCase?.id === testCase.id 
                ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400' 
                : 'bg-black/40 hover:bg-black/60 border-purple-500/20'
              }
              backdrop-blur-sm
            `}
            onClick={() => handleTestCaseSelect(testCase)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">{testCase.name}</CardTitle>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-400 hover:text-red-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTestCase(testCase.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-purple-200 text-sm mb-4">{testCase.description}</p>
              <div className="space-y-2">
                <Badge className={getPriorityColor(testCase.priority)}>
                  {testCase.priority} Priority
                </Badge>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  {testCase.status}
                </Badge>
                <p className="text-xs text-purple-300">Created: {testCase.created_date}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack} className="border-purple-500/20 text-purple-300">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>

        {selectedTestCase && (
          <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20 p-4">
            <div className="flex items-center space-x-4">
              <div className="text-white">
                <p className="font-medium">Selected: {selectedTestCase.name}</p>
                <p className="text-sm text-purple-300">Ready to configure test steps</p>
              </div>
              <Button 
                onClick={handleProceed}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                Configure Test Steps
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TestCaseDashboard;
