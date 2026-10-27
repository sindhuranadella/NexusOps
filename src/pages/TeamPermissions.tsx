import React, { useState } from 'react';
import {
  Users,
  Shield,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import { apiService } from '../services/api';
import { User } from '../types';
import { Modal } from '../components/common/Modal';

export const TeamPermissions: React.FC = () => {
  const [users, setUsers] = useState<User[]>(apiService.getUsers());
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<User['role']>('Site Reliability Engineer');
  const [inviteTeam, setInviteTeam] = useState('Core Platform Reliability');

  // RBAC Matrix definitions
  const permissionsList = [
    { id: 'perm-p1', name: 'Declare & Escalate P1 Incident', desc: 'Allows paging executive on-call and locking canary deployments' },
    { id: 'perm-rollback', name: 'Trigger Automated Rollback Runbook', desc: 'Can abort Kubernetes ArgoCD releases and revert commits' },
    { id: 'perm-failover', name: 'Execute Database / Regional Failover', desc: 'Directs PgBouncer & Route53 traffic to secondary regions' },
    { id: 'perm-wf-edit', name: 'Create & Modify Visual Workflows', desc: 'Permits editing automated DAG runbooks' },
    { id: 'perm-pir-edit', name: 'Publish Post-Incident Reviews (PIR)', desc: 'Can author and finalize public postmortem documents' },
    { id: 'perm-admin', name: 'Manage System Integrations & RBAC', desc: 'Full administration of API connectors and team roles' }
  ];

  const rolePermissions: Record<User['role'], string[]> = {
    Admin: ['perm-p1', 'perm-rollback', 'perm-failover', 'perm-wf-edit', 'perm-pir-edit', 'perm-admin'],
    'Incident Commander': ['perm-p1', 'perm-rollback', 'perm-failover', 'perm-wf-edit', 'perm-pir-edit'],
    'Site Reliability Engineer': ['perm-p1', 'perm-rollback', 'perm-wf-edit', 'perm-pir-edit'],
    'DevOps Specialist': ['perm-rollback', 'perm-wf-edit'],
    'Read-Only Observer': []
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      team: inviteTeam,
      avatarUrl: '',
      onCall: false
    };
    setUsers((prev) => [...prev, newUser]);
    setInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Team Directory & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Active on-call escalation rotations, operational privileges, and team memberships.
          </p>
        </div>

        <button
          onClick={() => setInviteModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Invite Operator</span>
        </button>
      </div>

      {/* On-Call Active Roster Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-100">Live On-Call Escalation Roster</h2>
          </div>
          <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
            SHIFT WINDOW: 08:00 - 16:00 UTC
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded bg-slate-950 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold flex items-center justify-center font-mono">
              P1
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Primary Responder</span>
              <span className="font-bold text-slate-200">Elena Rostova</span>
              <div className="text-[11px] text-slate-400">Incident Commander · PagerDuty #412</div>
            </div>
          </div>

          <div className="p-3.5 rounded bg-slate-950 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-950 border border-blue-800 text-blue-300 font-bold flex items-center justify-center font-mono">
              P2
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Secondary SRE Lead</span>
              <span className="font-bold text-slate-200">Marcus Vance</span>
              <div className="text-[11px] text-slate-400">Payments Reliability · PagerDuty #415</div>
            </div>
          </div>

          <div className="p-3.5 rounded bg-slate-950 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-950 border border-purple-800 text-purple-300 font-bold flex items-center justify-center font-mono">
              ESC
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Escalation Executive</span>
              <span className="font-bold text-slate-200">Dr. Sarah Chen</span>
              <div className="text-[11px] text-slate-400">VP Infrastructure Architecture</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">Certified Operations Personnel ({users.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase bg-slate-950/60">
                <th className="py-2.5 px-4">Operator</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">Assigned Role</th>
                <th className="py-2.5 px-4">Functional Team</th>
                <th className="py-2.5 px-4 text-right">On-Call Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((usr) => (
                <tr key={usr.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-200 flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center">
                      {usr.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <span>{usr.name}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{usr.email}</td>
                  <td className="py-3 px-4">
                    <span className="text-cyan-300 font-medium">{usr.role}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{usr.team}</td>
                  <td className="py-3 px-4 text-right font-mono">
                    {usr.onCall ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900 text-[10px] font-bold">
                        ACTIVE ON-CALL
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">Standby</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Permission Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Operational RBAC Privilege Governance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict role matrix enforced at both API gateway layer and frontend view state.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase bg-slate-950/60">
                <th className="py-2.5 px-4">Operational Privilege</th>
                <th className="py-2.5 px-4 text-center">Admin</th>
                <th className="py-2.5 px-4 text-center">Incident Commander</th>
                <th className="py-2.5 px-4 text-center">SRE Lead</th>
                <th className="py-2.5 px-4 text-center">DevOps</th>
                <th className="py-2.5 px-4 text-center">Observer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {permissionsList.map((perm) => (
                <tr key={perm.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{perm.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{perm.desc}</div>
                  </td>
                  {(['Admin', 'Incident Commander', 'Site Reliability Engineer', 'DevOps Specialist', 'Read-Only Observer'] as User['role'][]).map(
                    (role) => {
                      const hasPerm = rolePermissions[role].includes(perm.id);
                      return (
                        <td key={role} className="py-3 px-4 text-center">
                          {hasPerm ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-700 mx-auto" />
                          )}
                        </td>
                      );
                    }
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Invite Operator */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Operations Engineer"
        description="Provision access to NexusOps command center."
        maxWidth="md"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="e.g. Liam Kowalski"
              className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Corporate Email</label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="liam.kowalski@nexusops.internal"
              className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden text-xs"
              >
                <option value="Incident Commander">Incident Commander</option>
                <option value="Site Reliability Engineer">SRE</option>
                <option value="DevOps Specialist">DevOps</option>
                <option value="Admin">Admin</option>
                <option value="Read-Only Observer">Observer</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Team</label>
              <input
                type="text"
                value={inviteTeam}
                onChange={(e) => setInviteTeam(e.target.value)}
                className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-100 focus:outline-hidden text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setInviteModalOpen(false)}
              className="px-3 py-1.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
