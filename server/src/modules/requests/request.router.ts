import { Router } from 'express';
import { authenticate, requireTenantAccess } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as controller from './request.controller';
import { resolveRequestSchema } from './request.schema';

const router = Router({ mergeParams: true });

router.get('/', authenticate, requireTenantAccess(), controller.getRequests);
router.get('/:requestId', authenticate, requireTenantAccess(), controller.getRequest);
router.post('/:requestId/resolve', authenticate, requireTenantAccess(['admin', 'approver']), validate(resolveRequestSchema), controller.resolveRequest);

export default router;