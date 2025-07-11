
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProjectDashboard from '@/components/ProjectDashboard';
import TestCaseDashboard from '@/components/TestCaseDashboard';
import TestConfigDashboard from '@/components/TestConfigDashboard';
import TestSummaryDashboard from '@/components/TestSummaryDashboard';
import TestResultsDashboard from '@/components/TestResultsDashboard';
import { Play, Database, Settings, BarChart3, TestTube } from 'lucide-react';

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTestCase, setSelectedTestCase] = useState(null);

  const steps = [
    { id: 1, name: 'Project Management', icon: Database, description: 'Create and manage test projects' },
    { id: 2, name: 'Test Cases', icon: TestTube, description: 'Define and configure test cases' },
    { id: 3, name: 'Test Configuration', icon: Settings, description: 'Configure test steps and actions' },
    { id: 4, name: 'Test Summary', icon: Play, description: 'Review and execute tests' },
    { id: 5, name: 'Results Dashboard', icon: BarChart3, description: 'View test results and analytics' }
  ];

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProjectDashboard 
            onProjectSelect={setSelectedProject}
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <TestCaseDashboard 
            selectedProject={selectedProject}
            onTestCaseSelect={setSelectedTestCase}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <TestConfigDashboard 
            selectedTestCase={selectedTestCase}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        );
      case 4:
        return (
          <TestSummaryDashboard 
            selectedProject={selectedProject}
            selectedTestCase={selectedTestCase}
            onExecute={() => setCurrentStep(5)}
            onBack={() => setCurrentStep(3)}
          />
        );
      case 5:
        return (
          <TestResultsDashboard 
            selectedTestCase={selectedTestCase}
            onBack={() => setCurrentStep(4)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <TestTube className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Selenium Test Automation Framework</h1>
                <p className="text-purple-300 text-sm">Advanced Web Testing Suite</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-purple-300">
              <Database className="w-4 h-4" />
              <span>Ixigo_TestAutomation DB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4 bg-black/30 backdrop-blur-sm rounded-xl p-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <Button
                  key={step.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                      : isCompleted 
                        ? 'text-green-400 hover:text-green-300' 
                        : 'text-purple-300 hover:text-white hover:bg-white/10'
                    }
                  `}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{step.name}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="max-w-7xl mx-auto">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default Index;
