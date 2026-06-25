import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/guard';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if ('res' in admin) return admin.res;

    const [totalUsers, totalItems, activeItems, soldItems, offlineItems] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.item.count(),
      prisma.item.count({ where: { status: 'ACTIVE' } }),
      prisma.item.count({ where: { status: 'SOLD' } }),
      prisma.item.count({ where: { status: 'OFFLINE' } }),
    ]);

    const categoryStats = await prisma.item.groupBy({
      by: ['category'],
      _count: true,
    });

    const categories = categoryStats.map((c) => ({
      name: c.category,
      count: c._count,
    }));

    return NextResponse.json({
      totalUsers,
      totalItems,
      activeItems,
      soldItems,
      offlineItems,
      categories,
    });
  } catch {
    return NextResponse.json({ error: '获取统计失败' }, { status: 500 });
  }
}
