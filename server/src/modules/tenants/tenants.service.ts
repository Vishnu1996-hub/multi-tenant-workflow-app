import { AuditAction } from '@prisma/client';
import { prisma } from '../../db';
import { AppError } from '../../utils/error';
import { PaginationParams } from '../../utils/pagination';
import { createAuditLog } from '../audit/audit.service';
import * as repo from './tenants.repository';
import { TenantRole } from './tenants.types';

export async function createTenant(
  name: string,
  slug: string,
  userId: string
) {
  const existing = await repo.findTenantBySlug(slug);

  if (existing) {
    throw new AppError('Tenant slug already exists', 400);
  }

  return prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: { name, slug },
    });

    await tx.tenantMembership.create({
      data: {
        tenantId: tenant.id,
        userId,
        role: 'admin',
      },
    });

    await createAuditLog({
      tenantId: tenant.id,
      actorId: userId,
      action: AuditAction.tenant_created,
      entityType: 'tenant',
      entityId: tenant.id,
      afterState: {
        name: tenant.name,
        slug: tenant.slug,
      },
    });

    await createAuditLog({
      tenantId: tenant.id,
      actorId: userId,
      action: AuditAction.tenant_membership_added,
      entityType: 'tenant_membership',
      entityId: userId,
      afterState: {
        role: 'admin',
      },
    });


    return tenant;
  });
}

export async function getTenants(userId: string, pagination: PaginationParams) {
  return repo.getUserTenants(userId, pagination);
}

export async function getTenantById(tenantId: string) {
  const tenant = await repo.findTenantById(tenantId);
  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }
  return tenant;
}

export async function addMember(
  tenantId: string,
  email: string,
  role: TenantRole,
  actorId?: string
) {
  const user = await repo.findUserByEmail(email);
  console.log('Found user:', user);
  if (!user) {
    throw new AppError('User not found', 404);
  }

const membership = await repo.addMembership(tenantId, user.id, role);

  await createAuditLog({
    tenantId,
    actorId: actorId || user.id,
    action: AuditAction.tenant_membership_added,
    entityType: 'tenant_membership',
    entityId: user.id,
    afterState: {
      role,
      email: user.email,
    },
  });

  return membership;
}

export async function getTenantMembers(tenantId: string, pagination: PaginationParams) {
  return repo.getMembershipsByTenantId(tenantId, pagination);
}

export async function updateMemberRole(
  tenantId: string,
  userId: string,
  role: TenantRole,
  actorId?: string
) {
  const membership = await repo.updateMembershipRole(
    tenantId,
    userId,
    role
  );

  await createAuditLog({
    tenantId,
    actorId: actorId || userId,
    action: AuditAction.tenant_membership_updated,
    entityType: 'tenant_membership',
    entityId: userId,
    afterState: {
      role,
    },
  });

  return membership;
}

export async function removeMember(tenantId: string, userId: string, actorId?: string) {
  const membership = await repo.removeMembership(tenantId, userId);

  await createAuditLog({
    tenantId,
    actorId: actorId || userId,
    action: AuditAction.tenant_membership_updated,
    entityType: 'tenant_membership',
    entityId: userId,
    afterState: {
      removed: true,
    },
  });

  return membership;
}