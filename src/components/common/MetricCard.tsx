import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  tone?: 'default' | 'positive' | 'warning' | 'critical';
  subtitle?: string;
  actionText?: string;
  onActionClick?: () => void;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  change,
  trend,
  tone = 'default',
  subtitle,
  actionText,
  onActionClick,
  icon
}) => {
  const toneClasses = {
    default: 'text-slate-100',
    positive: 'text-emerald-400',
    warning: 'text-amber-400',
    critical: 'text-rose-400'
  };

  const trendClasses = {
    up: trend === 'up' ? (tone === 'critical' ? 'text-rose-400' : 'text-emerald-400') : '',
    down: trend === 'down' ? (tone === 'critical' ? 'text-emerald-400' : 'text-rose-400') : '',
    neutral: 'text-slate-400'
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 flex flex-col justify-between transition-colors hover:border-slate-700">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        {icon && <div className="text-slate-500">{icon}</div>}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${toneClasses[tone]}`}>
          {value}
        </span>
        {unit && <span className="text-xs text-slate-400 font-medium">{unit}</span>}
        {change && (
          <span className={`text-xs font-mono tabular-nums ml-auto ${trendClasses[trend || 'neutral']}`}>
            {change}
          </span>
        )}
      </div>

      {(subtitle || actionText) && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {actionText && onActionClick && (
            <button
              onClick={onActionClick}
              className="ml-auto text-sky-400 hover:text-sky-300 font-medium transition-colors hover:underline"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
