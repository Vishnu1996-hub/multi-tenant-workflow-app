import { prisma } from '../../db';
import { AppError } from '../../utils/error';
import { itemRepository } from './item.repository';
import {
  CreateItemInput,
  Params,
  TransitionResponse,
} from './item.types';

export async function createItem(
  tenantId: string,
  userId: string,
  data: CreateItemInput
) {
  const workflow = await prisma.workflow.findFirst({
    where: {
      id: data.workflowId,
      tenantId,
      isActive: true,
    },
  });

  if (!workflow) {
    throw new AppError('Workflow not found', 404);
  }

  const initialState = await prisma.workflowState.findFirst({
    where: {
      workflowId: workflow.id,
      isInitial: true,
    },
  });

  if (!initialState) {
    throw new AppError('Workflow initial state not found', 400);
  }

  return itemRepository.create({
    tenantId,
    workflowId: workflow.id,
    currentStateId: initialState.id,
    title: data.title,
    description: data.description ?? null,
    metadata: data.metadata ?? {},
    createdBy: userId,
  });
}

export async function getItems(tenantId: string) {
  return itemRepository.findMany(tenantId);
}

export async function getItem(itemId: string, tenantId: string) {
  const item = await itemRepository.findById(itemId, tenantId);

  if (!item) {
    throw new AppError('Item not found', 404);
  }

  return item;
}

export async function requestTransition(
  params: Params
): Promise<TransitionResponse> {
  const {
    tenantId,
    itemId,
    actorId,
    actorRole,
    transitionId,
    version,
    idempotencyKey,
  } = params;

  return prisma.$transaction(async (tx) => {
    /**
     * 1. Idempotency check
     */
    if (idempotencyKey) {
      const existing = await tx.request.findFirst({
        where: {
          tenantId,
          idempotencyKey,
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (existing) {
        return { request: existing };
      }
    }

    /**
     * 2. Find item inside transaction
     */
    const item = await tx.item.findFirst({
      where: {
        id: itemId,
        tenantId,
      },
    });

    if (!item) {
      throw new AppError('Item not found', 404);
    }

    /**
     * 3. Optimistic locking
     */
    if (item.version !== version) {
      throw new AppError('Version conflict. Please refresh item.', 409);
    }

    /**
     * 4. Validate transition
     */
    const transition = await itemRepository.findTransition(
      transitionId,
      item.workflowId,
      item.currentStateId,
      tenantId,
    );

    if (!transition) {
      throw new AppError('Invalid transition for current state', 400);
    }

    /**
     * 5. Role validation
     */
    if (
      transition.allowedRoles &&
      transition.allowedRoles.length > 0 &&
      !transition.allowedRoles.includes(actorRole as any)
    ) {
      throw new AppError('You are not allowed to perform this transition', 403);
    }

    /**
     * 6. Supersede previous pending approvals
     */
    await tx.request.updateMany({
      where: {
        itemId,
        status: 'pending',
      },
      data: {
        status: 'superseded',
        resolvedAt: new Date(),
      },
    });

    /**
     * 7. Approval flow
     */
    if (transition.requiresApproval) {
      const request = await tx.request.create({
        data: {
          tenantId,
          itemId,
          transitionId,
          requestedBy: actorId,
          idempotencyKey: idempotencyKey ?? null,
        },
        select: {
          id: true,
          status: true,
        },
      });

      return { request };
    }

    /**
     * 8. Direct transition
     */
    return performTransition({
      tenantId,
      item,
      transition,
    });
  });
}

export type PerformTransitionParams = {
  tenantId: string;
  item: {
    id: string;
    version: number;
  };
  transition: {
    toStateId: string;
  };
};

export async function performTransition({
  tenantId,
  item,
  transition,
}: PerformTransitionParams): Promise<TransitionResponse> {
  const updated = await itemRepository.updateState(
    item.id,
    tenantId,
    item.version,
    transition.toStateId,
  );

  if (updated.count === 0) {
    throw new AppError('Version conflict. Item already updated.', 409);
  }

  const freshItem = await itemRepository.findById(item.id, tenantId);

  return { item: freshItem ?? undefined };
}