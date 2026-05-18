import { prisma } from '../../db';
import { AppError } from '../../utils/error';

import * as repo from './workflow.repository';
import { validateWorkflowDefinition } from './workflow.utils';
import {
    WorkflowPayload,
    AddStatePayload,
    AddTransitionPayload,
} from './workflow.types';
import { PaginationParams } from '../../utils/pagination';
import { createAuditLog } from '../audit/audit.service';
import { AuditAction } from '@prisma/client';

export async function createWorkflow(
    tenantId: string,
    userId: string,
    data: WorkflowPayload
) {
    validateWorkflowDefinition(data.states, data.transitions);

    const existing = await repo.findActiveWorkflowByName(
        tenantId,
        data.name
    );

    if (existing) {
        throw new AppError('Workflow already exists', 400);
    }

    return prisma.$transaction(async (tx) => {
        const workflow = await repo.createWorkflow(
            tx,
            tenantId,
            userId,
            data
        );

        const stateMap = await repo.createStates(
            tx,
            workflow.id,
            tenantId,
            data.states
        );

        const transitions = await repo.createTransitions(
            tx,
            workflow.id,
            tenantId,
            stateMap,
            data.transitions
        );

        await createAuditLog({
            tenantId,
            actorId: userId,
            action: AuditAction.workflow_created,
            entityType: 'workflow',
            entityId: workflow.id,
            afterState: {
                name: workflow.name,
            },
        });

        for (const state of Array.from(stateMap.values())) {
            await createAuditLog({
                tenantId,
                actorId: userId,
                action: AuditAction.workflow_state_added,
                entityType: 'workflow_state',
                entityId: state.id,
                afterState: {
                    name: state.name,
                    isInitial: state.isInitial,
                    isTerminal: state.isTerminal,
                },
            });
        }

        for (const transition of transitions) {
            await createAuditLog({
                tenantId,
                actorId: userId,
                action: AuditAction.workflow_transition_added,
                entityType: 'workflow_transition',
                entityId: transition.id,
                afterState: {
                    fromStateId: transition.fromStateId,
                    toStateId: transition.toStateId,
                    requiresApproval: transition.requiresApproval,
                },
            });
        }

        return {
            workflow,
            states: Array.from(stateMap.values()),
            transitions,
        };
    });
}

export const getWorkflows = (tenantId: string, pagination: PaginationParams) =>
    repo.findAllByTenant(tenantId, pagination);

export async function getWorkflow(
    tenantId: string,
    workflowId: string
) {
    const workflow = await repo.findById(tenantId, workflowId);

    if (!workflow) {
        throw new AppError('Workflow not found', 404);
    }

    return workflow;
}

export const addState = async (
    tenantId: string,
    workflowId: string,
    data: AddStatePayload,
    userId?: string
) => {
  const state = await repo.addState(tenantId, workflowId, data);

  await createAuditLog({
    tenantId,
    actorId: userId,
    action: AuditAction.workflow_state_added,
    entityType: 'workflow_state',
    entityId: state.id,
    afterState: {
      name: state.name,
      isInitial: state.isInitial,
      isTerminal: state.isTerminal,
    },
  });

  return state;
}

export const addTransition = async (
    tenantId: string,
    workflowId: string,
    data: AddTransitionPayload,
    userId?: string
) => {
  const transition = await repo.addTransition(tenantId, workflowId, data);

  await createAuditLog({
    tenantId,
    actorId: userId,
    action: AuditAction.workflow_transition_added,
    entityType: 'workflow_transition',
    entityId: transition.id,
    afterState: {
      fromStateId: transition.fromStateId,
      toStateId: transition.toStateId,
      requiresApproval: transition.requiresApproval,
    },
  });

  return transition;
};