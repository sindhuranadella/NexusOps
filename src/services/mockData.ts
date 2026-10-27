import {
  User,
  ServiceNode,
  Incident,
  WorkflowDefinition,
  PostIncidentReview,
  IntegrationConnector,
  AuditNotification,
  ScenarioParameter
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Elena Rostova',
    email: 'elena.rostova@nexusops.internal',
    role: 'Incident Commander',
    team: 'Core Platform Reliability',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    onCall: true,
  },
  {
    id: 'usr-2',
    name: 'Marcus Vance',
    email: 'marcus.vance@nexusops.internal',
    role: 'Site Reliability Engineer',
    team: 'Payments & Settlement Infrastructure',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    onCall: true,
  },
  {
    id: 'usr-3',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@nexusops.internal',
    role: 'Admin',
    team: 'Infrastructure Architecture',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    onCall: false,
  },
  {
    id: 'usr-4',
    name: 'Devon Miller',
    email: 'devon.miller@nexusops.internal',
    role: 'DevOps Specialist',
    team: 'Data & Stream Processing',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    onCall: false,
  },
  {
    id: 'usr-5',
    name: 'Aisha Al-Mansoor',
    email: 'aisha.almansoor@nexusops.internal',
    role: 'Site Reliability Engineer',
    team: 'Edge & Ingress Routing',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    onCall: true,
  }
];

export const INITIAL_SERVICES: ServiceNode[] = [
  {
    id: 'svc-edge-ingress',
    name: 'edge-ingress',
    displayName: 'Global Edge Ingress & CDN',
    category: 'Edge',
    tier: 'tier-1',
    health: 'healthy',
    uptime: 99.99,
    latencyP99: 18,
    errorRate: 0.01,
    activeIncidents: 0,
    ownerTeam: 'Edge & Ingress Routing',
    dependencies: ['svc-api-gateway'],
    upstream: [],
    version: 'v4.18.2',
    cluster: 'eu-west1-ingress-prod',
    description: 'Cloudflare / Envoy edge boundary proxy handling SSL termination and rate limiting.'
  },
  {
    id: 'svc-api-gateway',
    name: 'api-gateway',
    displayName: 'Core API Gateway',
    category: 'Compute',
    tier: 'tier-1',
    health: 'healthy',
    uptime: 99.97,
    latencyP99: 34,
    errorRate: 0.04,
    activeIncidents: 0,
    ownerTeam: 'Core Platform Reliability',
    dependencies: ['svc-auth-core', 'svc-payment-orchestrator', 'svc-order-processing'],
    upstream: ['svc-edge-ingress'],
    version: 'v2.11.0',
    cluster: 'k8s-core-cluster-prod-1',
    description: 'Central Kong gateway orchestrating request authentication, routing, and header enrichment.'
  },
  {
    id: 'svc-auth-core',
    name: 'auth-core',
    displayName: 'Identity & JWT Token Service',
    category: 'Compute',
    tier: 'tier-1',
    health: 'healthy',
    uptime: 99.99,
    latencyP99: 22,
    errorRate: 0.02,
    activeIncidents: 0,
    ownerTeam: 'Security Engineering',
    dependencies: ['svc-redis-session', 'svc-aurora-db'],
    upstream: ['svc-api-gateway'],
    version: 'v3.5.1',
    cluster: 'k8s-sec-cluster-prod',
    description: 'OAuth2/OIDC token verification, session lifecycle, and cryptographic key rotation.'
  },
  {
    id: 'svc-payment-orchestrator',
    name: 'payment-orchestrator',
    displayName: 'Payment Orchestrator & Vault',
    category: 'Compute',
    tier: 'tier-1',
    health: 'critical',
    uptime: 98.42,
    latencyP99: 1420,
    errorRate: 4.86,
    activeIncidents: 1,
    ownerTeam: 'Payments & Settlement Infrastructure',
    dependencies: ['svc-stripe-connector', 'svc-aurora-db', 'svc-kafka-bus'],
    upstream: ['svc-api-gateway'],
    version: 'v2.41.4',
    cluster: 'k8s-pci-cluster-prod',
    description: 'PCI-DSS tier-1 payment state machine, tokenized card vault, and ledger dispatcher.'
  },
  {
    id: 'svc-stripe-connector',
    name: 'stripe-connector',
    displayName: 'Stripe Gateway Connector',
    category: 'Third-Party',
    tier: 'tier-1',
    health: 'degraded',
    uptime: 99.12,
    latencyP99: 890,
    errorRate: 2.14,
    activeIncidents: 1,
    ownerTeam: 'Payments & Settlement Infrastructure',
    dependencies: [],
    upstream: ['svc-payment-orchestrator'],
    version: 'v1.19.0',
    cluster: 'external-provider',
    description: 'Outbound webhook consumer and settlement dispatcher to Stripe and Adyen banking APIs.'
  },
  {
    id: 'svc-order-processing',
    name: 'order-processing',
    displayName: 'Order State Machine',
    category: 'Compute',
    tier: 'tier-1',
    health: 'degraded',
    uptime: 99.45,
    latencyP99: 210,
    errorRate: 1.15,
    activeIncidents: 1,
    ownerTeam: 'Commerce Core',
    dependencies: ['svc-inventory-service', 'svc-kafka-bus', 'svc-aurora-db'],
    upstream: ['svc-api-gateway'],
    version: 'v3.1.8',
    cluster: 'k8s-commerce-cluster-prod',
    description: 'Order lifecycle management, discount validation, and checkout finalization.'
  },
  {
    id: 'svc-inventory-service',
    name: 'inventory-service',
    displayName: 'Real-time Stock Inventory',
    category: 'Compute',
    tier: 'tier-2',
    health: 'healthy',
    uptime: 99.94,
    latencyP99: 45,
    errorRate: 0.05,
    activeIncidents: 0,
    ownerTeam: 'Logistics & Supply',
    dependencies: ['svc-redis-session', 'svc-warehouse-erp'],
    upstream: ['svc-order-processing'],
    version: 'v2.8.3',
    cluster: 'k8s-logistics-cluster-prod',
    description: 'High-speed Redis-backed reservation lock service for sku allocation during cart checkout.'
  },
  {
    id: 'svc-warehouse-erp',
    name: 'warehouse-erp',
    displayName: 'Warehouse Logistics ERP',
    category: 'Internal',
    tier: 'tier-3',
    health: 'healthy',
    uptime: 99.80,
    latencyP99: 160,
    errorRate: 0.12,
    activeIncidents: 0,
    ownerTeam: 'Fulfillment Systems',
    dependencies: ['svc-aurora-db'],
    upstream: ['svc-inventory-service'],
    version: 'v1.4.2',
    cluster: 'on-prem-vpn-bridge',
    description: 'Dispatch manifest synchronization with regional fulfillment centers.'
  },
  {
    id: 'svc-kafka-bus',
    name: 'kafka-bus',
    displayName: 'Kafka Event Backbone (Strimzi)',
    category: 'Messaging',
    tier: 'tier-1',
    health: 'healthy',
    uptime: 99.99,
    latencyP99: 12,
    errorRate: 0.00,
    activeIncidents: 0,
    ownerTeam: 'Data & Stream Processing',
    dependencies: ['svc-aurora-db'],
    upstream: ['svc-payment-orchestrator', 'svc-order-processing'],
    version: 'v3.6.0',
    cluster: 'kafka-cluster-prod-9node',
    description: 'Event log topic backbone processing 45,000 events/sec across order and audit partitions.'
  },
  {
    id: 'svc-redis-session',
    name: 'redis-session',
    displayName: 'Redis Enterprise Cache Cluster',
    category: 'Database',
    tier: 'tier-1',
    health: 'healthy',
    uptime: 99.995,
    latencyP99: 3,
    errorRate: 0.00,
    activeIncidents: 0,
    ownerTeam: 'Data & Stream Processing',
    dependencies: [],
    upstream: ['svc-auth-core', 'svc-inventory-service'],
    version: 'v7.2.4',
    cluster: 'redis-multi-az-cluster',
    description: 'In-memory distributed key-value store for session persistence and distributed locks.'
  },
  {
    id: 'svc-aurora-db',
    name: 'aurora-db',
    displayName: 'PostgreSQL Aurora Primary Cluster',
    category: 'Database',
    tier: 'tier-1',
    health: 'degraded',
    uptime: 99.78,
    latencyP99: 185,
    errorRate: 0.95,
    activeIncidents: 1,
    ownerTeam: 'Infrastructure Architecture',
    dependencies: [],
    upstream: ['svc-payment-orchestrator', 'svc-order-processing', 'svc-auth-core'],
    version: 'PostgreSQL 16.2',
    cluster: 'aws-rds-aurora-eu-west-1',
    description: 'Multi-AZ transactional relational database cluster with connection pooling via PgBouncer.'
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-8921',
    title: 'Payment Gateway Latency Surge & Transaction Drop Spike',
    description: 'P99 latency on /v1/checkout/capture spiked from 85ms to 1,420ms following release canary v2.41.4. PgBouncer pool exhaustion observed on postgres-aurora-primary.',
    severity: 'P1',
    status: 'investigating',
    affectedServiceId: 'svc-payment-orchestrator',
    affectedServiceName: 'Payment Orchestrator & Vault',
    assignedOwnerId: 'usr-2',
    assignedOwnerName: 'Marcus Vance',
    createdAt: '2026-10-27T09:12:00Z',
    updatedAt: '2026-10-27T10:28:00Z',
    slaDeadline: '2026-10-27T11:12:00Z',
    slaBreached: false,
    impactSummary: 'Approximately 4.8% of EU-West checkout captures failing with HTTP 504 Gateway Timeout. Estimated revenue affected: $42,500/hr.',
    customerImpactPercent: 4.8,
    rootCauseSummary: 'Preliminary hypothesis: Unindexed foreign key constraint check added in migration 20261027_01 causing sequential table scans on settlement_transactions under concurrency > 800 rps.',
    evidence: [
      {
        id: 'ev-1',
        incidentId: 'INC-8921',
        type: 'log_snippet',
        title: 'PgBouncer connection pool maxed out (500/500 client connections)',
        source: 'Datadog Log Pipeline (payment-orchestrator-pod-6xb9)',
        timestamp: '2026-10-27T09:14:22Z',
        payload: 'ERROR [db-pool] pool_acquire_timeout: timeout=5000ms server_connections=500 waiting_clients=248 query="SELECT * FROM settlement_transactions WHERE idempotency_key = $1 FOR UPDATE"',
        verified: true,
      },
      {
        id: 'ev-2',
        incidentId: 'INC-8921',
        type: 'metric_anomaly',
        title: 'P99 Latency Divergence: payment-orchestrator',
        source: 'Prometheus AlertManager',
        timestamp: '2026-10-27T09:15:00Z',
        payload: 'metric: http_request_duration_seconds{quantile="0.99", service="payment-orchestrator"} threshold=250ms current=1420ms deviation=+468%',
        verified: true,
      },
      {
        id: 'ev-3',
        incidentId: 'INC-8921',
        type: 'deployment_diff',
        title: 'Release Canary Deployment: v2.41.4 deployed 8 mins prior to alert',
        source: 'GitHub Actions Release Pipeline',
        timestamp: '2026-10-27T09:04:11Z',
        payload: 'commit: sha256:7f4c01d9 "feat(settlement): add mandatory regulatory audit trail cross-table lock"\nfiles_changed: migrations/20261027_01_regulatory_audit.sql, src/services/settlement.ts',
        verified: true,
      }
    ],
    timeline: [
      {
        id: 'tl-1',
        timestamp: '2026-10-27T09:04:11Z',
        author: 'GitHub CI/CD Automation',
        type: 'action_taken',
        title: 'Canary Deployment v2.41.4 dispatched',
        description: 'Automated 15% canary deployed to pod cluster eu-west1-pci-prod.'
      },
      {
        id: 'tl-2',
        timestamp: '2026-10-27T09:12:00Z',
        author: 'Prometheus AlertManager',
        type: 'alert_fired',
        title: 'Alert Fired: PaymentLatencyP99ExceededSLA',
        description: 'SLO breach condition met: Latency > 500ms for consecutive 3 evaluation windows.'
      },
      {
        id: 'tl-3',
        timestamp: '2026-10-27T09:15:40Z',
        author: 'Elena Rostova',
        type: 'status_change',
        title: 'Incident Declared P1 Critical',
        description: 'Assigned Marcus Vance as primary lead. Incident war room bridged.'
      },
      {
        id: 'tl-4',
        timestamp: '2026-10-27T09:28:15Z',
        author: 'Marcus Vance',
        type: 'evidence_added',
        title: 'Correlated PgBouncer connection starvation log to canary deploy',
        description: 'Identified unindexed SELECT FOR UPDATE query originating from v2.41.4 regulatory audit migration.'
      }
    ],
    tags: ['Payments', 'PgBouncer', 'DatabaseLock', 'EU-West', 'Canary']
  },
  {
    id: 'INC-8914',
    title: 'Order Processing Kafka Consumer Lag Accumulation',
    description: 'Partition 4 and 7 consumer lag on topic commerce.orders.finalized exceeded 12,000 messages. Downstream fulfillment dispatch delayed by 18 minutes.',
    severity: 'P2',
    status: 'identified',
    affectedServiceId: 'svc-order-processing',
    affectedServiceName: 'Order State Machine',
    assignedOwnerId: 'usr-4',
    assignedOwnerName: 'Devon Miller',
    createdAt: '2026-10-27T08:30:00Z',
    updatedAt: '2026-10-27T10:15:00Z',
    slaDeadline: '2026-10-27T12:30:00Z',
    slaBreached: false,
    impactSummary: 'Order status webhooks delayed for e-commerce store checkouts. No data loss observed.',
    customerImpactPercent: 1.2,
    rootCauseSummary: 'Deadlock on inventory allocation table caused worker threads to hang for 45s before socket timeout.',
    evidence: [
      {
        id: 'ev-4',
        incidentId: 'INC-8914',
        type: 'alert_payload',
        title: 'KafkaConsumerLagHigh: commerce.orders.finalized',
        source: 'Strimzi Kafka Exporter',
        timestamp: '2026-10-27T08:30:14Z',
        payload: 'lag_records=12840 consumer_group=order-fulfillment-cg threshold=5000',
        verified: true,
      }
    ],
    timeline: [
      {
        id: 'tl-5',
        timestamp: '2026-10-27T08:30:00Z',
        author: 'System Monitor',
        type: 'alert_fired',
        title: 'High Consumer Lag Alert Fired',
        description: 'Consumer lag threshold breached on Kafka cluster.'
      },
      {
        id: 'tl-6',
        timestamp: '2026-10-27T09:40:00Z',
        author: 'Devon Miller',
        type: 'action_taken',
        title: 'Scaled consumer replicas from 4 to 12',
        description: 'Additional consumer instances spun up; lag is draining at 1,200 msg/min.'
      }
    ],
    tags: ['Kafka', 'Orders', 'Throughput']
  },
  {
    id: 'INC-8890',
    title: 'Auth Token Revocation Cache Sync Disparity',
    description: 'Redis cluster failover in us-east-2 led to an un-replicated window of 14 revocation entries, temporarily validating revoked tokens.',
    severity: 'P2',
    status: 'mitigating',
    affectedServiceId: 'svc-auth-core',
    affectedServiceName: 'Identity & JWT Token Service',
    assignedOwnerId: 'usr-3',
    assignedOwnerName: 'Dr. Sarah Chen',
    createdAt: '2026-10-26T21:45:00Z',
    updatedAt: '2026-10-27T09:50:00Z',
    slaDeadline: '2026-10-27T09:45:00Z',
    slaBreached: true,
    impactSummary: 'Scope isolated to 14 administrative sessions; all 14 tokens forced to full re-authentication.',
    customerImpactPercent: 0.05,
    rootCauseSummary: 'Asynchronous cross-region replication lag during automatic Sentinel failover.',
    evidence: [],
    timeline: [],
    tags: ['Auth', 'Security', 'Redis', 'Failover']
  },
  {
    id: 'INC-8842',
    title: 'Warehouse Inventory Webhook Retry Exhaustion',
    description: 'Regional ERP maintenance window returned 503 HTTP for 40 minutes, exhausting standard retry backoff queues.',
    severity: 'P3',
    status: 'resolved',
    affectedServiceId: 'svc-warehouse-erp',
    affectedServiceName: 'Warehouse Logistics ERP',
    assignedOwnerId: 'usr-1',
    assignedOwnerName: 'Elena Rostova',
    createdAt: '2026-10-26T14:10:00Z',
    updatedAt: '2026-10-26T18:20:00Z',
    resolvedAt: '2026-10-26T18:20:00Z',
    slaDeadline: '2026-10-26T22:10:00Z',
    slaBreached: false,
    impactSummary: 'Delayed manifest generation by 40 minutes; all items successfully dispatched.',
    customerImpactPercent: 0.0,
    rootCauseSummary: 'Scheduled upstream ERP maintenance without prior notification to ops calendar.',
    evidence: [],
    timeline: [],
    tags: ['Fulfillment', 'Webhooks', 'Resolved']
  },
  {
    id: 'INC-8819',
    title: 'Stripe Settlement Webhook TLS Certificate Handshake Flap',
    description: 'Intermittent TLS handshake dropouts on external egress NAT gateway during certificate authority bundle refresh.',
    severity: 'P3',
    status: 'resolved',
    affectedServiceId: 'svc-stripe-connector',
    affectedServiceName: 'Stripe Gateway Connector',
    assignedOwnerId: 'usr-2',
    assignedOwnerName: 'Marcus Vance',
    createdAt: '2026-10-25T11:00:00Z',
    updatedAt: '2026-10-25T13:45:00Z',
    resolvedAt: '2026-10-25T13:45:00Z',
    slaDeadline: '2026-10-25T19:00:00Z',
    slaBreached: false,
    impactSummary: '35 payment confirmations requeued in dead-letter topic; 100% replayed.',
    customerImpactPercent: 0.1,
    rootCauseSummary: 'Outdated intermediate cert bundle on legacy egress proxy pool.',
    evidence: [],
    timeline: [],
    tags: ['Stripe', 'TLS', 'Resolved']
  }
];

export const INITIAL_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'wf-auto-p1-triage',
    name: 'P1 Critical Incident Automated Triage & Isolation',
    description: 'Automatically provisions incident bridge, halts active canary deployments, takes thread dumps, and alerts executive on-call.',
    enabled: true,
    triggerEvent: 'incident.created.p1',
    serviceScope: ['payment-orchestrator', 'auth-core', 'api-gateway'],
    lastRunAt: '2026-10-27T09:12:15Z',
    lastRunStatus: 'success',
    executionCount: 42,
    nodes: [
      {
        id: 'node-1',
        type: 'custom',
        position: { x: 50, y: 150 },
        data: {
          label: 'Trigger: P1 Incident Created',
          nodeType: 'trigger',
          description: 'Fires when any incident is declared with severity P1',
          config: { filterSeverity: 'P1', requireAffectedService: true },
          status: 'success'
        }
      },
      {
        id: 'node-2',
        type: 'custom',
        position: { x: 340, y: 150 },
        data: {
          label: 'Condition: Service Tier == Tier-1',
          nodeType: 'condition',
          description: 'Evaluates if affected service is mission critical',
          config: { operator: 'equals', field: 'tier', value: 'tier-1' },
          status: 'success'
        }
      },
      {
        id: 'node-3',
        type: 'custom',
        position: { x: 630, y: 60 },
        data: {
          label: 'Action: Freeze Active Canaries',
          nodeType: 'action',
          description: 'Sends rollback signal to Kubernetes ArgoCD rollout',
          config: { targetCluster: 'prod', action: 'abort_canary', timeoutSec: 30 },
          status: 'success'
        }
      },
      {
        id: 'node-4',
        type: 'custom',
        position: { x: 630, y: 240 },
        data: {
          label: 'Action: Provision War Room & Slack Channel',
          nodeType: 'action',
          description: 'Creates dedicated #incident-xxx channel and invites on-call engineers',
          config: { slackWorkspace: 'nexusops-eng', prefix: 'incident-' },
          status: 'success'
        }
      },
      {
        id: 'node-5',
        type: 'custom',
        position: { x: 920, y: 150 },
        data: {
          label: 'Approval: Route Traffic to Secondary Gateway',
          nodeType: 'approval',
          description: 'Requires Incident Commander confirmation before applying global traffic reroute',
          config: { roleRequired: 'Incident Commander', timeoutMinutes: 10 },
          status: 'waiting_approval'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true },
      { id: 'e2-3', source: 'node-2', target: 'node-3', label: 'Match' },
      { id: 'e2-4', source: 'node-2', target: 'node-4', label: 'Match' },
      { id: 'e3-5', source: 'node-3', target: 'node-5' },
      { id: 'e4-5', source: 'node-4', target: 'node-5' }
    ],
    createdAt: '2026-08-15T12:00:00Z',
    updatedAt: '2026-10-20T14:30:00Z'
  },
  {
    id: 'wf-db-pool-saturation',
    name: 'Database Connection Pool Auto-Shedder',
    description: 'Detects PgBouncer pool utilization exceeding 92% and dynamically enables aggressive client keepalive throttling and read replica redirection.',
    enabled: true,
    triggerEvent: 'metric.threshold.pgbouncer_saturation',
    serviceScope: ['aurora-db', 'payment-orchestrator'],
    lastRunAt: '2026-10-27T09:20:00Z',
    lastRunStatus: 'success',
    executionCount: 19,
    nodes: [
      {
        id: 'node-db-1',
        type: 'custom',
        position: { x: 50, y: 150 },
        data: {
          label: 'Trigger: Pool Saturation > 90%',
          nodeType: 'trigger',
          description: 'Fires when connection pool reaches 90% threshold for > 60s',
          config: { metric: 'pgbouncer.pool_used_pct', threshold: 90 },
          status: 'success'
        }
      },
      {
        id: 'node-db-2',
        type: 'custom',
        position: { x: 350, y: 150 },
        data: {
          label: 'Action: Scale Read Replicas +2',
          nodeType: 'action',
          description: 'Triggers AWS RDS Aurora Auto-Scaling policy',
          config: { minReplicas: 4, maxReplicas: 8 },
          status: 'success'
        }
      },
      {
        id: 'node-db-3',
        type: 'custom',
        position: { x: 650, y: 150 },
        data: {
          label: 'Action: Divert Read-Only Queries',
          nodeType: 'action',
          description: 'Updates DNS endpoint for non-transactional reporting traffic',
          config: { endpoint: 'aurora-read-nlb.internal' },
          status: 'idle'
        }
      }
    ],
    edges: [
      { id: 'edb-1-2', source: 'node-db-1', target: 'node-db-2', animated: true },
      { id: 'edb-2-3', source: 'node-db-2', target: 'node-db-3' }
    ],
    createdAt: '2026-09-02T10:00:00Z',
    updatedAt: '2026-10-24T16:00:00Z'
  },
  {
    id: 'wf-sla-risk-escalator',
    name: 'SLA Breach Proximity Escalation Protocol',
    description: 'Triggered when an open P1 or P2 incident has under 20% remaining time until SLA breach with unresolved mitigation status.',
    enabled: false,
    triggerEvent: 'incident.sla.breach_warning',
    serviceScope: ['all'],
    executionCount: 8,
    nodes: [
      {
        id: 'node-sla-1',
        type: 'custom',
        position: { x: 50, y: 150 },
        data: {
          label: 'Trigger: Time to Breach < 15m',
          nodeType: 'trigger',
          description: 'Monitors open incidents with approaching SLA expiration',
          config: { minutesRemaining: 15 },
          status: 'idle'
        }
      },
      {
        id: 'node-sla-2',
        type: 'custom',
        position: { x: 350, y: 150 },
        data: {
          label: 'Action: Page Secondary On-Call Lead',
          nodeType: 'action',
          description: 'Pings PagerDuty high-urgency escalation policy',
          config: { escalationLevel: 2 },
          status: 'idle'
        }
      }
    ],
    edges: [
      { id: 'esla-1-2', source: 'node-sla-1', target: 'node-sla-2' }
    ],
    createdAt: '2026-09-18T08:00:00Z',
    updatedAt: '2026-10-12T11:00:00Z'
  }
];

export const INITIAL_PIRS: PostIncidentReview[] = [
  {
    id: 'PIR-2026-04',
    incidentId: 'INC-8819',
    incidentTitle: 'Stripe Settlement Webhook TLS Certificate Handshake Flap',
    date: '2026-10-25',
    leadAuthor: 'Marcus Vance',
    executiveSummary: 'On October 25, 2026, outbound settlement webhooks experienced intermittent TLS handshake failures following an automated CA bundle update on egress proxy pool eu-west-1. 35 payment notifications were delayed by up to 2 hours before dead-letter queues were replayed.',
    durationMinutes: 165,
    downtimeMinutes: 0,
    impactScore: 'Moderate',
    timeline: [
      { time: '11:00 UTC', event: 'Automated certificate authority bundle update applied to proxy nodes.' },
      { time: '11:15 UTC', event: 'Stripe connector logs register SSLHandshakeException on egress interface.' },
      { time: '11:42 UTC', event: 'Alert fired on webhook retry exhaustion.' },
      { time: '12:20 UTC', event: 'Egress proxy rolled back to previous trusted CA bundle.' },
      { time: '13:45 UTC', event: 'Dead-letter consumer queue drained with 0 dropped transactions.' }
    ],
    fiveWhys: [
      'Why did payments fail? Outbound webhooks to Stripe timed out during SSL handshake.',
      'Why did SSL handshake fail? The egress proxy rejected the intermediate cert chain presented by Stripe API.',
      'Why was it rejected? The proxy had ingested a pruned CA bundle that lacked the cross-signed root.',
      'Why was the CA bundle pruned? An automated script purged certificates older than 5 years without checking cross-signature anchors.',
      'Why was this not caught in staging? Staging environments use mock gateway endpoints with self-signed test certificates rather than live public root hierarchies.'
    ],
    whatWentWell: [
      'Dead-letter queue design prevented any permanent transaction loss.',
      'Alerting fired within 2 minutes of error rate exceeding 1% threshold.'
    ],
    whatWentWrong: [
      'Staging test suite did not validate live public CA trust chains.',
      'Egress proxy logs lacked clear reason code for the failed handshake until debug flag was enabled.'
    ],
    whereWeGotLucky: [
      'The failure occurred outside peak European checkout volume hours (11:00 UTC vs 19:00 UTC).'
    ],
    actionItems: [
      {
        id: 'act-1',
        description: 'Update staging environment to validate against live public CA trust chains via canary probe',
        owner: 'Devon Miller',
        priority: 'P1',
        status: 'Completed',
        dueDate: '2026-10-26'
      },
      {
        id: 'act-2',
        description: 'Add automated pre-validation linting for egress CA bundle deployment scripts',
        owner: 'Dr. Sarah Chen',
        priority: 'P2',
        status: 'In Progress',
        dueDate: '2026-11-05'
      }
    ]
  },
  {
    id: 'PIR-2026-03',
    incidentId: 'INC-8842',
    incidentTitle: 'Warehouse Inventory Webhook Retry Exhaustion',
    date: '2026-10-26',
    leadAuthor: 'Elena Rostova',
    executiveSummary: 'Upstream vendor ERP conducted an unscheduled 40-minute maintenance shutdown without notifying our operations team. Exponential backoff retry limits were reached, dropping 120 stock synchronizations into manual review.',
    durationMinutes: 250,
    downtimeMinutes: 0,
    impactScore: 'Moderate',
    timeline: [
      { time: '14:10 UTC', event: 'ERP gateway begins responding with HTTP 503 Service Unavailable.' },
      { time: '15:00 UTC', event: 'Retry budget exhausted; incident declared.' },
      { time: '17:30 UTC', event: 'ERP service restored; automated replay script deployed.' },
      { time: '18:20 UTC', event: 'Incident closed after all 120 syncs reconciled.' }
    ],
    fiveWhys: [
      'Why were manifests delayed? Webhook requests to the warehouse ERP failed with 503.',
      'Why did ERP return 503? Upstream provider was performing database migration.',
      'Why was this unknown? Vendor maintenance alerts were routed to an unmonitored legacy mailbox.',
      'Why did backoff fail? Maximum retry count was capped at 5 attempts over 30 minutes.',
      'Why cap at 30 minutes? Assumed brief network glitches rather than extended vendor outages.'
    ],
    whatWentWell: [
      'Manual replay tool worked reliably with zero duplicate dispatches.'
    ],
    whatWentWrong: [
      'Vendor alert email had sat unread in an orphaned distribution group for 3 days.'
    ],
    whereWeGotLucky: [
      'Warehouse staff was on lunch shift break so dispatch floor was not halted.'
    ],
    actionItems: [
      {
        id: 'act-3',
        description: 'Audit and consolidate all 3rd-party vendor notification email addresses to SRE pager queue',
        owner: 'Elena Rostova',
        priority: 'P2',
        status: 'Completed',
        dueDate: '2026-10-27'
      },
      {
        id: 'act-4',
        description: 'Extend retry queue maximum backoff window to 6 hours for non-realtime batch operations',
        owner: 'Marcus Vance',
        priority: 'P3',
        status: 'Open',
        dueDate: '2026-11-12'
      }
    ]
  }
];

export const INITIAL_INTEGRATIONS: IntegrationConnector[] = [
  {
    id: 'int-aws',
    name: 'Amazon Web Services (AWS)',
    category: 'Cloud Provider',
    status: 'connected',
    lastSyncAt: 'Just now',
    eventsProcessed24h: 842100,
    endpointUrl: 'arn:aws:iam::534305809712:role/nexusops-telemetry-role',
    description: 'Telemetry ingest for Amazon RDS Aurora, CloudWatch, ELB Ingress, and S3 archives.'
  },
  {
    id: 'int-datadog',
    name: 'Datadog APM & Logs',
    category: 'Observability',
    status: 'connected',
    lastSyncAt: '12 seconds ago',
    eventsProcessed24h: 3410290,
    endpointUrl: 'https://api.datadoghq.eu/v2/logs/events',
    description: 'APM distributed traces, service maps, and anomaly detection feeds.'
  },
  {
    id: 'int-kubernetes',
    name: 'Kubernetes Production Clusters',
    category: 'Cloud Provider',
    status: 'connected',
    lastSyncAt: '1 minute ago',
    eventsProcessed24h: 198300,
    endpointUrl: 'https://k8s-api.prod.nexusops.internal:6443',
    description: 'Real-time pod lifecycle, ArgoCD sync status, and deployment replica telemetry.'
  },
  {
    id: 'int-pagerduty',
    name: 'PagerDuty On-Call Orchestrator',
    category: 'Alerting',
    status: 'connected',
    lastSyncAt: '3 minutes ago',
    eventsProcessed24h: 421,
    endpointUrl: 'https://events.pagerduty.com/v2/enqueue',
    description: 'Bidirectional sync for high-urgency incident triggering, escalation, and acknowledgment.'
  },
  {
    id: 'int-slack',
    name: 'Slack Enterprise Grid',
    category: 'Alerting',
    status: 'connected',
    lastSyncAt: '40 seconds ago',
    eventsProcessed24h: 14890,
    endpointUrl: 'https://hooks.slack.com/services/T01/B02/xyz123',
    description: 'Automated war room channel provisioning and incident status broadcasts.'
  },
  {
    id: 'int-github',
    name: 'GitHub Enterprise CI/CD',
    category: 'VCS',
    status: 'connected',
    lastSyncAt: '2 minutes ago',
    eventsProcessed24h: 1240,
    endpointUrl: 'https://api.github.com/repos/nexusops-enterprise',
    description: 'Commit correlation, deployment releases, and automated pull request rollback tracking.'
  },
  {
    id: 'int-flask-pg',
    name: 'NexusOps Core Flask REST & PostgreSQL API',
    category: 'Database',
    status: 'connected',
    lastSyncAt: 'Live',
    eventsProcessed24h: 92830,
    endpointUrl: 'http://localhost:5000/api/v1 (Flask REST Engine)',
    description: 'Persistent relational database backend schema driver and deterministic workflow execution engine.'
  }
];

export const INITIAL_NOTIFICATIONS: AuditNotification[] = [
  {
    id: 'notif-1',
    title: 'P1 Incident INC-8921 Declared',
    message: 'Payment Orchestrator latency spike > 1,400ms. Marcus Vance assigned as Incident Commander.',
    severity: 'critical',
    category: 'incident',
    timestamp: '2026-10-27T09:12:00Z',
    read: false,
    link: '/incidents/INC-8921'
  },
  {
    id: 'notif-2',
    title: 'Automated Workflow Executed',
    message: 'P1 Critical Incident Automated Triage & Isolation ran successfully for INC-8921.',
    severity: 'info',
    category: 'workflow',
    timestamp: '2026-10-27T09:12:15Z',
    read: false,
    link: '/workflows'
  },
  {
    id: 'notif-3',
    title: 'PgBouncer Connection Exhaustion Warning',
    message: 'Database connection pool reached 96% utilization on postgres-aurora-primary.',
    severity: 'warning',
    category: 'service',
    timestamp: '2026-10-27T09:14:22Z',
    read: false,
    link: '/services'
  },
  {
    id: 'notif-4',
    title: 'Canary Deployment Abort Signal Dispatched',
    message: 'Canary rollout for v2.41.4 was halted by automated triage policy.',
    severity: 'info',
    category: 'deployment',
    timestamp: '2026-10-27T09:16:00Z',
    read: true,
    link: '/topology'
  },
  {
    id: 'notif-5',
    title: 'SLA Risk Alert: INC-8890 Breached',
    message: 'Incident INC-8890 breached SLA response deadline by 5 minutes.',
    severity: 'warning',
    category: 'incident',
    timestamp: '2026-10-27T09:45:00Z',
    read: true,
    link: '/incidents/INC-8890'
  }
];

export const DEFAULT_SCENARIO_PARAMETERS: ScenarioParameter[] = [
  {
    id: 'param-traffic-surge',
    name: 'Peak Traffic Multiplier',
    description: 'Simulates sudden concurrent user transaction volume spikes over regular baseline load.',
    unit: 'x multiplier',
    minValue: 1.0,
    maxValue: 5.0,
    step: 0.1,
    currentValue: 2.2,
    defaultValue: 1.0
  },
  {
    id: 'param-db-latency',
    name: 'Database Failover Delay',
    description: 'Simulated time required for Aurora cross-region replica promotion under split-brain avoidance.',
    unit: 'seconds',
    minValue: 10,
    maxValue: 300,
    step: 5,
    currentValue: 65,
    defaultValue: 25
  },
  {
    id: 'param-stripe-degradation',
    name: 'External Gateway Latency',
    description: 'Upstream banking / payment provider round-trip network response latency.',
    unit: 'ms',
    minValue: 100,
    maxValue: 2500,
    step: 50,
    currentValue: 850,
    defaultValue: 150
  },
  {
    id: 'param-oncall-readiness',
    name: 'Staff On-Call Concurrency',
    description: 'Available certified Incident Commanders and SRE responders active on primary rotation.',
    unit: 'responders',
    minValue: 1,
    maxValue: 10,
    step: 1,
    currentValue: 3,
    defaultValue: 4
  }
];
