import { Router } from 'express';
import { authenticate, requireTenantAccess } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { addMemberSchema, createTenantSchema, updateMemberRoleSchema } from './tenants.schema';
import * as controller from './tenants.controller';

const router = Router();

// Create tenant
router.post('/', authenticate, validate(createTenantSchema), controller.createTenant);

// Get tenants
router.get('/', authenticate, controller.getTenants);

// Get tenant by id
router.get('/:tenantId', authenticate, requireTenantAccess(), controller.getTenantById);

// Add member
router.post('/:tenantId/members', authenticate, requireTenantAccess(['admin']), validate(addMemberSchema), controller.addMember);

// Get members
router.get('/:tenantId/members', authenticate, requireTenantAccess(), controller.getTenantMembers);

// Update member role
router.patch('/:tenantId/members/:userId', authenticate, requireTenantAccess(['admin']), validate(updateMemberRoleSchema), controller.updateMemberRole);

// Remove member
router.delete('/:tenantId/members/:userId', authenticate, requireTenantAccess(['admin']), controller.removeMember);

export default router;