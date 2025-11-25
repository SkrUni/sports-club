import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getStaffMemberByUserId } from '@/lib/staff';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || (decoded.role !== 'trainer' && decoded.role !== 'masseur')) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const staffMember = getStaffMemberByUserId(decoded.id);
    if (!staffMember) {
      return NextResponse.json({ error: 'Профиль сотрудника не найден' }, { status: 404 });
    }

    return NextResponse.json({ staff: staffMember });
  } catch (error) {
    console.error('Ошибка получения профиля сотрудника:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}








