import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/guard';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if ('res' in admin) return admin.res;

    const users = await prisma.user.findMany({
      where: { role: { not: 'ADMIN' } },
      select: {
        id: true, studentId: true, name: true, email: true,
        dormitory: true, phone: true, role: true, createdAt: true,
        _count: { select: { items: true } },
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 });
  }
}
