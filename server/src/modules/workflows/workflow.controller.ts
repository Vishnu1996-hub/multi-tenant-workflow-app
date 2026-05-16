import { Request, Response, NextFunction } from 'express';
import * as service from './workflow.service';

export async function createWorkflow(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log('Creating workflow with data:', req.body);
    const result = await service.createWorkflow(
      req.tenantId!,
      req.userId!,
      req.body
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getWorkflows(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await service.getWorkflows(req.tenantId!);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getWorkflow(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await service.getWorkflow(
      req.tenantId!,
      req.params.workflowId as string
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function addState(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await service.addState(
      req.tenantId!,
      req.params.workflowId as string,
      req.body
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function addTransition(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await service.addTransition(
      req.tenantId!,
      req.params.workflowId as string,
      req.body
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}