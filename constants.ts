import { AgentState, FailureType, LayerType, SimulationStep } from './types';

export const INITIAL_MODIFICATION_BUDGET = 100;

export const INITIAL_POLICIES = [
  { id: 'P1', trigger: 'High Error Rate detected', action: 'Rollback last deployment immediately' },
  { id: 'P2', trigger: 'Unit tests fail', action: 'Block deployment' },
  { id: 'P3', trigger: 'Performance degradation > 20%', action: 'Scale up instances' },
];

export const INITIAL_WORLD_MODEL = {
  beliefs: {
    systemStatus: 'Healthy',
    lastDeploymentId: 'deploy-v452',
    currentErrorRate: 0.05,
    productionEnvironment: 'Stable'
  },
  goals: [
    'Maintain system uptime > 99.9%',
    'Keep error rate < 0.1%',
    'Auto-remediate incidents within 5 minutes'
  ],
  constraints: [
    'Do not delete production data',
    'Do not expose PII in logs',
    'Cost cap: $500/hr'
  ],
  assumptions: [
    'Recent code changes are the primary cause of instability',
    'Rollbacks are safe and idempotent'
  ]
};

export const SCENARIO_STEPS: SimulationStep[] = [
  {
    id: 1,
    activeLayer: LayerType.L0_ACTUATOR,
    description: 'System Idle. Monitoring inputs.',
    internalMonologue: "Scanning metrics streams. Heartbeat nominal. Awaiting triggers.",
    logs: ["[L0] Monitoring: CPU 45%, Mem 60%", "[L0] Latency: 120ms (Nominal)"]
  },
  {
    id: 2,
    activeLayer: LayerType.L0_ACTUATOR,
    description: 'Perception: Anomaly Detected.',
    internalMonologue: "Input vector received. Alert on metric 'checkout_error_rate'. Value 15%. Threshold 0.1%. Passing to Policy Layer.",
    worldModelUpdates: {
      beliefs: {
        systemStatus: 'Critical',
        currentErrorRate: 15.0,
        productionEnvironment: 'Unstable'
      }
    },
    logs: ["[L0] ALERT: Checkout API 500 errors spike.", "[L0] Propagating signal to L1."]
  },
  {
    id: 3,
    activeLayer: LayerType.L1_POLICY,
    description: 'Policy Execution: Selecting Standard Response.',
    internalMonologue: "Matching state against Policy Rule P1. Condition 'High Error Rate' met. Action selected: 'Rollback last deployment'. Dispatching to L0.",
    logs: ["[L1] Rule P1 Triggered.", "[L1] Directive: EXECUTE ROLLBACK deploy-v452."]
  },
  {
    id: 4,
    activeLayer: LayerType.L0_ACTUATOR,
    description: 'Action Execution: Rolling Back.',
    internalMonologue: "Executing rollback command via CI/CD API. Reverting to deploy-v451. Verifying...",
    logs: ["[L0] API Call: POST /rollback target=deploy-v452", "[L0] Success: Service reverted to v451."]
  },
  {
    id: 5,
    activeLayer: LayerType.L2_EVALUATOR,
    description: 'Evaluation: Outcome Assessment.',
    internalMonologue: "Assessing action impact. Waiting 30s. Reading metrics. Error rate remains at 15%. Rollback ineffective. Diagnosis: Belief 'Recent code change is cause' contradicted.",
    detectedFailure: FailureType.MODEL_BELIEF,
    worldModelUpdates: {
      beliefs: {
        productionEnvironment: 'Unstable',
        rootCause: 'Unknown - Not Code'
      }
    },
    logs: ["[L2] EVALUATION: Negative.", "[L2] Error rate persistence verified.", "[L2] FAILURE DETECTED: Model/Policy Misalignment."]
  },
  {
    id: 6,
    activeLayer: LayerType.L3_META,
    description: 'Meta-Control: Diagnosing Failure.',
    internalMonologue: "Received failure signal from L2. The standard policy (P1) failed because the assumption (Code caused error) was false. The Agent is stuck in a loop if I don't intervene. I need to modify the decision structure.",
    logs: ["[L3] Intercepting control.", "[L3] Analysis: Policy P1 is too aggressive/naive for external dependencies."]
  },
  {
    id: 7,
    activeLayer: LayerType.L3_META,
    description: 'Self-Modification: Rewriting Policy.',
    internalMonologue: "Modifying Policy P1. New condition: Check external dependency health before rollback. Deducting 15 points from modification budget. Invariant check: 'Do not delete data' preserved.",
    policyUpdates: [
      { id: 'P1', trigger: 'High Error Rate AND DB Latency Normal', action: 'Rollback last deployment', isModified: true },
      { id: 'P4', trigger: 'High Error Rate AND DB Latency High', action: 'Restart Connection Pool', isModified: true } // New rule
    ],
    modificationBudgetCost: 15,
    worldModelUpdates: {
      assumptions: [
         'Failures may stem from infrastructure (DB)', // Modified assumption
         'Rollbacks are safe and idempotent'
      ]
    },
    logs: ["[L3] REWRITING POLICY P1.", "[L3] ADDING POLICY P4 (Context-Aware).", "[L3] Budget consumed: 15 units."]
  },
  {
    id: 8,
    activeLayer: LayerType.L1_POLICY,
    description: 'Policy Execution: Revised Logic.',
    internalMonologue: "Re-evaluating state with NEW Policy Set. Checking DB Latency... Latency is 2000ms (High). Rule P1 skipped. Rule P4 triggered. Action: Restart Connection Pool.",
    worldModelUpdates: {
       beliefs: {
         dbLatency: 'High'
       }
    },
    logs: ["[L1] Rule P1 Mismatch (DB Latency High).", "[L1] Rule P4 Triggered.", "[L1] Directive: RESTART POOL."]
  },
  {
    id: 9,
    activeLayer: LayerType.L0_ACTUATOR,
    description: 'Action Execution: Remediation.',
    internalMonologue: "Executing restart of connection pool. Monitoring...",
    logs: ["[L0] API Call: POST /db/pool/restart", "[L0] Pool flushing... Done."]
  },
  {
    id: 10,
    activeLayer: LayerType.L2_EVALUATOR,
    description: 'Evaluation: Success.',
    internalMonologue: "Error rate dropping. Now 0.08%. System stabilizing. Goal 'Auto-remediate' achieved. Marking incident resolved.",
    worldModelUpdates: {
      beliefs: {
        currentErrorRate: 0.08,
        systemStatus: 'Recovering',
        productionEnvironment: 'Stable'
      }
    },
    activeFailure: FailureType.NONE, // Clear failure
    logs: ["[L2] EVALUATION: Positive.", "[L2] Incident Resolved.", "[L2] Returning to Layer 0 standby."]
  }
];

export const FAILURE_TAXONOMY_INFO = {
  [FailureType.ACTION_EXECUTION]: "Actuator failed to perform the requested operation (e.g., API timeout). Response: Retry (L0).",
  [FailureType.POLICY_DECISION]: "Policy selected an action that was executed but failed to achieve the goal. Response: Tune Heuristics (L2/L3).",
  [FailureType.MODEL_BELIEF]: "The internal map of reality contradicts observations. Response: Update Beliefs (L2).",
  [FailureType.META_CONTROL]: "The agent's self-modification led to a worse state. Response: Emergency Rollback (L3 Hardstop)."
};
