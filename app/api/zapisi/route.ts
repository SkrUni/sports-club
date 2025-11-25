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
  // Инициализируем БД
  await initializeDatabase();
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
    // Инициализируем БД
    await initializeDatabase();
    
    console.log('=== СОЗДАНИЕ ЗАПИСИ (API) ===');
    
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      console.log('❌ Токен не найден');
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('❌ Токен недействителен');
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 });
    }

    console.log('✅ Пользователь:', decoded.email, 'Роль:', decoded.role, 'ID:', decoded.id);

    const body = await request.json();
    const { client_id, service_id, trainer_id, booking_date, booking_time, notes } = body;

    console.log('Данные записи:', { client_id, service_id, trainer_id, booking_date, booking_time });

    // Если пользователь - обычный клиент (роль 'user'), проверяем что он создает запись для себя
    if (decoded.role === 'user') {
      // Получаем ID клиента по user_id
      const clientRecord = db.prepare('SELECT id FROM clients WHERE user_id = ?').get(decoded.id) as { id: number } | undefined;
      
      if (!clientRecord) {
        console.log('❌ Клиент не найден для user_id:', decoded.id);
        return NextResponse.json({ error: 'Клиент не найден' }, { status: 404 });
      }
      
      console.log('Client ID из базы:', clientRecord.id, 'Client ID из запроса:', client_id);
      
      if (clientRecord.id !== client_id) {
        console.log('❌ Клиент пытается создать запись для другого клиента');
        return NextResponse.json({ error: 'Вы можете создавать записи только для себя' }, { status: 403 });
      }
    }

    // Проверяем права доступа (админы, сисадмины и обычные пользователи могут создавать записи)
    if (!hasRequiredRole(decoded, ['sys_admin', 'admin', 'user'])) {
      console.log('❌ Недостаточно прав, роль:', decoded.role);
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    console.log('✅ Проверка прав прошла успешно');

    if (!client_id || !service_id || !booking_date || !booking_time) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    // Проверяем только если указан trainer_id (не null, не undefined, не пустая строка)
    const parsedTrainerId = trainer_id ? parseInt(trainer_id, 10) : null;
    console.log('trainer_id:', trainer_id, '→ parsedTrainerId:', parsedTrainerId);
    console.log('booking_time:', booking_time, 'тип:', typeof booking_time);
    
    if (parsedTrainerId && !isNaN(parsedTrainerId)) {
      console.log('=== ПРОВЕРКА ТРЕНЕРА ===');
      console.log('ID тренера:', parsedTrainerId);
      console.log('Время записи:', booking_time);
      console.log('Дата записи:', booking_date);
      
      const staffMember = getStaffMemberById(parsedTrainerId);
      if (!staffMember) {
        console.log('❌ Сотрудник не найден');
        return NextResponse.json(
          { error: 'Выбранный сотрудник не найден' },
          { status: 400 }
        );
      }

      console.log('✅ Сотрудник найден:', staffMember.name);
      console.log('Рабочее время сотрудника:', staffMember.work_start, '-', staffMember.work_end);
      console.log('Длительность слота:', staffMember.slot_duration, 'минут');

      // Проверяем, что время записи находится в рабочем времени сотрудника
      const timeValidation = isTimeWithinWorkingHours(parsedTrainerId, booking_time);
      console.log('Результат проверки времени работы:', JSON.stringify(timeValidation, null, 2));
      
      if (!timeValidation.valid) {
        console.log('❌ ВАЛИДАЦИЯ НЕ ПРОЙДЕНА: Время вне рабочего времени');
        return NextResponse.json(
          { error: timeValidation.error || 'Время записи вне рабочего времени сотрудника' },
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }

      // Проверяем, что время не занято
      const availabilityCheck = isTimeSlotAvailable(parsedTrainerId, booking_date, booking_time);
      console.log('Результат проверки доступности:', JSON.stringify(availabilityCheck, null, 2));
      
      if (!availabilityCheck.available) {
        console.log('❌ ВАЛИДАЦИЯ НЕ ПРОЙДЕНА: Время уже занято');
        return NextResponse.json(
          { error: availabilityCheck.error || 'Время уже занято' },
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }
      
      console.log('✅ ВСЕ ПРОВЕРКИ ТРЕНЕРА ПРОЙДЕНЫ УСПЕШНО');
    } else {
      console.log('⚠️ Тренер не указан (trainer_id:', trainer_id, '), пропускаем проверки рабочего времени');
    }

    console.log('Вставка записи в базу данных...');
    const stmt = db.prepare(`
      INSERT INTO bookings (client_id, service_id, trainer_id, booking_date, booking_time, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(client_id, service_id, parsedTrainerId, booking_date, booking_time, notes || '');
    console.log('✅ Запись создана, ID:', result.lastInsertRowid);

    const newBooking = db.prepare(`
      SELECT 
        b.*,
        c.name as client_name,
        s.name as service_name,
        s.price as service_price,
        u.name as staff_name,
        st.specialization as staff_specialization
      FROM bookings b
      JOIN clients c ON b.client_id = c.id
      JOIN services s ON b.service_id = s.id
      LEFT JOIN staff st ON b.trainer_id = st.id
      LEFT JOIN users u ON st.user_id = u.id
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


