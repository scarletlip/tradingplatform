import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/guard';

// DELETE: cancel reservation (buyer or seller)
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

    const reservation = await prisma.reservation.findUnique({ where: { itemId } });
    if (!reservation) {
      return NextResponse.json({ error: '预约记录不存在' }, { status: 404 });
    }

    // Only the buyer or seller can cancel
    if (auth.user.userId !== reservation.buyerId && auth.user.userId !== reservation.sellerId) {
      return NextResponse.json({ error: '无权取消此预约' }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.reservation.delete({ where: { itemId } }),
      prisma.item.update({ where: { id: itemId }, data: { status: 'ACTIVE' } }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '取消预约失败' }, { status: 500 });
  }
}
