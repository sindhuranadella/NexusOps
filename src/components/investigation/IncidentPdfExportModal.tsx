import React, { useRef } from 'react';
import {
  Printer,
  Download,
  X,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Layers,
  Terminal,
  Activity
} from 'lucide-react';
import { Incident } from '../../types';
import { AIAnalysisResult } from '../../services/aiService';

interface IncidentPdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident;
  aiAnalysis: AIAnalysisResult | null;
}

export const IncidentPdfExportModal: React.FC<IncidentPdfExportModalProps> = ({
  isOpen,
  onClose,
  incident,
  aiAnalysis
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Incident Dossier - ${incident.id} - NexusOps AI</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 32px;
      line-height: 1.5;
      font-size: 13px;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .title-box h1 {
      margin: 0 0 6px 0;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
    }
    .badge-p1 { background: #ffe4e6; color: #be123c; border-color: #fda4af; }
    .badge-p2 { background: #fef3c7; color: #b45309; border-color: #fcd34d; }
    .badge-p3 { background: #e0f2fe; color: #0369a1; border-color: #7dd3fc; }
    .badge-p4 { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
      background: #f8fafc;
      padding: 16px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      font-size: 12px;
    }
    .meta-item span {
      display: block;
      color: #64748b;
      font-size: 10px;
      text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace;
      margin-bottom: 2px;
    }
    .meta-item strong {
      font-size: 13px;
      color: #0f172a;
    }
    h2 {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin: 24px 0 12px 0;
      color: #0f172a;
      font-family: 'JetBrains Mono', monospace;
    }
    .section-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 14px;
      margin-bottom: 16px;
    }
    .timeline-item {
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .timeline-item:last-child { border-bottom: none; }
    .timeline-time {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #64748b;
    }
    pre {
      background: #0f172a;
      color: #e2e8f0;
      padding: 12px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      overflow-x: auto;
      white-space: pre-wrap;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 8px;
    }
    th, td {
      padding: 8px 10px;
      border: 1px solid #e2e8f0;
      text-align: left;
    }
    th {
      background: #f8fafc;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      text-transform: uppercase;
      color: #475569;
    }
    .footer {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      color: #64748b;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title-box">
      <div style="font-family:'JetBrains Mono',monospace; font-size:11px; color:#0284c7; font-weight:700; margin-bottom:4px;">
        NEXUSOPS AI · ENTERPRISE OPERATIONS COMMAND
      </div>
      <h1>Incident Investigation Summary Report: ${incident.id}</h1>
      <div style="font-size: 14px; font-weight: 600; color: #334155;">
        ${incident.title}
      </div>
    </div>
    <div style="text-align: right;">
      <span class="badge ${
        incident.severity === 'P1'
          ? 'badge-p1'
          : incident.severity === 'P2'
          ? 'badge-p2'
          : incident.severity === 'P3'
          ? 'badge-p3'
          : 'badge-p4'
      }">
        ${incident.severity} CRITICALITY
      </span>
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #64748b; margin-top: 4px;">
        Status: ${incident.status.toUpperCase()}
      </div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <span>Affected Service</span>
      <strong>${incident.affectedServiceName}</strong>
    </div>
    <div class="meta-item">
      <span>Assigned Incident Lead</span>
      <strong>${incident.assignedOwnerName}</strong>
    </div>
    <div class="meta-item">
      <span>Declared Timestamp</span>
      <strong>${new Date(incident.createdAt).toUTCString()}</strong>
    </div>
    <div class="meta-item">
      <span>SLA Deadline & Status</span>
      <strong style="color: ${incident.slaBreached ? '#be123c' : '#047857'};">
        ${new Date(incident.slaDeadline).toLocaleTimeString()} (${incident.slaBreached ? 'BREACHED' : 'IN COMPLIANCE'})
      </strong>
    </div>
  </div>

  <h2>1. Executive Summary & Impact Analysis</h2>
  <div class="section-box">
    <p><strong>Description:</strong> ${incident.description}</p>
    <p><strong>Impact Assessment:</strong> ${incident.impactSummary}</p>
    <div style="display:flex; gap: 24px; margin-top: 12px; font-family:'JetBrains Mono',monospace; font-size:12px;">
      <div>Customer Impact: <strong>${incident.customerImpactPercent}% of Active Traffic</strong></div>
      <div>Tags: <strong>${incident.tags.join(', ')}</strong></div>
      <div>Resolved: <strong>${incident.resolvedAt ? new Date(incident.resolvedAt).toUTCString() : 'Ongoing / Active'}</strong></div>
    </div>
  </div>

  ${
    aiAnalysis
      ? `
  <h2>2. AI Diagnostic Synthesis & Root Cause Hypotheses</h2>
  <div class="section-box">
    <p style="background:#f0fdf4; border:1px solid #bbf7d0; padding:10px; border-radius:4px; color:#14532d; font-size:12px;">
      ${aiAnalysis.executiveBrief}
    </p>

    <h3 style="font-size:12px; margin: 16px 0 6px 0; text-transform:uppercase; font-family:'JetBrains Mono',monospace;">Confirmed Facts (100% Grounded)</h3>
    <ul>
      ${aiAnalysis.confirmedFacts.map((f) => `<li><strong>${f.statement}</strong> (Source: ${f.evidenceSource})</li>`).join('')}
    </ul>

    <h3 style="font-size:12px; margin: 16px 0 6px 0; text-transform:uppercase; font-family:'JetBrains Mono',monospace;">Correlated Hypotheses</h3>
    ${aiAnalysis.hypotheses
      .map(
        (h) => `
      <div style="margin-bottom:8px; padding:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:4px;">
        <div style="display:flex; justify-content:space-between; font-weight:700;">
          <span>#${h.rank} ${h.title}</span>
          <span style="font-family:'JetBrains Mono',monospace; color:#0284c7;">${h.probabilityScore}% Match</span>
        </div>
        <p style="margin:4px 0 2px 0; font-size:12px; color:#334155;">${h.rationale}</p>
        <div style="font-size:11px; color:#64748b;">Falsification Criteria: ${h.falsificationCriteria}</div>
      </div>
    `
      )
      .join('')}
  </div>
  `
      : ''
  }

  <h2>3. Correlated Evidence Locker (${incident.evidence.length} Artifacts)</h2>
  <div class="section-box">
    ${
      incident.evidence.length === 0
        ? '<p style="color:#64748b;">No diagnostic artifacts attached yet.</p>'
        : incident.evidence
            .map(
              (ev) => `
        <div style="margin-bottom: 12px; border:1px solid #e2e8f0; border-radius:4px; padding:10px;">
          <div style="display:flex; justify-content:space-between; font-weight:700; font-size:12px; margin-bottom:4px;">
            <span>[${ev.type.toUpperCase()}] ${ev.title}</span>
            <span style="font-family:'JetBrains Mono',monospace; font-size:11px; color:#64748b;">${new Date(ev.timestamp).toLocaleTimeString()}</span>
          </div>
          <div style="font-size:11px; color:#64748b; margin-bottom:6px;">Source: ${ev.source}</div>
          <pre>${ev.payload}</pre>
        </div>
      `
            )
            .join('')
    }
  </div>

  <h2>4. Complete Chronological Event Timeline & Notes (${incident.timeline.length} Entries)</h2>
  <div class="section-box">
    ${
      incident.timeline.length === 0
        ? '<p style="color:#64748b;">No timeline events recorded.</p>'
        : incident.timeline
            .map(
              (t) => `
        <div class="timeline-item">
          <div style="display:flex; justify-content:space-between; font-weight:700;">
            <span>${t.title}</span>
            <span class="timeline-time">${new Date(t.timestamp).toLocaleTimeString()}</span>
          </div>
          <div style="font-size:11px; color:#0284c7; margin: 2px 0;">Author: ${t.author} · Type: ${t.type}</div>
          <div style="color:#334155; font-size:12px;">${t.description}</div>
        </div>
      `
            )
            .join('')
    }
  </div>

  <div class="footer">
    <div>Report Generated by NexusOps AI Operational Command Center</div>
    <div>Document Ref: DOSSIER-${incident.id}-${Date.now()}</div>
  </div>
</body>
</html>`;

    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NexusOps_Incident_Report_${incident.id}_${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs no-print"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden text-xs">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Executive Incident Summary Dossier & PDF Export
              </h3>
              <p className="text-[11px] text-slate-400">
                Official audit dossier for {incident.id} including diagnostics, notes, and activity history.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs transition-colors"
              title="Print document or save as PDF via system dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
              title="Download standalone HTML/PDF document file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report File</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Preview Area */}
        <div
          ref={reportRef}
          id="printable-incident-report"
          className="print-only-container px-6 py-6 overflow-y-auto flex-1 space-y-6 bg-slate-900 text-slate-200"
        >
          {/* Header */}
          <div className="border-b border-slate-800 pb-5 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-cyan-400 font-bold text-xs uppercase tracking-wider block">
                  NEXUSOPS AI · OFFICIAL INCIDENT DOSSIER
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                  {incident.id}: {incident.title}
                </h1>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-800 inline-block">
                  {incident.severity} CRITICALITY
                </span>
                <div className="font-mono text-[10px] text-slate-400 mt-1 uppercase">
                  Lifecycle: {incident.status}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl pt-1">
              {incident.description}
            </p>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Impacted Service</span>
              <span className="font-semibold text-slate-200">{incident.affectedServiceName}</span>
            </div>
            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Incident Commander</span>
              <span className="font-semibold text-slate-200">{incident.assignedOwnerName}</span>
            </div>
            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Declared Time</span>
              <span className="font-semibold text-slate-200">{new Date(incident.createdAt).toLocaleTimeString()} UTC</span>
            </div>
            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">SLA Compliance</span>
              <span
                className={`font-semibold ${
                  incident.slaBreached ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {incident.slaBreached ? 'BREACHED' : 'IN SLA WINDOW'}
              </span>
            </div>
          </div>

          {/* Impact and Diagnostic Assessment */}
          <section className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
            <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              1. Operational Impact & Blast Radius
            </h2>
            <div className="text-slate-300 leading-relaxed text-xs">
              {incident.impactSummary}
            </div>
            <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-4 text-[11px] font-mono text-slate-400">
              <span>Customer Traffic Affected: <strong className="text-slate-200">{incident.customerImpactPercent}%</strong></span>
              <span>·</span>
              <span>Tags: <strong className="text-slate-200">{incident.tags.join(', ')}</strong></span>
            </div>
          </section>

          {/* AI RCA Engine Section */}
          {aiAnalysis && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider border-b border-slate-800 pb-1.5">
                2. AI Root Cause Diagnostics & Hypotheses
              </h2>

              <div className="p-3.5 rounded bg-slate-950 border border-cyan-900/40 text-slate-300 text-xs leading-relaxed">
                {aiAnalysis.executiveBrief}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-bold text-emerald-400 uppercase font-mono text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Grounded Facts
                  </span>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    {aiAnalysis.confirmedFacts.map((fact) => (
                      <li key={fact.id}>
                        • <strong>{fact.statement}</strong> ({fact.evidenceSource})
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-bold text-amber-400 uppercase font-mono text-[10px] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Hypotheses Ranked
                  </span>
                  <div className="space-y-2 text-[11px]">
                    {aiAnalysis.hypotheses.map((hyp) => (
                      <div key={hyp.id} className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="flex justify-between font-semibold text-slate-200">
                          <span>#{hyp.rank} {hyp.title}</span>
                          <span className="text-cyan-400 font-mono">{hyp.probabilityScore}%</span>
                        </div>
                        <p className="text-slate-400 text-[10px] mt-0.5">{hyp.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Correlated Evidence Section */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider border-b border-slate-800 pb-1.5">
              3. Diagnostic Evidence Artifacts ({incident.evidence.length})
            </h2>

            {incident.evidence.length === 0 ? (
              <p className="text-slate-500 text-xs">No evidence artifacts attached.</p>
            ) : (
              <div className="space-y-2">
                {incident.evidence.map((ev) => (
                  <div key={ev.id} className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">
                        [{ev.type.toUpperCase()}] {ev.title}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">Source: {ev.source}</div>
                    <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap overflow-x-auto">
                      {ev.payload}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Chronological Event Timeline & Notes */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider border-b border-slate-800 pb-1.5">
              4. Chronological Event Timeline & Notes ({incident.timeline.length})
            </h2>

            <div className="divide-y divide-slate-800 rounded bg-slate-950 border border-slate-800">
              {incident.timeline.map((event) => (
                <div key={event.id} className="p-3 space-y-0.5">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="font-semibold text-slate-200">{event.title}</span>
                    <span className="text-slate-400">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400">
                    Author: {event.author} · Action: {event.type}
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed pt-0.5">
                    {event.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Footer Notice */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between font-mono text-[10px] text-slate-500">
            <span>NexusOps AI Automated Audit System · Confidential</span>
            <span>Generated: {new Date().toUTCString()}</span>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between no-print">
          <span className="text-[11px] text-slate-400 font-mono">
            Ready for PDF printer or archival download
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
