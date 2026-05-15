import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/error';
import { config } from '../config';
import { TenantRole } from '../modules/tenants/tenants.types';
import { prisma } from '../db';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      tenantId?: string;
      tenantRole?: TenantRole;
    }
  }
}

type JwtPayload = {
  userId: string;
};

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError('Unauthorized', 401);
    }
    const token = header.slice(7);
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.userId = payload.userId;
    next();
  } catch {
    throw new AppError('Unauthorized', 401);
  }
}

export function requireTenantAccess(roles?: TenantRole[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = req.params['tenantId'] as string ?? req.headers['x-tenant-id'] as string;
      if (!tenantId) {
        throw new AppError('Tenant context required', 403);
      }
      const membership = await prisma.tenantMembership.findFirst({
        where: { tenantId, userId: req.userId },
        select: { tenantId: true, role: true },
      });
      if (!membership) {
        throw new AppError('You do not have access to this tenant', 403);
      }
      if (roles && !roles.includes(membership.role)) {
        throw new AppError(`Required role: ${roles.join(', ')}`, 403);
      }
      req.tenantId = membership.tenantId;
      req.tenantRole = membership.role;
      next();
    } catch (error) {
      next(error);
    }
  };
}