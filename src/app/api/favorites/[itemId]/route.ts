import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/guard';

// DELETE: remove favorite
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const auth = await requireAuth(request);
    if ('res' in auth) return auth.res;

    const itemId = parseInt(params.itemId, 10);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: '无效的商品ID' }, { status: 400 });
    }

    await prisma.favorite.deleteMany({
      where: { userId: auth.user.userId, itemId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '取消收藏失败' }, { status: 500 });
  }
}

// GET: check if specific item is favorited
export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const auth = await requireAuth(request);
    if ('res' in auth) return auth.res;

    const itemId = parseInt(params.itemId, 10);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: '无效的商品ID' }, { status: 400 });
    }

    const fav = await prisma.favorite.findUnique({
      where: { userId_itemId: { userId: auth.user.userId, itemId } },
    });

    return NextResponse.json({ favorited: !!fav });
  } catch {
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
