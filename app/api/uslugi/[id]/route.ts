import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
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

    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(params.id);

    if (!service) {
      return NextResponse.json({ error: 'Услуга не найдена' }, { status: 404 });
    }

    return NextResponse.json({ service });

  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await request.json();
    const { name, description, price, duration, category, is_active } = body;

    const stmt = db.prepare(`
      UPDATE services 
      SET name = ?, description = ?, price = ?, duration = ?, category = ?, is_active = ?
      WHERE id = ?
    `);

    const result = stmt.run(name, description, price, duration, category, is_active, params.id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Услуга не найдена' }, { status: 404 });
    }

    const updatedService = db.prepare('SELECT * FROM services WHERE id = ?').get(params.id);

    return NextResponse.json({
      message: 'Услуга успешно обновлена',
      service: updatedService
    });

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
    if (!decoded) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 });
    }

    const stmt = db.prepare('UPDATE services SET is_active = 0 WHERE id = ?');
    const result = stmt.run(params.id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Услуга не найдена' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Услуга успешно удалена'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}


