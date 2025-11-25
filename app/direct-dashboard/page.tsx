'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types/roles';

interface StoredUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

interface Credentials {
  email: string;
  password: string;
}

interface RoleInfo {
  title: string;
  description: string;
  highlights: string[];
  icon: string;
  credentials?: Credentials;
}

const ROLE_INFO: Record<UserRole, RoleInfo> = {
  sys_admin: {
    title: 'Системный администратор',
    description: 'Полный контроль над системой, архитектурой и безопасностью платформы.',
    highlights: [
      'Создание и управление учетными записями администраторов и сотрудников',
      'Настройка расписаний, параметров услуг и интеграций',
      'Контроль доступов, резервное копирование и аудит действий',
    ],
    credentials: {
      email: 'sysadmin@sportsclub.com',
      password: 'sysadmin123',
    },
    icon: '🛡️',
  },
  admin: {
    title: 'Администратор',
    description: 'Операционное управление клиентским сервисом и бизнес-процессами.',
    highlights: [
      'Регистрация клиентов, создание и корректировка записей',
      'Обработка платежей и формирование отчетов',
      'Мониторинг расписаний тренеров и массажистов',
    ],
    credentials: {
      email: 'admin@sportsclub.com',
      password: 'admin123',
    },
    icon: '📋',
  },
  trainer: {
    title: 'Тренер',
    description: 'Проведение тренировок и управление собственной загрузкой.',
    highlights: [
      'Просмотр личного расписания в рабочем кабинете',
      'Подготовка к занятиям и ведение обратной связи клиентов',
      'Оповещение администратора об изменениях графика',
    ],
    credentials: {
      email: 'trainer@sportsclub.com',
      password: 'trainer123',
    },
    icon: '🏋️',
  },
  masseur: {
    title: 'Массажист',
    description: 'Проведение сеансов и контроль свободных окон.',
    highlights: [
      'Отслеживание расписания и свободных окон в рабочем кабинете',
      'Поддержание качества процедур и коммуникация с клиентами',
      'Сообщение администратору о корректировках расписания',
    ],
    credentials: {
      email: 'masseur@sportsclub.com',
      password: 'masseur123',
    },
    icon: '💆',
  },
  user: {
    title: 'Клиент',
    description: 'Доступ к личному кабинету и возможностям записи на услуги.',
    highlights: [
      'Выбор услуг и создание записей в личном кабинете',
      'Просмотр истории посещений и оплат',
      'Получение уведомлений о ближайших занятиях',
    ],
    icon: '🙋',
  },
};

const OVERVIEW_ROLES: UserRole[] = ['sys_admin', 'admin', 'trainer', 'masseur'];

export default function DirectDashboardPage() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const localUser = localStorage.getItem('user');
    const authToken = localStorage.getItem('auth-token');

    if (localUser && authToken) {
      const parsedUser: StoredUser = JSON.parse(localUser);

      if (parsedUser.role === 'trainer' || parsedUser.role === 'masseur') {
        router.replace('/staff-portal');
        return;
      }

      if (parsedUser.role === 'user') {
        router.replace('/client-portal');
        return;
      }

      setUser(parsedUser);
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth-token');
    window.location.href = '/vhod';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-gray-700 text-lg font-semibold">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-rose-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Не авторизован</h1>
          <a href="/vhod" className="text-blue-600 hover:underline font-semibold">
            Перейти на страницу входа
          </a>
        </div>
      </div>
    );
  }

  const primaryLink = getPrimaryLink(user.role);
  const roleLabel = getRoleLabel(user.role);
  const roleInfo = ROLE_INFO[user.role];
  const isSysAdmin = user.role === 'sys_admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Декоративные элементы фона */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Панель управления
              </h1>
              <p className="text-lg text-gray-700 font-medium">
                Добро пожаловать, <span className="font-bold text-purple-600">{user.name}</span>! 👋
                <span className="ml-2 text-sm text-gray-600">({roleLabel})</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-500/50 transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center gap-2">
                <span>Выйти</span>
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          {/* Приветственная карточка */}
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative px-6 py-6 sm:p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl mb-6 transform group-hover:rotate-12 transition-transform duration-500">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Успешный вход в систему!
              </h2>
              <p className="text-lg text-gray-700 font-medium mb-8">
                Вы успешно вошли в систему управления спортивным клубом.
              </p>
              {primaryLink && (
                <div className="mb-6">
                  <a
                    href={primaryLink.href}
                    className="group/btn relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10 flex items-center gap-2">
                      <span>🚀</span>
                      <span>{primaryLink.label}</span>
                      <span className="transform group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                    </span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Информация о роли */}
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative px-6 py-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-500">
                  <span className="text-2xl">{roleInfo.icon}</span>
                </div>
                <h3 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Ваша роль
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="group/item relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  <div className="relative">
                    <dt className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span>👤</span>
                      <span>Роль</span>
                    </dt>
                    <dd className="text-lg font-bold text-gray-900">{roleInfo.title}</dd>
                  </div>
                </div>
                <div className="group/item relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  <div className="relative">
                    <dt className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span>📧</span>
                      <span>Email</span>
                    </dt>
                    <dd className="text-lg font-bold text-gray-900 break-all">{user.email}</dd>
                  </div>
                </div>
                <div className="group/item relative bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-5 border border-pink-100 hover:border-pink-300 hover:shadow-lg hover:shadow-pink-500/20 hover:scale-[1.02] transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-rose-500/10 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  <div className="relative">
                    <dt className="text-xs font-bold text-pink-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span>📝</span>
                      <span>Описание</span>
                    </dt>
                    <dd className="text-sm font-semibold text-gray-700">{roleInfo.description}</dd>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-indigo-200">
                <h4 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>✨</span>
                  <span>Что входит в роль:</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {roleInfo.highlights.map((item, index) => (
                    <div key={item} className="group/list flex items-start space-x-3 bg-white/60 rounded-xl p-3 border border-white/50 hover:bg-white/80 hover:shadow-md transition-all duration-200">
                      <span className="mt-0.5 text-lg">✅</span>
                      <span className="text-sm font-medium text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

                {roleInfo.credentials && (
                <div className="mt-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 p-5">
                  <p className="font-bold mb-3 flex items-center gap-2 text-indigo-800">
                    <span className="text-xl">🔑</span>
                    <span>Тестовая учетная запись:</span>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/80 rounded-xl p-3 border border-indigo-200">
                      <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Логин</p>
                      <p className="text-sm font-mono text-gray-900 font-semibold">{roleInfo.credentials.email}</p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-3 border border-indigo-200">
                      <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Пароль</p>
                      <p className="text-sm font-mono text-gray-900 font-semibold">{roleInfo.credentials.password}</p>
                    </div>
                  </div>
                  </div>
                )}
            </div>
              </div>

          {/* Все роли команды */}
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative px-6 py-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-500">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                  Все роли команды и их ответственность
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {OVERVIEW_ROLES.map((roleKey) => {
                    const info = ROLE_INFO[roleKey];
                  const roleColors = {
                    sys_admin: { 
                      bg: 'from-blue-50 to-indigo-50', 
                      border: 'border-blue-200',
                      hoverBorder: 'hover:border-blue-400',
                      hoverShadow: 'hover:shadow-blue-500/20',
                      iconBg: 'from-blue-500 to-indigo-600',
                      text: 'text-blue-700'
                    },
                    admin: { 
                      bg: 'from-purple-50 to-pink-50', 
                      border: 'border-purple-200',
                      hoverBorder: 'hover:border-purple-400',
                      hoverShadow: 'hover:shadow-purple-500/20',
                      iconBg: 'from-purple-500 to-pink-600',
                      text: 'text-purple-700'
                    },
                    trainer: { 
                      bg: 'from-green-50 to-emerald-50', 
                      border: 'border-green-200',
                      hoverBorder: 'hover:border-green-400',
                      hoverShadow: 'hover:shadow-green-500/20',
                      iconBg: 'from-green-500 to-emerald-600',
                      text: 'text-green-700'
                    },
                    masseur: { 
                      bg: 'from-orange-50 to-red-50', 
                      border: 'border-orange-200',
                      hoverBorder: 'hover:border-orange-400',
                      hoverShadow: 'hover:shadow-orange-500/20',
                      iconBg: 'from-orange-500 to-red-600',
                      text: 'text-orange-700'
                    },
                    user: { 
                      bg: 'from-gray-50 to-slate-50', 
                      border: 'border-gray-200',
                      hoverBorder: 'hover:border-gray-400',
                      hoverShadow: 'hover:shadow-gray-500/20',
                      iconBg: 'from-gray-500 to-slate-600',
                      text: 'text-gray-700'
                    }
                  };
                  const colors = roleColors[roleKey as keyof typeof roleColors] || {
                    bg: 'from-gray-50 to-gray-100',
                    border: 'border-gray-200',
                    hoverBorder: 'hover:border-gray-400',
                    hoverShadow: 'hover:shadow-gray-500/20',
                    iconBg: 'from-gray-500 to-gray-600',
                    text: 'text-gray-700'
                  };
                    return (
                      <div
                        key={roleKey}
                      className={`group/item relative overflow-hidden rounded-3xl border-2 ${colors.border} bg-gradient-to-br ${colors.bg} p-6 shadow-xl ${colors.hoverBorder} ${colors.hoverShadow} hover:scale-105 transition-all duration-300`}
                      >
                      <div className={`absolute inset-0 bg-gradient-to-br ${colors.iconBg} opacity-0 group-hover/item:opacity-5 transition-opacity duration-300 rounded-3xl`}></div>
                      <div className="relative">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${colors.iconBg} rounded-2xl flex items-center justify-center shadow-lg transform group-hover/item:rotate-6 transition-transform duration-500`}>
                          <span className="text-2xl">{info.icon}</span>
                          </div>
                          <div>
                            <p className="text-base font-extrabold text-gray-900">{info.title}</p>
                            <p className="text-xs text-gray-600 font-medium">{info.description}</p>
                          </div>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-700 mb-4">
                          {info.highlights.map((item) => (
                            <li key={`${roleKey}-${item}`} className="flex items-start space-x-2 group/list">
                              <span className="mt-1 text-green-600 text-base">✓</span>
                              <span className="font-medium">{item}</span>
                            </li>
                          ))}
                        </ul>
                        {info.credentials && (
                          <div className={`mt-4 rounded-xl bg-white/80 border ${colors.border} p-3 text-xs`}>
                            <p className={`font-bold mb-2 flex items-center gap-1 ${colors.text}`}>
                              <span>🔐</span>
                              <span>Тестовые данные:</span>
                            </p>
                            <div className="space-y-1 font-mono">
                              <p className="text-gray-800">
                                <span className={`font-bold ${colors.text}`}>Логин:</span> <span className="text-gray-900">{info.credentials.email}</span>
                              </p>
                              <p className="text-gray-800">
                                <span className={`font-bold ${colors.text}`}>Пароль:</span> <span className="text-gray-900">{info.credentials.password}</span>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getPrimaryLink(role: UserRole): { href: string; label: string } | null {
  switch (role) {
    case 'sys_admin':
      return { href: '/panel-upravleniya', label: 'Перейти в системную панель' };
    case 'admin':
      return { href: '/panel-upravleniya/zapisi', label: 'Перейти к записям' };
    default:
      return null;
  }
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
