import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hasRequiredRole, registerUser } from '@/lib/auth';
import db from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!hasRequiredRole(decoded, ['sys_admin'])) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const admins = db
      .prepare(
        `
          SELECT id, email, name, created_at
          FROM users
          WHERE role = 'admin'
          ORDER BY created_at DESC
        `
      )
      .all();

    return NextResponse.json({ admins });
  } catch (error) {
    console.error('Ошибка получения администраторов:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!hasRequiredRole(decoded, ['sys_admin'])) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    const user = await registerUser({
      email,
      password,
      name,
      role: 'admin',
    });

    return NextResponse.json(
      {
        message: 'Администратор успешно создан',
        user,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Ошибка создания администратора:', error);
    return NextResponse.json(
      { error: error?.message || 'Ошибка сервера' },
      { status: 500 }
    );
  }
}








