import React from 'react';
import { IncidentSeverity } from '../../types';

interface SeverityBadgeProps {
  severity: IncidentSeverity;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const styles: Record<IncidentSeverity, { bg: string; text: string; label: string; border: string }> = {
    P1: {
      bg: 'bg-rose-950/50',
      text: 'text-rose-400',
      border: 'border-rose-800/60',
      label: 'P1 Critical'
    },
    P2: {
      bg: 'bg-amber-950/50',
      text: 'text-amber-400',
      border: 'border-amber-800/60',
      label: 'P2 Major'
    },
    P3: {
      bg: 'bg-sky-950/50',
      text: 'text-sky-400',
      border: 'border-sky-800/60',
      label: 'P3 Minor'
    },
    P4: {
      bg: 'bg-slate-900/60',
      text: 'text-slate-400',
      border: 'border-slate-800',
      label: 'P4 Low'
    }
  };

  const current = styles[severity] || styles.P4;
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border font-mono uppercase tracking-wider ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {severity}
    </span>
  );
};
