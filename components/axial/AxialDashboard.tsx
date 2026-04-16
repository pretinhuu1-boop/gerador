import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  DollarSign,
  Activity
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  variant = 'default',
  className 
}: MetricCardProps) {
  const variants = {
    default: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  };

  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon || <Activity className={cn("h-4 w-4", variants[variant])} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center text-xs mt-1",
            change >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {change >= 0 ? (
              <TrendingUp className="mr-1 h-3 w-3" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3" />
            )}
            <span>{change >= 0 ? '+' : ''}{change}% from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AlertItem {
  id: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  title: string;
  description: string;
  agent: string;
  timestamp: string;
}

interface AlertsPanelProps {
  alerts: AlertItem[];
  className?: string;
}

export function AlertsPanel({ alerts, className }: AlertsPanelProps) {
  const priorityColors = {
    P1: 'bg-red-100 text-red-800 border-red-200',
    P2: 'bg-orange-100 text-orange-800 border-orange-200',
    P3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    P4: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const priorityIcons = {
    P1: <AlertTriangle className="h-4 w-4 text-red-600" />,
    P2: <AlertTriangle className="h-4 w-4 text-orange-600" />,
    P3: <Clock className="h-4 w-4 text-yellow-600" />,
    P4: <Activity className="h-4 w-4 text-blue-600" />,
  };

  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader>
        <CardTitle className="text-lg">Priority Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>No active alerts</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border',
                  priorityColors[alert.priority]
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {priorityIcons[alert.priority]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="default">{alert.priority}</Badge>
                    <span className="text-xs font-medium">{alert.agent}</span>
                  </div>
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{alert.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ProjectStatus {
  id: string;
  client: string;
  project: string;
  status: 'on-track' | 'at-risk' | 'delayed' | 'completed';
  deadline: string;
  progress: number;
  agents: string[];
}

interface ProjectListProps {
  projects: ProjectStatus[];
  className?: string;
}

export function ProjectList({ projects, className }: ProjectListProps) {
  const statusColors = {
    'on-track': 'bg-green-100 text-green-800',
    'at-risk': 'bg-yellow-100 text-yellow-800',
    delayed: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  };

  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader>
        <CardTitle className="text-lg">Active Projects</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold">{project.client}</h4>
                  <p className="text-sm text-gray-600">{project.project}</p>
                </div>
                <Badge className={statusColors[project.status]}>
                  {project.status.replace('-', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Due: {project.deadline}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{project.agents.length} agents</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">{project.progress}% complete</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
