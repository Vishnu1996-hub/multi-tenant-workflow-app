import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { AuthResponse, LoginInput, RegisterInput } from './auth.types';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await authService.registerUser(req.body);

    res.status(201).json({
      success: true,
       ...user,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result: AuthResponse = await authService.loginUser(req.body);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await authService.getProfile(req.userId!);

    res.json({
      success: true,
      ...user,
    });
  } catch (error) {
    next(error);
  }
}