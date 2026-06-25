import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(_request: NextRequest) {
  try {
    const [activeItems, totalUsers, catCount] = await Promise.all([
      prisma.item.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.category.count(),
    ]);
    return NextResponse.json({ items: activeItems, users: totalUsers, categories: catCount });
  } catch {
    return NextResponse.json({ items: 0, users: 0, categories: 0 });
  }
}
