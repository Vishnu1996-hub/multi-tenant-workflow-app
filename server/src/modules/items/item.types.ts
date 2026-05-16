export type CreateItemInput = {
  workflowId: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
};

export type ItemFilters = {
  workflowId?: string;
  stateId?: string;
  search?: string;
};

export type RequestTransitionInput = {
  transitionId: string;
  version: number;
  idempotencyKey?: string;
};


export type TransitionResponse = {
  item?: any;
  request?: {
    id: string;
    status: string;
  };
};

export type Params = {
  tenantId: string;
  itemId: string;
  actorId: string;
  actorRole: string;
} & RequestTransitionInput;
