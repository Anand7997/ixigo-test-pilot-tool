
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import ProjectDashboard from '@/components/ProjectDashboard';
import TestCaseDashboard from '@/components/TestCaseDashboard';
import TestConfigDashboard from '@/components/TestConfigDashboard';
import TestSummaryDashboard from '@/components/TestSummaryDashboard';
import TestResultsDashboard from '@/components/TestResultsDashboard';
import { Play, Database, Settings, BarChart3, TestTube, Sparkles, Zap } from 'lucide-react';

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

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [testSteps, setTestSteps] = useState<TestStep[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const steps = [
    { id: 1, name: 'Project Management', icon: Database, description: 'Create and manage test projects', color: 'from-blue-500 to-cyan-500' },
    { id: 2, name: 'Test Cases', icon: TestTube, description: 'Define and configure test cases', color: 'from-green-500 to-emerald-500' },
    { id: 3, name: 'Test Configuration', icon: Settings, description: 'Configure test steps and actions', color: 'from-yellow-500 to-orange-500' },
    { id: 4, name: 'Test Summary', icon: Play, description: 'Review and execute tests', color: 'from-purple-500 to-pink-500' },
    { id: 5, name: 'Results Dashboard', icon: BarChart3, description: 'View test results and analytics', color: 'from-red-500 to-rose-500' }
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
            testSteps={testSteps}
            onTestStepsChange={setTestSteps}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        );
      case 4:
        return (
          <TestSummaryDashboard 
            selectedProject={selectedProject}
            selectedTestCase={selectedTestCase}
            testSteps={testSteps}
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 cursor-glow">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"
            style={{
              left: mousePosition.x / 10 + 'px',
              top: mousePosition.y / 10 + 'px',
            }}
          />
          <div 
            className="absolute w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-float"
            style={{
              right: mousePosition.x / 20 + 'px',
              bottom: mousePosition.y / 20 + 'px',
              animationDelay: '1s',
            }}
          />
        </div>

        <AppSidebar />
        
        <SidebarInset className="flex-1">
          {/* Enhanced Header */}
          <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="hover:bg-white/5 transition-colors" />
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center animate-pulse-glow">
                      <TestTube className="w-7 h-7 text-white animate-spin-slow" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                        Selenium Test Automation Framework
                      </h1>
                      <p className="text-purple-300/80 text-sm flex items-center space-x-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Advanced Web Testing Suite</span>
                        <Zap className="w-4 h-4 text-yellow-400" />
                      </p>
                    </div>
                  </div>
                </div>
                <div className="glass-effect px-4 py-2 rounded-lg flex items-center space-x-2 text-sm text-purple-300">
                  <Database className="w-4 h-4 text-green-400" />
                  <span>Ixigo_TestAutomation DB</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Step Navigation */}
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-center mb-10">
              <div className="glass-effect rounded-2xl p-3 shadow-2xl">
                <div className="flex space-x-2">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    
                    return (
                      <Button
                        key={step.id}
                        variant={isActive ? "default" : "ghost"}
                        size="lg"
                        className={`
                          flex items-center space-x-3 px-6 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden
                          ${isActive 
                            ? `bg-gradient-to-r ${step.color} text-white shadow-2xl animate-pulse-glow transform scale-105` 
                            : isCompleted 
                              ? 'text-green-400 hover:text-green-300 hover:bg-green-500/10' 
                              : 'text-purple-300 hover:text-white hover:bg-white/5'
                          }
                        `}
                        onClick={() => setCurrentStep(step.id)}
                      >
                        <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'animate-spin-slow' : ''}`} />
                        <div className="hidden lg:block text-left">
                          <div className="font-semibold">{step.name}</div>
                          <div className="text-xs opacity-80">{step.description}</div>
                        </div>
                        <span className="lg:hidden font-medium">{step.name}</span>
                        
                        {/* Progress indicator */}
                        {isCompleted && (
                          <div className="absolute top-1 right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Current Step Content with enhanced styling */}
            <div className="max-w-7xl mx-auto">
              <div className="glass-effect rounded-2xl p-8 shadow-2xl">
                {renderCurrentStep()}
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
