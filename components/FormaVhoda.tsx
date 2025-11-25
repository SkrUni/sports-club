'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { UserRole } from '@/types/roles';

export default function FormaVhoda() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Отправка запроса на /api/avtorizaciya/vhod');
      const response = await fetch('/api/avtorizaciya/vhod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Статус ответа:', response.status, response.statusText);
      console.log('Content-Type:', response.headers.get('content-type'));

      // Читаем ответ один раз
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      console.log('Текст ответа (первые 200 символов):', text.substring(0, 200));

      // Проверяем Content-Type
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Сервер вернул не JSON! Content-Type:', contentType);
        console.error('Статус ответа:', response.status, response.statusText);
        console.error('Полный текст ответа (первые 500 символов):', text.substring(0, 500));
        
        // Если это HTML страница ошибки Next.js, попробуем извлечь информацию
        if (contentType && contentType.includes('text/html')) {
          // Проверяем, есть ли в HTML информация об ошибке
          const errorMatch = text.match(/<title>([^<]+)<\/title>/i) || text.match(/Error: ([^<]+)/i) || text.match(/<pre[^>]*>([^<]+)<\/pre>/i);
          const errorMessage = errorMatch ? errorMatch[1] : 'Ошибка компиляции сервера';
          setError(`Ошибка сервера: ${errorMessage}. Проверьте консоль браузера и терминал сервера для деталей.`);
        } else {
          setError(`Сервер вернул неверный формат данных. Content-Type: ${contentType || 'не указан'}. Проверьте консоль для деталей.`);
        }
        setLoading(false);
        return;
      }

      // Проверяем, что ответ можно распарсить как JSON
      let data;
      try {
        if (!text || text.trim() === '') {
          console.error('Пустой ответ от сервера');
          setError('Сервер вернул пустой ответ');
          return;
        }
        
        data = JSON.parse(text);
        console.log('Успешно распарсен JSON:', data);
      } catch (parseError: any) {
        console.error('Ошибка парсинга JSON:', parseError);
        console.error('Текст, который не удалось распарсить:', text);
        setError(`Ошибка парсинга ответа: ${parseError.message}. Проверьте консоль для деталей.`);
        return;
      }

      console.log('Ответ сервера:', data);

      if (response.ok) {
        // Сохраняем данные пользователя в localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('auth-token', 'authenticated');
        
        console.log('✅ Пользователь сохранен в localStorage:', data.user);
        console.log('✅ Роль пользователя:', data.user.role);
        
        // Определяем путь редиректа
        const redirectPath = resolveRedirectPath(data.user.role);
        console.log('✅ Редирект на:', redirectPath);
        
        // Используем window.location.href для более надежного редиректа
        window.location.href = redirectPath;
      } else {
        console.error('❌ Ошибка от сервера:', data.error);
        setError(data.error || `Ошибка входа (${response.status})`);
      }
    } catch (err: any) {
      console.error('Ошибка при входе:', err);
      const errorMessage = err.message || 'Ошибка подключения к серверу';
      setError(`Ошибка подключения: ${errorMessage}. Убедитесь, что сервер запущен.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Декоративные элементы фона */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 hover:shadow-indigo-500/20 transition-all duration-500 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg mb-3 sm:mb-4 transform group-hover:rotate-6 transition-transform duration-500 mx-auto">
                <span className="text-2xl sm:text-3xl">🔐</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2 sm:mb-3 animate-fade-in">
                Вход в систему
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-2 px-2">
                Спортивный клуб - Управление услугами
              </p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email адрес
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3 border-2 border-indigo-200/50 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-gray-900"
                    placeholder="Введите email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Пароль
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 border-2 border-indigo-200/50 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-gray-900"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full inline-flex items-center justify-center px-5 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-blue-500/50 transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-500 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>Вход...</span>
                      </>
                    ) : (
                      <>
                        <span>Войти</span>
                        <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>
              </div>

              <div className="space-y-3">
              <div className="text-center">
                <Link
                  href="/registraciya"
                  className="group inline-flex items-center gap-2 font-semibold text-sm sm:text-base text-indigo-600 hover:text-indigo-700 transition-colors duration-300"
                >
                  <span>Нет аккаунта? Зарегистрироваться</span>
                  <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
                </div>
                
                <div className="text-center pt-2 border-t border-gray-200">
                  <Link
                    href="/"
                    className="group relative inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg sm:rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="transform group-hover:-translate-x-1 transition-transform duration-300 text-lg">←</span>
                      <span>Вернуться на главную</span>
                    </span>
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function resolveRedirectPath(role: UserRole): string {
  switch (role) {
    case 'sys_admin':
      return '/panel-upravleniya';
    case 'admin':
      return '/panel-upravleniya/zapisi';
    case 'trainer':
    case 'masseur':
      return '/staff-portal';
    default:
      return '/lichnyy-kabinet';
  }
}
