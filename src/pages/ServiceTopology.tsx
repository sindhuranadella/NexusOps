import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType
} from '@xyflow/react';
import {
  Network,
  Filter,
  AlertTriangle,
  Server,
  Layers,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Zap,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { apiService } from '../services/api';
import { ServiceNode, ServiceHealth, ServiceTier } from '../types';
import { ServiceGraphNode } from '../components/topology/ServiceGraphNode';
import { ServiceHealthBadge } from '../components/common/StatusBadge';

const nodeTypes = {
  serviceNode: ServiceGraphNode
};

export const ServiceTopology: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSelect = searchParams.get('select');

  const [services, setServices] = useState<ServiceNode[]>(apiService.getServices());
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    initialSelect || 'svc-payment-orchestrator'
  );
  const [tierFilter, setTierFilter] = useState<'all' | ServiceTier>('all');
  const [healthFilter, setHealthFilter] = useState<'all' | ServiceHealth>('all');
  const [isSimulatingBlast, setIsSimulatingBlast] = useState(false);

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId) || null,
    [services, selectedServiceId]
  );

  // Position definitions for topology hierarchy
  const initialPositions: Record<string, { x: number; y: number }> = {
    'svc-edge-ingress': { x: 420, y: 30 },
    'svc-api-gateway': { x: 420, y: 170 },
    'svc-auth-core': { x: 100, y: 320 },
    'svc-payment-orchestrator': { x: 420, y: 320 },
    'svc-order-processing': { x: 740, y: 320 },
    'svc-stripe-connector': { x: 260, y: 490 },
    'svc-inventory-service': { x: 740, y: 490 },
    'svc-kafka-bus': { x: 500, y: 490 },
    'svc-warehouse-erp': { x: 860, y: 640 },
    'svc-redis-session': { x: 100, y: 640 },
    'svc-aurora-db': { x: 480, y: 640 }
  };

  // Upstream / Downstream calculation
  const upstreamServiceIds = useMemo(() => {
    if (!selectedService) return [];
    return selectedService.upstream;
  }, [selectedService]);

  const downstreamServiceIds = useMemo(() => {
    if (!selectedService) return [];
    return selectedService.dependencies;
  }, [selectedService]);

  // Construct React Flow Nodes
  const nodes: Node[] = useMemo(() => {
    return services.map((svc) => {
      const pos = initialPositions[svc.id] || { x: 200, y: 200 };
      const isSelected = svc.id === selectedServiceId;
      const isUpstream = upstreamServiceIds.includes(svc.id);
      const isDownstream = downstreamServiceIds.includes(svc.id);
      const isHighlighted = isSelected || isUpstream || isDownstream;

      const isFilteredOut =
        (tierFilter !== 'all' && svc.tier !== tierFilter) ||
        (healthFilter !== 'all' && svc.health !== healthFilter);

      return {
        id: svc.id,
        type: 'serviceNode',
        position: pos,
        data: {
          service: svc,
          isHighlighted: isHighlighted && !isFilteredOut,
          isDimmed: (selectedServiceId !== null && !isHighlighted) || isFilteredOut
        },
        selected: isSelected
      };
    });
  }, [services, selectedServiceId, upstreamServiceIds, downstreamServiceIds, tierFilter, healthFilter]);

  // Construct React Flow Edges
  const edges: Edge[] = useMemo(() => {
    const list: Edge[] = [];
    services.forEach((src) => {
      src.dependencies.forEach((tgtId) => {
        const isSelectedPath =
          src.id === selectedServiceId ||
          tgtId === selectedServiceId ||
          (upstreamServiceIds.includes(src.id) && src.dependencies.includes(selectedServiceId || '')) ||
          (selectedServiceId && downstreamServiceIds.includes(tgtId));

        list.push({
          id: `e-${src.id}-${tgtId}`,
          source: src.id,
          target: tgtId,
          animated: isSelectedPath || isSimulatingBlast || src.health === 'critical',
          style: {
            stroke: isSelectedPath ? '#38bdf8' : src.health === 'critical' ? '#f43f5e' : '#334155',
            strokeWidth: isSelectedPath ? 2.5 : 1.5
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isSelectedPath ? '#38bdf8' : src.health === 'critical' ? '#f43f5e' : '#475569'
          }
        });
      });
    });
    return list;
  }, [services, selectedServiceId, upstreamServiceIds, downstreamServiceIds, isSimulatingBlast]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedServiceId(node.id);
  }, []);

  const handleSimulateFailover = (serviceId: string) => {
    const current = services.find((s) => s.id === serviceId);
    if (!current) return;
    const nextHealth: ServiceHealth =
      current.health === 'healthy' ? 'degraded' : current.health === 'degraded' ? 'critical' : 'healthy';

    apiService.updateServiceHealth(serviceId, nextHealth);
    setServices(apiService.getServices());
  };

  const handleSimulateCascadingFailure = () => {
    setIsSimulatingBlast(true);
    // Temporarily trigger degraded states
    setTimeout(() => {
      apiService.updateServiceHealth('svc-order-processing', 'degraded');
      apiService.updateServiceHealth('svc-aurora-db', 'critical');
      setServices(apiService.getServices());
      setIsSimulatingBlast(false);
    }, 1200);
  };

  const handleResetTopology = () => {
    apiService.resetAllData();
    setServices(apiService.getServices());
    setSelectedServiceId('svc-payment-orchestrator');
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Service Dependency & Blast Radius Map
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Directed topological graph of enterprise services, upstream ingress paths, and database clusters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tier filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as any)}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-hidden"
          >
            <option value="all">All Tiers</option>
            <option value="tier-1">Tier-1 Mission Critical</option>
            <option value="tier-2">Tier-2 Core</option>
            <option value="tier-3">Tier-3 Internal</option>
          </select>

          {/* Health filter */}
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value as any)}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-hidden"
          >
            <option value="all">All Health States</option>
            <option value="healthy">Healthy</option>
            <option value="degraded">Degraded</option>
            <option value="critical">Critical</option>
          </select>

          <button
            onClick={handleSimulateCascadingFailure}
            disabled={isSimulatingBlast}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold transition-colors disabled:opacity-50"
            title="Simulate cascading ripple through dependent microservices"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulatingBlast ? 'animate-bounce' : ''}`} />
            <span>Simulate Blast Radius</span>
          </button>

          <button
            onClick={handleResetTopology}
            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset topology to baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas & Detail Drawer Container */}
      <div className="flex-1 min-h-0 flex border border-slate-800 rounded-lg overflow-hidden bg-slate-950 relative">
        {/* React Flow Canvas */}
        <div className="flex-1 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            minZoom={0.3}
            maxZoom={1.6}
          >
            <Background color="#1e293b" gap={20} size={1} />
            <Controls className="bg-slate-900 border border-slate-800 text-slate-400" />
            <MiniMap
              nodeColor={(n) => {
                const svc = services.find((s) => s.id === n.id);
                if (!svc) return '#475569';
                if (svc.health === 'critical') return '#f43f5e';
                if (svc.health === 'degraded') return '#f59e0b';
                return '#10b981';
              }}
              maskColor="rgba(15, 23, 42, 0.7)"
              className="bg-slate-950 border border-slate-800 rounded-md"
            />
          </ReactFlow>
        </div>

        {/* Selected Service Detail Drawer */}
        {selectedService && (
          <aside className="w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md border-l border-slate-800 p-4 overflow-y-auto space-y-4 text-xs z-10 shrink-0">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 font-bold">{selectedService.name}</span>
                  <span className="text-slate-600">·</span>
                  <ServiceHealthBadge health={selectedService.health} />
                </div>
                <h3 className="text-sm font-bold text-white mt-1">{selectedService.displayName}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{selectedService.description}</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">P99 Latency</span>
                <span
                  className={`text-sm font-bold ${
                    selectedService.latencyP99 > 500
                      ? 'text-rose-400'
                      : selectedService.latencyP99 > 150
                      ? 'text-amber-400'
                      : 'text-slate-200'
                  }`}
                >
                  {selectedService.latencyP99}ms
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Error Rate</span>
                <span
                  className={`text-sm font-bold ${
                    selectedService.errorRate > 2
                      ? 'text-rose-400'
                      : selectedService.errorRate > 0.5
                      ? 'text-amber-400'
                      : 'text-slate-200'
                  }`}
                >
                  {selectedService.errorRate}%
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">30d Uptime</span>
                <span className="text-sm font-bold text-emerald-400">{selectedService.uptime}%</span>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Active Incidents</span>
                <span
                  className={`text-sm font-bold ${
                    selectedService.activeIncidents > 0 ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  {selectedService.activeIncidents}
                </span>
              </div>
            </div>

            {/* Upstream Callers */}
            <div>
              <span className="font-semibold text-slate-300 block mb-1.5 uppercase tracking-wider text-[10px]">
                Upstream Ingress / Callers ({selectedService.upstream.length})
              </span>
              {selectedService.upstream.length === 0 ? (
                <div className="text-slate-500 text-[11px] p-2 bg-slate-950 rounded border border-slate-800/80">
                  Top-level entry point (Edge / External)
                </div>
              ) : (
                <div className="space-y-1">
                  {selectedService.upstream.map((upId) => {
                    const upSvc = services.find((s) => s.id === upId);
                    return (
                      <button
                        key={upId}
                        onClick={() => setSelectedServiceId(upId)}
                        className="w-full p-2 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between text-xs transition-colors"
                      >
                        <span className="text-slate-200">{upSvc?.displayName || upId}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Downstream Dependencies */}
            <div>
              <span className="font-semibold text-slate-300 block mb-1.5 uppercase tracking-wider text-[10px]">
                Downstream Dependencies ({selectedService.dependencies.length})
              </span>
              {selectedService.dependencies.length === 0 ? (
                <div className="text-slate-500 text-[11px] p-2 bg-slate-950 rounded border border-slate-800/80">
                  Terminal node (No downstream dependencies)
                </div>
              ) : (
                <div className="space-y-1">
                  {selectedService.dependencies.map((depId) => {
                    const depSvc = services.find((s) => s.id === depId);
                    return (
                      <button
                        key={depId}
                        onClick={() => setSelectedServiceId(depId)}
                        className="w-full p-2 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between text-xs transition-colors"
                      >
                        <span className="text-slate-200">{depSvc?.displayName || depId}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Infrastructure Details */}
            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1 text-[11px] font-mono">
              <div className="text-slate-400">Cluster: <span className="text-slate-200">{selectedService.cluster}</span></div>
              <div className="text-slate-400">Version: <span className="text-slate-200">{selectedService.version}</span></div>
              <div className="text-slate-400">Owner Team: <span className="text-slate-200">{selectedService.ownerTeam}</span></div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleSimulateFailover(selectedService.id)}
                className="w-full py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-center font-semibold transition-colors"
              >
                Cycle Simulated Health State
              </button>

              <button
                onClick={() => navigate('/investigation')}
                className="w-full py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-center font-semibold transition-colors flex items-center justify-center gap-1"
              >
                Inspect in Studio <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
