import { NextRequest } from 'next/server';
import { verifyToken, JwtPayload } from '@/lib/auth';
import prisma from '@/lib/db';

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

  // Verify role against database to catch BANNED users whose JWT predates the ban
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    });
    if (!user) return null;
    return {
      userId: payload.userId,
      studentId: payload.studentId,
      name: payload.name,
      role: user.role,
    };
  } catch {
    // DB unavailable — fallback to JWT role
    return {
      userId: payload.userId,
      studentId: payload.studentId,
      name: payload.name,
      role: payload.role,
    };
  }
}
