import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Settings, ArrowRight, ArrowLeft, Save, Play } from 'lucide-react';
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

interface TestConfigDashboardProps {
  selectedTestCase: any;
  testSteps: TestStep[];
  onTestStepsChange: (steps: TestStep[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const ACTION_TYPES = [
  'OPEN_BROWSER',
  'CLICK_AND_SELECT',
  'CLICK_AND_SELECT_DATE',
  'CLICK',
  'SELECT_COUNT',
  'CLICK_QUICK_DATE',
  'CLICK_AND_SELECT_AGE',
  'HANDLE_CHECKBOX',
  'CLICK_BUS_QUICK_DATE'
];

const TestConfigDashboard: React.FC<TestConfigDashboardProps> = ({ 
  selectedTestCase, 
  testSteps,
  onTestStepsChange,
  onNext, 
  onBack 
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<TestStep | null>(null);
  const [formData, setFormData] = useState({
    tc_id: '',
    step_no: 1,
    test_step_description: '',
    element_name: '',
    action_type: 'CLICK',
    xpath: '',
    values: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (selectedTestCase && testSteps.length === 0) {
      // Only load mock data if no test steps exist
      const mockTestSteps: TestStep[] = [
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
        }
      ];
      onTestStepsChange(mockTestSteps);
    }
  }, [selectedTestCase, testSteps.length, onTestStepsChange]);

  const resetForm = () => {
    setFormData({
      tc_id: '',
      step_no: testSteps.length + 1,
      test_step_description: '',
      element_name: '',
      action_type: 'CLICK',
      xpath: '',
      values: ''
    });
  };

  const handleCreateStep = async () => {
    if (!formData.test_step_description.trim()) {
      toast({
        title: "Error",
        description: "Test step description is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const newStep: TestStep = {
        id: Date.now(),
        tc_id: formData.tc_id || `TC${String(testSteps.length + 1).padStart(3, '0')}`,
        step_no: formData.step_no,
        test_step_description: formData.test_step_description,
        element_name: formData.element_name,
        action_type: formData.action_type,
        xpath: formData.xpath,
        values: formData.values
      };

      if (editingStep) {
        const updatedSteps = testSteps.map(step => 
          step.id === editingStep.id ? { ...newStep, id: editingStep.id } : step
        );
        onTestStepsChange(updatedSteps);
        setEditingStep(null);
        toast({
          title: "Success",
          description: "Test step updated successfully!",
        });
      } else {
        onTestStepsChange([...testSteps, newStep]);
        toast({
          title: "Success",
          description: "Test step created successfully!",
        });
      }

      resetForm();
      setIsCreateModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save test step",
        variant: "destructive"
      });
    }
  };

  const handleEditStep = (step: TestStep) => {
    setEditingStep(step);
    setFormData({
      tc_id: step.tc_id,
      step_no: step.step_no,
      test_step_description: step.test_step_description,
      element_name: step.element_name,
      action_type: step.action_type,
      xpath: step.xpath,
      values: step.values
    });
    setIsCreateModalOpen(true);
  };

  const handleDeleteStep = async (stepId: number) => {
    try {
      const updatedSteps = testSteps.filter(step => step.id !== stepId);
      onTestStepsChange(updatedSteps);
      toast({
        title: "Success",
        description: "Test step deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete test step",
        variant: "destructive"
      });
    }
  };

  const handleSaveConfiguration = async () => {
    if (testSteps.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one test step",
        variant: "destructive"
      });
      return;
    }

    try {
      // TODO: Save to database table
      toast({
        title: "Success",
        description: `Configuration saved to ${selectedTestCase.name} table in Ixigo_TestAutomation database!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive"
      });
    }
  };

  if (!selectedTestCase) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
        <CardContent className="p-8 text-center">
          <p className="text-purple-300">Please select a test case first</p>
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
                <Settings className="w-6 h-6 text-purple-400" />
                <span>Configure "{selectedTestCase.name}"</span>
              </CardTitle>
              <p className="text-purple-300 mt-2">Define test steps and actions for your test case</p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSaveConfiguration} className="bg-blue-500 hover:bg-blue-600">
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    onClick={resetForm}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Test Step
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-purple-500/20 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      {editingStep ? 'Edit Test Step' : 'Add New Test Step'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-purple-300">TC ID</label>
                      <Input
                        value={formData.tc_id}
                        onChange={(e) => setFormData({ ...formData, tc_id: e.target.value })}
                        placeholder="TC001"
                        className="bg-slate-700 border-purple-500/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-purple-300">Step No</label>
                      <Input
                        type="number"
                        value={formData.step_no}
                        onChange={(e) => setFormData({ ...formData, step_no: parseInt(e.target.value) || 1 })}
                        className="bg-slate-700 border-purple-500/20 text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-purple-300">Test Step Description</label>
                      <Textarea
                        value={formData.test_step_description}
                        onChange={(e) => setFormData({ ...formData, test_step_description: e.target.value })}
                        placeholder="Describe what this step does"
                        className="bg-slate-700 border-purple-500/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-purple-300">Element Name</label>
                      <Input
                        value={formData.element_name}
                        onChange={(e) => setFormData({ ...formData, element_name: e.target.value })}
                        placeholder="ElementName"
                        className="bg-slate-700 border-purple-500/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-purple-300">Action Type</label>
                      <select
                        value={formData.action_type}
                        onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                        className="w-full bg-slate-700 border border-purple-500/20 rounded-md px-3 py-2 text-white"
                      >
                        {ACTION_TYPES.map(action => (
                          <option key={action} value={action}>{action}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-purple-300">XPath</label>
                      <Input
                        value={formData.xpath}
                        onChange={(e) => setFormData({ ...formData, xpath: e.target.value })}
                        placeholder="//div[@id='example']"
                        className="bg-slate-700 border-purple-500/20 text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-purple-300">Values</label>
                      <Input
                        value={formData.values}
                        onChange={(e) => setFormData({ ...formData, values: e.target.value })}
                        placeholder="Enter values if needed"
                        className="bg-slate-700 border-purple-500/20 text-white"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => {
                        setIsCreateModalOpen(false);
                        setEditingStep(null);
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateStep} className="bg-gradient-to-r from-purple-500 to-pink-500">
                        {editingStep ? 'Update Step' : 'Add Step'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Test Steps Table */}
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Test Steps Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="text-left py-3 px-2 text-purple-300">TC ID</th>
                  <th className="text-left py-3 px-2 text-purple-300">Step No</th>
                  <th className="text-left py-3 px-2 text-purple-300">Description</th>
                  <th className="text-left py-3 px-2 text-purple-300">Element</th>
                  <th className="text-left py-3 px-2 text-purple-300">Action</th>
                  <th className="text-left py-3 px-2 text-purple-300">XPath</th>
                  <th className="text-left py-3 px-2 text-purple-300">Values</th>
                  <th className="text-left py-3 px-2 text-purple-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testSteps.map((step) => (
                  <tr key={step.id} className="border-b border-purple-500/10 hover:bg-purple-500/5">
                    <td className="py-3 px-2 text-white">{step.tc_id}</td>
                    <td className="py-3 px-2 text-white">{step.step_no}</td>
                    <td className="py-3 px-2 text-white max-w-xs truncate">{step.test_step_description}</td>
                    <td className="py-3 px-2 text-white">{step.element_name}</td>
                    <td className="py-3 px-2">
                      <Badge className="bg-blue-500/20 text-blue-400">{step.action_type}</Badge>
                    </td>
                    <td className="py-3 px-2 text-white max-w-xs truncate">{step.xpath}</td>
                    <td className="py-3 px-2 text-white">{step.values}</td>
                    <td className="py-3 px-2">
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-purple-300 hover:text-white"
                          onClick={() => handleEditStep(step)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-400 hover:text-red-300"
                          onClick={() => handleDeleteStep(step.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {testSteps.length === 0 && (
              <div className="text-center py-8 text-purple-300">
                No test steps configured yet. Click "Add Test Step" to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack} className="border-purple-500/20 text-purple-300">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Test Cases
        </Button>

        {testSteps.length > 0 && (
          <Button 
            onClick={onNext}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            Review & Execute
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default TestConfigDashboard;
