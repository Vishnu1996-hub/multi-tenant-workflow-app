import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodTypeAny, target: ValidationTarget = 'body') =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req[target]);
      next();
    } catch (error: any) {
      console.log('Validation Error:', error);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors,
      });
    }
  };