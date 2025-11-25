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

    // Сначала находим client_id по user_id
    let client = db.prepare('SELECT id FROM clients WHERE user_id = ?').get(params.id);
    if (!client) {
      // Если не найден по user_id, используем id напрямую
      client = { id: params.id };
    }

    const bookings = db.prepare(`
      SELECT 
        b.*,
        s.name as service_name,
        s.price as service_price
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.client_id = ?
      ORDER BY b.booking_date DESC, b.booking_time DESC
    `).all(client.id);

    return NextResponse.json({ bookings });

  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
