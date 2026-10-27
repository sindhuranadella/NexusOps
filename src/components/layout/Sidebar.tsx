import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  SearchCode,
  Network,
  Workflow,
  Sparkles,
  FlaskConical,
  BarChart3,
  FileText,
  Users,
  Bell,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { apiService } from '../../services/api';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const incidents = apiService.getIncidents();
  const openCriticalCount = incidents.filter(
    (i) => (i.severity === 'P1' || i.severity === 'P2') && i.status !== 'resolved'
  ).length;
  const unreadNotifsCount = apiService.getNotifications().filter((n) => !n.read).length;

  const navItems = [
    {
      to: '/',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      to: '/incidents',
      label: 'Incident Management',
      icon: AlertTriangle,
      badge: openCriticalCount > 0 ? `${openCriticalCount}` : null,
      badgeTone: 'critical'
    },
    {
      to: '/investigation',
      label: 'Investigation Studio',
      icon: SearchCode,
      badge: null
    },
    {
      to: '/topology',
      label: 'Service Dependency Map',
      icon: Network,
      badge: null
    },
    {
      to: '/workflows',
      label: 'Workflow Automation',
      icon: Workflow,
      badge: null
    },
    {
      to: '/ai',
      label: 'AI Operations Intelligence',
      icon: Sparkles,
      badge: 'AI',
      badgeTone: 'cyan'
    },
    {
      to: '/scenarios',
      label: 'Scenario Lab',
      icon: FlaskConical,
      badge: null
    },
    {
      to: '/analytics',
      label: 'Analytics & Performance',
      icon: BarChart3,
      badge: null
    },
    {
      to: '/reports',
      label: 'Reports & PIR Reviews',
      icon: FileText,
      badge: null
    },
    {
      to: '/team',
      label: 'Team & Permissions',
      icon: Users,
      badge: null
    },
    {
      to: '/activity',
      label: 'Notifications & Activity',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? `${unreadNotifsCount}` : null,
      badgeTone: 'warning'
    },
    {
      to: '/admin',
      label: 'Integrations & Backend',
      icon: Sliders,
      badge: null
    }
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-200 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand header */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-slate-800/80">
        <NavLink to="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white shrink-0 shadow-xs">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold tracking-tight text-white whitespace-nowrap truncate">
                NexusOps AI
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider truncate">
                Ops Intelligence
              </span>
            </div>
          )}
        </NavLink>

        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5" aria-label="Main Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors relative ${
                  isActive
                    ? 'bg-slate-900 text-cyan-400 border border-slate-800 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
              {!collapsed && (
                <>
                  <span className="truncate flex-1">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        item.badgeTone === 'critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-900/60'
                          : item.badgeTone === 'warning'
                          ? 'bg-amber-950 text-amber-300 border border-amber-900/60'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* On-Call Responders Footer Bar */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span className="font-medium text-slate-300">Active Incident Lead</span>
            <span className="text-[10px] text-emerald-400 font-mono">ON-CALL</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-900 text-blue-200 text-xs font-semibold flex items-center justify-center border border-blue-700">
              MV
            </div>
            <div className="truncate">
              <div className="text-xs font-medium text-slate-200 truncate">Marcus Vance</div>
              <div className="text-[10px] text-slate-400 truncate">Payments & Settlement</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
