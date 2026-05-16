import { Router } from 'express';
import { authenticate, requireTenantAccess } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createWorkflowSchema, addStateSchema, addTransitionSchema } from './workflow.schema';
import * as controller from './workflow.controller';

const router = Router({ mergeParams: true });

router.post('/', authenticate, requireTenantAccess(['admin']), validate(createWorkflowSchema), controller.createWorkflow);

router.get('/', authenticate, requireTenantAccess(), controller.getWorkflows);

router.get('/:workflowId', authenticate, requireTenantAccess(), controller.getWorkflow);

router.post('/:workflowId/states', authenticate, requireTenantAccess(['admin']), validate(addStateSchema), controller.addState);

router.post('/:workflowId/transitions', authenticate, requireTenantAccess(['admin']), validate(addTransitionSchema), controller.addTransition);

export default router;