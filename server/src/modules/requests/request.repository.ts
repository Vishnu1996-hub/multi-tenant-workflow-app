import { prisma } from '../../db';
import { buildPaginatedResult, PaginationParams, paginationToPrisma } from '../../utils/pagination';

export const approvalRepository = {
  findMany: async (
  tenantId: string,
  filters?: { itemId?: string; status?: string },
  pagination?: PaginationParams
) => {
  const params = pagination ?? { page: 1, limit: 20 };
  const { skip, take } = paginationToPrisma(params);

  const where = {
    tenantId,
    ...(filters?.itemId && { itemId: filters.itemId }),
    ...(filters?.status && { status: filters.status as any }),
  };

  const [data, total] = await Promise.all([
    prisma.request.findMany({
      where,
      include: {
        item: true,
        transition: {
          include: {
            toState: true,
          },
        },
        requester: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    }),
    prisma.request.count({
      where,
    }),
  ]);

  return buildPaginatedResult(data, total, params);
},

  findById(requestId: string, tenantId: string) {
    return prisma.request.findFirst({
      where: {
        id: requestId,
        tenantId,
      },
      include: {
        item: true,
        transition: true,
        requester: true,
      },
    });
  },

  findMembership(tenantId: string, userId: string) {
    return prisma.tenantMembership.findFirst({
      where: {
        tenantId,
        userId,
      },
    });
  },

  updateStatus(
    requestId: string,
    decision: 'approved' | 'rejected'
  ) {
    return prisma.request.update({
      where: { id: requestId },
      data: {
        status: decision,
        resolvedAt: new Date(),
      },
    });
  },

};