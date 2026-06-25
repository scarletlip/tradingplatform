import { NextRequest } from 'next/server';
import { verifyToken, JwtPayload } from '@/lib/auth';

export interface CurrentUser {
  userId: number;
  studentId: string;
  name: string;
  role: string;
}

export async function getCurrentUser(request: NextRequest): Promise<CurrentUser | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  const payload: JwtPayload | null = verifyToken(token);

  if (!payload) {
    return null;
  }

  return {
    userId: payload.userId,
    studentId: payload.studentId,
    name: payload.name,
    role: payload.role,
  };
}
