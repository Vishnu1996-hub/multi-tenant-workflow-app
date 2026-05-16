import { Request, Response } from 'express';
import { getAuditLogs } from './audit.service';

export async function getAllAuditLogs(req: Request, res: Response) {
  const result = await getAuditLogs(req.tenantId!, {
    action: req.query.action as any,
    entityType: req.query.entityType as string,
    entityId: req.query.entityId as string,
    actorId: req.query.actorId as string,
    from: req.query.from ? new Date(req.query.from as string) : undefined,
    to: req.query.to ? new Date(req.query.to as string) : undefined,
  });

  res.json({
    success: true,
    data: result,
  });
}