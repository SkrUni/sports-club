import { NextRequest, NextResponse } from 'next/server';
import { loginUser, generateToken } from '@/lib/auth';
import { initDatabase, createDefaultAdmin, migrateDatabase, createDefaultServices } from '@/lib/database';

// Флаг инициализации структуры БД
let isDbInitialized = false;

// Инициализация базы данных
async function initializeDatabase() {
  if (!isDbInitialized) {
    console.log('Инициализация структуры базы данных...');
    initDatabase();
    migrateDatabase();
    await createDefaultServices(); // Исправлено: добавлен await
    isDbInitialized = true;
  }
  
  // ВСЕГДА обновляем пароли администраторов при каждом запросе
  // Это гарантирует, что пароли всегда правильные
  console.log('Обновление паролей администраторов...');
  await createDefaultAdmin();
}

export async function POST(request: NextRequest) {
  // Убеждаемся, что всегда возвращаем JSON, даже при критических ошибках
  try {
    // Инициализируем базу данных и обновляем пароли администраторов
    console.log('=== API /api/avtorizaciya/vhod вызван ===');
    
    try {
      await initializeDatabase();
      console.log('База данных инициализирована, пытаемся войти...');
    } catch (initError: any) {
      console.error('Ошибка инициализации базы данных:', initError);
      return NextResponse.json(
        { error: 'Ошибка инициализации базы данных: ' + initError.message },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    let body;
    try {
      body = await request.json();
    } catch (parseError: any) {
      console.error('Ошибка парсинга тела запроса:', parseError);
      return NextResponse.json(
        { error: 'Неверный формат запроса' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    const { email, password } = body;

    console.log('Получены данные для входа - Email:', email);

    // Валидация
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    let user;
    try {
      user = await loginUser({ email, password });
      console.log('Пользователь найден после входа:', user);
      console.log('Роль пользователя:', user.role);
    } catch (loginError: any) {
      console.error('Ошибка входа:', loginError);
      return NextResponse.json(
        { error: loginError.message || 'Ошибка входа в систему' },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    const token = generateToken(user);

    const response = NextResponse.json({
      message: 'Успешный вход в систему',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Ответ API:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    // Устанавливаем токен в cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 дней
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('Неожиданная ошибка в API:', error);
    console.error('Стек ошибки:', error.stack);
    
    // Всегда возвращаем JSON, даже при критических ошибках
    try {
      return NextResponse.json(
        { 
          error: error.message || 'Внутренняя ошибка сервера',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    } catch (jsonError) {
      // Если даже создание JSON ответа не удалось, создаем простой текстовый ответ
      return new NextResponse(
        JSON.stringify({ error: 'Критическая ошибка сервера' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
  }
}
