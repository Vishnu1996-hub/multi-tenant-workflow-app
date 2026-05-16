import {
  CreateWorkflowInput,
  AddStateInput,
  AddTransitionInput,
} from './workflow.schema';
import { z } from 'zod';


export const tenantRoleEnum = z.enum([
  'admin',
  'member',
  'approver',
  'viewer',
]);

export const approvalStrategyEnum = z.enum([
  'none',
  'single',
  'all',
  'quorum',
]);

export type WorkflowPayload = CreateWorkflowInput;
export type WorkflowStateInput = CreateWorkflowInput['states'][number];
export type WorkflowTransitionInput =
  CreateWorkflowInput['transitions'][number];

export type AddStatePayload = AddStateInput;
export type AddTransitionPayload = AddTransitionInput;