import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Download,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  MoreVertical,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { apiService } from '../services/api';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { IncidentStatusBadge } from '../components/common/StatusBadge';
import { Incident, IncidentSeverity, IncidentStatus } from '../types';

export const Incidents: React.FC = () => {
  const navigate = useNavigate();
  const { onOpenNewIncident } = useOutletContext<{ onOpenNewIncident: () => void }>();

  const [incidents, setIncidents] = useState<Incident[]>(apiService.getIncidents());
  const [activeTab, setActiveTab] = useState<'all' | 'p1' | 'p2' | 'in_progress' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const services = apiService.getServices();

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredIncidents.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleBulkAcknowledge = () => {
    selectedIds.forEach((id) => {
      const inc = incidents.find((i) => i.id === id);
      if (inc && inc.status === 'investigating') {
        apiService.updateIncidentStatus(id, 'identified', 'Marcus Vance', 'Bulk acknowledged from incident table.');
      }
    });
    setIncidents(apiService.getIncidents());
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Severity', 'Title', 'Service', 'Status', 'Owner', 'CreatedAt', 'SLABreached'];
    const rows = filteredIncidents.map((i) => [
      i.id,
      i.severity,
      `"${i.title.replace(/"/g, '""')}"`,
      i.affectedServiceName,
      i.status,
      i.assignedOwnerName,
      i.createdAt,
      i.slaBreached ? 'Yes' : 'No'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexusops_incidents_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logic
  const filteredIncidents = incidents.filter((inc) => {
    if (activeTab === 'p1' && inc.severity !== 'P1') return false;
    if (activeTab === 'p2' && inc.severity !== 'P2') return false;
    if (activeTab === 'in_progress' && inc.status === 'resolved') return false;
    if (activeTab === 'resolved' && inc.status !== 'resolved') return false;

    if (serviceFilter !== 'all' && inc.affectedServiceId !== serviceFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = inc.id.toLowerCase().includes(q);
      const matchTitle = inc.title.toLowerCase().includes(q);
      const matchService = inc.affectedServiceName.toLowerCase().includes(q);
      const matchOwner = inc.assignedOwnerName.toLowerCase().includes(q);
      const matchTags = inc.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchId && !matchTitle && !matchService && !matchOwner && !matchTags) return false;
    }
    return true;
  });

  const p1Count = incidents.filter((i) => i.severity === 'P1' && i.status !== 'resolved').length;
  const p2Count = incidents.filter((i) => i.severity === 'P2' && i.status !== 'resolved').length;
  const inProgressCount = incidents.filter((i) => i.status !== 'resolved').length;
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Incident Management Console
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational triage registry, SLA compliance tracking, and incident escalation dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenNewIncident}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Declare Incident</span>
          </button>
        </div>
      </div>

      {/* Tabs and Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800/80 rounded-md overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Incidents ({incidents.length})
            </button>
            <button
              onClick={() => setActiveTab('p1')}
              className={`px-3 py-1 rounded font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'p1'
                  ? 'bg-rose-950 text-rose-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              P1 Critical ({p1Count})
            </button>
            <button
              onClick={() => setActiveTab('p2')}
              className={`px-3 py-1 rounded font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'p2'
                  ? 'bg-amber-950 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              P2 Major ({p2Count})
            </button>
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`px-3 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                activeTab === 'in_progress'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`px-3 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                activeTab === 'resolved'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Resolved ({resolvedCount})
            </button>
          </div>

          {/* Search & Service Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by ID, service, tag..."
                className="w-full pl-8 pr-3 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-hidden focus:border-cyan-500"
            >
              <option value="all">All Services</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Action Bar (when rows are selected) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-300 font-medium">
              <strong className="text-cyan-400 font-mono">{selectedIds.length}</strong> incidents selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkAcknowledge}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
              >
                Bulk Acknowledge
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-2 py-1 text-slate-400 hover:text-slate-200 text-xs"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Incident Registry Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase bg-slate-950/60">
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      filteredIncidents.length > 0 && selectedIds.length === filteredIncidents.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                </th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3 font-mono">Incident ID</th>
                <th className="py-2.5 px-3">Title & Diagnostic Summary</th>
                <th className="py-2.5 px-3">Affected Service</th>
                <th className="py-2.5 px-3">Assigned Lead</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 font-mono">SLA Deadline</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No incidents match your selected filters.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      selectedIds.includes(inc.id) ? 'bg-slate-800/30' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(inc.id)}
                        onChange={() => handleToggleSelect(inc.id)}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <SeverityBadge severity={inc.severity} />
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                      <button
                        onClick={() => navigate(`/incidents/${inc.id}`)}
                        className="hover:underline"
                      >
                        {inc.id}
                      </button>
                    </td>
                    <td className="py-3 px-3 max-w-md">
                      <div className="font-semibold text-slate-100 truncate">{inc.title}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{inc.description}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {inc.tags.map((t) => (
                          <span key={t} className="text-[10px] text-slate-500 font-mono">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-300">{inc.affectedServiceName}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{inc.assignedOwnerName}</td>
                    <td className="py-3 px-3">
                      <IncidentStatusBadge status={inc.status} />
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span
                        className={`text-[11px] ${
                          inc.slaBreached
                            ? 'text-rose-400 font-semibold'
                            : inc.status === 'resolved'
                            ? 'text-slate-500'
                            : 'text-amber-400'
                        }`}
                      >
                        {new Date(inc.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {inc.slaBreached && ' (BREACHED)'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/incidents/${inc.id}`)}
                        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        Workspace <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Showing {filteredIncidents.length} of {incidents.length} registered operational incidents</span>
          <span className="font-mono text-[11px]">NexusOps Incident Engine · PostgreSQL Schema v1</span>
        </div>
      </div>
    </div>
  );
};
