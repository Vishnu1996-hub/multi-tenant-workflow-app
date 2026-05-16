export type ResolveRequestInput = {
  tenantId: string;
  requestId: string;
  actorId: string;
  decision: 'approved' | 'rejected';
  comment?: string;
};

export type RequestFilters = {
  itemId?: string;
  status?: string;
};