import { prisma } from '../../db';
import { AppError } from '../../utils/error';
import { approvalRepository } from './request.repository';
import { itemRepository } from '../items/item.repository';
import { performTransition } from '../items/item.service';
import { RequestFilters, ResolveRequestInput } from './request.types';
import { PaginationParams } from '../../utils/pagination';

export async function getRequests(
  tenantId: string,
  filters: RequestFilters,
  pagination: PaginationParams  

) {
  return approvalRepository.findMany(tenantId, filters, pagination);
}

export async function getRequest(
  tenantId: string,
  requestId: string
) {
  const request = await approvalRepository.findById(requestId, tenantId);

  if (!request) {
    throw new AppError('request request not found', 404);
  }

  return request;
}

export async function resolveRequest(
  params: ResolveRequestInput
) {
  const { tenantId, requestId, actorId, decision } = params;

  return prisma.$transaction(async () => {
    const request = await approvalRepository.findById(requestId, tenantId);

    if (!request) {
      throw new AppError('request request not found', 404);
    }

    if (request.status !== 'pending') {
      throw new AppError(`request request already ${request.status}`, 409);
    }

    const membership = await approvalRepository.findMembership(
      tenantId,
      actorId
    );

    if (!membership || !['admin', 'approver'].includes(membership.role)) {
      throw new AppError('Not authorized to resolve request', 403);
    }

    await approvalRepository.updateStatus(requestId, decision);

    if (decision === 'approved') {
      const item = await itemRepository.findById(request.itemId, tenantId);

      if (!item) {
        throw new AppError('Item not found', 404);
      }

      await performTransition({
        tenantId,
        item,
        transition: request.transition,
      });
    }

    return approvalRepository.findById(requestId, tenantId);
  });
}