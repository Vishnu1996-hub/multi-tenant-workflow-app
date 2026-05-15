import 'express';
import { TenantRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      tenantId?: string;
      tenantRole?: TenantRole;
    }
  }
}

export {};