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

    const url = new URL(request.url);
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');

    let query = `
      SELECT 
        p.*,
        c.name as client_name,
        s.name as service_name
      FROM payments p
      JOIN clients c ON p.client_id = c.id
      JOIN services s ON p.service_id = s.id
    `;

    const params: any[] = [];

    if (startDate && endDate) {
      query += ' WHERE DATE(p.payment_date) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY p.payment_date DESC';

    const payments = db.prepare(query).all(...params);

    return NextResponse.json({ payments });

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
    const { client_id, service_id, amount, payment_method } = body;

    if (!client_id || !service_id || !amount || !payment_method) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      INSERT INTO payments (client_id, service_id, amount, payment_method)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(client_id, service_id, amount, payment_method);

    const newPayment = db.prepare(`
      SELECT 
        p.*,
        c.name as client_name,
        s.name as service_name
      FROM payments p
      JOIN clients c ON p.client_id = c.id
      JOIN services s ON p.service_id = s.id
      WHERE p.id = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json({
      message: 'Платеж успешно добавлен',
      payment: newPayment
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}


