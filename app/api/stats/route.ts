import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import db from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 });
    }

    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'month'; // month, week, day

    let dateFilter = '';
    const params: any[] = [];

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (period) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        dateFilter = 'WHERE DATE(p.payment_date) >= ?';
        params.push(weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString().split('T')[0];
        dateFilter = 'WHERE DATE(p.payment_date) >= ?';
        params.push(monthAgo);
        break;
      case 'day':
        dateFilter = 'WHERE DATE(p.payment_date) = ?';
        params.push(today);
        break;
    }

    // Общая статистика
    const totalRevenue = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM payments 
      ${dateFilter.replace('p.', '')}
    `).get(...params) as any;

    const totalClients = db.prepare('SELECT COUNT(*) as total FROM clients').get() as any;
    const totalServices = db.prepare('SELECT COUNT(*) as total FROM services WHERE is_active = 1').get() as any;
    const totalBookings = db.prepare(`
      SELECT COUNT(*) as total 
      FROM bookings 
      ${dateFilter.replace('p.payment_date', 'booking_date')}
    `).get(...params) as any;

    // Топ услуги
    const topServices = db.prepare(`
      SELECT 
        s.name,
        COUNT(p.id) as bookings_count,
        SUM(p.amount) as revenue
      FROM services s
      LEFT JOIN payments p ON s.id = p.service_id ${dateFilter}
      GROUP BY s.id, s.name
      ORDER BY bookings_count DESC
      LIMIT 5
    `).all(...params);

    // Статистика по дням недели
    const dailyStats = db.prepare(`
      SELECT 
        DATE(payment_date) as date,
        COUNT(*) as bookings_count,
        SUM(amount) as revenue
      FROM payments 
      ${dateFilter}
      GROUP BY DATE(payment_date)
      ORDER BY date DESC
      LIMIT 7
    `).all(...params);

    return NextResponse.json({
      stats: {
        totalRevenue: totalRevenue.total,
        totalClients: totalClients.total,
        totalServices: totalServices.total,
        totalBookings: totalBookings.total
      },
      topServices,
      dailyStats
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}



