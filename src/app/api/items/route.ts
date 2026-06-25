import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { status: 'ACTIVE' };
    if (category && category !== '全部') {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const items = await prisma.item.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const imageFile = formData.get('image') as File | null;

    if (!title || !price || !category) {
      return NextResponse.json({ error: '标题、价格和分类为必填项' }, { status: 400 });
    }

    let imagesUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
      imagesUrl = await saveImage(imageFile);
    }

    const item = await prisma.item.create({
      data: {
        title,
        description: description || null,
        price: parseFloat(price),
        category,
        images: imagesUrl,
        sellerId: currentUser.userId,
        status: 'ACTIVE',
      },
      include: {
        seller: {
          select: { id: true, username: true, avatar: true, contact: true },
        },
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: '创建商品失败' }, { status: 500 });
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
