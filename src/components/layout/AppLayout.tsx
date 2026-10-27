import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NewIncidentModal } from '../incidents/NewIncidentModal';
import { apiService } from '../../services/api';
import { User, Incident } from '../../types';

export const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [newIncidentOpen, setNewIncidentOpen] = useState(false);
  const [users] = useState<User[]>(apiService.getUsers());
  const [currentUser, setCurrentUser] = useState<User>(users[0]);
  const navigate = useNavigate();

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleIncidentCreated = (inc: Incident) => {
    navigate(`/incidents/${inc.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          sidebarCollapsed ? 'pl-16' : 'pl-64'
        }`}
      >
        <Topbar
          onOpenSearch={() => setSearchOpen(true)}
          onOpenNewIncident={() => setNewIncidentOpen(true)}
          currentUser={currentUser}
          onSelectUser={setCurrentUser}
        />

        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <Outlet context={{ currentUser, onOpenNewIncident: () => setNewIncidentOpen(true) }} />
        </main>
      </div>

      {/* Global Search Dialog */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Declare Incident Dialog */}
      <NewIncidentModal
        isOpen={newIncidentOpen}
        onClose={() => setNewIncidentOpen(false)}
        onCreated={handleIncidentCreated}
      />
    </div>
  );
};
