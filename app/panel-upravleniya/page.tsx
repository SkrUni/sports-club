'use client';

import { useState, useEffect } from 'react';
import Maket from '@/components/Maket';
import ZashchitaAvtorizacii from '@/components/ZashchitaAvtorizacii';

interface Stats {
  totalRevenue: number;
  totalClients: number;
  totalServices: number;
  totalBookings: number;
}

interface TopService {
  name: string;
  bookings_count: number;
  revenue: number;
}

interface RoleCard {
  role: string;
  icon: string;
  highlight: string;
  responsibilities: string[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalClients: 0,
    totalServices: 0,
    totalBookings: 0
  });
  const [topServices, setTopServices] = useState<TopService[]>([]);
  const [loading, setLoading] = useState(true);

  const roleCards: RoleCard[] = [
    {
      role: 'Системный администратор',
      icon: '🛡️',
      highlight: 'Полный контроль над системой, безопасность и архитектура.',
      responsibilities: [
        'Создание и управление учетными записями администраторов и персонала.',
        'Настройка расписаний и параметров работы тренеров/массажистов.',
        'Контроль интеграций, доступов и резервное копирование данных.'
      ]
    },
    {
      role: 'Администратор',
      icon: '📋',
      highlight: 'Операционное управление клиентами, услугами и платежами.',
      responsibilities: [
        'Регистрация клиентов, создание и корректировка записей.',
        'Отслеживание оплат и формирование отчетов.',
        'Ведение расписания сотрудников и мониторинг свободных окон.'
      ]
    },
    {
      role: 'Тренер',
      icon: '🏋️',
      highlight: 'Проведение тренировок и управление собственной загрузкой.',
      responsibilities: [
        'Просмотр и подтверждение личного расписания через рабочий кабинет.',
        'Подготовка к тренировкам, фиксация результатов и обратной связи.',
        'Информирование администраторов о корректировках графика.'
      ]
    },
    {
      role: 'Массажист',
      icon: '💆',
      highlight: 'Проведение сеансов массажа и контроль свободных окон.',
      responsibilities: [
        'Оперативная проверка доступности и записей в рабочем кабинете.',
        'Поддержание качества процедур и взаимодействие с клиентами.',
        'Своевременное уведомление администраторов об изменениях расписания.'
      ]
    }
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/statistika?period=month');
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setTopServices(data.topServices);
      } else {
        console.error('Ошибка API:', response.status);
        const errorData = await response.json().catch(() => ({}));
        console.error('Детали ошибки:', errorData);
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Maket>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Загрузка...</div>
        </div>
      </Maket>
    );
  }

  return (
    <ZashchitaAvtorizacii allowedRoles={['sys_admin', 'admin']}>
      <Maket>
        <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Панель управления</h1>
          <p className="mt-1 text-sm text-gray-500">
            Обзор деятельности спортивного клуба
          </p>
        </div>

        {/* Статистические карточки */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <div className="relative z-10 flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <span className="text-white text-lg font-bold">₽</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Доход за месяц</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {stats.totalRevenue.toLocaleString()} ₽
                </p>
              </div>
            </div>
          </div>

          <div className="card group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <div className="relative z-10 flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <span className="text-white text-lg">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Всего клиентов</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stats.totalClients}
                </p>
              </div>
            </div>
          </div>

          <div className="card group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <div className="relative z-10 flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <span className="text-white text-lg">🏋️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Активных услуг</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {stats.totalServices}
                </p>
              </div>
            </div>
          </div>

          <div className="card group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <div className="relative z-10 flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <span className="text-white text-lg">📅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Записей за месяц</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {stats.totalBookings}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Топ услуги */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Популярные услуги</h3>
            {topServices.length > 0 ? (
              <div className="space-y-3">
                {topServices.slice(0, 5).map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{service.name}</p>
                      <p className="text-sm text-gray-500">
                        {service.bookings_count} записей
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {service.revenue.toLocaleString()} ₽
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Нет данных о услугах</p>
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Быстрые действия</h3>
            <div className="space-y-3">
              <a
                href="/panel-upravleniya/uslugi"
                className="group relative block w-full text-left px-5 py-3 text-sm font-semibold text-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-xl border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">➕</span>
                  <span>Добавить новую услугу</span>
                  <span className="ml-auto transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                </span>
              </a>
              <a
                href="/panel-upravleniya/klienty"
                className="group relative block w-full text-left px-5 py-3 text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">👤</span>
                  <span>Зарегистрировать клиента</span>
                  <span className="ml-auto transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                </span>
              </a>
              <a
                href="/panel-upravleniya/zapisi"
                className="group relative block w-full text-left px-5 py-3 text-sm font-semibold text-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  <span>Создать запись</span>
                  <span className="ml-auto transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                </span>
              </a>
              <a
                href="/panel-upravleniya/platezhi"
                className="group relative block w-full text-left px-5 py-3 text-sm font-semibold text-gray-700 bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 rounded-xl border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">💳</span>
                  <span>Зарегистрировать платеж</span>
                  <span className="ml-auto transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Роли и зона ответственности */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Роли и зона ответственности команды
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {roleCards.map((card) => (
              <div
                key={card.role}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">{card.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{card.role}</p>
                    <p className="text-xs text-gray-500">{card.highlight}</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  {card.responsibilities.map((item) => (
                    <li key={item} className="flex items-start space-x-2">
                      <span className="mt-1 text-primary-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Maket>
    </ZashchitaAvtorizacii>
  );
}
