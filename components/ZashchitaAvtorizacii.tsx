'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types/roles';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectMap?: Partial<Record<UserRole, string>>;
}

interface StoredUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

const defaultRedirects: Record<UserRole, string> = {
  sys_admin: '/panel-upravleniya',
  admin: '/panel-upravleniya/zapisi',
  trainer: '/staff-portal',
  masseur: '/staff-portal',
  user: '/client-portal',
};

export default function AuthGuard({
  children,
  allowedRoles,
  redirectMap,
}: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const authToken = localStorage.getItem('auth-token');

        console.log('Проверка авторизации:', { storedUser: !!storedUser, authToken: !!authToken });

        if (storedUser && authToken) {
          const user: StoredUser = JSON.parse(storedUser);
          console.log('Пользователь из localStorage:', user);
          console.log('Разрешенные роли:', allowedRoles);
          console.log('Роль пользователя:', user.role);
          
          if (allowedRoles && !allowedRoles.includes(user.role)) {
            console.log('Роль не разрешена, редирект');
            const redirectPath =
              redirectMap?.[user.role] || defaultRedirects[user.role] || '/';
            console.log('Редирект на:', redirectPath);
            router.replace(redirectPath);
            setLoading(false);
            return;
          }
          console.log('Авторизация успешна');
          setIsAuthenticated(true);
        } else {
          console.log('Пользователь не авторизован, редирект на /vhod');
          router.replace('/vhod');
        }
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        router.replace('/vhod');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles, redirectMap, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Проверка авторизации...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
