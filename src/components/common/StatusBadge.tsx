import React from 'react';
import { IncidentStatus, ServiceHealth } from '../../types';

interface IncidentStatusBadgeProps {
  status: IncidentStatus;
}

export const IncidentStatusBadge: React.FC<IncidentStatusBadgeProps> = ({ status }) => {
  const configs: Record<IncidentStatus, { label: string; text: string; bg: string; border: string }> = {
    investigating: {
      label: 'Investigating',
      text: 'text-rose-400',
      bg: 'bg-rose-950/30',
      border: 'border-rose-900/50'
    },
    identified: {
      label: 'Identified',
      text: 'text-amber-400',
      bg: 'bg-amber-950/30',
      border: 'border-amber-900/50'
    },
    mitigating: {
      label: 'Mitigating',
      text: 'text-sky-400',
      bg: 'bg-sky-950/30',
      border: 'border-sky-900/50'
    },
    monitoring: {
      label: 'Monitoring',
      text: 'text-cyan-400',
      bg: 'bg-cyan-950/30',
      border: 'border-cyan-900/50'
    },
    resolved: {
      label: 'Resolved',
      text: 'text-emerald-400',
      bg: 'bg-emerald-950/30',
      border: 'border-emerald-900/50'
    }
  };

  const current = configs[status] || configs.investigating;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${current.bg} ${current.text} ${current.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {current.label}
    </span>
  );
};

interface ServiceHealthBadgeProps {
  health: ServiceHealth;
}

export const ServiceHealthBadge: React.FC<ServiceHealthBadgeProps> = ({ health }) => {
  const configs: Record<ServiceHealth, { label: string; text: string; bg: string; border: string }> = {
    healthy: {
      label: 'Healthy',
      text: 'text-emerald-400',
      bg: 'bg-emerald-950/40',
      border: 'border-emerald-900/50'
    },
    degraded: {
      label: 'Degraded',
      text: 'text-amber-400',
      bg: 'bg-amber-950/40',
      border: 'border-amber-900/50'
    },
    critical: {
      label: 'Critical',
      text: 'text-rose-400',
      bg: 'bg-rose-950/40',
      border: 'border-rose-900/50'
    },
    maintenance: {
      label: 'Maintenance',
      text: 'text-slate-400',
      bg: 'bg-slate-900/60',
      border: 'border-slate-800'
    }
  };

  const current = configs[health] || configs.healthy;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${current.bg} ${current.text} ${current.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {current.label}
    </span>
  );
};
