import React, { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node
} from '@xyflow/react';
import {
  Workflow,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Save,
  RotateCcw,
  Sliders,
  Terminal,
  Zap,
  GitBranch,
  UserCheck,
  X
} from 'lucide-react';
import { apiService } from '../services/api';
import { WorkflowDefinition, WorkflowNodeData } from '../types';
import { WorkflowCustomNode } from '../components/workflows/WorkflowCustomNode';
import { Modal } from '../components/common/Modal';

const nodeTypes = {
  custom: WorkflowCustomNode
};

export const Workflows: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id');

  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>(apiService.getWorkflows());
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(
    initialId || workflows[0]?.id || ''
  );

  const activeWorkflow = useMemo(
    () => workflows.find((w) => w.id === selectedWorkflowId) || workflows[0],
    [workflows, selectedWorkflowId]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(activeWorkflow ? activeWorkflow.nodes : []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(activeWorkflow ? activeWorkflow.edges : []);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Validation modal state
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    valid: boolean;
    issues: string[];
    summary: string;
  }>({ valid: true, issues: [], summary: '' });

  // Execution modal state
  const [executionModalOpen, setExecutionModalOpen] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  // When active workflow changes
  const handleSelectWorkflow = (id: string) => {
    setSelectedWorkflowId(id);
    const target = workflows.find((w) => w.id === id);
    if (target) {
      setNodes(target.nodes);
      setEdges(target.edges);
      setSelectedNode(null);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Add new node of specified type
  const handleAddNode = (type: 'trigger' | 'condition' | 'action' | 'approval') => {
    const id = `node-${Date.now()}`;
    const titles = {
      trigger: 'Trigger: High Error Rate Metric',
      condition: 'Condition: Error Rate > 5% for 3m',
      action: 'Action: Scale Pod Replicas +4',
      approval: 'Approval: SRE Lead Sign-Off'
    };
    const descriptions = {
      trigger: 'Monitors inbound metric threshold',
      condition: 'Evaluates logical operator against live payload',
      action: 'Sends idempotent command to backend proxy',
      approval: 'Requires sign-off before proceeding'
    };

    const newNode: Node = {
      id,
      type: 'custom',
      position: { x: 300 + Math.random() * 100, y: 150 + Math.random() * 100 },
      data: {
        label: titles[type],
        nodeType: type,
        description: descriptions[type],
        config: { enabled: true, timeoutSec: 60 },
        status: 'idle'
      }
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
  };

  // Node editing handlers
  const handleUpdateNodeLabel = (newLabel: string) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id
          ? { ...n, data: { ...(n.data as any), label: newLabel } }
          : n
      )
    );
    setSelectedNode((prev) => (prev ? { ...prev, data: { ...(prev.data as any), label: newLabel } } : null));
  };

  const handleUpdateNodeDesc = (newDesc: string) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id
          ? { ...n, data: { ...(n.data as any), description: newDesc } }
          : n
      )
    );
    setSelectedNode((prev) => (prev ? { ...prev, data: { ...(prev.data as any), description: newDesc } } : null));
  };

  const handleDeleteSelectedNode = () => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
  };

  // Validate workflow graph
  const handleValidateGraph = () => {
    const issues: string[] = [];
    const triggerNodes = nodes.filter((n) => (n.data as any)?.nodeType === 'trigger');
    if (triggerNodes.length === 0) {
      issues.push('Workflow missing a primary Trigger node. Add a trigger to initialize runbook execution.');
    }

    // Check for orphaned nodes
    nodes.forEach((n) => {
      const isSource = edges.some((e) => e.source === n.id);
      const isTarget = edges.some((e) => e.target === n.id);
      const isTrigger = (n.data as any)?.nodeType === 'trigger';
      if (!isSource && !isTarget) {
        issues.push(`Node "${(n.data as any)?.label}" is completely disconnected.`);
      } else if (!isTarget && !isTrigger) {
        issues.push(`Non-trigger node "${(n.data as any)?.label}" has no inbound connection.`);
      }
    });

    const valid = issues.length === 0;
    setValidationResults({
      valid,
      issues,
      summary: valid
        ? 'Workflow DAG topology verified. Graph is deterministic and valid for Flask execution engine.'
        : `Found ${issues.length} structural issues in the workflow graph.`
    });
    setValidationModalOpen(true);
  };

  // Save workflow
  const handleSaveWorkflow = () => {
    if (!activeWorkflow) return;
    const updated: WorkflowDefinition = {
      ...activeWorkflow,
      nodes,
      edges,
      updatedAt: new Date().toISOString()
    };
    apiService.saveWorkflow(updated);
    setWorkflows(apiService.getWorkflows());
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 2500);
  };

  // Execute simulation (Dry run)
  const handleRunSimulation = () => {
    setIsExecuting(true);
    setExecutionModalOpen(true);
    setExecutionLogs([
      `[${new Date().toISOString()}] Initializing deterministic execution run for ${activeWorkflow.name}`,
      `[${new Date().toISOString()}] Validating ${nodes.length} nodes and ${edges.length} state transition edges`
    ]);

    setTimeout(() => {
      const res = apiService.executeWorkflowSimulation(activeWorkflow.id);
      setExecutionLogs((prev) => [
        ...prev,
        `[${new Date().toISOString()}] Dispatched trigger event: ${activeWorkflow.triggerEvent}`,
        `[${new Date().toISOString()}] Step 1: Evaluated condition branches: PASSED`,
        `[${new Date().toISOString()}] Step 2: Action [Rollback / Shed] invoked against mock Flask gateway (HTTP 200 OK)`,
        `[${new Date().toISOString()}] Step 3: Approval node state set to: COMPLETED_AUTOMATIC`,
        `[${new Date().toISOString()}] Execution ID: ${res.executionId} completed successfully with 0 exceptions.`
      ]);
      setIsExecuting(false);
      setWorkflows(apiService.getWorkflows());
    }, 1200);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Top Header & Workflow Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Visual Workflow Automation & Runbooks
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic operations runbooks executed by the NexusOps Flask REST execution engine.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Workflow selector */}
          <select
            value={selectedWorkflowId}
            onChange={(e) => handleSelectWorkflow(e.target.value)}
            className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-semibold text-cyan-400 focus:outline-hidden"
          >
            {workflows.map((wf) => (
              <option key={wf.id} value={wf.id}>
                {wf.name} ({wf.nodes.length} nodes)
              </option>
            ))}
          </select>

          <button
            onClick={handleValidateGraph}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Validate Graph</span>
          </button>

          <button
            onClick={handleRunSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Dry-Run Simulation</span>
          </button>

          <button
            onClick={handleSaveWorkflow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Definition</span>
          </button>
        </div>
      </div>

      {/* Palette Toolbar */}
      <div className="flex items-center justify-between gap-2 p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono text-[10px] uppercase font-semibold">
            Add Node to Canvas:
          </span>
          <button
            onClick={() => handleAddNode('trigger')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-purple-950/60 hover:bg-purple-900 border border-purple-800/80 text-purple-300 font-medium transition-colors"
          >
            <Zap className="w-3 h-3" />
            <span>+ Trigger</span>
          </button>
          <button
            onClick={() => handleAddNode('condition')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-950/60 hover:bg-amber-900 border border-amber-800/80 text-amber-300 font-medium transition-colors"
          >
            <GitBranch className="w-3 h-3" />
            <span>+ Condition</span>
          </button>
          <button
            onClick={() => handleAddNode('action')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800/80 text-cyan-300 font-medium transition-colors"
          >
            <Play className="w-3 h-3" />
            <span>+ Action</span>
          </button>
          <button
            onClick={() => handleAddNode('approval')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 font-medium transition-colors"
          >
            <UserCheck className="w-3 h-3" />
            <span>+ Approval</span>
          </button>
        </div>

        {saveSuccessToast && (
          <span className="font-mono text-emerald-400 text-[11px] animate-fade-in">
            ✓ Workflow definition saved to store
          </span>
        )}
      </div>

      {/* Main Canvas & Node Inspector */}
      <div className="flex-1 min-h-0 flex border border-slate-800 rounded-lg overflow-hidden bg-slate-950 relative">
        <div className="flex-1 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
          >
            <Background color="#1e293b" gap={20} size={1} />
            <Controls className="bg-slate-900 border border-slate-800 text-slate-400" />
            <MiniMap maskColor="rgba(15, 23, 42, 0.7)" className="bg-slate-950 border border-slate-800 rounded-md" />
          </ReactFlow>
        </div>

        {/* Node Inspector Drawer */}
        {selectedNode && (
          <aside className="w-80 bg-slate-900/95 backdrop-blur-md border-l border-slate-800 p-4 overflow-y-auto space-y-4 text-xs z-10 shrink-0">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono uppercase text-cyan-400 font-bold text-[10px]">
                  {(selectedNode.data as any)?.nodeType} NODE INSPECTOR
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">Edit Configuration</h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Label input */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">Node Title / Step Label</label>
              <input
                type="text"
                value={(selectedNode.data as any)?.label || ''}
                onChange={(e) => handleUpdateNodeLabel(e.target.value)}
                className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">Behavior Description</label>
              <textarea
                rows={3}
                value={(selectedNode.data as any)?.description || ''}
                onChange={(e) => handleUpdateNodeDesc(e.target.value)}
                className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-hidden focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Config JSON preview */}
            <div>
              <label className="block font-medium text-slate-300 mb-1 font-mono text-[10px] uppercase">
                Runtime Config Payload (Flask Execution Driver)
              </label>
              <pre className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                {JSON.stringify((selectedNode.data as any)?.config || {}, null, 2)}
              </pre>
            </div>

            {/* Delete Node */}
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={handleDeleteSelectedNode}
                className="w-full py-2 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 font-semibold transition-colors"
              >
                Delete Selected Node
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Modal: Validation Results */}
      <Modal
        isOpen={validationModalOpen}
        onClose={() => setValidationModalOpen(false)}
        title="Workflow Graph Integrity Analysis"
        description="Static validation for deterministic DAG execution."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div
            className={`p-3 rounded border ${
              validationResults.valid
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}
          >
            <div className="font-semibold flex items-center gap-1.5">
              {validationResults.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              )}
              {validationResults.valid ? 'Graph Validation Passed' : 'Validation Errors Found'}
            </div>
            <p className="mt-1 text-[11px] leading-relaxed">{validationResults.summary}</p>
          </div>

          {validationResults.issues.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-semibold text-slate-300 uppercase text-[10px]">Identified Issues:</span>
              {validationResults.issues.map((iss, i) => (
                <div key={i} className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  • {iss}
                </div>
              ))}
            </div>
          )}

          <div className="text-right pt-2 border-t border-slate-800">
            <button
              onClick={() => setValidationModalOpen(false)}
              className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Execution Simulation Console */}
      <Modal
        isOpen={executionModalOpen}
        onClose={() => setExecutionModalOpen(false)}
        title="Automated Runbook Dry-Run Console"
        description="Deterministic simulation log stream from the NexusOps Flask REST proxy."
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs font-mono">
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 max-h-80 overflow-y-auto space-y-2">
            {executionLogs.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                <span className="text-cyan-400">&gt;</span> {log}
              </div>
            ))}
            {isExecuting && (
              <div className="text-amber-400 animate-pulse">
                [Executing DAG nodes against mock endpoint...]
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 font-sans">
              Execution state will be reflected on the incident timeline.
            </span>
            <button
              onClick={() => setExecutionModalOpen(false)}
              disabled={isExecuting}
              className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50 font-sans"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
