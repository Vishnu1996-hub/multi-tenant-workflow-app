import { prisma } from '../../db';
import { AppError } from '../../utils/error';
import { PaginationParams } from '../../utils/pagination';
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
  role: TenantRole
) {
  const user = await repo.findUserByEmail(email);
  console.log('Found user:', user);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return repo.addMembership(tenantId, user.id, role);
}

export async function getTenantMembers(tenantId: string, pagination: PaginationParams) {
  return repo.getMembershipsByTenantId(tenantId, pagination);
}

export async function updateMemberRole(
  tenantId: string,
  userId: string,
  role: TenantRole
) {
  return repo.updateMembershipRole(tenantId, userId, role);
}

export async function removeMember(tenantId: string, userId: string) {
  return repo.removeMembership(tenantId, userId);
}