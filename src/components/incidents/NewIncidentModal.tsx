import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { apiService } from '../../services/api';
import { IncidentSeverity, Incident } from '../../types';

interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (incident: Incident) => void;
}

export const NewIncidentModal: React.FC<NewIncidentModalProps> = ({ isOpen, onClose, onCreated }) => {
  const services = apiService.getServices();
  const users = apiService.getUsers();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IncidentSeverity>('P2');
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [ownerId, setOwnerId] = useState(users[0]?.id || '');
  const [impactSummary, setImpactSummary] = useState('');
  const [customerImpactPercent, setCustomerImpactPercent] = useState('1.0');
  const [tagsInput, setTagsInput] = useState('Production, High-Priority');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Incident title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Incident description is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const selectedService = services.find((s) => s.id === serviceId) || services[0];
    const selectedOwner = users.find((u) => u.id === ownerId) || users[0];

    // Calculate SLA deadline based on severity
    const hoursToDeadline = severity === 'P1' ? 2 : severity === 'P2' ? 4 : severity === 'P3' ? 8 : 24;
    const slaDeadline = new Date(Date.now() + hoursToDeadline * 60 * 60 * 1000).toISOString();

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const created = apiService.createIncident({
        title: title.trim(),
        description: description.trim(),
        severity,
        status: 'investigating',
        affectedServiceId: selectedService.id,
        affectedServiceName: selectedService.displayName,
        assignedOwnerId: selectedOwner.id,
        assignedOwnerName: selectedOwner.name,
        slaDeadline,
        impactSummary: impactSummary.trim() || 'Investigation initiated by operations lead.',
        customerImpactPercent: parseFloat(customerImpactPercent) || 0.5,
        tags: tags.length ? tags : ['General']
      });

      // Update service health if P1 or P2
      if (severity === 'P1') {
        apiService.updateServiceHealth(selectedService.id, 'critical');
      } else if (severity === 'P2' && selectedService.health === 'healthy') {
        apiService.updateServiceHealth(selectedService.id, 'degraded');
      }

      onCreated(created);
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setImpactSummary('');
    } catch (err: any) {
      setError(err?.message || 'Failed to declare incident.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Declare Operational Incident"
      description="Create a new incident ticket, notify on-call leads, and initialize telemetry correlation."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded bg-rose-950/60 border border-rose-800 text-rose-300 font-medium">
            {error}
          </div>
        )}

        {/* Severity selection */}
        <div>
          <label className="block font-medium text-slate-300 mb-1.5">Incident Severity Tier</label>
          <div className="grid grid-cols-4 gap-2">
            {(['P1', 'P2', 'P3', 'P4'] as IncidentSeverity[]).map((sev) => {
              const info = {
                P1: { label: 'P1 Critical', sub: '2h SLA · Severe Outage', border: 'border-rose-600', bg: 'bg-rose-950/50' },
                P2: { label: 'P2 Major', sub: '4h SLA · Core Degraded', border: 'border-amber-600', bg: 'bg-amber-950/50' },
                P3: { label: 'P3 Minor', sub: '8h SLA · Partial Impact', border: 'border-sky-600', bg: 'bg-sky-950/50' },
                P4: { label: 'P4 Low', sub: '24h SLA · Low Severity', border: 'border-slate-600', bg: 'bg-slate-900' }
              }[sev];

              const selected = severity === sev;
              return (
                <button
                  type="button"
                  key={sev}
                  onClick={() => setSeverity(sev)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selected
                      ? `${info.border} ${info.bg} ring-1 ring-white/10 text-white font-semibold`
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-mono text-sm">{info.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{info.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block font-medium text-slate-300 mb-1">
            Incident Summary / Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Ingress Gateway 502 Bad Gateway surge on European checkout cluster"
            className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500 text-xs"
          />
        </div>

        {/* Impacted Service & Assigned Owner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Affected Service</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden focus:border-cyan-500 text-xs"
            >
              {services.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.displayName} ({svc.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Assigned Incident Lead</label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden focus:border-cyan-500 text-xs"
            >
              {users.map((usr) => (
                <option key={usr.id} value={usr.id}>
                  {usr.name} — {usr.role} {usr.onCall ? '(On-Call)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Detailed description */}
        <div>
          <label className="block font-medium text-slate-300 mb-1">
            Technical Description & Diagnostic Observations <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Observed symptoms, log traces, affected endpoints, and metric deviations..."
            className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500 text-xs resize-none"
          />
        </div>

        {/* Impact & Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block font-medium text-slate-300 mb-1">Customer / Revenue Impact Summary</label>
            <input
              type="text"
              value={impactSummary}
              onChange={(e) => setImpactSummary(e.target.value)}
              placeholder="e.g. Checkout page latency degraded for ~5% of users"
              className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Estimated Customer %</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={customerImpactPercent}
              onChange={(e) => setCustomerImpactPercent(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden focus:border-cyan-500 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-300 mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. EU-West, Database, PgBouncer, Canary"
            className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500 text-xs"
          />
        </div>

        {/* Buttons */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Dispatching...' : 'Declare Incident'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
