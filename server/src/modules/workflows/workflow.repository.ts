import { Prisma, WorkflowState } from '@prisma/client';
import { prisma } from '../../db';
import {
  AddStatePayload,
  AddTransitionPayload,
  WorkflowPayload,
  WorkflowStateInput,
  WorkflowTransitionInput,
} from './workflow.types';
import { buildPaginatedResult, PaginationParams, paginationToPrisma } from '../../utils/pagination';

type Tx = Prisma.TransactionClient;

export const findActiveWorkflowByName = (
  tenantId: string,
  name: string
) =>
  prisma.workflow.findFirst({
    where: { tenantId, name, isActive: true },
  });

export const createWorkflow = (
  tx: Tx,
  tenantId: string,
  userId: string,
  data: WorkflowPayload
) =>
  tx.workflow.create({
    data: {
      tenantId,
      name: data.name,
      description: data.description,
      createdBy: userId,
    },
  });

export async function createStates(
  tx: Tx,
  workflowId: string,
  tenantId: string,
  states: WorkflowStateInput[]
) {
  const stateMap = new Map<string, WorkflowState>();

  for (const state of states) {
    const created = await tx.workflowState.create({
      data: {
        workflowId,
        tenantId,
        name: state.name,
        description: state.description,
        isInitial: state.isInitial,
        isTerminal: state.isTerminal,
        positionOrder: state.positionOrder,
      },
    });

    stateMap.set(state.name, created);
  }

  return stateMap;
}

export async function createTransitions(
  tx: Tx,
  workflowId: string,
  tenantId: string,
  stateMap: Map<string, WorkflowState>,
  transitions: WorkflowTransitionInput[]
) {
  const created = [];

  for (const transition of transitions) {
    const fromState = stateMap.get(transition.fromState)!;
    const toState = stateMap.get(transition.toState)!;

    const result = await tx.workflowTransition.create({
      data: {
        workflowId,
        tenantId,
        fromStateId: fromState.id,
        toStateId: toState.id,
        name: transition.name,
        requiresApproval: transition.requiresApproval,
        approvalStrategy: transition.approvalStrategy,
        quorumCount: transition.quorumCount,
        allowedRoles: transition.allowedRoles ?? [],
      },
    });

    created.push(result);
  }

  return created;
}

export const findAllByTenant = async (
  tenantId: string,
  pagination: PaginationParams
) => {
  const { skip, take } = paginationToPrisma(pagination);

  const where = {
    tenantId,
    isActive: true,
  };

  const [data, total] = await Promise.all([
    prisma.workflow.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    }),
    prisma.workflow.count({
      where,
    }),
  ]);

  return buildPaginatedResult(data, total, pagination);
};

export const findById = (
  tenantId: string,
  workflowId: string
) =>
  prisma.workflow.findFirst({
    where: { id: workflowId, tenantId },
    include: {
      states: { orderBy: { positionOrder: 'asc' } },
      transitions: {
        include: {
          fromState: true,
          toState: true,
        },
      },
      creator: true,
    },
  });

export const addState = (
  tenantId: string,
  workflowId: string,
  data: AddStatePayload
) =>
  prisma.workflowState.create({
    data: {
      workflowId,
      tenantId,
      ...data,
    },
  });

export const addTransition = (
  tenantId: string,
  workflowId: string,
  data: AddTransitionPayload
) =>
  prisma.workflowTransition.create({
    data: {
      workflowId,
      tenantId,
      ...data,
    },
  });

export const findTransitionsByFromState = (
  fromStateId: string,
  tenantId: string
) =>
  prisma.workflowTransition.findMany({
    where: {
      fromStateId,
      tenantId,
    },
    include: {
      toState: true,
    },
  });