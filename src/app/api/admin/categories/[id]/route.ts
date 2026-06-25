import { NextRequest, NextResponse } from 'next/server';
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

    const catId = parseInt(params.id);
    if (isNaN(catId)) {
      return NextResponse.json({ error: '无效的分类ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, sortOrder, action } = body;

    if (action === 'reorder') {
      // Reorder: swap with neighbor
      const all = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
      const idx = all.findIndex((c) => c.id === catId);
      if (idx === -1) {
        return NextResponse.json({ error: '分类不存在' }, { status: 404 });
      }

      const direction = body.direction; // 'up' or 'down'
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= all.length) {
        return NextResponse.json({ error: '无法移动' }, { status: 400 });
      }

      await prisma.category.update({ where: { id: all[idx].id }, data: { sortOrder: all[swapIdx].sortOrder } });
      await prisma.category.update({ where: { id: all[swapIdx].id }, data: { sortOrder: all[idx].sortOrder } });

      return NextResponse.json({ success: true });
    }

    if (name !== undefined) {
      const updated = await prisma.category.update({
        where: { id: catId },
        data: { name: name.trim() },
      });
      return NextResponse.json(updated);
    }

    if (sortOrder !== undefined) {
      const updated = await prisma.category.update({
        where: { id: catId },
        data: { sortOrder },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: '无有效更新字段' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
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

    const catId = parseInt(params.id);
    if (isNaN(catId)) {
      return NextResponse.json({ error: '无效的分类ID' }, { status: 400 });
    }

    const cat = await prisma.category.findUnique({ where: { id: catId } });
    if (!cat) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 });
    }
    if (cat.name === '全部') {
      return NextResponse.json({ error: '不能删除"全部"分类' }, { status: 400 });
    }

    const itemCount = await prisma.item.count({ where: { category: cat.name } });
    if (itemCount > 0) {
      return NextResponse.json({ error: `该分类下有 ${itemCount} 件商品，无法删除` }, { status: 400 });
    }

    await prisma.category.delete({ where: { id: catId } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
