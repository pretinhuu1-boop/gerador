import React, { useCallback, useState, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface WorkflowNodeData {
  label: string;
  agent: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error' | 'waiting-approval';
  progress?: number;
  sla?: string;
}

type WorkflowNode = Node<WorkflowNodeData>;
type WorkflowEdge = Edge;

interface AxialWorkflowProps {
  initialNodes?: WorkflowNode[];
  initialEdges?: WorkflowEdge[];
  className?: string;
  onNodeClick?: (node: WorkflowNode) => void;
  readOnly?: boolean;
}

const nodeStyle = {
  padding: '10px',
  borderRadius: '8px',
  border: '2px solid',
  minWidth: '200px',
  fontSize: '12px',
};

const statusColors = {
  pending: '#9CA3AF',
  'in-progress': '#3B82F6',
  completed: '#10B981',
  error: '#EF4444',
  'waiting-approval': '#F59E0B',
};

const statusBorderWidth = {
  pending: 1,
  'in-progress': 3,
  completed: 2,
  error: 3,
  'waiting-approval': 2,
};

function CustomNode({ data }: { data: WorkflowNodeData }) {
  return (
    <div
      style={{
        ...nodeStyle,
        borderColor: statusColors[data.status],
        borderWidth: statusBorderWidth[data.status],
        background: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
        {data.label}
      </div>
      <div style={{ marginBottom: '4px' }}>
        <Badge 
          variant={
            data.status === 'completed' ? 'success' :
            data.status === 'error' ? 'danger' :
            data.status === 'in-progress' ? 'info' :
            data.status === 'waiting-approval' ? 'warning' :
            'default'
          }
        >
          {data.status.replace('-', ' ').toUpperCase()}
        </Badge>
      </div>
      {data.progress !== undefined && (
        <div style={{ marginTop: '8px' }}>
          <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>
            Progress: {data.progress}%
          </div>
          <div
            style={{
              width: '100%',
              height: '4px',
              background: '#E5E7EB',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${data.progress}%`,
                height: '100%',
                background: statusColors[data.status],
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}
      {data.sla && (
        <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
          SLA: {data.sla}
        </div>
      )}
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

export function AxialWorkflow({
  initialNodes = [],
  initialEdges = [],
  className,
  onNodeClick,
  readOnly = false,
}: AxialWorkflowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#3B82F6', strokeWidth: 2 },
          },
          eds
        )
      ),
    [setEdges]
  );

  const onNodeClickHandler = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(node as WorkflowNode);
      }
    },
    [onNodeClick]
  );

  return (
    <div className={cn('h-[600px] w-full border rounded-lg', className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onNodeClick={onNodeClickHandler}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Controls />
        <Background color="#aaa" gap={16} />
        <Panel position="top-right" style={{ background: 'white', padding: '8px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Status Legend</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: color }} />
                <span>{status.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
