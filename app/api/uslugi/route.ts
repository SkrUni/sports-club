import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import db from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Временно отключаем проверку авторизации для демонстрации
    // В продакшене здесь должна быть проверка авторизации

    const services = db.prepare(`
      SELECT * FROM services 
      WHERE is_active = 1 
      ORDER BY name ASC
    `).all();

    return NextResponse.json({ services });

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
    if (!decoded) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, duration, category } = body;

    if (!name || !price || !duration || !category) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      INSERT INTO services (name, description, price, duration, category)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, description || '', price, duration, category);

    const newService = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({
      message: 'Услуга успешно создана',
      service: newService
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}


