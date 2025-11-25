import { NextRequest, NextResponse } from 'next/server';
import {
  verifyToken,
  hasRequiredRole,
  registerUser,
  StaffSpecialization,
} from '@/lib/auth';
import { listStaffMembers } from '@/lib/staff';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    // Разрешаем доступ клиентам, администраторам и сисадминам
    if (!hasRequiredRole(decoded, ['sys_admin', 'admin', 'user'])) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const staff = listStaffMembers();
    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Ошибка получения сотрудников:', error);
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
    if (!hasRequiredRole(decoded, ['sys_admin'])) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const body = await request.json();
    const {
      email,
      password,
      name,
      specialization,
      work_start,
      work_end,
      slot_duration,
    } = body;

    if (!email || !password || !name || !specialization) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    if (!['trainer', 'masseur'].includes(specialization)) {
      return NextResponse.json(
        { error: 'Недопустимая специализация' },
        { status: 400 }
      );
    }

    const user = await registerUser({
      email,
      password,
      name,
      role: specialization as StaffSpecialization,
      staffConfig: {
        specialization: specialization as StaffSpecialization,
        work_start,
        work_end,
        slot_duration,
      },
    });

    const staff = listStaffMembers().find((member) => member.user_id === user.id);

    return NextResponse.json(
      {
        message: 'Сотрудник успешно создан',
        user,
        staff,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Ошибка создания сотрудника:', error);
    return NextResponse.json(
      { error: error?.message || 'Ошибка сервера' },
      { status: 500 }
    );
  }
}






