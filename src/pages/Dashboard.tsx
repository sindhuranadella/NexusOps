import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Zap,
  TrendingDown,
  Sparkles,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import { apiService } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { IncidentStatusBadge, ServiceHealthBadge } from '../components/common/StatusBadge';
import { Incident, ServiceNode } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [services] = useState<ServiceNode[]>(apiService.getServices());
  const [incidents, setIncidents] = useState<Incident[]>(apiService.getIncidents());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeIncidents = incidents.filter((i) => i.status !== 'resolved');
  const criticalIncidents = activeIncidents.filter((i) => i.severity === 'P1' || i.severity === 'P2');
  const healthyServicesCount = services.filter((s) => s.health === 'healthy').length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIncidents(apiService.getIncidents());
      setIsRefreshing(false);
    }, 400);
  };

  const handleAcknowledge = (id: string) => {
    apiService.updateIncidentStatus(id, 'identified', 'Marcus Vance', 'Acknowledged by active Incident Commander.');
    setIncidents(apiService.getIncidents());
  };

  // Sample incident trend timeseries for charts
  const incidentTrendData = [
    { time: '04:00', p1: 0, p2: 1, p3: 2, mttr: 22 },
    { time: '06:00', p1: 0, p2: 0, p3: 1, mttr: 19 },
    { time: '08:00', p1: 0, p2: 1, p3: 1, mttr: 24 },
    { time: '10:00', p1: 1, p2: 2, p3: 1, mttr: 36 },
    { time: '12:00', p1: 1, p2: 1, p3: 0, mttr: 31 },
    { time: '14:00', p1: 0, p2: 1, p3: 2, mttr: 25 },
    { time: '16:00', p1: 0, p2: 0, p3: 1, mttr: 20 },
    { time: '18:00', p1: 0, p2: 0, p3: 0, mttr: 18 }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Executive Operations Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time business operations monitoring, active incident telemetry, and automated remediation telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range segmented control */}
          <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-md text-xs">
            {(['1h', '6h', '24h', '7d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded font-mono font-medium transition-colors ${
                  timeRange === r
                    ? 'bg-slate-800 text-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors disabled:opacity-50"
            title="Refresh Operational Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* AI Daily Operations Briefing Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-cyan-900/40 rounded-lg p-4 sm:p-5 relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 max-w-4xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                <Sparkles className="w-3 h-3" />
                AI SYNTHESIZED EXECUTIVE BRIEFING
              </span>
              <span className="text-xs text-slate-400 font-mono">Generated Today at 10:28 UTC</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              <strong className="text-rose-300 font-semibold">Operational Alert:</strong> 1 mission-critical P1
              incident active on <span className="text-cyan-300 font-medium">Payment Orchestrator</span> (INC-8921)
              following release canary v2.41.4. PgBouncer pool saturation is causing 4.8% European checkout dropouts.
              Automated triage workflow has halted subsequent canaries. Remaining services operating within nominal
              tolerances.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Est. Revenue Exposure: <strong className="text-slate-200 font-mono">$42,500/hr</strong>
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                SLA Breach Risk: <strong className="text-slate-200 font-mono">44m remaining</strong>
              </span>
              <span className="text-slate-600">·</span>
              <button
                onClick={() => navigate('/investigation')}
                className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 hover:underline"
              >
                Inspect Investigation Studio <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end shrink-0 text-right">
            <span className="text-[10px] font-mono uppercase text-slate-400">Platform Resilience</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">92.4%</span>
            <span className="text-[11px] text-slate-400">SLO Adherence 30d</span>
          </div>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Global Availability"
          value="99.94%"
          tone="positive"
          change="-0.01% MoM"
          trend="down"
          subtitle="Target: 99.95% SLO"
          actionText="View SLOs"
          onActionClick={() => navigate('/analytics')}
          icon={<ShieldCheck className="w-4 h-4" />}
        />

        <MetricCard
          label="Active P1 / P2 Incidents"
          value={criticalIncidents.length}
          tone={criticalIncidents.length > 0 ? 'critical' : 'positive'}
          change={`${activeIncidents.length} total open`}
          trend={criticalIncidents.length > 0 ? 'up' : 'neutral'}
          subtitle="1 P1 in triage, 1 P2 in mitigation"
          actionText="Triage Queue"
          onActionClick={() => navigate('/incidents')}
          icon={<AlertTriangle className="w-4 h-4" />}
        />

        <MetricCard
          label="Mean Time to Resolve (MTTR)"
          value="28.4"
          unit="minutes"
          tone="positive"
          change="-14m vs avg"
          trend="down"
          subtitle="90-day moving average"
          actionText="Analytics"
          onActionClick={() => navigate('/analytics')}
          icon={<Clock className="w-4 h-4" />}
        />

        <MetricCard
          label="Automated Remediation Rate"
          value="94.2%"
          tone="positive"
          change="42 runs / 24h"
          trend="up"
          subtitle="Deterministic Flask engine"
          actionText="Workflows"
          onActionClick={() => navigate('/workflows')}
          icon={<Zap className="w-4 h-4" />}
        />
      </div>

      {/* Charts & Service Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Incident Volume & MTTR Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Incident Velocity & MTTR Trajectory</h2>
              <p className="text-xs text-slate-400">Severity distribution across operational shift windows</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" /> P1 Incidents
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" /> P2 Major
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-xs bg-cyan-400" /> MTTR (min)
              </span>
            </div>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incidentTrendData}>
                <defs>
                  <linearGradient id="colorP1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorP2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="p1" stroke="#f43f5e" fillOpacity={1} fill="url(#colorP1)" />
                <Area type="monotone" dataKey="p2" stroke="#f59e0b" fillOpacity={1} fill="url(#colorP2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Peak alert velocity occurred during 09:00 - 10:00 UTC Canary window</span>
            <button
              onClick={() => navigate('/analytics')}
              className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline flex items-center gap-1"
            >
              Detailed SLO metrics →
            </button>
          </div>
        </div>

        {/* Real-Time Service Health Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div>
                <h2 className="text-sm font-semibold text-slate-100">Service Health Matrix</h2>
                <p className="text-xs text-slate-400">
                  {healthyServicesCount} of {services.length} services nominal
                </p>
              </div>
              <button
                onClick={() => navigate('/topology')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 hover:underline"
              >
                Topology Map <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-800/60 max-h-72 overflow-y-auto">
              {services.slice(0, 6).map((svc) => (
                <div key={svc.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200 truncate">{svc.displayName}</span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{svc.tier}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono">P99: {svc.latencyP99}ms</span>
                      <span>·</span>
                      <span className="font-mono">Err: {svc.errorRate}%</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <ServiceHealthBadge health={svc.health} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>PgBouncer cluster at 96% capacity</span>
            <button
              onClick={() => navigate('/topology')}
              className="text-sky-400 hover:text-sky-300 font-medium hover:underline"
            >
              View all 11 services
            </button>
          </div>
        </div>
      </div>

      {/* Critical Incident Triage Queue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Critical Incident Triage Queue
              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-rose-950 text-rose-300 border border-rose-900/60">
                {activeIncidents.length} Open
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Active operational incidents ranked by severity and SLA proximity
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/incidents')}
              className="text-xs px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
            >
              View Full Incident Registry
            </button>
          </div>
        </div>

        {/* Dense Enterprise Table */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Incident ID</th>
                <th className="py-2.5 px-3">Title & Root Summary</th>
                <th className="py-2.5 px-3">Affected Service</th>
                <th className="py-2.5 px-3">Owner</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 font-mono">SLA Deadline</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeIncidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <SeverityBadge severity={inc.severity} />
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-cyan-400">
                    <button
                      onClick={() => navigate(`/incidents/${inc.id}`)}
                      className="hover:underline"
                    >
                      {inc.id}
                    </button>
                  </td>
                  <td className="py-3 px-3 max-w-sm">
                    <div className="font-medium text-slate-200 truncate">{inc.title}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{inc.impactSummary}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{inc.affectedServiceName}</td>
                  <td className="py-3 px-3 text-slate-400">{inc.assignedOwnerName}</td>
                  <td className="py-3 px-3">
                    <IncidentStatusBadge status={inc.status} />
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span
                      className={`text-[11px] ${
                        inc.slaBreached ? 'text-rose-400 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      {new Date(inc.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {inc.slaBreached && ' (BREACHED)'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-2 whitespace-nowrap">
                    {inc.status === 'investigating' && (
                      <button
                        onClick={() => handleAcknowledge(inc.id)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-medium transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/incidents/${inc.id}`)}
                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-colors"
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
