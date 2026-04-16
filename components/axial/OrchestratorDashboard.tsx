import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, TrendingUp, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { Alert, AlertDescription, AlertTitle } from '../ui/Alert';
import { AxialWorkflow } from './AxialWorkflow';

// Tipos definidos pela arquitetura
type AgentStatus = 'idle' | 'working' | 'blocked' | 'error';
type Priority = 'P1' | 'P2' | 'P3' | 'P4';

interface AgentLoad {
  id: string;
  name: string;
  status: AgentStatus;
  load: number; // 0-100%
  activeTasks: number;
  queueSize: number;
}

interface HandoffLog {
  id: string;
  timestamp: string;
  from: string;
  to: string;
  taskType: string;
  contextSize: number; // bytes
  status: 'pending' | 'transferring' | 'completed' | 'failed';
}

interface OrchestratorDecision {
  id: string;
  timestamp: string;
  reason: string;
  action: string;
  impact: 'high' | 'medium' | 'low';
}

export function OrchestratorDashboard() {
  // Estado simulado (virá do LangGraph state no futuro)
  const [agentLoads, setAgentLoads] = useState<AgentLoad[]>([
    { id: 'ops', name: 'OpsAgent', status: 'working', load: 75, activeTasks: 4, queueSize: 2 },
    { id: 'contract', name: 'ContractAgent', status: 'idle', load: 10, activeTasks: 0, queueSize: 0 },
    { id: 'cs', name: 'CSAgent', status: 'working', load: 60, activeTasks: 3, queueSize: 5 },
    { id: 'sm', name: 'SMAgent', status: 'working', load: 85, activeTasks: 2, queueSize: 1 },
    { id: 'copy', name: 'CopyAgent', status: 'working', load: 90, activeTasks: 5, queueSize: 3 },
    { id: 'design', name: 'DesignAgent', status: 'blocked', load: 40, activeTasks: 1, queueSize: 8 },
    { id: 'video', name: 'VideoAgent', status: 'idle', load: 5, activeTasks: 0, queueSize: 0 },
    { id: 'ads', name: 'AdsAgent', status: 'working', load: 55, activeTasks: 2, queueSize: 1 },
    { id: 'finance', name: 'FinanceAgent', status: 'idle', load: 15, activeTasks: 1, queueSize: 0 },
  ]);

  const [handoffLogs, setHandoffLogs] = useState<HandoffLog[]>([
    { id: 'h1', timestamp: '10:42:15', from: 'SMAgent', to: 'CopyAgent', taskType: 'Legend Creation', contextSize: 2048, status: 'completed' },
    { id: 'h2', timestamp: '10:42:18', from: 'SMAgent', to: 'DesignAgent', taskType: 'Post Art', contextSize: 4096, status: 'transferring' },
    { id: 'h3', timestamp: '10:41:50', from: 'OpsAgent', to: 'CSAgent', taskType: 'Client Onboarding', contextSize: 8192, status: 'completed' },
    { id: 'h4', timestamp: '10:40:30', from: 'CopyAgent', to: 'VideoAgent', taskType: 'Script Handoff', contextSize: 1536, status: 'failed' },
  ]);

  const [decisions, setDecisions] = useState<OrchestratorDecision[]>([
    { id: 'd1', timestamp: '10:42:20', reason: 'DesignAgent queue > 5 tasks', action: 'Rerouted new design tasks to backup pool', impact: 'high' },
    { id: 'd2', timestamp: '10:41:00', reason: 'P1 Task detected: Campaign Error', action: 'Paused all non-critical tasks for AdsAgent', impact: 'high' },
    { id: 'd3', timestamp: '10:38:45', reason: 'CopyAgent load > 90%', action: 'Scaled up sub-agent instances x2', impact: 'medium' },
  ]);

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case 'working': return 'bg-emerald-500';
      case 'idle': return 'bg-slate-400';
      case 'blocked': return 'bg-amber-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'P1': return 'bg-red-100 text-red-800 border-red-200';
      case 'P2': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'P3': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'P4': return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Zap className="w-8 h-8 text-indigo-600" />
            Axial Orchestrator Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Real-time agent coordination & handoff monitoring</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Pause All Agents</Button>
          <Button variant="default">Force Rebalance</Button>
        </div>
      </div>

      {/* Agent Load Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentLoads.map((agent) => (
          <Card key={agent.id} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold">{agent.name}</CardTitle>
                <Badge variant={agent.status === 'working' ? 'default' : agent.status === 'blocked' ? 'destructive' : 'secondary'}>
                  {agent.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Carga CPU/Mem</span>
                  <span className="font-mono">{agent.load}%</span>
                </div>
                <Progress value={agent.load} className="h-2" 
                  indicatorClassName={agent.load > 80 ? 'bg-red-500' : agent.load > 60 ? 'bg-amber-500' : 'bg-emerald-500'} 
                />
                <div className="flex justify-between text-xs text-slate-500 pt-2">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" /> {agent.activeTasks} ativos
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {agent.queueSize} na fila
                  </span>
                </div>
                {agent.status === 'blocked' && (
                  <Alert variant="destructive" className="mt-3 py-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Bloqueio Detectado</AlertTitle>
                    <AlertDescription className="text-xs">Aguardando aprovação humana ou dependência externa.</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <div className={`absolute top-0 right-0 w-2 h-full ${getStatusColor(agent.status)} opacity-20`} />
          </Card>
        ))}
      </div>

      {/* Main Grid: Handoffs & Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Handoff Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Live Handoff Stream
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {handoffLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-xs font-mono text-slate-400 w-16">{log.timestamp}</div>
                    <div className="flex items-center gap-2 flex-1">
                      <Badge variant="outline" className="text-xs">{log.from}</Badge>
                      <span className="text-slate-400">→</span>
                      <Badge variant="outline" className="text-xs font-semibold">{log.to}</Badge>
                      <span className="text-sm text-slate-700 ml-2">{log.taskType}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{(log.contextSize / 1024).toFixed(1)}KB</span>
                    {log.status === 'completed' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                    {log.status === 'transferring' && <Activity className="w-4 h-4 text-amber-500 animate-pulse" />}
                    {log.status === 'failed' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Orchestrator Decisions Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Decision Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {decisions.map((decision) => (
                <div key={decision.id} className="border-l-2 border-indigo-200 pl-3 py-1">
                  <div className="text-xs text-slate-400 mb-1">{decision.timestamp}</div>
                  <div className="text-sm font-medium text-slate-800 mb-1">{decision.action}</div>
                  <div className="text-xs text-slate-500 mb-2">{decision.reason}</div>
                  <Badge variant={decision.impact === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                    Impact: {decision.impact.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 text-xs">View Full History</Button>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Active Workflows Topology</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] bg-slate-50 rounded-lg border border-slate-200">
          {/* Aqui entraria o React Flow real conectado ao estado do LangGraph */}
          <div className="h-full flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>React Flow Integration Active</p>
              <p className="text-xs mt-1">Rendering live agent connections...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
