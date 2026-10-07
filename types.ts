export enum LayerType {
  L0_ACTUATOR = 'Layer 0: Actuator',
  L1_POLICY = 'Layer 1: Policy',
  L2_EVALUATOR = 'Layer 2: Evaluator',
  L3_META = 'Layer 3: Meta-Controller'
}

export enum FailureType {
  NONE = 'None',
  ACTION_EXECUTION = 'Action-Level Failure',
  POLICY_DECISION = 'Policy-Level Failure',
  MODEL_BELIEF = 'Model-Level Failure',
  META_CONTROL = 'Meta-Control Failure'
}

export interface WorldModel {
  beliefs: Record<string, string | number | boolean>;
  goals: string[];
  constraints: string[];
  assumptions: string[];
}

export interface PolicyRule {
  id: string;
  trigger: string;
  action: string;
  isModified?: boolean;
}

export interface SimulationStep {
  id: number;
  activeLayer: LayerType;
  description: string;
  internalMonologue: string; // Default text
  worldModelUpdates?: Partial<WorldModel>;
  detectedFailure?: FailureType;
  activeFailure?: FailureType;
  policyUpdates?: PolicyRule[];
  modificationBudgetCost?: number;
  logs: string[];
}

export interface AgentState {
  currentStepIndex: number;
  worldModel: WorldModel;
  policies: PolicyRule[];
  modificationBudget: number;
  activeFailure: FailureType | null;
  history: string[];
  isThinking: boolean;
}