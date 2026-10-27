import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ServiceNode } from '../../types';
import { ServiceHealthBadge } from '../common/StatusBadge';
import { AlertTriangle, Server } from 'lucide-react';

interface ServiceGraphNodeData {
  service: ServiceNode;
  isHighlighted?: boolean;
  isDimmed?: boolean;
}

export const ServiceGraphNode = memo(({ data, selected }: NodeProps) => {
  const { service, isHighlighted, isDimmed } = (data || {}) as unknown as ServiceGraphNodeData;

  if (!service) return null;

  const healthBorders = {
    healthy: 'border-emerald-600/50 hover:border-emerald-500',
    degraded: 'border-amber-600/60 hover:border-amber-500',
    critical: 'border-rose-600/80 hover:border-rose-500 animate-pulse',
    maintenance: 'border-slate-700 hover:border-slate-600'
  }[service.health];

  return (
    <div
      className={`relative w-64 rounded-lg bg-slate-900 border p-3.5 shadow-xl transition-all ${healthBorders} ${
        selected ? 'ring-2 ring-cyan-400 border-cyan-400' : ''
      } ${isHighlighted ? 'ring-2 ring-blue-500 scale-105 z-20' : ''} ${
        isDimmed ? 'opacity-30' : 'opacity-100'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-slate-600" />
      <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-cyan-500" />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Server className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-100 truncate">{service.displayName}</h4>
            <div className="text-[10px] font-mono text-slate-400 truncate">
              {service.name} · {service.tier}
            </div>
          </div>
        </div>

        <ServiceHealthBadge health={service.health} />
      </div>

      {/* Telemetry strip */}
      <div className="mt-2.5 pt-2 border-t border-slate-800 grid grid-cols-2 gap-1 text-[11px] font-mono">
        <div>
          <span className="text-slate-500 block text-[9px] uppercase">P99 Latency</span>
          <span
            className={`font-semibold ${
              service.latencyP99 > 500
                ? 'text-rose-400'
                : service.latencyP99 > 150
                ? 'text-amber-400'
                : 'text-slate-300'
            }`}
          >
            {service.latencyP99}ms
          </span>
        </div>

        <div>
          <span className="text-slate-500 block text-[9px] uppercase">Error Rate</span>
          <span
            className={`font-semibold ${
              service.errorRate > 2
                ? 'text-rose-400'
                : service.errorRate > 0.5
                ? 'text-amber-400'
                : 'text-slate-300'
            }`}
          >
            {service.errorRate}%
          </span>
        </div>
      </div>

      {/* Active incident badge if any */}
      {service.activeIncidents > 0 && (
        <div className="mt-2 flex items-center justify-between text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-900">
          <span className="flex items-center gap-1 font-semibold">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            {service.activeIncidents} Active Incident
          </span>
          <span>INVESTIGATE</span>
        </div>
      )}
    </div>
  );
});

ServiceGraphNode.displayName = 'ServiceGraphNode';
