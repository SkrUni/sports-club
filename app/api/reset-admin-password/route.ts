import { NextResponse } from 'next/server';
import db from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    console.log('=== ПРИНУДИТЕЛЬНЫЙ СБРОС ПАРОЛЯ АДМИНИСТРАТОРА ===');
    
    const adminEmail = 'admin@sportsclub.com';
    const adminPassword = 'admin123';
    
    // Проверяем, существует ли администратор
    const existingAdmin = db.prepare('SELECT id, email, name, role FROM users WHERE email = ?').get(adminEmail) as any;
    
    if (!existingAdmin) {
      // Создаем администратора, если его нет
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      const stmt = db.prepare(`
        INSERT INTO users (email, password, name, role)
        VALUES (?, ?, ?, 'admin')
      `);
      stmt.run(adminEmail, hashedPassword, 'Администратор');
      console.log('✅ Администратор создан: admin@sportsclub.com / admin123');
    } else {
      // Принудительно обновляем пароль
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      const updateStmt = db.prepare(`
        UPDATE users 
        SET password = ?, name = ?, role = 'admin'
        WHERE email = ?
      `);
      const result = updateStmt.run(hashedPassword, 'Администратор', adminEmail);
      console.log('✅ Пароль администратора принудительно обновлен');
      console.log('Результат UPDATE:', result.changes, 'строк изменено');
    }
    
    // Проверяем, что пароль правильный
    const adminWithPassword = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail) as any;
    const isPasswordValid = adminWithPassword ? await bcrypt.compare(adminPassword, adminWithPassword.password) : false;
    
    console.log('Проверка пароля:', isPasswordValid ? '✅ ВАЛИДЕН' : '❌ НЕВАЛИДЕН');
    console.log('=== КОНЕЦ СБРОСА ПАРОЛЯ ===');
    
    return NextResponse.json({
      success: true,
      message: 'Пароль администратора сброшен',
      admin: {
        email: adminEmail,
        password: adminPassword,
        exists: !!existingAdmin,
        passwordValid: isPasswordValid
      }
    });
  } catch (error: any) {
    console.error('Ошибка сброса пароля:', error);
    return NextResponse.json(
      { error: 'Ошибка сброса пароля', details: error.message },
      { status: 500 }
    );
  }
}




