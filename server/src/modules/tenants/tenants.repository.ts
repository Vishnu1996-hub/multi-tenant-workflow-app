import { prisma } from '../../db';
import { TenantRole } from './tenants.types';

export const findTenantBySlug = (slug: string) => {
  return prisma.tenant.findUnique({
    where: { slug },
  });
};

export const findTenantById = (id: string) => {
  return prisma.tenant.findUnique({
    where: { id },
  });
};

export const createTenantRepo = (data: {
  name: string;
  slug: string;
}) => {
  return prisma.tenant.create({
    data,
  });
};

export const addMembership = (
  tenantId: string,
  userId: string,
  role: TenantRole
) => {
  return prisma.tenantMembership.create({
    data: {
      tenantId,
      userId,
      role,
    },
  });
};

export const getUserTenants = (userId: string) => {
  return prisma.tenantMembership.findMany({
    where: { userId },
    include: {
      tenant: true,
    },
  });
};

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const getMembershipsByTenantId = (tenantId: string) => {
  return prisma.tenantMembership.findMany({
    where: { tenantId },
    include: {
      user: true,
    },
  });
};

export const updateMembershipRole = (
  tenantId: string,
  userId: string,
  role: TenantRole
) => {
  return prisma.tenantMembership.update({
    where: {
      tenantId_userId: {
        tenantId,
        userId,
      },
    },
    data: {
      role,
    },
  });
};

export const removeMembership = (tenantId: string, userId: string) => {
  return prisma.tenantMembership.delete({
    where: {
      tenantId_userId: {
        tenantId,
        userId,
      },
    },
  });
};
