import { Request, Response } from 'express';
import * as itemService from './item.service';

export async function createItem(req: Request, res: Response) {
  const item = await itemService.createItem(
    req.tenantId!,
    req.userId!,
    req.body
  );

  res.status(201).json(item);
}

export async function getItems(req: Request, res: Response) {
  const items = await itemService.getItems(req.tenantId!);
  res.json(items);
}

export async function getItem(req: Request, res: Response) {
  const item = await itemService.getItem(
    req.params.itemId as string,
    req.tenantId!
  );

  res.json(item);
}

export async function requestTransition(req: Request, res: Response) {
  const result = await itemService.requestTransition({
    tenantId: req.tenantId!,
    itemId: req.params.itemId! as string,
    actorId: req.userId!,
    actorRole: req.tenantRole!,
    transitionId: req.body.transitionId,
    version: req.body.version,
    idempotencyKey: req.body.idempotencyKey,
  });

  res.json(result);
}