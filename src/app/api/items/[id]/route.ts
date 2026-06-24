import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的商品ID' }, { status: 400 });
    }

    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    if (item.sellerId !== currentUser.userId) {
      return NextResponse.json({ error: '无权操作此商品' }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = ['status', 'title', 'description', 'price', 'category', 'images'];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: updates,
      include: {
        seller: {
          select: { id: true, username: true, avatar: true, contact: true },
        },
      },
    });

    return NextResponse.json(updatedItem);
  } catch {
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的商品ID' }, { status: 400 });
    }

    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    if (item.sellerId !== currentUser.userId) {
      return NextResponse.json({ error: '无权操作此商品' }, { status: 403 });
    }

    await prisma.item.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
