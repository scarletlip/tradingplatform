import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            avatar: true,
            contact: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

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

    const formData = await request.formData();
    const updates: Record<string, unknown> = {};
    const allowedFields = ['status', 'title', 'description', 'price', 'category'];

    for (const field of allowedFields) {
      const val = formData.get(field);
      if (val !== undefined && val !== '') {
        updates[field] = field === 'price' ? parseFloat(val as string) : val;
      }
    }

    // Handle new image upload — delete old file if replacing
    const newImageFile = formData.get('image') as File | null;
    if (newImageFile && newImageFile.size > 0) {
      // Delete old file
      if (item.images) {
        const oldFilePath = path.join(process.cwd(), 'public', item.images);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      updates.images = await saveImage(newImageFile);
    }

    if (Object.keys(updates).length > 0) {
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
    }

    return NextResponse.json(item);
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

    // Delete associated image file
    if (item.images) {
      const imgPath = path.join(process.cwd(), 'public', item.images);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await prisma.item.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}

function saveImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.jpg';
    const timestamp = Date.now();
    const filename = `${timestamp}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    file.arrayBuffer().then((buffer) => {
      fs.writeFile(filePath, Buffer.from(buffer), (err) => {
        if (err) return reject(err);
        resolve(`/uploads/${filename}`);
      });
    }).catch(reject);
  });
}
