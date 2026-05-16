import { Router } from 'express';
import { authenticate, requireTenantAccess } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { auditFiltersSchema } from './audit.schema';
import * as controller from './audit.controller';

const router = Router({ mergeParams: true });

router.get(
  '/',
  authenticate,
  requireTenantAccess(),
  validate(auditFiltersSchema, 'query'),
  controller.getAllAuditLogs
);

export default router;