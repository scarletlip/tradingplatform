import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';

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

    // Remove favorite (toggle off)
    await prisma.favorite.deleteMany({
      where: { userId: currentUser.userId, itemId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '取消收藏失败' }, { status: 500 });
  }
}

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
