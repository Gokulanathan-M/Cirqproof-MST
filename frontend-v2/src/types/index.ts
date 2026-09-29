export type BatchState = 
  | 'CREATED' 
  | 'EVIDENCE_COMMITTED' 
  | 'AI_ANALYZED' 
  | 'ATTESTED' 
  | 'VERIFIED' 
  | 'CHALLENGED' 
  | 'UNDER_REVIEW' 
  | 'RESOLVED' 
  | 'SETTLED';

export type Role = 'PRODUCER' | 'RECYCLER' | 'AUDITOR' | 'BUYER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Claim {
  quantity: number;
  unit: string;
}

export interface Batch {
  batchId: string;
  producer: string;
  recycler: string;
  material: string;
  claim: Claim;
  status: BatchState;
  evidenceRoot: string | null;
  aiReport: string | null;
  chainRefs: {
    txHash: string | null;
    attestationId: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AiRuleResult {
  ruleId: string;
  description: string;
  passed: boolean;
  actual: any;
  expected: any;
}

export interface AiReport {
  batchId: string;
  status?: 'CONSISTENT' | 'FLAGGED' | 'REVIEW' | string;
  result?: {
    rules?: AiRuleResult[];
    output?: 'CONSISTENT' | 'FLAGGED' | 'REVIEW';
    explanation?: string;
  };
  flags?: string[];
  explanation?: string;
  recommendation?: string;
  createdAt?: string;
}

export interface Evidence {
  evidenceId: string;
  batchId: string;
  type: string;
  source: string;
  timestamp: string;
  data: any;
  hash: string;
}

export interface Attestation {
  batchId: string;
  attestor: string;
  txHash: string;
  status: string;
  createdAt: string;
}

export interface Challenge {
  batchId: string;
  challenger: string;
  reason: string;
  txHash: string;
  status: string;
}

export interface Settlement {
  batchId: string;
  amount: number;
  payer: string;
  txHash: string;
  status: 'PENDING' | 'VERIFIED' | 'HELD' | 'RELEASED' | 'REFUNDED';
}

export interface BlockchainAnchor {
  success: boolean;
  txHash: string;
}

export interface BlockchainConfig {
  network?: string;
  rpcUrl?: string;
  chainId: number;
  explorerUrl?: string;
  registryAddress: string;
  settlementAddress: string;
  deployerAddress?: string;
}

export interface BlockchainLifecycleItem {
  state: string;
  action: string;
  detail?: string | number | null;
  txHash: string | null;
  explorerUrl: string | null;
}

export interface BlockchainLifecycle {
  batchId: string;
  status: string;
  explorerUrl: string;
  evidenceRoot: string | null;
  reportHash: string | null;
  attestation: { txHash: string | null; status: string; attestor: string | null };
  settlement: { amount: number | null; status: string; txHash: string | null };
  lifecycle: BlockchainLifecycleItem[];
}
