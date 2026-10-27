import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  RefreshCw,
  Server,
  Database,
  ExternalLink,
  Code,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Check,
  Terminal,
  Zap
} from 'lucide-react';
import { apiService } from '../services/api';
import { IntegrationConnector } from '../types';
import { Modal } from '../components/common/Modal';

export const Administration: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationConnector[]>(
    apiService.getIntegrations()
  );
  const [activeTab, setActiveTab] = useState<'connectors' | 'flask_pg' | 'system'>('connectors');
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; msg: string; latency: number } | null>(null);

  // Configure modal
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<IntegrationConnector | null>(null);
  const [endpointInput, setEndpointInput] = useState('');

  // Reset toast
  const [resetToast, setResetToast] = useState(false);

  const handleTestConnector = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      const res = apiService.testIntegration(id);
      setTestResult({ id, msg: res.message, latency: res.latencyMs });
      setTestingId(null);
      setTimeout(() => setTestResult(null), 4000);
    }, 450);
  };

  const handleOpenConfig = (conn: IntegrationConnector) => {
    setSelectedConnector(conn);
    setEndpointInput(conn.endpointUrl);
    setConfigModalOpen(true);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnector) return;
    setIntegrations((prev) =>
      prev.map((c) => (c.id === selectedConnector.id ? { ...c, endpointUrl: endpointInput } : c))
    );
    setConfigModalOpen(false);
  };

  const handleResetSystemData = () => {
    if (window.confirm('Reset all operational data, active incidents, and workflows back to default baseline?')) {
      apiService.resetAllData();
      setIntegrations(apiService.getIntegrations());
      setResetToast(true);
      setTimeout(() => {
        setResetToast(false);
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            Administration & Integration Architecture
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Enterprise integrations, telemetry connectors, and Flask REST & PostgreSQL architectural schemas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetSystemData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-rose-400 hover:text-rose-300 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Baseline</span>
          </button>
        </div>
      </div>

      {resetToast && (
        <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded text-xs font-mono">
          ✓ All platform state reset to default. Reloading...
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-2 text-xs">
        <button
          onClick={() => setActiveTab('connectors')}
          className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
            activeTab === 'connectors'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Integration Connectors ({integrations.length})
        </button>

        <button
          onClick={() => setActiveTab('flask_pg')}
          className={`px-4 py-2 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'flask_pg'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          Flask REST & PostgreSQL Schema Design
        </button>
      </div>

      {/* Tab 1: Connectors */}
      {activeTab === 'connectors' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((conn) => (
              <div
                key={conn.id}
                className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-4 text-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase text-cyan-400 font-bold">
                      {conn.category}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-900">
                      <CheckCircle2 className="w-2.5 h-2.5" /> CONNECTED
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{conn.name}</h3>
                  <p className="text-[11px] text-slate-400 leading-snug">{conn.description}</p>

                  <div className="pt-2 font-mono text-[10px] text-slate-500 truncate">
                    Endpoint: <span className="text-slate-300">{conn.endpointUrl}</span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-500">
                    24h Events: <span className="text-slate-300 font-bold">{conn.eventsProcessed24h.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  {testResult && testResult.id === conn.id && (
                    <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800 text-[10px] text-emerald-300 font-mono">
                      ✓ {testResult.msg}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleTestConnector(conn.id)}
                      disabled={testingId === conn.id}
                      className="py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium transition-colors text-center disabled:opacity-50"
                    >
                      {testingId === conn.id ? 'Testing...' : 'Ping Test'}
                    </button>
                    <button
                      onClick={() => handleOpenConfig(conn)}
                      className="py-1.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors text-center"
                    >
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Flask REST API & PostgreSQL Architecture Specification */}
      {activeTab === 'flask_pg' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              Flask REST API Architecture & Service Contract
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              NexusOps AI is engineered with a strict frontend/backend separation of concerns. While currently
              served via an in-memory and persisted enterprise API client (<code className="text-cyan-400 font-mono">src/services/api.ts</code>),
              all interfaces map directly to standard Flask REST endpoints with JSON payloads.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <div className="text-cyan-400 font-bold">GET /api/v1/incidents</div>
                <div className="text-slate-400 text-[11px]">Returns paginated list of operational incidents with filter queries.</div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <div className="text-cyan-400 font-bold">POST /api/v1/incidents</div>
                <div className="text-slate-400 text-[11px]">Declares new incident, triggers Kafka alert broadcast and PagerDuty.</div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <div className="text-cyan-400 font-bold">POST /api/v1/workflows/execute</div>
                <div className="text-slate-400 text-[11px]">Deterministic server-side DAG runner for automated runbook steps.</div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <div className="text-cyan-400 font-bold">POST /api/v1/ai/rca-synthesis</div>
                <div className="text-slate-400 text-[11px]">Proxies incident evidence to Gemini 2.5 with verified telemetry context.</div>
              </div>
            </div>
          </div>

          {/* PostgreSQL Schema Definition */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              PostgreSQL Relational Database Schema Specification
            </h2>
            <p className="text-xs text-slate-400">
              DDL specification designed for production PostgreSQL 16+ deployments.
            </p>

            <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
{`-- NexusOps AI PostgreSQL Core Schema
CREATE TABLE services (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    display_name VARCHAR(256) NOT NULL,
    category VARCHAR(64) NOT NULL,
    tier VARCHAR(32) NOT NULL,
    health VARCHAR(32) NOT NULL DEFAULT 'healthy',
    uptime NUMERIC(5,2) NOT NULL DEFAULT 99.99,
    latency_p99 INT NOT NULL DEFAULT 20,
    error_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    owner_team VARCHAR(128) NOT NULL,
    cluster VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incidents (
    id VARCHAR(32) PRIMARY KEY,
    title VARCHAR(512) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(8) NOT NULL CHECK (severity IN ('P1', 'P2', 'P3', 'P4')),
    status VARCHAR(32) NOT NULL DEFAULT 'investigating',
    affected_service_id VARCHAR(64) REFERENCES services(id),
    assigned_owner_id VARCHAR(64) NOT NULL,
    sla_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    sla_breached BOOLEAN DEFAULT FALSE,
    customer_impact_percent NUMERIC(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE incident_evidence (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(32) REFERENCES incidents(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL,
    title VARCHAR(512) NOT NULL,
    source VARCHAR(256) NOT NULL,
    payload TEXT NOT NULL,
    verified BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workflow_definitions (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    trigger_event VARCHAR(128) NOT NULL,
    dag_nodes JSONB NOT NULL,
    dag_edges JSONB NOT NULL,
    execution_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`}
            </pre>
          </div>
        </div>
      )}

      {/* Modal: Configure Connector */}
      {selectedConnector && (
        <Modal
          isOpen={configModalOpen}
          onClose={() => setConfigModalOpen(false)}
          title={`Configure ${selectedConnector.name}`}
          description="Update endpoint connectivity and webhook dispatch configurations."
          maxWidth="md"
        >
          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Target Endpoint / Webhook URL</label>
              <input
                type="text"
                required
                value={endpointInput}
                onChange={(e) => setEndpointInput(e.target.value)}
                className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-hidden"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfigModalOpen(false)}
                className="px-3 py-1.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
              >
                Save Settings
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
