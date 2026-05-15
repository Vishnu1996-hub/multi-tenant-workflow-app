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
      data: user,
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
      data: result,
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
  console.log('Getting profile for userId:', req.userId);
  try {
    const user = await authService.getProfile(req.userId!);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}