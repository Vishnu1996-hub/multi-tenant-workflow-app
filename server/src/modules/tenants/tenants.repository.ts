import { prisma } from '../../db';
import { buildPaginatedResult, PaginationParams, paginationToPrisma } from '../../utils/pagination';
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

export const getUserTenants = async (
  userId: string,
  params: PaginationParams
) => {
  const { skip, take } = paginationToPrisma(params);

  const [data, total] = await Promise.all([
    prisma.tenantMembership.findMany({
      where: { userId },
      include: {
        tenant: true,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.tenantMembership.count({
      where: { userId },
    }),
  ]);

  return buildPaginatedResult(data, total, params);
};


export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const getMembershipsByTenantId = async (
  tenantId: string,
  params: PaginationParams
) => {
  const { skip, take } = paginationToPrisma(params);

  const [data, total] = await Promise.all([
    prisma.tenantMembership.findMany({
      where: { tenantId },
      include: {
        user: true,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.tenantMembership.count({
      where: { tenantId },
    }),
  ]);

  return buildPaginatedResult(data, total, params);
};

export const updateMembershipRole = async (
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

export const removeMembership = async (tenantId: string, userId: string) => {
  return prisma.tenantMembership.delete({
    where: {
      tenantId_userId: {
        tenantId,
        userId,
      },
    },
  });
};
