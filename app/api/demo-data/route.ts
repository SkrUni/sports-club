import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hasRequiredRole } from '@/lib/auth';
import db from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!hasRequiredRole(decoded, ['sys_admin'])) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    // Добавляем демо-услуги
    const demoServices = [
      {
        name: 'Персональная тренировка',
        description: 'Индивидуальная тренировка с персональным тренером',
        price: 2500,
        duration: 60,
        category: 'Фитнес'
      },
      {
        name: 'Групповая йога',
        description: 'Занятия йогой в группе до 12 человек',
        price: 800,
        duration: 90,
        category: 'Йога'
      },
      {
        name: 'Плавание',
        description: 'Свободное плавание в бассейне',
        price: 600,
        duration: 45,
        category: 'Плавание'
      },
      {
        name: 'Теннис',
        description: 'Игра в теннис на корте',
        price: 1800,
        duration: 60,
        category: 'Теннис'
      },
      {
        name: 'Бокс',
        description: 'Тренировка по боксу с тренером',
        price: 1500,
        duration: 50,
        category: 'Бокс'
      },
      {
        name: 'Массаж',
        description: 'Расслабляющий массаж',
        price: 3000,
        duration: 60,
        category: 'Массаж'
      },
      {
        name: 'Танцы',
        description: 'Групповые занятия танцами',
        price: 1000,
        duration: 60,
        category: 'Танцы'
      }
    ];

    // Добавляем демо-клиентов
    const demoClients = [
      {
        name: 'Анна Петрова',
        phone: '+7 (912) 345-67-89',
        email: 'anna.petrova@email.com'
      },
      {
        name: 'Михаил Иванов',
        phone: '+7 (923) 456-78-90',
        email: 'mikhail.ivanov@email.com'
      },
      {
        name: 'Елена Сидорова',
        phone: '+7 (934) 567-89-01',
        email: 'elena.sidorova@email.com'
      },
      {
        name: 'Дмитрий Козлов',
        phone: '+7 (945) 678-90-12',
        email: 'dmitry.kozlov@email.com'
      },
      {
        name: 'Ольга Морозова',
        phone: '+7 (956) 789-01-23',
        email: 'olga.morozova@email.com'
      }
    ];

    let servicesAdded = 0;
    let clientsAdded = 0;

    // Добавляем услуги
    for (const service of demoServices) {
      const existingService = db.prepare('SELECT id FROM services WHERE name = ?').get(service.name);
      if (!existingService) {
        db.prepare(`
          INSERT INTO services (name, description, price, duration, category)
          VALUES (?, ?, ?, ?, ?)
        `).run(service.name, service.description, service.price, service.duration, service.category);
        servicesAdded++;
      }
    }

    // Добавляем клиентов
    for (const client of demoClients) {
      const existingClient = db.prepare('SELECT id FROM clients WHERE email = ?').get(client.email);
      if (!existingClient) {
        db.prepare(`
          INSERT INTO clients (name, phone, email, user_id)
          VALUES (?, ?, ?, NULL)
        `).run(client.name, client.phone, client.email);
        clientsAdded++;
      }
    }

    // Добавляем демо-записи
    const services = db.prepare('SELECT * FROM services').all();
    const clients = db.prepare('SELECT * FROM clients').all();

    let bookingsAdded = 0;
    if (services.length > 0 && clients.length > 0) {
      const today = new Date();
      const demoBookings = [];

      // Создаем записи на ближайшие 7 дней
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const randomClient = clients[Math.floor(Math.random() * clients.length)];
        const randomService = services[Math.floor(Math.random() * services.length)];
        const hours = 9 + Math.floor(Math.random() * 10); // с 9 до 19
        const minutes = Math.random() < 0.5 ? 0 : 30;
        
        demoBookings.push({
          client_id: randomClient.id,
          service_id: randomService.id,
          booking_date: date.toISOString().split('T')[0],
          booking_time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
          status: i < 2 ? 'completed' : 'scheduled',
          notes: i < 2 ? 'Занятие завершено' : 'Запланированное занятие'
        });
      }

      for (const booking of demoBookings) {
        const existingBooking = db.prepare(`
          SELECT id FROM bookings 
          WHERE client_id = ? AND service_id = ? AND booking_date = ? AND booking_time = ?
        `).get(booking.client_id, booking.service_id, booking.booking_date, booking.booking_time);
        
        if (!existingBooking) {
          db.prepare(`
            INSERT INTO bookings (client_id, service_id, booking_date, booking_time, status, notes)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(booking.client_id, booking.service_id, booking.booking_date, booking.booking_time, booking.status, booking.notes);
          bookingsAdded++;
        }
      }
    }

    // Добавляем демо-платежи
    const bookings = db.prepare('SELECT * FROM bookings WHERE status = ?').all('completed');
    let paymentsAdded = 0;

    for (const booking of bookings) {
      const existingPayment = db.prepare(`
        SELECT id FROM payments 
        WHERE client_id = ? AND service_id = ? AND booking_date = ?
      `).get(booking.client_id, booking.service_id, booking.booking_date);
      
      if (!existingPayment) {
        const service = db.prepare('SELECT price FROM services WHERE id = ?').get(booking.service_id);
        const paymentMethods = ['cash', 'card', 'transfer'];
        const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        
        db.prepare(`
          INSERT INTO payments (client_id, service_id, amount, payment_method)
          VALUES (?, ?, ?, ?)
        `).run(booking.client_id, booking.service_id, service.price, randomMethod);
        paymentsAdded++;
      }
    }

    return NextResponse.json({
      message: 'Демо-данные успешно добавлены',
      stats: {
        servicesAdded,
        clientsAdded,
        bookingsAdded,
        paymentsAdded
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
