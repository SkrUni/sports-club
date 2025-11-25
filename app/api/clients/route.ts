import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hasRequiredRole } from '@/lib/auth';
import db from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!hasRequiredRole(decoded, ['sys_admin', 'admin'])) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const clients = db.prepare(`
      SELECT * FROM clients 
      ORDER BY name ASC
    `).all();

    return NextResponse.json({ clients });

  } catch (error) {
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
    if (!hasRequiredRole(decoded, ['sys_admin', 'admin'])) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const body = await request.json();
    const { name, phone, email } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Имя клиента обязательно' },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      INSERT INTO clients (name, phone, email)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(name, phone || '', email || '');

    const newClient = db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({
      message: 'Клиент успешно добавлен',
      client: newClient
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}



