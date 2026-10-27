export type IncidentSeverity = 'P1' | 'P2' | 'P3' | 'P4';

export type IncidentStatus = 'investigating' | 'identified' | 'mitigating' | 'monitoring' | 'resolved';

export type ServiceHealth = 'healthy' | 'degraded' | 'critical' | 'maintenance';

export type ServiceTier = 'tier-1' | 'tier-2' | 'tier-3';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Incident Commander' | 'Site Reliability Engineer' | 'DevOps Specialist' | 'Read-Only Observer';
  team: string;
  avatarUrl: string;
  onCall: boolean;
}

export interface ServiceNode {
  id: string;
  name: string;
  displayName: string;
  category: 'Edge' | 'Compute' | 'Database' | 'Messaging' | 'Third-Party' | 'Internal';
  tier: ServiceTier;
  health: ServiceHealth;
  uptime: number; // e.g. 99.98%
  latencyP99: number; // in ms
  errorRate: number; // in %
  activeIncidents: number;
  ownerTeam: string;
  dependencies: string[]; // downstream target IDs
  upstream: string[]; // upstream callers
  version: string;
  cluster: string;
  description: string;
}

export interface IncidentEvidence {
  id: string;
  incidentId: string;
  type: 'log_snippet' | 'metric_anomaly' | 'deployment_diff' | 'alert_payload' | 'audit_trace';
  title: string;
  source: string;
  timestamp: string;
  payload: string;
  verified: boolean;
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  author: string;
  type: 'status_change' | 'note' | 'action_taken' | 'alert_fired' | 'evidence_added';
  title: string;
  description: string;
}

export interface Incident {
  id: string; // e.g. "INC-8921"
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedServiceId: string;
  affectedServiceName: string;
  assignedOwnerId: string;
  assignedOwnerName: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  slaDeadline: string; // ISO timestamp
  slaBreached: boolean;
  impactSummary: string;
  customerImpactPercent: number;
  rootCauseSummary?: string;
  evidence: IncidentEvidence[];
  timeline: IncidentTimelineEvent[];
  tags: string[];
}

export interface WorkflowNodeData {
  label: string;
  nodeType: 'trigger' | 'condition' | 'action' | 'approval';
  description: string;
  config: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'failed' | 'waiting_approval';
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  triggerEvent: string;
  serviceScope: string[];
  lastRunAt?: string;
  lastRunStatus?: 'success' | 'failed';
  executionCount: number;
  nodes: any[];
  edges: any[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  incidentId?: string;
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'completed' | 'failed' | 'pending_approval';
  steps: {
    nodeId: string;
    stepName: string;
    status: 'success' | 'failed' | 'running' | 'skipped';
    durationMs: number;
    outputSummary: string;
  }[];
}

export interface ScenarioParameter {
  id: string;
  name: string;
  description: string;
  unit: string;
  minValue: number;
  maxValue: number;
  step: number;
  currentValue: number;
  defaultValue: number;
}

export interface ScenarioCalculationResult {
  scenarioId: string;
  scenarioName: string;
  estimatedMttrMinutes: number;
  projectedRevenueAtRisk: number; // in USD
  slaBreachRiskPercent: number;
  systemThroughputRps: number;
  p99LatencyMs: number;
  resilienceScore: number; // 0-100
  keyBottlenecks: string[];
}

export interface PostIncidentReview {
  id: string; // e.g. "PIR-2026-04"
  incidentId: string;
  incidentTitle: string;
  date: string;
  leadAuthor: string;
  executiveSummary: string;
  durationMinutes: number;
  downtimeMinutes: number;
  impactScore: 'High' | 'Critical' | 'Moderate';
  timeline: { time: string; event: string }[];
  fiveWhys: string[];
  whatWentWell: string[];
  whatWentWrong: string[];
  whereWeGotLucky: string[];
  actionItems: {
    id: string;
    description: string;
    owner: string;
    priority: 'P1' | 'P2' | 'P3';
    status: 'Open' | 'In Progress' | 'Completed';
    dueDate: string;
  }[];
}

export interface IntegrationConnector {
  id: string;
  name: string;
  category: 'Cloud Provider' | 'Observability' | 'Alerting' | 'VCS' | 'Database';
  status: 'connected' | 'degraded' | 'disconnected' | 'testing';
  lastSyncAt: string;
  eventsProcessed24h: number;
  endpointUrl: string;
  description: string;
}

export interface AuditNotification {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'incident' | 'workflow' | 'service' | 'security' | 'deployment';
  timestamp: string;
  read: boolean;
  link?: string;
}
