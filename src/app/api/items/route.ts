import { NextRequest, NextResponse } from 'next/server';
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

    const body = await request.json();
    const { title, description, price, category, images } = body;

    if (!title || !price || !category) {
      return NextResponse.json({ error: '标题、价格和分类为必填项' }, { status: 400 });
    }

    const item = await prisma.item.create({
      data: {
        title,
        description: description || null,
        price: parseFloat(price),
        category,
        images: images || null,
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
