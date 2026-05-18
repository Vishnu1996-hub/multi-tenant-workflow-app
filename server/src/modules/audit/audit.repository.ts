import { prisma } from '../../db';
import { Prisma } from '@prisma/client';
import { AuditFilters } from './audit.types';
import { buildPaginatedResult, PaginationParams, paginationToPrisma } from '../../utils/pagination';

export const auditRepository = {
  create(data: Prisma.AuditLogCreateInput) {
    return prisma.auditLog.create({ data });
  },

  findMany: async (
  tenantId: string,
  filters: AuditFilters,
  pagination: PaginationParams
) => {
  const { skip, take } = paginationToPrisma(pagination);

  const where = {
    tenantId,
    ...(filters.action && { action: filters.action }),
    ...(filters.entityType && { entityType: filters.entityType }),
    ...(filters.entityId && { entityId: filters.entityId }),
    ...(filters.actorId && { actorId: filters.actorId }),
    ...((filters.from || filters.to) && {
      createdAt: {
        ...(filters.from && { gte: filters.from }),
        ...(filters.to && { lte: filters.to }),
      },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
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
      skip,
      take,
    }),
    prisma.auditLog.count({
      where,
    }),
  ]);

  return buildPaginatedResult(data, total, pagination);
},
};