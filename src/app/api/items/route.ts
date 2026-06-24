import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: Record<string, unknown> = { status: 'ACTIVE' };
    if (category && category !== '全部') {
      where.category = category;
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
