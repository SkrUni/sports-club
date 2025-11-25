'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types/roles';

interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  roles: UserRole[];
}

const NAVIGATION: NavigationItem[] = [
  {
    name: 'Панель управления',
    href: '/panel-upravleniya',
    icon: '📊',
    roles: ['sys_admin'],
  },
  {
    name: 'Услуги',
    href: '/panel-upravleniya/uslugi',
    icon: '🏋️‍♂️',
    roles: ['sys_admin'],
  },
  {
    name: 'Клиенты',
    href: '/panel-upravleniya/klienty',
    icon: '👥',
    roles: ['sys_admin', 'admin'],
  },
  {
    name: 'Записи',
    href: '/panel-upravleniya/zapisi',
    icon: '📅',
    roles: ['sys_admin', 'admin'],
  },
  {
    name: 'Платежи',
    href: '/panel-upravleniya/platezhi',
    icon: '💳',
    roles: ['sys_admin', 'admin'],
  },
  {
    name: 'Свободные окна',
    href: '/panel-upravleniya/svobodnye-slots',
    icon: '🕒',
    roles: ['sys_admin', 'admin'],
  },
  {
    name: 'Персонал',
    href: '/panel-upravleniya/personal',
    icon: '🧑‍🤝‍🧑',
    roles: ['sys_admin'],
  },
  {
    name: 'Отчеты',
    href: '/panel-upravleniya/otchety',
    icon: '📈',
    roles: ['sys_admin'],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const localUser = localStorage.getItem('user');
      const authToken = localStorage.getItem('auth-token');
      
      if (localUser && authToken) {
        const parsed = JSON.parse(localUser) as User;
        setUser(parsed);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/vhod');
      }
    } catch (error) {
      console.error('Ошибка получения пользователя:', error);
      router.push('/vhod');
    } finally {
      setLoading(false);
    }
  };

  const navigation = useMemo(() => {
    if (!user) {
      return [];
    }
    return NAVIGATION.filter((item) => item.roles.includes(user.role));
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Ошибка выхода:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('auth-token');
      router.push('/vhod');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Загрузка...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Декоративные элементы фона */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none z-0"></div>
      <div className="fixed top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none z-0"></div>
      <div className="fixed -bottom-8 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 pointer-events-none z-0"></div>
      
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white/90 backdrop-blur-xl border-r border-white/20 shadow-2xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-white/20">
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Спорт Клуб
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="group flex items-center px-3 py-2.5 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-indigo-700 transition-all duration-300 hover:shadow-md"
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex-shrink-0 border-t border-white/20 p-4">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-600">
                  {getRoleLabel(user.role)}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col z-30">
        <div className="flex flex-col flex-grow bg-white/70 backdrop-blur-xl border-r border-white/20 shadow-2xl">
          <div className="flex h-16 items-center px-4 border-b border-white/20">
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Спорт Клуб
            </h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto relative z-10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group relative flex items-center px-3 py-2.5 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-indigo-700 transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-pointer"
              >
                <span className="mr-3 text-lg transform group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex-shrink-0 border-t border-white/20 p-4">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-600">
                  {getRoleLabel(user.role)}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02]"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 relative z-20">
        {/* Top bar */}
        <div className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/20 bg-white/70 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:text-indigo-600 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Открыть меню</span>
            ☰
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-300" />
              <div className="flex items-center gap-x-4">
                <div className="hidden lg:block">
                  <div className="flex items-center gap-x-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{user.name}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'sys_admin':
      return 'Системный администратор';
    case 'admin':
      return 'Администратор';
    case 'trainer':
      return 'Тренер';
    case 'masseur':
      return 'Массажист';
    default:
      return 'Пользователь';
  }
}
