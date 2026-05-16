import { z } from 'zod';

export const createTenantSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).max(100),
});

export const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'approver', 'viewer']),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'member', 'approver', 'viewer']),
});