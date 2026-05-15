export type TenantRole = 'admin' | 'member' | 'approver' | 'viewer';

export interface CreateTenantInput {
  name: string;
  slug: string;
}

export interface AddMemberInput {
  email: string;
  role: TenantRole;
}

export interface UpdateMemberInput {
  role: TenantRole;
}