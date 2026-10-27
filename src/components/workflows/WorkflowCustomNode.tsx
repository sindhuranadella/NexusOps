import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { WorkflowNodeData } from '../../types';
import { Zap, GitBranch, Play, CheckCircle2, UserCheck, Clock } from 'lucide-react';

export const WorkflowCustomNode = memo(({ data, selected }: NodeProps) => {
  const { label, nodeType, description, status, config } = (data || {}) as unknown as WorkflowNodeData;

  const nodeStyles = {
    trigger: {
      border: 'border-purple-600/70',
      headerBg: 'bg-purple-950/40 text-purple-300',
      icon: Zap
    },
    condition: {
      border: 'border-amber-600/70',
      headerBg: 'bg-amber-950/40 text-amber-300',
      icon: GitBranch
    },
    action: {
      border: 'border-cyan-600/70',
      headerBg: 'bg-cyan-950/40 text-cyan-300',
      icon: Play
    },
    approval: {
      border: 'border-emerald-600/70',
      headerBg: 'bg-emerald-950/40 text-emerald-300',
      icon: UserCheck
    }
  }[nodeType || 'action'];

  const Icon = nodeStyles.icon;

  const statusBadge = {
    idle: <span className="text-[10px] font-mono text-slate-500">READY</span>,
    running: (
      <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
        <Clock className="w-2.5 h-2.5 animate-spin" /> RUNNING
      </span>
    ),
    success: (
      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
        <CheckCircle2 className="w-2.5 h-2.5" /> SUCCESS
      </span>
    ),
    failed: <span className="text-[10px] font-mono text-rose-400">FAILED</span>,
    waiting_approval: (
      <span className="text-[10px] font-mono text-sky-400 flex items-center gap-1">
        <UserCheck className="w-2.5 h-2.5" /> PENDING SIGN-OFF
      </span>
    )
  }[status || 'idle'];

  return (
    <div
      className={`w-64 rounded-lg bg-slate-900 border ${nodeStyles.border} shadow-xl text-xs overflow-hidden transition-all ${
        selected ? 'ring-2 ring-cyan-400' : ''
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-slate-500" />
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-cyan-400" />

      {/* Header */}
      <div className={`px-3 py-1.5 flex items-center justify-between border-b border-slate-800 ${nodeStyles.headerBg}`}>
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
          <Icon className="w-3 h-3" />
          <span>{nodeType}</span>
        </div>
        {statusBadge}
      </div>

      {/* Body */}
      <div className="p-3 space-y-1.5">
        <div className="font-semibold text-slate-100">{label}</div>
        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{description}</p>

        {config && Object.keys(config).length > 0 && (
          <div className="pt-1.5 border-t border-slate-800/80 font-mono text-[10px] text-slate-500 truncate">
            {Object.entries(config)
              .slice(0, 2)
              .map(([k, v]) => `${k}=${v}`)
              .join(' · ')}
          </div>
        )}
      </div>
    </div>
  );
});

WorkflowCustomNode.displayName = 'WorkflowCustomNode';
