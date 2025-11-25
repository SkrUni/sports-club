import Database from 'better-sqlite3';
import { join } from 'path';

// Используем /tmp для Docker контейнеров (Render, Railway и т.д.)
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/sports_club.db' 
  : join(process.cwd(), 'sports_club.db');
const db = new Database(dbPath);

// Создание таблиц при инициализации
export function initDatabase() {
  // Таблица пользователей
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица услуг
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      duration INTEGER NOT NULL,
      category TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица клиентов
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      membership_type TEXT DEFAULT 'basic',
      user_id INTEGER UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Таблица записей
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      trainer_id INTEGER,
      booking_date DATE NOT NULL,
      booking_time TIME NOT NULL,
      status TEXT DEFAULT 'scheduled',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients (id),
      FOREIGN KEY (service_id) REFERENCES services (id)
    )
  `);

  // Таблица платежей
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      payment_method TEXT NOT NULL,
      status TEXT DEFAULT 'completed',
      FOREIGN KEY (client_id) REFERENCES clients (id),
      FOREIGN KEY (service_id) REFERENCES services (id)
    )
  `);

  console.log('База данных инициализирована');
}

// Миграция для добавления поля user_id
export function migrateDatabase() {
  try {
    // Проверяем, есть ли поле user_id в таблице clients
    const columns = db.prepare("PRAGMA table_info(clients)").all();
    const hasUserId = columns.some((col: any) => col.name === 'user_id');
    
    if (!hasUserId) {
      console.log('Выполняется миграция: добавление user_id в таблицу clients');
      
      // Добавляем поле user_id
      db.exec('ALTER TABLE clients ADD COLUMN user_id INTEGER');
      
      // Обновляем существующих клиентов, связывая их с пользователями по email
      db.exec(`
        UPDATE clients 
        SET user_id = (
          SELECT users.id 
          FROM users 
          WHERE users.email = clients.email
        )
        WHERE email IN (SELECT email FROM users)
      `);
      
      console.log('Миграция завершена');
    }
  } catch (error) {
    console.error('Ошибка миграции:', error);
  }
}

// Создание услуг по умолчанию
export async function createDefaultServices() {
  try {
    // Проверяем, есть ли уже услуги в базе
    const existingServices = db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number };
    
    if (existingServices.count === 0) {
      console.log('Создание услуг по умолчанию...');
      
      const defaultServices = [
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
          name: 'Массаж',
          description: 'Расслабляющий массаж',
          price: 3000,
          duration: 60,
          category: 'Массаж'
        }
      ];
      
      const stmt = db.prepare(`
        INSERT INTO services (name, description, price, duration, category, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
      `);
      
      for (const service of defaultServices) {
        stmt.run(
          service.name,
          service.description,
          service.price,
          service.duration,
          service.category
        );
      }
      
      console.log(`Создано ${defaultServices.length} услуг по умолчанию`);
    } else {
      console.log('Услуги уже существуют в базе данных');
    }
  } catch (error) {
    console.error('Ошибка создания услуг по умолчанию:', error);
  }
}

// Создание администратора по умолчанию
export async function createDefaultAdmin() {
  try {
    const bcrypt = require('bcryptjs');
    
    // Проверяем, есть ли уже админ
    const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@sportsclub.com');
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const stmt = db.prepare(`
        INSERT INTO users (email, password, name, role)
        VALUES (?, ?, ?, 'admin')
      `);
      
      stmt.run('admin@sportsclub.com', hashedPassword, 'Администратор');
      console.log('Администратор создан: admin@sportsclub.com / admin123');
    } else {
      console.log('Администратор уже существует');
    }
  } catch (error) {
    console.error('Ошибка создания администратора:', error);
  }
}

export default db;
