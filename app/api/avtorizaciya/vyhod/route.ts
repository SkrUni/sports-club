import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    message: 'Успешный выход из системы'
  });

  // Удаляем токен из cookie
  response.cookies.delete('auth-token');

  return response;
}


