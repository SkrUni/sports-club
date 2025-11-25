import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hasRequiredRole } from '@/lib/auth';
import {
  getStaffAvailability,
  getStaffMemberById,
  getStaffMemberByUserId,
} from '@/lib/staff';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 });
    }

    const staffId = Number(params.id);
    if (Number.isNaN(staffId)) {
      return NextResponse.json({ error: 'Некорректный идентификатор сотрудника' }, { status: 400 });
    }

    const url = new URL(request.url);
    const date = url.searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Необходимо указать дату' }, { status: 400 });
    }

    const staffMember = getStaffMemberById(staffId);
    if (!staffMember) {
      return NextResponse.json({ error: 'Сотрудник не найден' }, { status: 404 });
    }

    if (decoded.role === 'trainer' || decoded.role === 'masseur') {
      const ownStaffProfile = getStaffMemberByUserId(decoded.id);
      if (!ownStaffProfile || ownStaffProfile.id !== staffId) {
        return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
      }
    } else if (!hasRequiredRole(decoded, ['sys_admin', 'admin'])) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const availability = getStaffAvailability(staffId, date);
    if (!availability) {
      return NextResponse.json({ error: 'Не удалось получить доступность сотрудника' }, { status: 500 });
    }

    return NextResponse.json({
      staff: {
        id: staffMember.id,
        name: staffMember.name,
        specialization: staffMember.specialization,
      },
      availability,
    });
  } catch (error) {
    console.error('Ошибка получения доступности сотрудника:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}














