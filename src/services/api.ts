import {
  Incident,
  IncidentEvidence,
  IncidentTimelineEvent,
  ServiceNode,
  WorkflowDefinition,
  PostIncidentReview,
  IntegrationConnector,
  AuditNotification,
  User,
  ScenarioParameter,
  ScenarioCalculationResult
} from '../types';
import {
  INITIAL_INCIDENTS,
  INITIAL_SERVICES,
  INITIAL_WORKFLOWS,
  INITIAL_PIRS,
  INITIAL_INTEGRATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
  DEFAULT_SCENARIO_PARAMETERS
} from './mockData';

// Storage keys
const STORAGE_PREFIX = 'nexusops_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
}

// In-memory / persistent mock store
class NexusDataStore {
  private incidents: Incident[] = loadFromStorage('incidents', INITIAL_INCIDENTS);
  private services: ServiceNode[] = loadFromStorage('services', INITIAL_SERVICES);
  private workflows: WorkflowDefinition[] = loadFromStorage('workflows', INITIAL_WORKFLOWS);
  private pirs: PostIncidentReview[] = loadFromStorage('pirs', INITIAL_PIRS);
  private integrations: IntegrationConnector[] = loadFromStorage('integrations', INITIAL_INTEGRATIONS);
  private notifications: AuditNotification[] = loadFromStorage('notifications', INITIAL_NOTIFICATIONS);
  private users: User[] = loadFromStorage('users', INITIAL_USERS);
  private scenarioParams: ScenarioParameter[] = loadFromStorage('scenario_params', DEFAULT_SCENARIO_PARAMETERS);

  // Incidents
  getIncidents(): Incident[] {
    return [...this.incidents];
  }

  getIncidentById(id: string): Incident | undefined {
    return this.incidents.find((inc) => inc.id === id);
  }

  createIncident(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'evidence' | 'slaBreached'>): Incident {
    const nextNum = Math.floor(8925 + Math.random() * 100);
    const id = `INC-${nextNum}`;
    const now = new Date().toISOString();

    const created: Incident = {
      ...incident,
      id,
      createdAt: now,
      updatedAt: now,
      slaBreached: false,
      evidence: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: now,
          author: 'NexusOps Automated Dispatcher',
          type: 'alert_fired',
          title: `Incident ${id} Declared`,
          description: `Severity ${incident.severity} incident logged for service ${incident.affectedServiceName}.`
        }
      ]
    };

    this.incidents = [created, ...this.incidents];
    saveToStorage('incidents', this.incidents);

    // Notify
    this.addNotification({
      title: `${incident.severity} Incident Created: ${id}`,
      message: incident.title,
      severity: incident.severity === 'P1' ? 'critical' : 'warning',
      category: 'incident',
      link: `/incidents/${id}`
    });

    return created;
  }

  updateIncidentStatus(id: string, status: Incident['status'], authorName = 'Marcus Vance', note?: string): Incident {
    const idx = this.incidents.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error(`Incident ${id} not found`);

    const now = new Date().toISOString();
    const updated = { ...this.incidents[idx] };
    const oldStatus = updated.status;
    updated.status = status;
    updated.updatedAt = now;

    if (status === 'resolved' && !updated.resolvedAt) {
      updated.resolvedAt = now;
    }

    const event: IncidentTimelineEvent = {
      id: `tl-${Date.now()}`,
      timestamp: now,
      author: authorName,
      type: 'status_change',
      title: `Status updated to ${status.toUpperCase()}`,
      description: note || `Transitioned from ${oldStatus} to ${status}.`
    };

    updated.timeline = [event, ...updated.timeline];
    this.incidents[idx] = updated;
    saveToStorage('incidents', this.incidents);

    this.addNotification({
      title: `Incident ${id} ${status.toUpperCase()}`,
      message: `Status updated by ${authorName}.`,
      severity: status === 'resolved' ? 'info' : 'warning',
      category: 'incident',
      link: `/incidents/${id}`
    });

    return updated;
  }

  addIncidentEvidence(id: string, evidence: Omit<IncidentEvidence, 'id' | 'incidentId' | 'timestamp' | 'verified'>): Incident {
    const idx = this.incidents.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error(`Incident ${id} not found`);

    const now = new Date().toISOString();
    const newEvidence: IncidentEvidence = {
      ...evidence,
      id: `ev-${Date.now()}`,
      incidentId: id,
      timestamp: now,
      verified: true
    };

    const updated = { ...this.incidents[idx] };
    updated.evidence = [newEvidence, ...updated.evidence];
    updated.updatedAt = now;

    const event: IncidentTimelineEvent = {
      id: `tl-${Date.now()}`,
      timestamp: now,
      author: 'Investigation Team',
      type: 'evidence_added',
      title: `Correlated Evidence Attached: ${evidence.title}`,
      description: `New artifact from ${evidence.source} cataloged.`
    };
    updated.timeline = [event, ...updated.timeline];

    this.incidents[idx] = updated;
    saveToStorage('incidents', this.incidents);
    return updated;
  }

  addTimelineNote(id: string, author: string, title: string, description: string): Incident {
    const idx = this.incidents.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error(`Incident ${id} not found`);

    const now = new Date().toISOString();
    const updated = { ...this.incidents[idx] };

    const event: IncidentTimelineEvent = {
      id: `tl-${Date.now()}`,
      timestamp: now,
      author,
      type: 'note',
      title,
      description
    };

    updated.timeline = [event, ...updated.timeline];
    updated.updatedAt = now;
    this.incidents[idx] = updated;
    saveToStorage('incidents', this.incidents);
    return updated;
  }

  // Services
  getServices(): ServiceNode[] {
    return [...this.services];
  }

  getServiceById(id: string): ServiceNode | undefined {
    return this.services.find((s) => s.id === id);
  }

  updateServiceHealth(id: string, health: ServiceNode['health']): ServiceNode {
    const idx = this.services.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Service ${id} not found`);

    this.services[idx] = {
      ...this.services[idx],
      health
    };
    saveToStorage('services', this.services);
    return this.services[idx];
  }

  // Workflows
  getWorkflows(): WorkflowDefinition[] {
    return [...this.workflows];
  }

  getWorkflowById(id: string): WorkflowDefinition | undefined {
    return this.workflows.find((w) => w.id === id);
  }

  saveWorkflow(workflow: WorkflowDefinition): WorkflowDefinition {
    const idx = this.workflows.findIndex((w) => w.id === workflow.id);
    const updated = {
      ...workflow,
      updatedAt: new Date().toISOString()
    };

    if (idx >= 0) {
      this.workflows[idx] = updated;
    } else {
      this.workflows = [updated, ...this.workflows];
    }
    saveToStorage('workflows', this.workflows);
    return updated;
  }

  executeWorkflowSimulation(id: string): { executionId: string; status: 'success' | 'failed'; logs: string[] } {
    const wf = this.workflows.find((w) => w.id === id);
    if (!wf) throw new Error('Workflow not found');

    const executionId = `exec-${Date.now()}`;
    const logs = [
      `[${new Date().toISOString()}] Initializing workflow trigger: ${wf.triggerEvent}`,
      `[${new Date().toISOString()}] Evaluating conditional logic across ${wf.nodes.length} registered nodes`,
      `[${new Date().toISOString()}] Executed action nodes successfully in dry-run mode (Flask REST proxy simulated)`,
      `[${new Date().toISOString()}] Execution completed with status: SUCCESS`
    ];

    wf.lastRunAt = new Date().toISOString();
    wf.lastRunStatus = 'success';
    wf.executionCount += 1;
    saveToStorage('workflows', this.workflows);

    this.addNotification({
      title: `Workflow Executed: ${wf.name}`,
      message: `Completed dry-run simulation with 0 errors across ${wf.nodes.length} nodes.`,
      severity: 'info',
      category: 'workflow',
      link: '/workflows'
    });

    return { executionId, status: 'success', logs };
  }

  // Post-Incident Reviews
  getPIRs(): PostIncidentReview[] {
    return [...this.pirs];
  }

  createPIR(pir: Omit<PostIncidentReview, 'id' | 'date'>): PostIncidentReview {
    const nextNum = Math.floor(5 + Math.random() * 20);
    const id = `PIR-2026-${String(nextNum).padStart(2, '0')}`;
    const created: PostIncidentReview = {
      ...pir,
      id,
      date: new Date().toISOString().split('T')[0]
    };
    this.pirs = [created, ...this.pirs];
    saveToStorage('pirs', this.pirs);
    return created;
  }

  // Integrations
  getIntegrations(): IntegrationConnector[] {
    return [...this.integrations];
  }

  testIntegration(id: string): { success: boolean; latencyMs: number; message: string } {
    const conn = this.integrations.find((i) => i.id === id);
    if (!conn) throw new Error('Connector not found');
    const latency = Math.floor(18 + Math.random() * 45);
    return {
      success: true,
      latencyMs: latency,
      message: `Verified HTTP 200 handshake with ${conn.name} endpoint in ${latency}ms.`
    };
  }

  // Notifications
  getNotifications(): AuditNotification[] {
    return [...this.notifications];
  }

  markNotificationRead(id: string): void {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveToStorage('notifications', this.notifications);
  }

  markAllNotificationsRead(): void {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    saveToStorage('notifications', this.notifications);
  }

  addNotification(notif: Omit<AuditNotification, 'id' | 'timestamp' | 'read'>): AuditNotification {
    const item: AuditNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    this.notifications = [item, ...this.notifications];
    saveToStorage('notifications', this.notifications);
    return item;
  }

  // Users
  getUsers(): User[] {
    return [...this.users];
  }

  // Scenario Lab Parameters & Calculations
  getScenarioParameters(): ScenarioParameter[] {
    return [...this.scenarioParams];
  }

  updateScenarioParameter(id: string, value: number): ScenarioParameter[] {
    this.scenarioParams = this.scenarioParams.map((p) => (p.id === id ? { ...p, currentValue: value } : p));
    saveToStorage('scenario_params', this.scenarioParams);
    return [...this.scenarioParams];
  }

  calculateScenario(params: ScenarioParameter[]): ScenarioCalculationResult {
    const traffic = params.find((p) => p.id === 'param-traffic-surge')?.currentValue || 1.0;
    const dbDelay = params.find((p) => p.id === 'param-db-latency')?.currentValue || 25;
    const stripeLat = params.find((p) => p.id === 'param-stripe-degradation')?.currentValue || 150;
    const staff = params.find((p) => p.id === 'param-oncall-readiness')?.currentValue || 4;

    // Deterministic simulation queue math
    const baselineMttr = 45; // minutes
    const staffImpact = 4 / Math.max(1, staff);
    const trafficStrain = Math.pow(traffic, 1.4);
    const estimatedMttr = Math.round(baselineMttr * staffImpact * (1 + (dbDelay - 25) / 100));

    // Revenue at risk ($12,000/hr baseline * hours * traffic multiplier)
    const downtimeHours = estimatedMttr / 60;
    const projectedRevenueAtRisk = Math.round(downtimeHours * 38000 * traffic * (stripeLat > 500 ? 1.6 : 1.0));

    // SLA breach risk
    const slaBreachRiskPercent = Math.min(99, Math.round(Math.max(5, (estimatedMttr / 60) * 45 + (stripeLat > 800 ? 25 : 0))));

    // System throughput under stress
    const baselineRps = 4800;
    const systemThroughputRps = Math.round((baselineRps * traffic) / (1 + (stripeLat / 1000) * 0.4));

    // P99 latency
    const p99LatencyMs = Math.round(45 + stripeLat * 0.65 + (traffic - 1) * 220 + dbDelay * 4);

    // Resilience score 0 - 100
    const resilienceScore = Math.max(12, Math.round(100 - (slaBreachRiskPercent * 0.5) - (traffic - 1) * 15 - (stripeLat > 600 ? 15 : 0)));

    const bottlenecks: string[] = [];
    if (traffic > 2.0) bottlenecks.push('API Gateway Worker Thread Starvation under >2.0x load');
    if (dbDelay > 60) bottlenecks.push('PostgreSQL Aurora cross-region replica split-brain delay');
    if (stripeLat > 600) bottlenecks.push('Third-party payment settlement HTTP socket timeout risk');
    if (staff < 3) bottlenecks.push('Incident Commander rotation burnout during prolonged incident bridge');

    return {
      scenarioId: `scen-${Date.now()}`,
      scenarioName: `Simulated Scenario (${traffic}x Load, ${staff} Responders)`,
      estimatedMttrMinutes: estimatedMttr,
      projectedRevenueAtRisk,
      slaBreachRiskPercent,
      systemThroughputRps,
      p99LatencyMs,
      resilienceScore,
      keyBottlenecks: bottlenecks.length ? bottlenecks : ['Nominal operational headroom maintained']
    };
  }

  resetAllData(): void {
    localStorage.clear();
    this.incidents = INITIAL_INCIDENTS;
    this.services = INITIAL_SERVICES;
    this.workflows = INITIAL_WORKFLOWS;
    this.pirs = INITIAL_PIRS;
    this.integrations = INITIAL_INTEGRATIONS;
    this.notifications = INITIAL_NOTIFICATIONS;
    this.users = INITIAL_USERS;
    this.scenarioParams = DEFAULT_SCENARIO_PARAMETERS;
  }
}

export const apiService = new NexusDataStore();
