import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Plus,
  Shield,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { apiService } from '../../services/api';
import { User, AuditNotification } from '../../types';

interface TopbarProps {
  onOpenSearch: () => void;
  onOpenNewIncident: () => void;
  currentUser: User;
  onSelectUser: (user: User) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenSearch,
  onOpenNewIncident,
  currentUser,
  onSelectUser
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<AuditNotification[]>(apiService.getNotifications());
  const users = apiService.getUsers();

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    apiService.markAllNotificationsRead();
    setNotifications(apiService.getNotifications());
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') return [{ label: 'Executive Operations', link: '/' }];
    if (path.startsWith('/incidents/')) {
      const incId = path.replace('/incidents/', '');
      return [
        { label: 'Incident Management', link: '/incidents' },
        { label: incId, link: path }
      ];
    }
    const mapping: Record<string, string> = {
      '/incidents': 'Incident Management',
      '/investigation': 'Investigation Studio',
      '/topology': 'Service Dependency Map',
      '/workflows': 'Visual Workflow Automation',
      '/ai': 'AI Operations Intelligence',
      '/scenarios': 'Scenario Lab',
      '/analytics': 'Analytics & Performance',
      '/reports': 'Reports & Post-Incident Reviews',
      '/team': 'Team & Permissions',
      '/activity': 'Notifications & Activity History',
      '/admin': 'Administration & Integrations'
    };
    const title = mapping[path] || 'Operations';
    return [
      { label: 'Operations Command', link: '/' },
      { label: title, link: path }
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-14 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between sticky top-0 z-20">
      {/* Zone 1: Breadcrumbs & Cluster indicator */}
      <div className="flex items-center gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.link}>
              {idx > 0 && <span className="text-slate-600 font-mono">/</span>}
              <Link
                to={crumb.link}
                className={`transition-colors whitespace-nowrap ${
                  idx === breadcrumbs.length - 1
                    ? 'text-slate-200 font-semibold'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>

        <span className="hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-900 border border-slate-800 text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          SIMULATED TELEMETRY · REST READY
        </span>
      </div>

      {/* Zone 2: Global Search, Quick Trigger, Notifications & User profile */}
      <div className="flex items-center gap-2.5">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 text-xs transition-colors"
          title="Search Incidents, Services, and Runbooks (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search operations, services, incidents...</span>
          <kbd className="hidden md:inline-block font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700">
            ⌘K
          </kbd>
        </button>

        {/* Primary Action: Declare Incident */}
        <button
          onClick={onOpenNewIncident}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Declare Incident</span>
        </button>

        {/* Notifications Drawer Toggle */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-950" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-50 overflow-hidden text-xs">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">Operational Alerts</span>
                  {unreadCount > 0 && (
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-sky-400 hover:text-sky-300 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">No active operational alerts.</div>
                ) : (
                  notifications.slice(0, 8).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        apiService.markNotificationRead(notif.id);
                        setNotifications(apiService.getNotifications());
                        if (notif.link) {
                          navigate(notif.link);
                          setNotificationsOpen(false);
                        }
                      }}
                      className={`p-3 transition-colors cursor-pointer hover:bg-slate-800/60 flex items-start gap-2.5 ${
                        !notif.read ? 'bg-slate-800/20' : ''
                      }`}
                    >
                      <span
                        className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                          notif.severity === 'critical'
                            ? 'bg-rose-500'
                            : notif.severity === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-cyan-500'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-medium text-slate-200 truncate">{notif.title}</p>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-0.5 line-clamp-2 text-[11px]">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-800 bg-slate-950/80 text-center">
                <Link
                  to="/activity"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                >
                  View full activity audit log →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Switcher Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-cyan-900 text-cyan-200 text-[10px] font-bold flex items-center justify-center">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-medium leading-none text-slate-200">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 leading-tight">{currentUser.role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-50 overflow-hidden text-xs">
              <div className="px-3.5 py-2.5 border-b border-slate-800 bg-slate-950">
                <div className="text-[11px] font-medium text-slate-400">Switch Operator Persona</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Test role-based access & views</div>
              </div>
              <div className="py-1">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onSelectUser(user);
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      user.id === currentUser.id ? 'bg-slate-800/60 text-cyan-300' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-[10px] text-slate-400">{user.role} · {user.team}</div>
                    </div>
                    {user.id === currentUser.id && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
