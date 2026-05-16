import { z } from "zod";

export const resolveRequestSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  comment: z.string().max(2000).optional(),
});
