import { Incident, IncidentEvidence } from '../types';

export interface AIAnalysisResult {
  incidentId: string;
  generatedAt: string;
  executiveBrief: string;
  confirmedFacts: {
    id: string;
    statement: string;
    evidenceSource: string;
  }[];
  hypotheses: {
    id: string;
    rank: number;
    title: string;
    probabilityScore: number; // e.g. 92%
    rationale: string;
    supportingEvidence: string[];
    falsificationCriteria: string;
  }[];
  mitigationSteps: {
    step: number;
    action: string;
    commandOrWorkflow: string;
    expectedImpact: string;
    riskLevel: 'Low' | 'Medium' | 'High';
  }[];
  blastRadiusAssessment: {
    directlyAffected: string[];
    upstreamAtRisk: string[];
    downstreamExposed: string[];
    estimatedCustomerImpact: string;
  };
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  content: string;
  evidenceCitations?: string[];
  suggestedFollowUps?: string[];
  factsVsHypothesisBreakdown?: {
    verifiedFacts: string[];
    hypotheses: string[];
  };
}

export class NexusAIService {
  // Synthesize evidence-grounded incident analysis
  async analyzeIncident(incident: Incident): Promise<AIAnalysisResult> {
    // Simulate brief processing latency
    await new Promise((res) => setTimeout(res, 400));

    const evidenceTitles = incident.evidence.map((e) => `[${e.source}] ${e.title}`);

    if (incident.id === 'INC-8921') {
      return {
        incidentId: incident.id,
        generatedAt: new Date().toISOString(),
        executiveBrief:
          'P1 critical degradation detected in Payment Orchestrator & Vault. P99 response time has surged to 1,420ms (+468% above SLA baseline), driving a 4.8% capture failure rate. Correlation confirms root cause began 8 minutes post-canary deployment v2.41.4, exhausting PgBouncer connection pools via unindexed table locks.',
        confirmedFacts: [
          {
            id: 'fact-1',
            statement: 'Canary v2.41.4 deployed at 09:04:11Z introducing migration 20261027_01_regulatory_audit.sql.',
            evidenceSource: 'GitHub Actions Release Pipeline (sha256:7f4c01d9)'
          },
          {
            id: 'fact-2',
            statement: 'PgBouncer connection pool reached 500/500 connection limit with 248 queued waiting clients.',
            evidenceSource: 'Datadog Log Pipeline (payment-orchestrator-pod-6xb9)'
          },
          {
            id: 'fact-3',
            statement: 'P99 HTTP request duration breached the 250ms SLA, measuring 1,420ms on /v1/checkout/capture.',
            evidenceSource: 'Prometheus AlertManager'
          }
        ],
        hypotheses: [
          {
            id: 'hyp-1',
            rank: 1,
            title: 'Unindexed Exclusive Row Lock in Regulatory Migration',
            probabilityScore: 94,
            rationale:
              'The new query "SELECT * FROM settlement_transactions WHERE idempotency_key = $1 FOR UPDATE" lacks an index on idempotency_key, forcing full sequential table scans that hold row locks across concurrent checkout requests.',
            supportingEvidence: [
              'Datadog PgBouncer log snippet indicating 248 waiting client connections',
              'Git diff showing new migration adding idempotency constraint verification'
            ],
            falsificationCriteria:
              'Check `pg_stat_activity` for active query strings and `pg_locks` for granted=false states.'
          },
          {
            id: 'hyp-2',
            rank: 2,
            title: 'Stripe Connector Egress Socket Hang',
            probabilityScore: 28,
            rationale:
              'Outbound TCP connections to Stripe may be backing up due to TLS keep-alive misconfiguration, keeping parent worker threads in payment-orchestrator blocked.',
            supportingEvidence: ['Stripe connector reported 890ms p99 latency in topology'],
            falsificationCriteria:
              'Compare outbound HTTP client timeout metrics vs database acquire timeout metrics.'
          }
        ],
        mitigationSteps: [
          {
            step: 1,
            action: 'Execute Canary Rollback via Automated Workflow',
            commandOrWorkflow: 'Runbook: wf-auto-p1-triage -> Rollback v2.41.4 to v2.41.3',
            expectedImpact: 'Immediately stops traffic from routing to problematic code path',
            riskLevel: 'Low'
          },
          {
            step: 2,
            action: 'Flush PgBouncer Idle Transaction Pool',
            commandOrWorkflow: 'RELOAD / PAUSE settlement_pool; RESUME settlement_pool;',
            expectedImpact: 'Releases 248 hanging connection descriptors to unblock throughput',
            riskLevel: 'Medium'
          },
          {
            step: 3,
            action: 'Deploy Concurrent Index hotfix',
            commandOrWorkflow: 'CREATE INDEX CONCURRENTLY idx_settlement_idempotency ON settlement_transactions(idempotency_key);',
            expectedImpact: 'Permits re-introduction of regulatory audit check with O(1) B-tree lookup',
            riskLevel: 'Low'
          }
        ],
        blastRadiusAssessment: {
          directlyAffected: ['Payment Orchestrator & Vault (Critical)', 'Core API Gateway (Degraded)'],
          upstreamAtRisk: ['Global Edge Ingress & CDN (504 surge on EU-West routes)'],
          downstreamExposed: ['Stripe Gateway Connector', 'Order State Machine', 'PostgreSQL Aurora Primary'],
          estimatedCustomerImpact: '4.8% of active European checkout carts; ~$42,500/hr gross merchandise volume at risk.'
        }
      };
    }

    // Generic synthesis for other incidents
    return {
      incidentId: incident.id,
      generatedAt: new Date().toISOString(),
      executiveBrief: `Operational investigation for ${incident.id} (${incident.title}). Impacting service ${incident.affectedServiceName} with severity ${incident.severity}.`,
      confirmedFacts: [
        {
          id: 'fact-gen-1',
          statement: `Incident logged at ${incident.createdAt} under severity ${incident.severity}.`,
          evidenceSource: 'NexusOps System Core'
        },
        ...incident.evidence.map((e, i) => ({
          id: `fact-ev-${i}`,
          statement: e.title,
          evidenceSource: e.source
        }))
      ],
      hypotheses: [
        {
          id: 'hyp-gen-1',
          rank: 1,
          title: `Primary failure mode in ${incident.affectedServiceName}`,
          probabilityScore: 82,
          rationale: incident.rootCauseSummary || 'Correlated anomaly observed across service telemetry logs.',
          supportingEvidence: evidenceTitles.length ? evidenceTitles : ['Baseline SLO deviation alarm'],
          falsificationCriteria: 'Review telemetry timeseries 15 minutes before and after incident timestamp.'
        }
      ],
      mitigationSteps: [
        {
          step: 1,
          action: 'Acknowledge incident and assign secondary investigation lead',
          commandOrWorkflow: 'NexusOps Commander CLI: incident assign --tier1',
          expectedImpact: 'Mobilizes dedicated response team',
          riskLevel: 'Low'
        },
        {
          step: 2,
          action: 'Isolate upstream traffic if error rate exceeds 5%',
          commandOrWorkflow: 'Envoy circuit-breaker toggle',
          expectedImpact: 'Prevents cascading degradation to downstream consumers',
          riskLevel: 'Medium'
        }
      ],
      blastRadiusAssessment: {
        directlyAffected: [incident.affectedServiceName],
        upstreamAtRisk: ['Core API Gateway'],
        downstreamExposed: ['Kafka Event Backbone'],
        estimatedCustomerImpact: `${incident.customerImpactPercent}% of active sessions.`
      }
    };
  }

  // Conversational Ops Assistant
  async askOperationsCopilot(question: string, context?: { incident?: Incident }): Promise<AIChatMessage> {
    await new Promise((res) => setTimeout(res, 350));
    const qLower = question.toLowerCase();

    if (qLower.includes('root cause') || qLower.includes('why') || qLower.includes('cause')) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        content:
          'Based on correlated telemetry and deployment logs, the primary root cause for current P1 incident **INC-8921** is **database connection pool starvation** on `postgres-aurora-primary` triggered by **canary deployment v2.41.4**.\n\nMigration `20261027_01_regulatory_audit.sql` introduced a `SELECT ... FOR UPDATE` query lacking an index on `idempotency_key`. Under high checkout concurrency (>800 rps), this resulted in full sequential table scans and pool queue buildup (248 waiting connections).',
        evidenceCitations: [
          'Datadog Log: PgBouncer pool_acquire_timeout (500/500 connections)',
          'GitHub Release Diff: Canary commit 7f4c01d9 deployed 8m prior',
          'Prometheus Alert: Latency quantile 0.99 spiked to 1,420ms'
        ],
        factsVsHypothesisBreakdown: {
          verifiedFacts: [
            'Canary v2.41.4 was rolled out 8 minutes before latency spiked.',
            'PgBouncer active connection pool was 100% saturated (500/500).',
            '4.8% of EU-West checkout capture requests are failing with 504 timeouts.'
          ],
          hypotheses: [
            'Absence of index on idempotency_key is the 94% probable cause of table lock latency.',
            'Stripe API network latency may be contributing a secondary 200ms delay.'
          ]
        },
        suggestedFollowUps: [
          'Can we execute a rollback of v2.41.4 immediately?',
          'What is the blast radius on order processing?',
          'Draft an executive briefing for stakeholders'
        ]
      };
    }

    if (qLower.includes('blast radius') || qLower.includes('impact') || qLower.includes('who is affected')) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        content:
          '### Blast Radius Assessment\n\n' +
          '- **Directly Impacted:** `Payment Orchestrator & Vault` (Critical, Error Rate: 4.86%, P99: 1420ms).\n' +
          '- **Degraded Dependencies:** `Order State Machine` (consumer lag climbing) and `Stripe Gateway Connector`.\n' +
          '- **Upstream Ingress:** `Core API Gateway` is returning 504 Gateway Timeouts on EU-West routes.\n' +
          '- **Financial Exposure:** Estimated at **$42,500 / hour** in delayed capture volume.\n' +
          '- **SLA Risk:** Incident INC-8921 has 44 minutes remaining before contract SLA breach.',
        evidenceCitations: [
          'Service Topology Node: svc-payment-orchestrator',
          'Order Processing Lag Metric: 12,840 records queued on Kafka topic'
        ],
        suggestedFollowUps: [
          'Show recommended mitigation steps',
          'Trigger failover to secondary payment gateway'
        ]
      };
    }

    if (qLower.includes('sla') || qLower.includes('risk') || qLower.includes('breach')) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        content:
          '### SLA & Error Budget Status\n\n' +
          '- **INC-8921 (P1):** SLA Deadline is **11:12 UTC**. Current time margin is **44 minutes**. Status: *Investigating*.\n' +
          '- **INC-8890 (P2):** **Breached** by 5 minutes due to cross-region Redis cache sync disparity. Mitigation in progress.\n' +
          '- **30-Day Platform SLA:** Currently standing at **99.94%** (Target: 99.95%). Error budget remaining: **14.2%**.',
        evidenceCitations: ['NexusOps SLA Registry', 'Service Health Metric Store'],
        suggestedFollowUps: [
          'Which services have highest MTTR this month?',
          'How can we prevent SLA breach on INC-8921?'
        ]
      };
    }

    if (qLower.includes('postmortem') || qLower.includes('pir') || qLower.includes('report') || qLower.includes('draft')) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        content:
          '### Post-Incident Review Draft Generated\n\n' +
          '**Title:** PIR-2026-05: Payment Orchestrator Latency & PgBouncer Starvation\n\n' +
          '**Executive Summary:** At 09:12 UTC, automated monitors detected a P99 latency spike to 1,420ms on checkout captures following release canary v2.41.4. The incident was isolated via automated canary halt workflow.\n\n' +
          '**Root Cause (5 Whys Preview):**\n' +
          '1. Why did captures time out? Postgres query took >5000ms.\n' +
          '2. Why did query take >5000ms? Exclusive row lock held by unindexed idempotency check.\n' +
          '3. Why was it unindexed? Migration script omitted `CREATE INDEX`.\n' +
          '4. Why was this missed? Staging test dataset contained only 500 rows, obscuring table-scan cost.\n' +
          '5. Action: Enforce query planner plan checks in pre-merge CI for all migrations.',
        evidenceCitations: ['Datadog Logs', 'GitHub Canary Diff'],
        suggestedFollowUps: [
          'Save this draft to Post-Incident Reviews registry',
          'Add action items to Jira/Engineering board'
        ]
      };
    }

    // Default response
    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      content:
        `NexusOps AI has analyzed your inquiry regarding: "${question}".\n\n` +
        'Currently, the system is actively monitoring **11 mission-critical services** across 3 Kubernetes clusters and AWS Aurora. ' +
        'There is **1 active P1 incident (INC-8921)** requiring immediate triage, and **1 active P2 incident (INC-8914)** with high consumer lag on Kafka.\n\n' +
        'All observations are linked to live telemetry and evidence artifacts.',
      evidenceCitations: ['Telemetry Telemetry Bus v1.4', 'Prometheus AlertManager'],
      suggestedFollowUps: [
        'Explain current P1 incident root cause',
        'Analyze blast radius for Payment Orchestrator',
        'Audit SLA risks for next 24 hours'
      ]
    };
  }
}

export const aiService = new NexusAIService();
