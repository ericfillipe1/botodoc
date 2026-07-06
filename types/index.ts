export type StepType = 'NORMAL' | 'CONDITIONAL' | 'CONDITIONAL_BRANCH';

export interface Step {
  id: string;
  title: string;
  description?: string;
  usages?: UsageCommunication[];
  subSteps?: Step[];
  stepType?: StepType; // Tipo do step: NORMAL, CONDITIONAL ou CONDITIONAL_BRANCH
}

export interface ProcessFlow {
  name: string;
  steps: Step[];
}

export interface AnalyzedRepository {
  id: string;
  gitUrl: string;
  repositoryName: string;
  processFlow: ProcessFlow;
  analyzedAt: string;
}

export interface UsageCommunication {
  origin?: Component;
  technology: string;
  destination?: Component;
  description?: string;
}

export interface Component {
  type: 'API' | 'DATABASE' | 'QUEUE' | 'FRONTEND';
  name: string;
  description?: string;
}
