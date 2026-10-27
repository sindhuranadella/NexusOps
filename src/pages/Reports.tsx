import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Sparkles
} from 'lucide-react';
import { apiService } from '../services/api';
import { PostIncidentReview, Incident } from '../types';
import { Modal } from '../components/common/Modal';

export const Reports: React.FC = () => {
  const [searchParams] = useSearchParams();
  const pirParam = searchParams.get('pir');
  const incidentParam = searchParams.get('incidentId');

  const [pirs, setPirs] = useState<PostIncidentReview[]>(apiService.getPIRs());
  const [selectedPirId, setSelectedPirId] = useState<string>(
    pirParam || pirs[0]?.id || ''
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form states for creating new PIR
  const incidents = apiService.getIncidents();
  const [selectedIncidentId, setSelectedIncidentId] = useState(incidentParam || incidents[0]?.id || '');
  const [leadAuthor, setLeadAuthor] = useState('Elena Rostova');
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [downtimeMinutes, setDowntimeMinutes] = useState(0);

  useEffect(() => {
    if (pirParam) {
      setSelectedPirId(pirParam);
    }
  }, [pirParam]);

  useEffect(() => {
    if (incidentParam) {
      setSelectedIncidentId(incidentParam);
      setCreateModalOpen(true);
    }
  }, [incidentParam]);

  const activePir = pirs.find((p) => p.id === selectedPirId) || pirs[0];

  const handleExportMarkdown = () => {
    if (!activePir) return;
    const md = `# ${activePir.id}: ${activePir.incidentTitle}
**Date:** ${activePir.date} | **Lead Author:** ${activePir.leadAuthor} | **Impact:** ${activePir.impactScore}

## Executive Summary
${activePir.executiveSummary}

## Incident Duration & Downtime
- **Total Duration:** ${activePir.durationMinutes} minutes
- **Customer Downtime:** ${activePir.downtimeMinutes} minutes

## Root Cause (5 Whys Analysis)
${activePir.fiveWhys.map((why, i) => `${i + 1}. ${why}`).join('\n')}

## Post-Incident Assessment
### What Went Well
${activePir.whatWentWell.map((w) => `- ${w}`).join('\n')}

### What Went Wrong
${activePir.whatWentWrong.map((w) => `- ${w}`).join('\n')}

### Where We Got Lucky
${activePir.whereWeGotLucky.map((w) => `- ${w}`).join('\n')}

## Preventative Action Items
${activePir.actionItems.map((a) => `- [${a.status}] (${a.priority}) ${a.description} - Owner: ${a.owner} (Due: ${a.dueDate})`).join('\n')}
`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activePir.id}_postmortem.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCreatePirSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inc = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];
    const created = apiService.createPIR({
      incidentId: inc.id,
      incidentTitle: inc.title,
      leadAuthor,
      executiveSummary:
        executiveSummary.trim() ||
        `On ${new Date().toLocaleDateString()}, service ${inc.affectedServiceName} experienced a ${inc.severity} degradation. Cause isolated to ${inc.rootCauseSummary || 'telemetry anomaly'}.`,
      durationMinutes: 120,
      downtimeMinutes: downtimeMinutes || 15,
      impactScore: inc.severity === 'P1' ? 'Critical' : 'Moderate',
      timeline: [
        { time: '09:04 UTC', event: 'Canary rollout v2.41.4 dispatched' },
        { time: '09:12 UTC', event: 'Alert fired: SLO Latency P99 Breached' },
        { time: '09:15 UTC', event: 'Incident declared P1; War room mobilized' }
      ],
      fiveWhys: [
        'Why did checkout fail? Captures timed out.',
        'Why did captures time out? Postgres row lock contention.',
        'Why was lock contention high? Missing idempotency key index in v2.41.4 migration.'
      ],
      whatWentWell: [
        'Automated triage workflow halted subsequent rollout instantly.',
        'Incident Commander established war room within 3 minutes.'
      ],
      whatWentWrong: [
        'Staging synthetic test suite lacked high-concurrency simulation.'
      ],
      whereWeGotLucky: [
        'Failure occurred after early-morning European peak load.'
      ],
      actionItems: [
        {
          id: `act-${Date.now()}`,
          description: 'Enforce index presence check on regulatory query migrations',
          owner: 'Marcus Vance',
          priority: 'P1',
          status: 'In Progress',
          dueDate: '2026-11-04'
        }
      ]
    });

    setPirs(apiService.getPIRs());
    setSelectedPirId(created.id);
    setCreateModalOpen(false);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Post-Incident Reviews & Operations Reports
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Blameless postmortems, 5-whys root cause analysis, and preventative engineering action tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* PIR Switcher */}
          <select
            value={selectedPirId}
            onChange={(e) => setSelectedPirId(e.target.value)}
            className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-semibold text-cyan-400 focus:outline-hidden"
          >
            {pirs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id}: {p.incidentTitle.slice(0, 35)}...
              </option>
            ))}
          </select>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Draft PIR</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Markdown</span>
          </button>
        </div>
      </div>

      {/* Main Document Body */}
      {activePir ? (
        <article className="bg-slate-900 border border-slate-800 rounded-lg p-6 sm:p-8 space-y-6 text-xs max-w-4xl mx-auto shadow-2xl">
          {/* PIR Document Header */}
          <div className="border-b border-slate-800 pb-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-cyan-400 font-bold text-sm tracking-wider">
                {activePir.id} · POST-INCIDENT REVIEW
              </span>
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded font-semibold ${
                  activePir.impactScore === 'Critical'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {activePir.impactScore.toUpperCase()} IMPACT
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {activePir.incidentTitle}
            </h1>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-slate-400 font-mono text-[11px]">
              <span>Date: <strong className="text-slate-200">{activePir.date}</strong></span>
              <span>·</span>
              <span>Lead Author: <strong className="text-slate-200">{activePir.leadAuthor}</strong></span>
              <span>·</span>
              <span>Incident Ref: <strong className="text-cyan-400">{activePir.incidentId}</strong></span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Total Duration</span>
              <span className="text-base font-bold text-slate-200">{activePir.durationMinutes} mins</span>
            </div>
            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Customer Downtime</span>
              <span className="text-base font-bold text-slate-200">{activePir.downtimeMinutes} mins</span>
            </div>
            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Action Items</span>
              <span className="text-base font-bold text-cyan-400">{activePir.actionItems.length} Total</span>
            </div>
            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Status</span>
              <span className="text-base font-bold text-emerald-400">Published</span>
            </div>
          </div>

          {/* Executive Summary */}
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              1. Executive Summary
            </h2>
            <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300 leading-relaxed text-xs sm:text-sm">
              {activePir.executiveSummary}
            </div>
          </section>

          {/* Root Cause: 5 Whys */}
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              2. Root Cause Analysis (5 Whys Framework)
            </h2>
            <div className="space-y-2">
              {activePir.fiveWhys.map((why, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded bg-slate-950 border border-slate-800 text-slate-200 flex items-start gap-3"
                >
                  <span className="font-mono text-cyan-400 font-bold shrink-0">{idx + 1}.</span>
                  <span className="leading-relaxed">{why}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Blameless Assessment: Well / Wrong / Lucky */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              3. Operational Lessons & Blameless Reflection
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded bg-slate-950 border border-emerald-900/40 space-y-2">
                <span className="font-bold text-emerald-400 uppercase font-mono text-[10px] block">
                  What Went Well
                </span>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  {activePir.whatWentWell.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded bg-slate-950 border border-rose-900/40 space-y-2">
                <span className="font-bold text-rose-400 uppercase font-mono text-[10px] block">
                  What Went Wrong
                </span>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  {activePir.whatWentWrong.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded bg-slate-950 border border-amber-900/40 space-y-2">
                <span className="font-bold text-amber-400 uppercase font-mono text-[10px] block">
                  Where We Got Lucky
                </span>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  {activePir.whereWeGotLucky.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Action Items Table */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                4. Corrective Action Items
              </h2>
              <span className="text-slate-500 font-mono text-[10px]">Tracked in Jira/Engineering</span>
            </div>

            <div className="overflow-x-auto rounded border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                    <th className="p-2.5">Priority</th>
                    <th className="p-2.5">Remediation Action Item</th>
                    <th className="p-2.5">Assignee</th>
                    <th className="p-2.5 font-mono">Target Due</th>
                    <th className="p-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {activePir.actionItems.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-mono font-semibold text-rose-400">{act.priority}</td>
                      <td className="p-2.5 text-slate-200">{act.description}</td>
                      <td className="p-2.5 text-slate-400">{act.owner}</td>
                      <td className="p-2.5 font-mono text-slate-300">{act.dueDate}</td>
                      <td className="p-2.5 text-right font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            act.status === 'Completed'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                              : 'bg-amber-950 text-amber-300 border border-amber-900'
                          }`}
                        >
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </article>
      ) : null}

      {/* Draft New PIR Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Draft Post-Incident Review (PIR)"
        description="Initialize a blameless postmortem document linked to an incident."
        maxWidth="lg"
      >
        <form onSubmit={handleCreatePirSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Source Incident</label>
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden text-xs"
            >
              {incidents.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.id} — {i.title} ({i.severity})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Lead Author</label>
              <input
                type="text"
                required
                value={leadAuthor}
                onChange={(e) => setLeadAuthor(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Customer Downtime (mins)</label>
              <input
                type="number"
                value={downtimeMinutes}
                onChange={(e) => setDowntimeMinutes(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Executive Summary</label>
            <textarea
              rows={4}
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              placeholder="High-level narrative explaining what happened, customer impact, and resolution..."
              className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden text-xs resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-3 py-1.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
            >
              Publish Post-Incident Review
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
