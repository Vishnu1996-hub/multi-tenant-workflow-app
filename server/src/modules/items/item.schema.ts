import { z } from 'zod';

export const createItemSchema = z.object({
  workflowId: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional().default({}),
});

export const transitionItemSchema = z.object({
  transitionId: z.string().uuid(),
  version: z.number().int().positive(),
  idempotencyKey: z.string().optional(),
});