import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/guard';
import { saveImage, validateImage } from '@/lib/image';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的商品ID' }, { status: 400 });
    }

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        seller: {
          select: { id: true, studentId: true, name: true, avatar: true, email: true, dormitory: true, phone: true },
        },
        reservation: {
          include: {
            buyer: { select: { id: true, studentId: true, name: true, email: true, dormitory: true, phone: true } },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: '获取商品失败' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request);
    if ('res' in auth) return auth.res;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的商品ID' }, { status: 400 });
    }

    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    // Admin can edit any item; regular users can only edit their own
    if (auth.user.role !== 'ADMIN' && item.sellerId !== auth.user.userId) {
      return NextResponse.json({ error: '无权操作此商品' }, { status: 403 });
    }

    const contentType = request.headers.get('content-type') || '';
    const updates: Record<string, unknown> = {};

    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      const stringFields = ['status', 'title', 'description', 'category', 'subCategory', 'condition', 'campusLocation', 'tradeMethod'];
      const numberFields = ['price', 'originalPrice'];
      for (const field of stringFields) {
        const val = formData.get(field);
        if (val !== undefined && val !== null) updates[field] = val;
      }
      for (const field of numberFields) {
        const val = formData.get(field) as string | null;
        if (val !== undefined && val !== null && val !== '') updates[field] = parseFloat(val);
      }

      // Handle new image upload
      const newImageFile = formData.get('image') as File | null;
      if (newImageFile && newImageFile.size > 0) {
        const err = validateImage(newImageFile);
        if (err) return NextResponse.json({ error: err }, { status: 400 });
        if (item.images) {
          const oldFilePath = path.join(process.cwd(), 'public', item.images);
          if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
        }
        updates.images = await saveImage(newImageFile);
      }
    } else {
      const body = await request.json();
      Object.assign(updates, body);
    }

    // Validate price
    if (updates.price !== undefined) {
      const p = parseFloat(updates.price as string);
      if (isNaN(p) || p <= 0 || p > 999999) {
        return NextResponse.json({ error: '价格需在 0.01-999999 之间' }, { status: 400 });
      }
      updates.price = p;
    }

    // Validate status transitions (non-admin users)
    if (updates.status && auth.user.role !== 'ADMIN') {
      const validTransitions: Record<string, string[]> = {
        ACTIVE: ['RESERVED', 'SOLD', 'OFFLINE'],
        RESERVED: ['ACTIVE', 'SOLD'],
        OFFLINE: ['ACTIVE'],
        SOLD: [],
      };
      const allowed = validTransitions[item.status] || [];
      if (!allowed.includes(updates.status as string)) {
        return NextResponse.json({ error: `不能从"${item.status}"改为"${updates.status}"` }, { status: 400 });
      }
    }

    if (Object.keys(updates).length > 0) {
      // If status changes away from RESERVED, delete reservation atomically
      if (item.status === 'RESERVED' && updates.status && updates.status !== 'RESERVED') {
        await prisma.$transaction([
          prisma.reservation.deleteMany({ where: { itemId: id } }),
          prisma.item.update({ where: { id }, data: updates, include: { seller: { select: { id: true, studentId: true, name: true, avatar: true, email: true, dormitory: true, phone: true } } } }),
        ]);
        const refreshed = await prisma.item.findUnique({ where: { id }, include: { seller: { select: { id: true, studentId: true, name: true, avatar: true, email: true, dormitory: true, phone: true } } } });
        return NextResponse.json(refreshed);
      }

      const updatedItem = await prisma.item.update({
        where: { id },
        data: updates,
        include: {
          seller: {
            select: { id: true, studentId: true, name: true, avatar: true, email: true, dormitory: true, phone: true },
          },
        },
      });
      return NextResponse.json(updatedItem);
    }

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request);
    if ('res' in auth) return auth.res;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的商品ID' }, { status: 400 });
    }

    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    if (auth.user.role !== 'ADMIN' && item.sellerId !== auth.user.userId) {
      return NextResponse.json({ error: '无权操作此商品' }, { status: 403 });
    }

    // Delete associated image file
    if (item.images) {
      const imgPath = path.join(process.cwd(), 'public', item.images);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await prisma.item.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}

