import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hasRequiredRole } from '@/lib/auth';
import db from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 });
    }

    // Сначала пытаемся найти клиента по user_id, если не найден - по id
    let client = db.prepare('SELECT * FROM clients WHERE user_id = ?').get(params.id);
    if (!client) {
      client = db.prepare('SELECT * FROM clients WHERE id = ?').get(params.id);
    }

    if (!client) {
      return NextResponse.json({ error: 'Клиент не найден' }, { status: 404 });
    }

    return NextResponse.json({ client });

  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!hasRequiredRole(decoded, ['sys_admin'])) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    // Проверяем, существует ли клиент
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(params.id);
    if (!client) {
      return NextResponse.json({ error: 'Клиент не найден' }, { status: 404 });
    }

    // Удаляем связанные записи и платежи
    db.prepare('DELETE FROM bookings WHERE client_id = ?').run(params.id);
    db.prepare('DELETE FROM payments WHERE client_id = ?').run(params.id);
    
    // Удаляем клиента
    const result = db.prepare('DELETE FROM clients WHERE id = ?').run(params.id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Клиент не найден' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Клиент успешно удален'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
