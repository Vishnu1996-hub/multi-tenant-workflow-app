import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 chars'),
    fullName: z
      .string()
      .min(2, 'Full name required'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});