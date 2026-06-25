import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, CurrentUser } from '@/lib/getCurrentUser';

/**
 * Require authenticated user (non-BANNED).
 * Returns the user if valid, or sends a 401/403 response.
 * Use: const auth = await requireAuth(request); if (!auth) return auth.res;
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: CurrentUser } | { res: NextResponse }> {
  const user = await getCurrentUser(request);
  if (!user) {
    return { res: NextResponse.json({ error: '请先登录' }, { status: 401 }) };
  }
  if (user.role === 'BANNED') {
    return { res: NextResponse.json({ error: '账号已被禁用' }, { status: 403 }) };
  }
  return { user };
}

/**
 * Require ADMIN role.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ user: CurrentUser } | { res: NextResponse }> {
  const user = await getCurrentUser(request);
  if (!user) {
    return { res: NextResponse.json({ error: '请先登录' }, { status: 401 }) };
  }
  if (user.role !== 'ADMIN') {
    return { res: NextResponse.json({ error: '无权访问' }, { status: 403 }) };
  }
  return { user };
}
