import { Request, Response } from 'express';
import { getAuditLogs } from './audit.service';
import { parsePagination } from '../../utils/pagination';

export async function getAllAuditLogs(req: Request, res: Response) {
  const pagination = parsePagination(req);
  const result = await getAuditLogs(req.tenantId!, {
    action: req.query.action as any,
    entityType: req.query.entityType as string,
    entityId: req.query.entityId as string,
    actorId: req.query.actorId as string,
    from: req.query.from ? new Date(req.query.from as string) : undefined,
    to: req.query.to ? new Date(req.query.to as string) : undefined,
  }, pagination);

  res.json({
    success: true,
    ...result,
  });
}