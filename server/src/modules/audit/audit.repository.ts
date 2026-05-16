import { prisma } from '../../db';
import { Prisma } from '@prisma/client';
import { AuditFilters } from './audit.types';

export const auditRepository = {
  create(data: Prisma.AuditLogCreateInput) {
    return prisma.auditLog.create({ data });
  },

  findMany(tenantId: string, filters: AuditFilters) {
    return prisma.auditLog.findMany({
      where: {
        tenantId,
        action: filters.action,
        entityType: filters.entityType,
        entityId: filters.entityId,
        actorId: filters.actorId,
        createdAt: {
          gte: filters.from,
          lte: filters.to,
        },
      },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },
};