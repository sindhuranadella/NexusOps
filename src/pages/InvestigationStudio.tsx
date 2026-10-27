import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle2,
  FileText,
  Activity,
  Layers,
  ShieldAlert,
  GitCommit,
  Terminal,
  Play,
  Plus,
  ArrowRight,
  Database,
  Send,
  AlertCircle,
  FileDown,
  Printer,
  Mail,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { apiService } from '../services/api';
import { aiService, AIAnalysisResult } from '../services/aiService';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { IncidentStatusBadge } from '../components/common/StatusBadge';
import { Incident, IncidentStatus, IncidentSeverity } from '../types';
import { Modal } from '../components/common/Modal';
import { IncidentPdfExportModal } from '../components/investigation/IncidentPdfExportModal';

export const InvestigationStudio: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const allIncidents = apiService.getIncidents();
  // Default to param ID or INC-8921 or first incident
  const currentIncidentId = id || 'INC-8921';
  const [incident, setIncident] = useState<Incident | undefined>(
    apiService.getIncidentById(currentIncidentId) || allIncidents[0]
  );

  const [activeTab, setActiveTab] = useState<'ai_rca' | 'telemetry' | 'evidence' | 'timeline'>('ai_rca');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Status transition dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<IncidentStatus>('identified');
  const [transitionNote, setTransitionNote] = useState('');

  // PDF Export modal state
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [emailCopiedToast, setEmailCopiedToast] = useState(false);

  // Add evidence dialog
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceSource, setEvidenceSource] = useState('Datadog APM');
  const [evidenceType, setEvidenceType] = useState<any>('log_snippet');
  const [evidencePayload, setEvidencePayload] = useState('');

  // Add note
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDescription, setNoteDescription] = useState('');

  useEffect(() => {
    if (id) {
      const found = apiService.getIncidentById(id);
      if (found) {
        setIncident(found);
      }
    }
  }, [id]);

  useEffect(() => {
    if (incident) {
      setLoadingAi(true);
      aiService.analyzeIncident(incident).then((res) => {
        setAiAnalysis(res);
        setLoadingAi(false);
      });
    }
  }, [incident?.id]);

  if (!incident) {
    return (
      <div className="p-8 text-center text-slate-400">
        Incident not found.{' '}
        <Link to="/incidents" className="text-cyan-400 hover:underline">
          Return to Incident Registry
        </Link>
      </div>
    );
  }

  // Calculate remaining time to SLA
  const deadlineTime = new Date(incident.slaDeadline).getTime();
  const now = Date.now();
  const minutesRemaining = Math.max(0, Math.floor((deadlineTime - now) / 60000));

  const handleStatusTransition = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = apiService.updateIncidentStatus(
      incident.id,
      nextStatus,
      'Marcus Vance',
      transitionNote || `Status changed to ${nextStatus}`
    );
    setIncident(updated);
    setStatusDialogOpen(false);
    setTransitionNote('');
  };

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceTitle || !evidencePayload) return;
    const updated = apiService.addIncidentEvidence(incident.id, {
      title: evidenceTitle,
      source: evidenceSource,
      type: evidenceType,
      payload: evidencePayload
    });
    setIncident(updated);
    setEvidenceDialogOpen(false);
    setEvidenceTitle('');
    setEvidencePayload('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    const updated = apiService.addTimelineNote(
      incident.id,
      'Marcus Vance (Commander)',
      noteTitle,
      noteDescription
    );
    setIncident(updated);
    setNoteTitle('');
    setNoteDescription('');
  };

  const handleExecuteMitigation = (stepAction: string) => {
    const updated = apiService.addTimelineNote(
      incident.id,
      'Automated Workflow Engine',
      `Mitigation Dispatched: ${stepAction}`,
      'Dry-run execution completed with return status code 0 via Flask REST API.'
    );
    setIncident(updated);
    alert(`Dispatched mitigation step: "${stepAction}". Step logged to event timeline.`);
  };

  const handleShareViaEmail = () => {
    const currentUrl = window.location.href;
    const subject = `[${incident.severity} Alert] ${incident.id}: ${incident.title}`;
    const body = `NEXUSOPS AI INCIDENT INVESTIGATION SUMMARY
===================================================
Incident ID: ${incident.id}
Title: ${incident.title}
Criticality: ${incident.severity}
Status: ${incident.status.toUpperCase()}
Impacted Service: ${incident.affectedServiceName}
Assigned Lead: ${incident.assignedOwnerName}
Declared At: ${new Date(incident.createdAt).toUTCString()}
SLA Window: ${new Date(incident.slaDeadline).toUTCString()} (${incident.slaBreached ? 'BREACHED' : 'IN COMPLIANCE'})

DIAGNOSTIC SUMMARY:
${incident.description}

OPERATIONAL & CUSTOMER IMPACT:
${incident.impactSummary}
Customer Traffic Affected: ${incident.customerImpactPercent}%
Tags: ${incident.tags.join(', ')}

INVESTIGATION NOTES & RECENT ACTIVITY:
${incident.timeline.slice(0, 4).map((t) => `• [${new Date(t.timestamp).toLocaleTimeString()}] ${t.title} (${t.author}): ${t.description}`).join('\n')}

DIRECT INVESTIGATION WORKSPACE LINK:
${currentUrl}

---
Dispatched via NexusOps AI Enterprise Operations Command`;

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setEmailCopiedToast(true);
      setTimeout(() => setEmailCopiedToast(false), 3500);
    }
  };

  // Sample telemetry data for charts
  const telemetryData = [
    { time: '08:50', latency: 85, poolUsed: 120, errorPct: 0.02 },
    { time: '09:00', latency: 90, poolUsed: 135, errorPct: 0.04 },
    { time: '09:04', latency: 95, poolUsed: 160, errorPct: 0.05 }, // Canary deploy
    { time: '09:08', latency: 420, poolUsed: 380, errorPct: 1.10 },
    { time: '09:12', latency: 1420, poolUsed: 500, errorPct: 4.86 }, // Alert fired
    { time: '09:20', latency: 1390, poolUsed: 498, errorPct: 4.70 },
    { time: '09:40', latency: 920, poolUsed: 410, errorPct: 2.30 },
    { time: '10:00', latency: 740, poolUsed: 340, errorPct: 1.80 }
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Incident Switcher Bar */}
      <div className="flex items-center justify-between gap-3 p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono">INVESTIGATING:</span>
          <select
            value={incident.id}
            onChange={(e) => navigate(`/incidents/${e.target.value}`)}
            className="bg-slate-950 border border-slate-800 text-cyan-400 font-mono font-semibold px-2 py-1 rounded focus:outline-hidden"
          >
            {allIncidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                {inc.id} — {inc.title} ({inc.severity})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/incidents"
            className="text-slate-400 hover:text-slate-200 transition-colors text-[11px]"
          >
            Back to Registry →
          </Link>
        </div>
      </div>

      {/* Incident Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <SeverityBadge severity={incident.severity} />
              <span className="font-mono text-cyan-400 text-sm font-bold">{incident.id}</span>
              <span className="text-slate-600">·</span>
              <IncidentStatusBadge status={incident.status} />
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-300 font-medium">Service: {incident.affectedServiceName}</span>
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {incident.title}
            </h1>

            <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
              {incident.description}
            </p>

            {/* Metadata row without pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400 font-mono">
              <span>Owner: <strong className="text-slate-200">{incident.assignedOwnerName}</strong></span>
              <span>·</span>
              <span>Logged: <strong className="text-slate-200">{new Date(incident.createdAt).toUTCString()}</strong></span>
              <span>·</span>
              <span>Impact: <strong className="text-slate-200">{incident.customerImpactPercent}% Sessions</strong></span>
            </div>
          </div>

          {/* Quick Actions & SLA Meter */}
          <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-md text-right">
              <div className="text-[10px] font-mono uppercase text-slate-400">SLA Breach Window</div>
              <div
                className={`text-lg font-bold font-mono tabular-nums ${
                  incident.slaBreached
                    ? 'text-rose-400'
                    : minutesRemaining < 60
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {incident.slaBreached
                  ? 'BREACHED'
                  : incident.status === 'resolved'
                  ? 'RESOLVED IN TIME'
                  : `${minutesRemaining}m Remaining`}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Deadline: {new Date(incident.slaDeadline).toLocaleTimeString()}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setPdfModalOpen(true)}
                className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                title="Export complete incident summary report, notes, and activity history to PDF"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export PDF Summary</span>
              </button>

              <button
                onClick={handleShareViaEmail}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-slate-600 shadow-xs transition-colors flex items-center gap-1.5"
                title="Open email draft pre-filled with incident summary and direct workspace link"
              >
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Share via Email</span>
              </button>

              <button
                onClick={() => setStatusDialogOpen(true)}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Update Status
              </button>

              <button
                onClick={() => navigate(`/reports?incidentId=${incident.id}`)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                Draft PIR Review
              </button>

              {emailCopiedToast && (
                <div className="w-full text-right text-[10px] text-emerald-400 font-mono flex items-center justify-end gap-1">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Email client opened & summary copied to clipboard!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('ai_rca')}
          className={`px-4 py-2.5 font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'ai_rca'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Root Cause & Hypotheses
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2.5 font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'telemetry'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Correlated Telemetry & Anomalies
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`px-4 py-2.5 font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'evidence'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Evidence Locker ({incident.evidence.length})
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2.5 font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Timeline & Event Log ({incident.timeline.length})
        </button>
      </div>

      {/* Tab 1: AI Root Cause Analysis */}
      {activeTab === 'ai_rca' && (
        <div className="space-y-5">
          {loadingAi ? (
            <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-lg">
              <Sparkles className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
              Synthesizing evidence-grounded hypotheses...
            </div>
          ) : aiAnalysis ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left 2 Cols: Facts vs Hypotheses & Mitigations */}
              <div className="lg:col-span-2 space-y-5">
                {/* Executive Synthesis */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Executive Diagnostics Synthesis
                    </h2>
                    <span className="text-[10px] font-mono text-slate-500">
                      Grounded by {incident.evidence.length} evidence artifacts
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded border border-slate-800/80">
                    {aiAnalysis.executiveBrief}
                  </p>
                </div>

                {/* Confirmed Facts vs Hypotheses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Confirmed Facts */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Confirmed Facts
                      </h3>
                      <span className="text-[10px] font-mono text-emerald-400">100% Verified</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {aiAnalysis.confirmedFacts.map((fact) => (
                        <div key={fact.id} className="p-2.5 rounded bg-slate-950 border border-slate-800">
                          <p className="text-slate-200 leading-relaxed">{fact.statement}</p>
                          <div className="mt-1 text-[10px] font-mono text-slate-500">
                            Source: {fact.evidenceSource}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hypotheses Ranked */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        Correlated Hypotheses
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">Ranked by Confidence</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {aiAnalysis.hypotheses.map((hyp) => (
                        <div key={hyp.id} className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">
                              #{hyp.rank} {hyp.title}
                            </span>
                            <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                              {hyp.probabilityScore}% match
                            </span>
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed">{hyp.rationale}</p>
                          <div className="pt-1 text-[10px] text-slate-500">
                            <strong>Falsification:</strong> {hyp.falsificationCriteria}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommended Mitigation Runbook Actions */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-cyan-400" />
                        Recommended Mitigation Runbook Steps
                      </h3>
                      <p className="text-xs text-slate-400">
                        Operational interventions generated from verified root causes
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    {aiAnalysis.mitigationSteps.map((step) => (
                      <div
                        key={step.step}
                        className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-[11px] font-mono font-bold flex items-center justify-center">
                              {step.step}
                            </span>
                            <span className="font-semibold text-slate-200">{step.action}</span>
                            <span className="text-[10px] font-mono text-slate-400">Risk: {step.riskLevel}</span>
                          </div>
                          <div className="font-mono text-[11px] text-cyan-300 bg-slate-900 px-2 py-1 rounded border border-slate-800 truncate max-w-xl">
                            {step.commandOrWorkflow}
                          </div>
                          <div className="text-[11px] text-slate-400">{step.expectedImpact}</div>
                        </div>

                        <button
                          onClick={() => handleExecuteMitigation(step.action)}
                          className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold border border-slate-700 hover:border-cyan-500/50 flex items-center gap-1.5 shrink-0 transition-colors"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Simulate Action</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Col: Blast Radius Assessment */}
              <div className="space-y-5">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4 text-xs">
                  <div className="pb-2 border-b border-slate-800">
                    <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-rose-400" />
                      Blast Radius Assessment
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Upstream dependencies and consumer vulnerability
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-rose-400 font-semibold">
                      Directly Affected
                    </span>
                    <ul className="mt-1 space-y-1 text-slate-200">
                      {aiAnalysis.blastRadiusAssessment.directlyAffected.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold">
                      Upstream At Risk
                    </span>
                    <ul className="mt-1 space-y-1 text-slate-300">
                      {aiAnalysis.blastRadiusAssessment.upstreamAtRisk.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-sky-400 font-semibold">
                      Downstream Exposed
                    </span>
                    <ul className="mt-1 space-y-1 text-slate-300">
                      {aiAnalysis.blastRadiusAssessment.downstreamExposed.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded bg-slate-950 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Estimated Impact</div>
                    <div className="text-slate-200 font-medium mt-0.5">
                      {aiAnalysis.blastRadiusAssessment.estimatedCustomerImpact}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/topology')}
                    className="w-full py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-center font-medium transition-colors block"
                  >
                    View in Dependency Map →
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Tab 2: Telemetry & Anomaly Graphs */}
      {activeTab === 'telemetry' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-sm font-semibold text-slate-100">
                  P99 Request Latency & Connection Pool Depletion
                </h2>
                <p className="text-xs text-slate-400">
                  Telemetry timeline aligned to canary rollout at 09:04 UTC
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-rose-400">● Latency (ms)</span>
                <span className="text-amber-400">● PgBouncer Connections</span>
              </div>
            </div>

            <div className="h-72 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetryData}>
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
                  <Line
                    type="monotone"
                    dataKey="latency"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="poolUsed"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 p-3 bg-slate-950 rounded border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Noticeable jump from 95ms to 1,420ms immediately following v2.41.4 release.</span>
              <span className="font-mono text-cyan-400">Max connections reached: 500/500</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Evidence Locker */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Diagnostic artifacts, raw log traces, and deployment commits collected for this incident.
            </p>
            <button
              onClick={() => setEvidenceDialogOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Attach Evidence</span>
            </button>
          </div>

          <div className="space-y-3">
            {incident.evidence.map((ev) => (
              <div key={ev.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-cyan-400 font-semibold">{ev.type.toUpperCase()}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs font-semibold text-slate-200">{ev.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">Source: {ev.source}</div>

                <pre className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {ev.payload}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Timeline & Runbook Notes */}
      {activeTab === 'timeline' && (
        <div className="space-y-5">
          {/* Add note card */}
          <form onSubmit={handleAddNote} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 text-xs">
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              Add Investigation Note / Commander Directive
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <input
                  type="text"
                  required
                  placeholder="Note Headline (e.g. Rolled back canary)"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-hidden focus:border-cyan-500"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Additional context or verification command..."
                  value={noteDescription}
                  onChange={(e) => setNoteDescription(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>
            <div className="text-right">
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
              >
                Log to Event Timeline
              </button>
            </div>
          </form>

          {/* Timeline List */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {incident.timeline.map((event) => (
                <div key={event.id} className="relative group text-xs">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-slate-900" />
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 text-[11px]">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="font-medium text-slate-300">{event.author}</span>
                  </div>
                  <div className="font-semibold text-slate-100 mt-0.5">{event.title}</div>
                  <div className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                    {event.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Status Transition */}
      <Modal
        isOpen={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        title={`Update Status: ${incident.id}`}
        description="Transition incident lifecycle state and record mandatory audit reason."
        maxWidth="md"
      >
        <form onSubmit={handleStatusTransition} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Target Status</label>
            <select
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value as IncidentStatus)}
              className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden focus:border-cyan-500 text-xs"
            >
              <option value="investigating">Investigating (Gathering diagnostics)</option>
              <option value="identified">Identified (Root cause isolated)</option>
              <option value="mitigating">Mitigating (Fix/remediation in progress)</option>
              <option value="monitoring">Monitoring (Fix deployed, observing SLO)</option>
              <option value="resolved">Resolved (Incident closed, nominal)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Transition Reason / Audit Note <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={transitionNote}
              onChange={(e) => setTransitionNote(e.target.value)}
              placeholder="e.g. Verified Canary rollback completed, p99 latency returned under 100ms."
              className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden focus:border-cyan-500 text-xs resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setStatusDialogOpen(false)}
              className="px-3 py-1.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold"
            >
              Confirm Transition
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Evidence */}
      <Modal
        isOpen={evidenceDialogOpen}
        onClose={() => setEvidenceDialogOpen(false)}
        title="Attach Diagnostic Evidence"
        description="Correlate logs, metric anomalies, or deployment SHAs to this incident."
        maxWidth="lg"
      >
        <form onSubmit={handleAddEvidence} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Evidence Title</label>
            <input
              type="text"
              required
              placeholder="e.g. PgBouncer thread starvation error"
              value={evidenceTitle}
              onChange={(e) => setEvidenceTitle(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Source System</label>
              <input
                type="text"
                value={evidenceSource}
                onChange={(e) => setEvidenceSource(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Artifact Type</label>
              <select
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden text-xs"
              >
                <option value="log_snippet">Log Snippet</option>
                <option value="metric_anomaly">Metric Anomaly</option>
                <option value="deployment_diff">Deployment Diff</option>
                <option value="alert_payload">Alert Payload</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Raw Payload / Stack Trace</label>
            <textarea
              required
              rows={4}
              value={evidencePayload}
              onChange={(e) => setEvidencePayload(e.target.value)}
              placeholder="Paste raw log lines, error messages, or JSON payload..."
              className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden text-xs font-mono resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEvidenceDialogOpen(false)}
              className="px-3 py-1.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
            >
              Attach Artifact
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: PDF Export & Printable Dossier */}
      <IncidentPdfExportModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        incident={incident}
        aiAnalysis={aiAnalysis}
      />
    </div>
  );
};
