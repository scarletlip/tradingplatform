import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: currentUser.userId },
      include: {
        item: {
          include: {
            seller: {
              select: { id: true, username: true, avatar: true, contact: true },
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
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json({ error: '商品ID为必填项' }, { status: 400 });
    }

    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    const favorite = await prisma.favorite.create({
      data: { userId: currentUser.userId, itemId },
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
