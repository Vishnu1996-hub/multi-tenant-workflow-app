import { AuditAction, Prisma } from '@prisma/client';

export type AuditFilters = {
  action?: AuditAction;
  entityType?: string;
  entityId?: string;
  actorId?: string;
  from?: Date;
  to?: Date;
};

export type CreateAuditLogInput = {
  tenantId?: string;
  actorId?: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  beforeState?: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
  afterState?: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
  metadata?: Prisma.JsonNullValueInput | Prisma.InputJsonValue;
  ipAddress?: string;
};