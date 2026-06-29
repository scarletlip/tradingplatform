import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/guard';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if ('res' in auth) return auth.res;

    const favorites = await prisma.favorite.findMany({
      where: { userId: auth.user.userId },
      include: {
        item: {
          include: {
            seller: {
              select: { id: true, studentId: true, name: true, avatar: true, email: true, dormitory: true, phone: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(favorites.map((f) => f.item));
  } catch {
    return NextResponse.json({ error: '获取收藏失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if ('res' in auth) return auth.res;

    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json({ error: '商品ID为必填项' }, { status: 400 });
    }

    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }
    if (item.status !== 'ACTIVE' && item.status !== 'RESERVED') {
      return NextResponse.json({ error: '该商品已下架或已售出' }, { status: 400 });
    }

    const favorite = await prisma.favorite.create({
      data: { userId: auth.user.userId, itemId },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'P2002') {
      return NextResponse.json({ error: '已收藏过此商品' }, { status: 409 });
    }
    return NextResponse.json({ error: '收藏失败' }, { status: 500 });
  }
}
