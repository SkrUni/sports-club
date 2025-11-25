import { NextResponse } from 'next/server';
import { initDatabase, migrateDatabase, createDefaultAdmin, createDefaultServices } from '@/lib/database';
import db from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    console.log('=== Тестовая инициализация базы данных ===');
    
    // Инициализируем базу данных
    initDatabase();
    migrateDatabase();
    await createDefaultAdmin();
    await createDefaultServices();
    
    // Проверяем, что администратор существует и пароль правильный
    const admin = db.prepare('SELECT id, email, name, role FROM users WHERE email = ?').get('admin@sportsclub.com') as any;
    
    // Тестируем пароль
    const testPassword = 'admin123';
    const adminWithPassword = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@sportsclub.com') as any;
    const isPasswordValid = adminWithPassword ? await bcrypt.compare(testPassword, adminWithPassword.password) : false;
    
    return NextResponse.json({
      message: 'База данных инициализирована',
      adminExists: !!admin,
      adminInfo: admin || null,
      passwordTest: {
        tested: testPassword,
        isValid: isPasswordValid
      },
      users: {
        sysadmin: {
          email: 'sysadmin@sportsclub.com',
          password: 'sysadmin123'
        },
      admin: {
        email: 'admin@sportsclub.com',
        password: 'admin123'
        },
        trainer: {
          email: 'trainer@sportsclub.com',
          password: 'trainer123'
        },
        masseur: {
          email: 'masseur@sportsclub.com',
          password: 'masseur123'
        }
      }
    });
  } catch (error: any) {
    console.error('Ошибка инициализации:', error);
    return NextResponse.json(
      { error: 'Ошибка инициализации', details: error.message },
      { status: 500 }
    );
  }
}



