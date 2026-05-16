import { Router } from 'express';
import { authenticate, requireTenantAccess } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as controller from './item.controller';
import { createItemSchema, transitionItemSchema } from './item.schema';

const router = Router({ mergeParams: true });

router.post('/', authenticate, requireTenantAccess(['admin', 'member', 'approver']), validate(createItemSchema), controller.createItem);
router.get('/', authenticate, requireTenantAccess(), controller.getItems);
router.get('/:itemId', authenticate, requireTenantAccess(), controller.getItem);
router.post('/:itemId/transitions', authenticate, requireTenantAccess(['admin', 'member', 'approver']), validate(transitionItemSchema), controller.requestTransition);

export default router;