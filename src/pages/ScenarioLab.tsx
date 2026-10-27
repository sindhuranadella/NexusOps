import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  Sliders,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Clock,
  ShieldCheck,
  Download,
  RotateCcw,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { apiService } from '../services/api';
import { ScenarioParameter, ScenarioCalculationResult } from '../types';

export const ScenarioLab: React.FC = () => {
  const [parameters, setParameters] = useState<ScenarioParameter[]>(
    apiService.getScenarioParameters()
  );

  const baselineParameters: ScenarioParameter[] = useMemo(
    () =>
      parameters.map((p) => ({
        ...p,
        currentValue: p.defaultValue
      })),
    [parameters]
  );

  const worstCaseParameters: ScenarioParameter[] = useMemo(
    () => [
      { ...parameters[0], currentValue: 4.5 },
      { ...parameters[1], currentValue: 180 },
      { ...parameters[2], currentValue: 1800 },
      { ...parameters[3], currentValue: 2 }
    ],
    [parameters]
  );

  // Calculate results deterministically
  const activeResult = useMemo(
    () => apiService.calculateScenario(parameters),
    [parameters]
  );

  const baselineResult = useMemo(
    () => apiService.calculateScenario(baselineParameters),
    [baselineParameters]
  );

  const worstCaseResult = useMemo(
    () => apiService.calculateScenario(worstCaseParameters),
    [worstCaseParameters]
  );

  const handleSliderChange = (id: string, value: number) => {
    const updated = apiService.updateScenarioParameter(id, value);
    setParameters(updated);
  };

  const handleResetParameters = () => {
    const reset = parameters.map((p) => ({
      ...p,
      currentValue: p.defaultValue
    }));
    setParameters(reset);
  };

  const handlePresetSelect = (preset: 'normal' | 'surge' | 'black_friday' | 'outage') => {
    let next: Record<string, number> = {};
    if (preset === 'normal') {
      next = {
        'param-traffic-surge': 1.0,
        'param-db-latency': 25,
        'param-stripe-degradation': 150,
        'param-oncall-readiness': 4
      };
    } else if (preset === 'surge') {
      next = {
        'param-traffic-surge': 2.5,
        'param-db-latency': 45,
        'param-stripe-degradation': 450,
        'param-oncall-readiness': 4
      };
    } else if (preset === 'black_friday') {
      next = {
        'param-traffic-surge': 4.0,
        'param-db-latency': 90,
        'param-stripe-degradation': 1200,
        'param-oncall-readiness': 6
      };
    } else if (preset === 'outage') {
      next = {
        'param-traffic-surge': 1.8,
        'param-db-latency': 240,
        'param-stripe-degradation': 2200,
        'param-oncall-readiness': 2
      };
    }

    const updated = parameters.map((p) => ({
      ...p,
      currentValue: next[p.id] !== undefined ? next[p.id] : p.currentValue
    }));
    setParameters(updated);
  };

  const handleExportScenario = () => {
    const data = {
      timestamp: new Date().toISOString(),
      parameters,
      results: {
        baseline: baselineResult,
        activeScenario: activeResult,
        stressTestWorstCase: worstCaseResult
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexusops_scenario_simulation_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const comparisonData = [
    {
      metric: 'MTTR (min)',
      Baseline: baselineResult.estimatedMttrMinutes,
      'Active Scenario': activeResult.estimatedMttrMinutes,
      'Worst Case': worstCaseResult.estimatedMttrMinutes
    },
    {
      metric: 'SLA Risk %',
      Baseline: baselineResult.slaBreachRiskPercent,
      'Active Scenario': activeResult.slaBreachRiskPercent,
      'Worst Case': worstCaseResult.slaBreachRiskPercent
    },
    {
      metric: 'Resilience (0-100)',
      Baseline: baselineResult.resilienceScore,
      'Active Scenario': activeResult.resilienceScore,
      'Worst Case': worstCaseResult.resilienceScore
    }
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-cyan-400" />
            Scenario Lab & What-If Stress Sandbox
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent, deterministic modeling of operational failure modes, capacity bottlenecks, and SLA breach exposure.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportScenario}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Projections</span>
          </button>

          <button
            onClick={handleResetParameters}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Preset Buttons Bar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-300">Quick Simulation Presets:</span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handlePresetSelect('normal')}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Baseline Nominal
          </button>
          <button
            onClick={() => handlePresetSelect('surge')}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
          >
            2.5x Marketing Traffic Surge
          </button>
          <button
            onClick={() => handlePresetSelect('black_friday')}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 transition-colors"
          >
            4.0x Black Friday Peak Load
          </button>
          <button
            onClick={() => handlePresetSelect('outage')}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 transition-colors"
          >
            Split-Brain DB Cross-Region Failover
          </button>
        </div>
      </div>

      {/* Main Grid: Parameters & Calculations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Interactive Parameter Sliders */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-5">
          <div className="pb-2 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Adjustable System Stress Variables
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate operational conditions and external degradation
            </p>
          </div>

          <div className="space-y-5">
            {parameters.map((param) => (
              <div key={param.id} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-200">{param.name}</label>
                  <span className="font-mono font-bold text-cyan-400 tabular-nums">
                    {param.currentValue} {param.unit}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{param.description}</p>
                <input
                  type="range"
                  min={param.minValue}
                  max={param.maxValue}
                  step={param.step}
                  value={param.currentValue}
                  onChange={(e) => handleSliderChange(param.id, parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>
                    Min: {param.minValue} {param.unit}
                  </span>
                  <span>
                    Max: {param.maxValue} {param.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Projections are computed deterministically using queuing theory (M/M/c models) and historical 90-day incident velocity baselines.
            </span>
          </div>
        </div>

        {/* Right 2 Columns: Projection Metrics & Comparison */}
        <div className="lg:col-span-2 space-y-5">
          {/* Output KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Projected MTTR</span>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-1 tabular-nums">
                {activeResult.estimatedMttrMinutes}m
              </div>
              <span className="text-[10px] text-slate-400">Baseline: {baselineResult.estimatedMttrMinutes}m</span>
            </div>

            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Est. Revenue At Risk</span>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-1 tabular-nums">
                ${activeResult.projectedRevenueAtRisk.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Per hour of disruption</span>
            </div>

            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">SLA Breach Risk</span>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
                {activeResult.slaBreachRiskPercent}%
              </div>
              <span className="text-[10px] text-slate-400">Probability of contractual breach</span>
            </div>

            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Resilience Index</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                {activeResult.resilienceScore}/100
              </div>
              <span className="text-[10px] text-slate-400">Composite headroom</span>
            </div>
          </div>

          {/* Side-by-Side Comparison Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Scenario Projections Comparison (Simulated Estimates)
                </h3>
                <p className="text-xs text-slate-400">
                  Side-by-side metric comparison against nominal baseline and worst-case stress thresholds
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="metric" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Baseline" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Active Scenario" fill="#38bdf8" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Worst Case" fill="#f43f5e" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Identified System Bottlenecks */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 text-xs">
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Identified Primary Operational Bottlenecks
            </h3>

            <div className="space-y-2">
              {activeResult.keyBottlenecks.map((b, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-200 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
