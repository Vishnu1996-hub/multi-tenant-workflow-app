import { Request, Response, NextFunction } from 'express';
import * as tenantService from './tenants.service';

export async function createTenant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, slug } = req.body;

    const tenant = await tenantService.createTenant(
      name,
      slug,
      req.userId!
    );

    res.status(201).json({
      success: true,
      data: tenant,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTenants(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tenants = await tenantService.getTenants(req.userId!);

    res.json({
      success: true,
      data: tenants,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTenantById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tenant = await tenantService.getTenantById(
      req.params.tenantId as string
    );

    res.json({
      success: true,
      data: tenant,
    });
  } catch (error) {
    next(error);
  }
}

export async function addMember(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const member = await tenantService.addMember(
      req.params.tenantId as string,
      req.body.email,
      req.body.role
    );

    res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTenantMembers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const members = await tenantService.getTenantMembers(
      req.params.tenantId as string
    );

    res.json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMemberRole(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { role } = req.body;

    const member = await tenantService.updateMemberRole(
      req.params.tenantId as string,
      req.params.userId as string,
      role
    );

    res.json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeMember(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const member = await tenantService.removeMember(
      req.params.tenantId as string,
      req.params.userId as string
    );

    res.json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
}
