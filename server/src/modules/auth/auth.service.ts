import bcrypt from 'bcrypt';
import { createUser, findUserByEmail, findUserById } from './auth.repository';
import { AppError } from '../../utils/error';
import { LoginInput, RegisterInput, AuthResponse } from './auth.types';
import { generateToken, sanitizeUser } from './auth.utils';
import { createAuditLog } from '../audit/audit.service';
import { AuditAction } from '@prisma/client';

export async function registerUser(data: RegisterInput) {
  const existing = await findUserByEmail(data.email);

  if (existing) {
    throw new AppError('Email already registered', 400);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await createUser({
    email: data.email,
    passwordHash: hashedPassword,
    fullName: data.fullName,
  });

  await createAuditLog({
    actorId: user.id,
    action: AuditAction.user_registered,
    entityType: 'user',
    entityId: user.id,
    afterState: {
      email: user.email,
      fullName: user.fullName,
    },
  });

  const token = generateToken(user.id);

  return { token, user: sanitizeUser(user) };
}

export async function loginUser(data: LoginInput): Promise<AuthResponse> {
  const user = await findUserByEmail(data.email);

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isValid = await bcrypt.compare(
    data.password,
    user.passwordHash
  );

  if (!isValid) {
    throw new AppError('Invalid credentials', 401);
  }

  await createAuditLog({
    actorId: user.id,
    action: AuditAction.user_logged_in,
    entityType: 'user',
    entityId: user.id,
    metadata: {
      email: user.email,
    },
  });

  const token = generateToken(user.id);

  return {
    token,
    user: sanitizeUser(user),
  };
}

export async function getProfile(userId: string) {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return sanitizeUser(user);
}

