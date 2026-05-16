import { prisma } from '../../db';
import { AppError } from '../../utils/error';

import * as repo from './workflow.repository';
import { validateWorkflowDefinition } from './workflow.utils';
import {
    WorkflowPayload,
    AddStatePayload,
    AddTransitionPayload,
} from './workflow.types';

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

        return {
            workflow,
            states: Array.from(stateMap.values()),
            transitions,
        };
    });
}

export const getWorkflows = (tenantId: string) =>
    repo.findAllByTenant(tenantId);

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

export const addState = (
    tenantId: string,
    workflowId: string,
    data: AddStatePayload
) => repo.addState(tenantId, workflowId, data);

export const addTransition = (
    tenantId: string,
    workflowId: string,
    data: AddTransitionPayload
) => repo.addTransition(tenantId, workflowId, data);