import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/guard';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sellerId = searchParams.get('sellerId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');

    const where: Record<string, unknown> = { status: 'ACTIVE' };
    if (category && category !== '全部') where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (sellerId) where.sellerId = parseInt(sellerId);

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        include: {
          seller: {
            select: { id: true, studentId: true, name: true, avatar: true, email: true, dormitory: true, phone: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.item.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, pageSize });
  } catch {
    return NextResponse.json({ error: '获取商品失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if ('res' in auth) return auth.res;

    const formData = await request.formData();
    const title = (formData.get('title') as string) || '';
    const description = formData.get('description') as string;
    const price = parseFloat((formData.get('price') as string) || '0');
    const category = (formData.get('category') as string) || '';
    const imageFile = formData.get('image') as File | null;
    const originalPrice = formData.get('originalPrice') as string;
    const subCategory = formData.get('subCategory') as string;
    const condition = formData.get('condition') as string;
    const campusLocation = formData.get('campusLocation') as string;
    const tradeMethod = formData.get('tradeMethod') as string;

    if (!title || !category) {
      return NextResponse.json({ error: '标题和分类为必填项' }, { status: 400 });
    }
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: '请输入有效的价格' }, { status: 400 });
    }

    let imagesUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(imageFile.type)) {
        return NextResponse.json({ error: '只支持 JPG/PNG/WebP/GIF 格式' }, { status: 400 });
      }
      if (imageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: '图片大小不能超过 5MB' }, { status: 400 });
      }
      imagesUrl = await saveImage(imageFile);
    }

    const item = await prisma.item.create({
      data: {
        title,
        description: description || null,
        price,
        category,
        images: imagesUrl,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        subCategory: subCategory || null,
        condition: condition || null,
        campusLocation: campusLocation || null,
        tradeMethod: tradeMethod || null,
        sellerId: auth.user.userId,
        status: 'ACTIVE',
      },
      include: {
        seller: {
          select: { id: true, studentId: true, name: true, avatar: true, email: true, dormitory: true, phone: true },
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
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const ext = path.extname(file.name) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    file.arrayBuffer().then((buffer) => {
      fs.writeFile(filePath, Buffer.from(buffer), (err) => {
        if (err) return reject(err);
        resolve(`/uploads/${filename}`);
      });
    }).catch(reject);
  });
}
