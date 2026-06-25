import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentUser(request);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const sellerId = searchParams.get('sellerId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');

    const where: Record<string, unknown> = {};
    if (status && status !== 'ALL') where.status = status;
    if (category) where.category = category;
    if (sellerId) where.sellerId = parseInt(sellerId);

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        include: {
          seller: {
            select: { id: true, studentId: true, name: true, dormitory: true, phone: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.item.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, pageSize });
  } catch {
    return NextResponse.json({ error: '获取商品列表失败' }, { status: 500 });
  }
}
