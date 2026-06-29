import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentUser(request);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const itemId = parseInt(params.id);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: '无效的商品ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['ACTIVE', 'SOLD', 'OFFLINE'].includes(status)) {
      return NextResponse.json({ error: '无效的状态' }, { status: 400 });
    }

    // Clean up reservation if changing away from RESERVED
    await prisma.reservation.deleteMany({ where: { itemId } });

    const item = await prisma.item.update({
      where: { id: itemId },
      data: { status },
    });

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentUser(request);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const itemId = parseInt(params.id);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: '无效的商品ID' }, { status: 400 });
    }

    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    // Clean up image file
    if (item.images) {
      const imgPath = path.join(process.cwd(), 'public', item.images);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await prisma.item.delete({ where: { id: itemId } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
