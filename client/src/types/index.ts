export type TenantRole = 'admin' | 'member' | 'approver' | 'viewer';
export type ApprovalStrategy = 'none' | 'single' | 'all' | 'quorum';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'superseded';
export type VoteDecision = 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantMembership {
  id: string;
  tenantId: string;
  userId: string;
  role: TenantRole;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  role?: TenantRole;
}

export interface WorkflowState {
  id: string;
  workflow_id: string;
  name: string;
  isInitial: boolean;
  isTerminal: boolean;
  positionOrder: number;
}

export interface CurrentState {
  id: string;
  workflowId: string;
  tenantId: string;
  name: string;
  description?: string;
  isInitial: boolean;
  isTerminal: boolean;
  positionOrder: number;
  createdAt: string;
};

export interface WorkflowTransition {
  id: string;
  workflow_id: string;
  fromStateId: string;
  toStateId: string;
  toStateName?: string;
  name: string | null;
  requiresApproval: boolean;
  approvalStrategy: ApprovalStrategy;
  quorumCount: number | null;
  toState?: CurrentState;
  fromState?: CurrentState;
}

export interface Workflow {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  version: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: User;
}

export interface Item {
  id: string;
  tenantId: string;
  workflowId: string;
  currentStateId: string;
  createdBy: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  version: number;
  createdAt?: string;
  updatedAt?: string;
  workflow: Workflow;
  currentState: CurrentState;
  creator: User;
}

// export interface ApprovalRequest {
//   id: string;
//   itemId: string;
//   itemTitle?: string;
//   transitionId: string;
//   toStateName?: string;
//   requestedBy: string;
//   requesterName?: string;
//   status: ApprovalStatus;
//   createdAt: string;
//   approvalStrategy?: ApprovalStrategy;
//   quorumCount?: number | null;
//   resolvedAt?: string | null;
// }

export interface ApprovalRequest {
  id: string;
  item: Item;
  transition: WorkflowTransition;
  requester: User;
  status: ApprovalStatus;
  createdAt: string;
  approvalStrategy?: ApprovalStrategy;
  quorumCount?: number | null;
  resolvedAt?: string | null;
  votes?: ApprovalVote[];
}

export interface ApprovalVote {
  id: string;
  voter_id: string;
  voter_name: string;
  voter_email: string;
  delegated_from_name?: string;
  decision: VoteDecision;
  comment: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  actor?: User;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  currentTenant: Tenant | null;
}
