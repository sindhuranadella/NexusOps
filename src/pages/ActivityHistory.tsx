import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Shield,
  Download,
  Filter,
  Trash2,
  ExternalLink,
  Slack,
  Mail,
  Smartphone,
  Check
} from 'lucide-react';
import { apiService } from '../services/api';
import { AuditNotification } from '../types';

export const ActivityHistory: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AuditNotification[]>(
    apiService.getNotifications()
  );
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Channels state
  const [channels, setChannels] = useState([
    { id: 'ch-slack', name: 'Slack #ops-incident-war-room', type: 'slack', enabled: true, destination: 'hooks.slack.com/services/...' },
    { id: 'ch-pagerduty', name: 'PagerDuty High-Urgency Escalation', type: 'pagerduty', enabled: true, destination: 'Service: Core-PCI-Platform' },
    { id: 'ch-teams', name: 'Microsoft Teams Executive Ops', type: 'teams', enabled: false, destination: 'outlook.office.com/webhook/...' },
    { id: 'ch-email', name: 'Engineering Leadership Distribution', type: 'email', enabled: true, destination: 'ops-leadership@nexusops.internal' }
  ]);

  const [channelToast, setChannelToast] = useState<string | null>(null);

  const handleMarkRead = (id: string) => {
    apiService.markNotificationRead(id);
    setNotifications(apiService.getNotifications());
  };

  const handleMarkAllRead = () => {
    apiService.markAllNotificationsRead();
    setNotifications(apiService.getNotifications());
  };

  const handleTestChannel = (chName: string) => {
    setChannelToast(`Test ping dispatched to ${chName} (Status 200 OK)`);
    setTimeout(() => setChannelToast(null), 3000);
  };

  const handleToggleChannel = (id: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(notifications, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexusops_audit_log_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (severityFilter !== 'all' && n.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            Audit History & Notification Dispatch Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically sealed operational audit trail and notification delivery channel management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Mark All Read
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Trail</span>
          </button>
        </div>
      </div>

      {channelToast && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded text-xs flex items-center gap-2 font-mono">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{channelToast}</span>
        </div>
      )}

      {/* Notification Delivery Channels */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Broadcast Delivery Channels</h2>
            <p className="text-xs text-slate-400">
              Live endpoints receiving high-urgency operational broadcasts
            </p>
          </div>
          <span className="font-mono text-[10px] text-cyan-400">4 Active Endpoints</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {channels.map((ch) => (
            <div key={ch.id} className="p-3.5 rounded bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 truncate">{ch.name}</span>
                  <input
                    type="checkbox"
                    checked={ch.enabled}
                    onChange={() => handleToggleChannel(ch.id)}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-500 truncate mt-1">{ch.destination}</div>
              </div>

              <button
                onClick={() => handleTestChannel(ch.name)}
                className="w-full py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-medium transition-colors"
              >
                Send Test Ping
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold text-slate-300">Filter Trail:</span>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-200 text-xs"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warning Only</option>
            <option value="info">Info Only</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-200 text-xs"
          >
            <option value="all">All Categories</option>
            <option value="incident">Incidents</option>
            <option value="workflow">Workflows</option>
            <option value="service">Services</option>
            <option value="deployment">Deployments</option>
          </select>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          Showing {filteredNotifications.length} of {notifications.length} audit entries
        </span>
      </div>

      {/* Main Audit Trail Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg divide-y divide-slate-800/80 text-xs">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No audit log entries matching filters.</div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 flex items-start justify-between gap-3 hover:bg-slate-800/40 transition-colors ${
                !notif.read ? 'bg-slate-800/20' : ''
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
                    notif.severity === 'critical'
                      ? 'bg-rose-500'
                      : notif.severity === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-cyan-500'
                  }`}
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100">{notif.title}</span>
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {notif.category}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">{notif.message}</p>
                  <div className="text-[10px] font-mono text-slate-500">
                    Timestamp: {new Date(notif.timestamp).toUTCString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!notif.read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors hover:underline"
                  >
                    Mark read
                  </button>
                )}
                {notif.link && (
                  <button
                    onClick={() => navigate(notif.link!)}
                    className="p-1 rounded text-cyan-400 hover:text-cyan-300 hover:bg-slate-800"
                    title="Navigate to resource"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
