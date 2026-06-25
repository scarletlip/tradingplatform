import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentUser(request);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: '获取分类列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser(request);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: '分类名称不能为空' }, { status: 400 });
    }

    const maxOrder = await prisma.category.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const category = await prisma.category.create({
      data: { name: name.trim(), sortOrder: (maxOrder?.sortOrder || 0) + 1 },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === 'P2002') {
      return NextResponse.json({ error: '分类名称已存在' }, { status: 409 });
    }
    return NextResponse.json({ error: '创建分类失败' }, { status: 500 });
  }
}
