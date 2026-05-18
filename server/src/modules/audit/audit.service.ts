import { PaginationParams } from '../../utils/pagination';
import { auditRepository } from './audit.repository';
import { CreateAuditLogInput, AuditFilters } from './audit.types';

export async function createAuditLog(data: CreateAuditLogInput) {
  return auditRepository.create({
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
  });
}

export async function getAuditLogs(
  tenantId: string,
  filters: AuditFilters,
  pagination: PaginationParams
) {
  return auditRepository.findMany(tenantId, filters, pagination);
}