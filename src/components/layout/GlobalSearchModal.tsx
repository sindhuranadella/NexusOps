import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertTriangle, Network, Workflow, FileText, ArrowRight, X } from 'lucide-react';
import { apiService } from '../../services/api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const incidents = apiService.getIncidents();
  const services = apiService.getServices();
  const workflows = apiService.getWorkflows();
  const pirs = apiService.getPIRs();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredIncidents = q
    ? incidents.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q) ||
          i.affectedServiceName.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q))
      )
    : incidents.slice(0, 3);

  const filteredServices = q
    ? services.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.displayName.toLowerCase().includes(q) ||
          s.cluster.toLowerCase().includes(q)
      )
    : services.slice(0, 3);

  const filteredWorkflows = q
    ? workflows.filter((w) => w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q))
    : workflows.slice(0, 2);

  const filteredPIRs = q
    ? pirs.filter((p) => p.id.toLowerCase().includes(q) || p.incidentTitle.toLowerCase().includes(q))
    : [];

  const handleSelect = (url: string) => {
    navigate(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-10 overflow-hidden">
        {/* Search Input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across incidents, services, topology nodes, runbooks..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-500 hover:text-slate-300">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Incidents Section */}
          {filteredIncidents.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1 font-semibold">
                Incidents ({filteredIncidents.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => handleSelect(`/incidents/${inc.id}`)}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-slate-800/80 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${inc.severity === 'P1' ? 'text-rose-400' : 'text-amber-400'}`} />
                      <span className="font-mono text-cyan-400 font-semibold">{inc.id}</span>
                      <span className="text-slate-200 truncate">{inc.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-400 text-[11px]">{inc.affectedServiceName}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services Section */}
          {filteredServices.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1 font-semibold">
                Services & Topology ({filteredServices.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredServices.map((svc) => (
                  <div
                    key={svc.id}
                    onClick={() => handleSelect(`/topology?select=${svc.id}`)}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-slate-800/80 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Network className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="text-slate-200 font-medium truncate">{svc.displayName}</span>
                      <span className="font-mono text-[11px] text-slate-400">({svc.category})</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-mono ${svc.health === 'healthy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {svc.health.toUpperCase()}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workflows */}
          {filteredWorkflows.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1 font-semibold">
                Automation Workflows ({filteredWorkflows.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredWorkflows.map((wf) => (
                  <div
                    key={wf.id}
                    onClick={() => handleSelect(`/workflows?id=${wf.id}`)}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-slate-800/80 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Workflow className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-slate-200 font-medium truncate">{wf.name}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PIR Reviews */}
          {filteredPIRs.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1 font-semibold">
                Post-Incident Reviews
              </div>
              <div className="space-y-1 mt-1">
                {filteredPIRs.map((pir) => (
                  <div
                    key={pir.id}
                    onClick={() => handleSelect(`/reports?pir=${pir.id}`)}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-slate-800/80 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-mono text-cyan-400">{pir.id}</span>
                      <span className="text-slate-200 truncate">{pir.incidentTitle}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredIncidents.length === 0 && filteredServices.length === 0 && filteredWorkflows.length === 0 && (
            <div className="py-8 text-center text-slate-500">
              No operational artifacts found matching &quot;{query}&quot;
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Tip: Jump to incident IDs (e.g. INC-8921) or service names</span>
          <span className="font-mono">NexusOps Command v2.4</span>
        </div>
      </div>
    </div>
  );
};
