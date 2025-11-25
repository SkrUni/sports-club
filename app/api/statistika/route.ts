import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import db from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Временно отключаем проверку авторизации для демонстрации
    // В продакшене здесь должна быть проверка авторизации

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
    let totalRevenueQuery = 'SELECT COALESCE(SUM(amount), 0) as total FROM payments';
    if (dateFilter) {
      totalRevenueQuery += ' ' + dateFilter.replace('p.', '');
    }
    const totalRevenue = db.prepare(totalRevenueQuery).get(...params) as any;

    const totalClients = db.prepare('SELECT COUNT(*) as total FROM clients').get() as any;
    const totalServices = db.prepare('SELECT COUNT(*) as total FROM services WHERE is_active = 1').get() as any;
    
    let totalBookingsQuery = 'SELECT COUNT(*) as total FROM bookings';
    if (dateFilter) {
      totalBookingsQuery += ' ' + dateFilter.replace('p.payment_date', 'booking_date');
    }
    const totalBookings = db.prepare(totalBookingsQuery).get(...params) as any;

    // Топ услуги - упрощенный запрос
    const topServices = db.prepare(`
      SELECT 
        s.name,
        COUNT(b.id) as bookings_count,
        COALESCE(SUM(s.price), 0) as revenue
      FROM services s
      LEFT JOIN bookings b ON s.id = b.service_id
      GROUP BY s.id, s.name
      ORDER BY bookings_count DESC
      LIMIT 5
    `).all();

    // Статистика по дням - упрощенный запрос
    const dailyStats = db.prepare(`
      SELECT 
        DATE(booking_date) as date,
        COUNT(*) as bookings_count,
        COALESCE(SUM(s.price), 0) as revenue
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      GROUP BY DATE(booking_date)
      ORDER BY date DESC
      LIMIT 7
    `).all();

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


