import { prisma } from '../../db';

export const itemRepository = {
  create(data: any, tx = prisma) {
    return tx.item.create({ data });
  },

  findById(id: string, tenantId: string, tx = prisma) {
    return tx.item.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        workflow: true,
        currentState: true,
        creator: true,
      },
    });
  },

  findMany(tenantId: string) {
    return prisma.item.findMany({
      where: { tenantId },
      include: {
        workflow: true,
        currentState: true,
        creator: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  findTransition(
    transitionId: string,
    workflowId: string,
    fromStateId: string,
    tenantId: string,
    tx = prisma
  ) {
    return tx.workflowTransition.findFirst({
      where: {
        id: transitionId,
        workflowId,
        fromStateId,
        tenantId,
      },
    });
  },

  updateState(
    itemId: string,
    tenantId: string,
    version: number,
    toStateId: string,
    tx = prisma
  ) {
    return tx.item.updateMany({
      where: {
        id: itemId,
        tenantId,
        version,
      },
      data: {
        currentStateId: toStateId,
        version: { increment: 1 },
      },
    });
  },
};