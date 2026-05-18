import { Request, Response } from 'express';
import * as service from './request.service';
import { parsePagination } from '../../utils/pagination';

export async function getRequests(req: Request, res: Response) {
  const pagination = parsePagination(req);
  const result = await service.getRequests(
    req.tenantId!, {
      itemId: req.query.itemId as string,
      status: req.query.status as string,
    }, 
    pagination
  );

  res.json(result);
}

export async function getRequest(req: Request, res: Response) {
  const result = await service.getRequest(
    req.tenantId!,
    req.params.requestId as string
  );

  res.json(result);
}

export async function resolveRequest(req: Request, res: Response) {
  const result = await service.resolveRequest({
    tenantId: req.tenantId!,
    requestId: req.params.requestId as string,
    actorId: req.userId!,
    decision: req.body.decision,
    comment: req.body.comment,
  });

  res.json(result);
}