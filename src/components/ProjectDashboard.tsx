
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, FolderOpen, Calendar, User, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: number;
  name: string;
  description: string;
  created_date: string;
  created_by: string;
  status: string;
}

interface ProjectDashboardProps {
  onProjectSelect: (project: Project) => void;
  onNext: () => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ onProjectSelect, onNext }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { toast } = useToast();

  // Mock data for demonstration - replace with actual API calls
  useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: 1,
        name: "Flight Booking Tests",
        description: "Automated tests for flight booking functionality",
        created_date: "2024-01-15",
        created_by: "Admin",
        status: "Active"
      },
      {
        id: 2,
        name: "Hotel Search Tests",
        description: "Test cases for hotel search and booking",
        created_date: "2024-01-10",
        created_by: "Admin",
        status: "Active"
      }
    ];
    setProjects(mockProjects);
  }, []);

  const handleCreateProject = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      // TODO: Replace with actual API call
      const newProject: Project = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        created_date: new Date().toISOString().split('T')[0],
        created_by: "Admin",
        status: "Active"
      };

      setProjects([...projects, newProject]);
      setFormData({ name: '', description: '' });
      setIsCreateModalOpen(false);
      
      toast({
        title: "Success",
        description: "Project created successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    try {
      setProjects(projects.filter(p => p.id !== projectId));
      toast({
        title: "Success",
        description: "Project deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive"
      });
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    onProjectSelect(project);
  };

  const handleProceed = () => {
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "Please select a project to proceed",
        variant: "destructive"
      });
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white flex items-center space-x-2">
                <FolderOpen className="w-6 h-6 text-purple-400" />
                <span>Project Management</span>
              </CardTitle>
              <p className="text-purple-300 mt-2">Create and manage your test automation projects</p>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-purple-500/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-purple-300">Project Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter project name"
                      className="bg-slate-700 border-purple-500/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-purple-300">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter project description"
                      className="bg-slate-700 border-purple-500/20 text-white"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProject} className="bg-gradient-to-r from-purple-500 to-pink-500">
                      Create Project
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card 
            key={project.id} 
            className={`
              cursor-pointer transition-all duration-200 hover:scale-105
              ${selectedProject?.id === project.id 
                ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400' 
                : 'bg-black/40 hover:bg-black/60 border-purple-500/20'
              }
              backdrop-blur-sm
            `}
            onClick={() => handleProjectSelect(project)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">{project.name}</CardTitle>
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
                      handleDeleteProject(project.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-purple-200 text-sm mb-4">{project.description}</p>
              <div className="space-y-2">
                <div className="flex items-center text-xs text-purple-300">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Created: {project.created_date}</span>
                </div>
                <div className="flex items-center text-xs text-purple-300">
                  <User className="w-3 h-3 mr-1" />
                  <span>By: {project.created_by}</span>
                </div>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  {project.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Proceed Button */}
      {selectedProject && (
        <div className="flex justify-center">
          <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20 p-4">
            <div className="flex items-center space-x-4">
              <div className="text-white">
                <p className="font-medium">Selected Project: {selectedProject.name}</p>
                <p className="text-sm text-purple-300">Ready to create test cases</p>
              </div>
              <Button 
                onClick={handleProceed}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                Proceed to Test Cases
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;
