import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/guard';

// POST: create reservation
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
    if (item.status !== 'ACTIVE') {
      return NextResponse.json({ error: '该商品不可预约' }, { status: 400 });
    }
    if (item.sellerId === auth.user.userId) {
      return NextResponse.json({ error: '不能预约自己的商品' }, { status: 400 });
    }

    // Create reservation and update item status atomically
    const [reservation] = await prisma.$transaction([
      prisma.reservation.create({
        data: {
          itemId,
          buyerId: auth.user.userId,
          sellerId: item.sellerId,
        },
        include: {
          buyer: { select: { id: true, studentId: true, name: true, email: true, dormitory: true, phone: true } },
        },
      }),
      prisma.item.update({
        where: { id: itemId },
        data: { status: 'RESERVED' },
      }),
    ]);

    return NextResponse.json(reservation, { status: 201 });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'P2002') {
      return NextResponse.json({ error: '该商品已被预约' }, { status: 409 });
    }
    return NextResponse.json({ error: '预约失败' }, { status: 500 });
  }
}

// GET: list my reservations (as buyer) or my items' reservations (as seller)
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if ('res' in auth) return auth.res;

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'buyer'; // 'buyer' or 'seller'

    let reservations;
    if (role === 'seller') {
      reservations = await prisma.reservation.findMany({
        where: { sellerId: auth.user.userId },
        include: {
          item: true,
          buyer: { select: { id: true, studentId: true, name: true, email: true, dormitory: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      reservations = await prisma.reservation.findMany({
        where: { buyerId: auth.user.userId },
        include: {
          item: { include: { seller: { select: { id: true, studentId: true, name: true, dormitory: true, phone: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(reservations);
  } catch {
    return NextResponse.json({ error: '获取预约记录失败' }, { status: 500 });
  }
}
