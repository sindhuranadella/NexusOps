import React, { useState } from 'react';
import {
  BarChart3,
  TrendingDown,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Download,
  Filter,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { apiService } from '../services/api';

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const services = apiService.getServices();

  // MTTR by service data
  const mttrByService = [
    { service: 'Payment Orchestrator', mttr: 42, target: 30 },
    { service: 'Postgres Aurora DB', mttr: 35, target: 30 },
    { service: 'Order Processing', mttr: 28, target: 30 },
    { service: 'Auth Core', mttr: 18, target: 30 },
    { service: 'Core API Gateway', mttr: 14, target: 30 },
    { service: 'Stripe Connector', mttr: 24, target: 30 },
    { service: 'Kafka Bus', mttr: 8, target: 30 }
  ];

  // Root Cause Categories
  const rootCauses = [
    { name: 'Migration / Query Lock Drift', value: 38, color: '#f43f5e' },
    { name: 'Infrastructure & Pool Exhaustion', value: 26, color: '#f59e0b' },
    { name: 'Third-Party Upstream Degraded', value: 20, color: '#38bdf8' },
    { name: 'Deployment Rollout Regression', value: 16, color: '#a855f7' }
  ];

  // SLO Error budget data
  const sloTable = [
    {
      service: 'Global Edge Ingress & CDN',
      targetSlo: '99.99%',
      currentUptime: '99.99%',
      errorBudget: '84.0%',
      burnRate: '0.4x',
      status: 'Healthy'
    },
    {
      service: 'Core API Gateway',
      targetSlo: '99.95%',
      currentUptime: '99.97%',
      errorBudget: '62.5%',
      burnRate: '0.8x',
      status: 'Healthy'
    },
    {
      service: 'Payment Orchestrator & Vault',
      targetSlo: '99.95%',
      currentUptime: '98.42%',
      errorBudget: '0.0%',
      burnRate: '4.8x',
      status: 'Exhausted'
    },
    {
      service: 'Identity & JWT Token Service',
      targetSlo: '99.99%',
      currentUptime: '99.99%',
      errorBudget: '92.0%',
      burnRate: '0.2x',
      status: 'Healthy'
    },
    {
      service: 'PostgreSQL Aurora Primary',
      targetSlo: '99.95%',
      currentUptime: '99.78%',
      errorBudget: '14.2%',
      burnRate: '1.9x',
      status: 'Warning'
    }
  ];

  const handleExportCSV = () => {
    const headers = ['Service', 'TargetSLO', 'CurrentUptime', 'ErrorBudgetRemaining', 'BurnRate', 'Status'];
    const rows = sloTable.map((s) => [
      `"${s.service}"`,
      s.targetSlo,
      s.currentUptime,
      s.errorBudget,
      s.burnRate,
      s.status
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `nexusops_slo_analytics_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Operational Analytics & SLO Performance
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Mean Time to Resolve (MTTR) trends, error budget consumption rates, and root-cause taxonomy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range selector */}
          <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-md text-xs">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded font-mono font-medium transition-colors ${
                  timeRange === r
                    ? 'bg-slate-800 text-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export SLO Metrics</span>
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* MTTR by Service */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">MTTR by Service (Minutes)</h2>
              <p className="text-xs text-slate-400">Target SLA resolution baseline is 30 minutes</p>
            </div>
            <span className="text-xs font-mono text-cyan-400">Target: 30m</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mttrByService} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis dataKey="service" type="category" stroke="#64748b" tick={{ fontSize: 11 }} width={140} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="mttr" fill="#38bdf8" radius={[0, 3, 3, 0]} name="Actual MTTR" />
                <Bar dataKey="target" fill="#334155" radius={[0, 3, 3, 0]} name="SLO Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Root Cause Taxonomy */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3 flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-100">Root-Cause Taxonomy</h2>
            <p className="text-xs text-slate-400">Distribution over {timeRange}</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rootCauses}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                >
                  {rootCauses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '6px',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-[11px]">
            {rootCauses.map((rc, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: rc.color }} />
                  {rc.name}
                </span>
                <span className="font-mono font-bold text-slate-100">{rc.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service SLO & Error Budget Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Service Level Objectives (SLO) & Error Budget Burndown
            </h2>
            <p className="text-xs text-slate-400">
              Tracking remaining error budget and 24h burn rate across tier-1 services
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase bg-slate-950/60">
                <th className="py-2.5 px-4">Service Name</th>
                <th className="py-2.5 px-4 font-mono">Target SLO</th>
                <th className="py-2.5 px-4 font-mono">Current Uptime</th>
                <th className="py-2.5 px-4 font-mono">Error Budget Left</th>
                <th className="py-2.5 px-4 font-mono">Burn Rate</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sloTable.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-200">{row.service}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{row.targetSlo}</td>
                  <td className="py-3 px-4 font-mono text-slate-200 font-semibold">{row.currentUptime}</td>
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`font-semibold ${
                        row.errorBudget === '0.0%'
                          ? 'text-rose-400'
                          : parseFloat(row.errorBudget) < 20
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {row.errorBudget}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`${
                        parseFloat(row.burnRate) > 2.0
                          ? 'text-rose-400 font-semibold'
                          : parseFloat(row.burnRate) > 1.0
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {row.burnRate}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        row.status === 'Healthy'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900'
                          : row.status === 'Warning'
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-900'
                          : 'bg-rose-950/60 text-rose-400 border border-rose-900'
                      }`}
                    >
                      {row.status}
                    </span>
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
