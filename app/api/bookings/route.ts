import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hasRequiredRole } from '@/lib/auth';
import db, { initDatabase, migrateDatabase, createDefaultServices, createDefaultAdmin } from '@/lib/database';
import { getStaffMemberByUserId, getStaffMemberById, isTimeWithinWorkingHours, isTimeSlotAvailable } from '@/lib/staff';

// Флаг инициализации
let isDbInitialized = false;

async function initializeDatabase() {
  if (isDbInitialized) {
    return;
  }
  initDatabase();
  migrateDatabase();
  await createDefaultServices();
  await createDefaultAdmin();
  isDbInitialized = true;
}

export async function GET(request: NextRequest) {
  try {
    // Инициализируем БД
    await initializeDatabase();
    
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 });
    }

    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const staffIdParam = url.searchParams.get('staffId');

    let effectiveStaffId: number | null = null;

    if (decoded.role === 'trainer' || decoded.role === 'masseur') {
      const staffMember = getStaffMemberByUserId(decoded.id);
      if (!staffMember) {
        return NextResponse.json(
          { error: 'Профиль сотрудника не найден' },
          { status: 404 }
        );
      }
      effectiveStaffId = staffMember.id;
    } else if (staffIdParam) {
      effectiveStaffId = parseInt(staffIdParam, 10);
      if (Number.isNaN(effectiveStaffId)) {
        return NextResponse.json(
          { error: 'Некорректный идентификатор сотрудника' },
          { status: 400 }
        );
      }
    }

    let query = `
      SELECT 
        b.*,
        c.name as client_name,
        c.phone as client_phone,
        s.name as service_name,
        s.price as service_price,
        sm.name as staff_name,
        sm.specialization as staff_specialization
      FROM bookings b
      JOIN clients c ON b.client_id = c.id
      JOIN services s ON b.service_id = s.id
      LEFT JOIN staff_members sm ON b.trainer_id = sm.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (date) {
      conditions.push('b.booking_date = ?');
      params.push(date);
    }

    if (effectiveStaffId) {
      conditions.push('b.trainer_id = ?');
      params.push(effectiveStaffId);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY b.booking_date, b.booking_time';

    const bookings = db.prepare(query).all(...params);

    return NextResponse.json({ bookings });

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

    if (!hasRequiredRole(decoded, ['sys_admin', 'admin'])) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const body = await request.json();
    const { client_id, service_id, trainer_id, booking_date, booking_time, notes } = body;

    if (!client_id || !service_id || !booking_date || !booking_time) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    // Проверяем только если указан trainer_id (не null, не undefined, не пустая строка)
    const parsedTrainerId = trainer_id ? parseInt(trainer_id, 10) : null;
    if (parsedTrainerId && !isNaN(parsedTrainerId)) {
      const staffMember = getStaffMemberById(parsedTrainerId);
      if (!staffMember) {
        return NextResponse.json(
          { error: 'Выбранный сотрудник не найден' },
          { status: 400 }
        );
      }

      // Проверяем, что время записи находится в рабочем времени сотрудника
      const timeValidation = isTimeWithinWorkingHours(parsedTrainerId, booking_time);
      if (!timeValidation.valid) {
        return NextResponse.json(
          { error: timeValidation.error || 'Время записи вне рабочего времени сотрудника' },
          { status: 400 }
        );
      }

      // Проверяем, что время не занято
      const availabilityCheck = isTimeSlotAvailable(parsedTrainerId, booking_date, booking_time);
      if (!availabilityCheck.available) {
        return NextResponse.json(
          { error: availabilityCheck.error || 'Время уже занято' },
          { status: 400 }
        );
      }
    }

    const stmt = db.prepare(`
      INSERT INTO bookings (client_id, service_id, trainer_id, booking_date, booking_time, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(client_id, service_id, parsedTrainerId, booking_date, booking_time, notes || '');

    const newBooking = db.prepare(`
      SELECT 
        b.*,
        c.name as client_name,
        c.phone as client_phone,
        s.name as service_name,
        s.price as service_price,
        sm.name as staff_name,
        sm.specialization as staff_specialization
      FROM bookings b
      JOIN clients c ON b.client_id = c.id
      JOIN services s ON b.service_id = s.id
      LEFT JOIN staff_members sm ON b.trainer_id = sm.id
      WHERE b.id = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json({
      message: 'Запись успешно создана',
      booking: newBooking
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}



