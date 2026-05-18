import { Prisma, PrismaClient } from '@prisma/client';
import { PaginationParams } from '../../utils/pagination';
import { auditRepository } from './audit.repository';
import { CreateAuditLogInput, AuditFilters } from './audit.types';

type TxClient = Prisma.TransactionClient;

export async function createAuditLog(
  data: CreateAuditLogInput,
  tx?: TxClient
) {
  return auditRepository.create(
    {
      tenant: data.tenantId
        ? { connect: { id: data.tenantId } }
        : undefined,
      actor: data.actorId
        ? { connect: { id: data.actorId } }
        : undefined,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      beforeState: data.beforeState,
      afterState: data.afterState,
      metadata: data.metadata ?? {},
      ipAddress: data.ipAddress,
    },
    tx
  );
}

export async function getAuditLogs(
  tenantId: string,
  filters: AuditFilters,
  pagination: PaginationParams
) {
  return auditRepository.findMany(tenantId, filters, pagination);
}