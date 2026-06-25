import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { studentId, password } = await request.json();

    if (!studentId || !password) {
      return NextResponse.json(
        { error: '学号和密码为必填项' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { studentId },
    });

    if (!user) {
      return NextResponse.json(
        { error: '学号或密码错误' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: '学号或密码错误' },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: user.id,
      studentId: user.studentId,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        studentId: user.studentId,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        email: user.email,
        dormitory: user.dormitory,
        phone: user.phone,
      },
    });
  } catch {
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
