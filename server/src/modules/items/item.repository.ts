import { prisma } from '../../db';
import { buildPaginatedResult, PaginationParams, paginationToPrisma } from '../../utils/pagination';

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

  async findMany(tenantId: string, pagination: PaginationParams, tx = prisma) {
    const { skip, take } = paginationToPrisma(pagination);

  const where = { tenantId };

  const [data, total] = await Promise.all([
    tx.item.findMany({
      where,
      include: {
        workflow: true,
        currentState: true,
        creator: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    }),
    tx.item.count({
      where,
    }),
  ]);

  return buildPaginatedResult(data, total, pagination);
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