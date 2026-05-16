import { z } from 'zod';
import { approvalStrategyEnum } from './workflow.types';
import { tenantRoleEnum } from './workflow.types';

const stateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().optional(),
  isInitial: z.boolean().default(false),
  isTerminal: z.boolean().default(false),
  positionOrder: z.number().int().default(0),
});

const transitionSchema = z.object({
  fromState: z.string(),
  toState: z.string(),
  name: z.string().optional(),
  requiresApproval: z.boolean().default(false),
  approvalStrategy: approvalStrategyEnum.default('none'),
  quorumCount: z.number().int().positive().optional(),
  allowedRoles: z.array(tenantRoleEnum).optional(),
});

export const createWorkflowSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().optional(),
  states: z.array(stateSchema).min(2),
  transitions: z.array(transitionSchema).min(1),
});

export const addStateSchema = stateSchema;

export const addTransitionSchema = z.object({
  fromStateId: z.string().uuid(),
  toStateId: z.string().uuid(),
  name: z.string().optional(),
  requiresApproval: z.boolean().default(false),
  approvalStrategy: approvalStrategyEnum.default('none'),
  quorumCount: z.number().int().positive().optional(),
  allowedRoles: z.array(tenantRoleEnum).optional(),
});

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type AddStateInput = z.infer<typeof addStateSchema>;
export type AddTransitionInput = z.infer<typeof addTransitionSchema>;