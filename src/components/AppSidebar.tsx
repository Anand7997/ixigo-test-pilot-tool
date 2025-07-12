
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Database,
  TestTube,
  Settings,
  BarChart3,
  Play,
  History,
  FileText,
  Activity,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const navigationItems = [
  {
    title: 'Project Management',
    url: '/#step-1',
    icon: Database,
    description: 'Manage test projects',
    badge: null,
  },
  {
    title: 'Test Cases',
    url: '/#step-2',
    icon: TestTube,
    description: 'Configure test cases',
    badge: null,
  },
  {
    title: 'Test Configuration',
    url: '/#step-3',
    icon: Settings,
    description: 'Setup test steps',
    badge: null,
  },
  {
    title: 'Test Execution',
    url: '/#step-4',
    icon: Play,
    description: 'Run tests',
    badge: 'Live',
  },
  {
    title: 'Results Dashboard',
    url: '/#step-5',
    icon: BarChart3,
    description: 'View results',
    badge: null,
  },
];

const quickAccessItems = [
  {
    title: 'Recent Results',
    icon: History,
    description: 'Last 10 test runs',
    badge: '5',
  },
  {
    title: 'Test Reports',
    icon: FileText,
    description: 'Generated reports',
    badge: null,
  },
  {
    title: 'System Status',
    icon: Activity,
    description: 'Health monitoring',
    badge: 'Online',
  },
  {
    title: 'Performance',
    icon: TrendingUp,
    description: 'Test metrics',
    badge: null,
  },
];

const systemMetrics = [
  {
    title: 'Tests Passed',
    value: '847',
    icon: CheckCircle,
    color: 'text-green-400',
  },
  {
    title: 'Active Tests',
    value: '12',
    icon: Zap,
    color: 'text-blue-400',
  },
  {
    title: 'Avg. Time',
    value: '2.3s',
    icon: Clock,
    color: 'text-purple-400',
  },
  {
    title: 'Failed',
    value: '23',
    icon: AlertTriangle,
    color: 'text-red-400',
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar
      variant="inset"
      className="cursor-glow"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center animate-pulse-glow">
            <TestTube className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Test Suite
              </h2>
              <p className="text-xs text-muted-foreground">Automation Hub</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-semibold">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="group transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 hover:border-purple-500/20"
                  >
                    <a href={item.url} className="flex items-center space-x-3">
                      <item.icon className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Access */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-400 font-semibold">
            Quick Access
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickAccessItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className="group transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10 hover:border-blue-500/20">
                    <item.icon className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Metrics */}
        {!isCollapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-green-400 font-semibold">
              System Metrics
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-3 p-2">
                {systemMetrics.map((metric) => (
                  <div
                    key={metric.title}
                    className="glass-effect rounded-lg p-3 hover:bg-white/10 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <metric.icon className={`w-4 h-4 ${metric.color}`} />
                        <span className="text-sm text-muted-foreground">{metric.title}</span>
                      </div>
                      <span className={`text-lg font-bold ${metric.color} group-hover:scale-110 transition-transform`}>
                        {metric.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
