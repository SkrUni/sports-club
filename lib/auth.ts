import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import db from './database';
import type { UserRole } from '@/types/roles';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export type StaffSpecialization = 'trainer' | 'masseur';
export interface AuthTokenPayload extends JwtPayload {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface StaffRegistrationConfig {
  specialization: StaffSpecialization;
  work_start?: string;
  work_end?: string;
  slot_duration?: number;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  staffConfig?: StaffRegistrationConfig;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'string') {
      return null;
    }
    return decoded as AuthTokenPayload;
  } catch (error) {
    return null;
  }
}

export function hasRequiredRole(
  payload: AuthTokenPayload | null,
  roles: UserRole[]
): boolean {
  if (!payload) {
    return false;
  }
  return roles.includes(payload.role);
}

export async function registerUser(data: RegisterData): Promise<User> {
  const { email, password, name, role: requestedRole, staffConfig } = data;
  const role: UserRole = requestedRole || 'user';

  if ((role === 'trainer' || role === 'masseur') && !staffConfig) {
    throw new Error('Для регистрации сотрудника необходимо указать параметры staffConfig');
  }
  
  // Проверяем, существует ли пользователь
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingUser) {
    throw new Error('Пользователь с таким email уже существует');
  }

  const hashedPassword = await hashPassword(password);
  
  const stmt = db.prepare(`
    INSERT INTO users (email, password, name, role)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(email, hashedPassword, name, role);
  const userId = result.lastInsertRowid as number;

  if (role === 'user') {
    // Создаем клиента для нового пользователя с привязкой к user_id
    const clientStmt = db.prepare(`
      INSERT INTO clients (name, email, user_id)
      VALUES (?, ?, ?)
    `);
    
    clientStmt.run(name, email, userId);
  }

  if (role === 'trainer' || role === 'masseur') {
    const { specialization, work_start, work_end, slot_duration } = staffConfig!;

    if (specialization !== role) {
      throw new Error('Специализация сотрудника должна соответствовать его роли');
    }

    const staffStmt = db.prepare(`
      INSERT INTO staff (user_id, specialization, work_start, work_end, slot_duration)
      VALUES (?, ?, ?, ?, ?)
    `);

    staffStmt.run(
      userId,
      specialization,
      work_start || '09:00',
      work_end || '18:00',
      slot_duration || 60
    );
  }
  
  return {
    id: userId,
    email,
    name,
    role
  };
}

export async function loginUser(data: LoginData): Promise<User> {
  const { email, password } = data;
  
  console.log('=== Попытка входа ===');
  console.log('Email:', email);
  console.log('Пароль (первые 3 символа):', password.substring(0, 3) + '***');
  
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  
  if (!user) {
    console.log('❌ Пользователь не найден:', email);
    // Проверяем всех пользователей в базе
    const allUsers = db.prepare('SELECT id, email, name, role FROM users').all() as any[];
    console.log('Все пользователи в базе:', allUsers.map(u => ({ id: u.id, email: u.email, role: u.role })));
    throw new Error('Неверный email или пароль');
  }

  console.log('✅ Найден пользователь:', user.email, 'Роль:', user.role, 'ID:', user.id);
  console.log('Проверка пароля...');
  console.log('Хеш пароля в базе (первые 30 символов):', user.password?.substring(0, 30) + '...');
  console.log('Длина хеша:', user.password?.length);
  
  // Дополнительная проверка - тестируем пароль напрямую
  const directTest = await verifyPassword(password, user.password);
  console.log('Прямая проверка пароля:', directTest ? '✅ ВАЛИДЕН' : '❌ НЕВАЛИДЕН');
  
  const isValidPassword = await verifyPassword(password, user.password);
  console.log('Результат проверки пароля:', isValidPassword ? '✅ ВАЛИДЕН' : '❌ НЕВАЛИДЕН');
  
  if (!isValidPassword) {
    console.log('❌ Ошибка: Неверный пароль для пользователя:', email);
    console.log('Введенный пароль:', password);
    console.log('Ожидаемый пароль для admin@sportsclub.com: admin123');
    // Попробуем проверить с правильным паролем для отладки
    if (email === 'admin@sportsclub.com') {
      const testWithCorrectPassword = await verifyPassword('admin123', user.password);
      console.log('Тест с правильным паролем "admin123":', testWithCorrectPassword ? '✅ РАБОТАЕТ' : '❌ НЕ РАБОТАЕТ');
    }
    throw new Error('Неверный email или пароль');
  }

  console.log('✅ Вход успешен для пользователя:', email);
  console.log('=== Конец попытки входа ===');

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
}

export function getUserById(id: number): User | null {
  const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(id) as any;
  
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
}
