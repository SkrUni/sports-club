import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';
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
  console.log('Обновление паролей администраторов...');
  await createDefaultAdmin();
}

export async function POST(request: NextRequest) {
  // Инициализируем базу данных и обновляем пароли администраторов
  await initializeDatabase();
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Валидация
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      );
    }

    const user = await registerUser({ email, password, name });
    
    return NextResponse.json({
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
