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
  { name: 'Dashboard', href: '/dashboard', icon: '📊', roles: ['sys_admin'] },
  { name: 'Services', href: '/dashboard/services', icon: '🏋️‍♂️', roles: ['sys_admin'] },
  { name: 'Clients', href: '/dashboard/clients', icon: '👥', roles: ['sys_admin', 'admin'] },
  { name: 'Bookings', href: '/dashboard/bookings', icon: '📅', roles: ['sys_admin', 'admin'] },
  { name: 'Payments', href: '/dashboard/payments', icon: '💳', roles: ['sys_admin', 'admin'] },
  { name: 'Reports', href: '/dashboard/reports', icon: '📈', roles: ['sys_admin'] },
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
        router.push('/login');
      }
    } catch (error) {
      console.error('Ошибка получения пользователя:', error);
      router.push('/login');
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
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h1 className="text-xl font-semibold">Спорт Клуб</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b">
            <h1 className="text-xl font-semibold text-gray-900">Спорт Клуб</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full text-left px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Открыть меню</span>
            ☰
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
              <div className="flex items-center gap-x-4">
                <div className="hidden lg:block">
                  <div className="flex items-center gap-x-2">
                    <div className="h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-900"
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
      return 'System Admin';
    case 'admin':
      return 'Admin';
    case 'trainer':
      return 'Trainer';
    case 'masseur':
      return 'Masseur';
    default:
      return 'User';
  }
}
