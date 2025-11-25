import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  // Публичные маршруты, которые не требуют авторизации
  const publicRoutes = ['/vhod', '/registraciya', '/', '/api/test', '/test-login'];
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith('/api/avtorizaciya') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/favicon')
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Проверяем токен для защищенных маршрутов
  if (!token) {
    console.log('Токен не найден, редирект на логин');
    return NextResponse.redirect(new URL('/vhod', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log('Токен валиден для пользователя:', payload.email);
    return NextResponse.next();
  } catch (error) {
    console.log('Токен невалиден:', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
}

export const config = {
  matcher: [
    // Временно отключаем middleware для отладки
    // '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
