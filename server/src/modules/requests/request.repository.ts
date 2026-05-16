import { prisma } from '../../db';

export const approvalRepository = {
  findMany(tenantId: string, filters?: { itemId?: string; status?: string }) {
    return prisma.request.findMany({
      where: {
        tenantId,
        ...(filters?.itemId && { itemId: filters.itemId }),
        ...(filters?.status && { status: filters.status as any }),
      },
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
    });
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