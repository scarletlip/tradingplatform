import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';

// PATCH: reset password or toggle role/status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentUser(request);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: '无效的用户ID' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'reset-password') {
      const newPassword = body.password || '123456';
      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
      });
      return NextResponse.json({ success: true, message: `密码已重置为 ${newPassword}` });
    }

    if (action === 'toggle-ban') {
      const newRole = user.role === 'BANNED' ? 'USER' : 'BANNED';
      await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
      });
      return NextResponse.json({ success: true, role: newRole });
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
