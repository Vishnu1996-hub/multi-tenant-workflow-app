import jwt from 'jsonwebtoken';

export function generateToken(userId: string) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1d' }
  );
}

export function sanitizeUser<T extends { passwordHash: string }>(
  user: T
) {
  const { passwordHash: _pw, ...safeUser } = user;
  return safeUser;
}