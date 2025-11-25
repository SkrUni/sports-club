'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types/roles';

export default function LoginForm() {
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Ответ сервера:', data);

      if (response.ok) {
        // Сохраняем данные пользователя в localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('auth-token', 'authenticated');
        
        console.log('✅ Пользователь сохранен в localStorage:', data.user);
        console.log('✅ Роль пользователя:', data.user.role);
        
        const redirectPath = resolveRedirectPath(data.user.role);
        console.log('✅ Редирект на:', redirectPath);
        
        // Используем window.location.href для более надежного редиректа
        window.location.href = redirectPath;
      } else {
        console.error('❌ Ошибка от сервера:', data.error);
        setError(data.error || 'Ошибка входа');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Вход в систему
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Спортивный клуб - Управление услугами
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="form-label">
                Email адрес
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="Введите email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="form-label">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="form-input"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </div>

          <div className="text-center">
            <a
              href="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Нет аккаунта? Зарегистрироваться
            </a>
          </div>
        </form>
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
      return '/client-portal';
  }
}
