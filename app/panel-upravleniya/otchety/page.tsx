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

interface DailyStat {
  date: string;
  bookings_count: number;
  revenue: number;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalClients: 0,
    totalServices: 0,
    totalBookings: 0
  });
  const [topServices, setTopServices] = useState<TopService[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/statistika?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setTopServices(data.topServices);
        setDailyStats(data.dailyStats);
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const periods = [
    { value: 'day', label: 'За день' },
    { value: 'week', label: 'За неделю' },
    { value: 'month', label: 'За месяц' }
  ];

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
    <ZashchitaAvtorizacii allowedRoles={['sys_admin']}>
      <Maket>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Отчеты</h1>
            <p className="mt-1 text-sm text-gray-500">
              Аналитика и отчетность по деятельности клуба
            </p>
          </div>
          <div className="flex space-x-2">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  period === p.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Основные показатели */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">₽</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Доход</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalRevenue.toLocaleString()} ₽
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Клиенты</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalClients}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">🏋️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Услуги</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalServices}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">📅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Записи</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalBookings}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Графики и аналитика */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Топ услуги */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Популярные услуги</h3>
            {topServices.length > 0 ? (
              <div className="space-y-4">
                {topServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-sm">{index + 1}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-500">
                          {service.bookings_count} записей
                        </p>
                      </div>
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

          {/* Динамика по дням */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Динамика по дням</h3>
            {dailyStats.length > 0 ? (
              <div className="space-y-3">
                {dailyStats.slice(0, 7).map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(stat.date)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {stat.bookings_count} записей
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {stat.revenue.toLocaleString()} ₽
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Нет данных за выбранный период</p>
            )}
          </div>
        </div>

        {/* Детальная статистика */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Детальная статистика</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">
                {stats.totalBookings > 0 ? (stats.totalRevenue / stats.totalBookings).toFixed(0) : 0}
              </div>
              <div className="text-sm text-gray-500">Средний чек (₽)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary-600">
                {stats.totalClients > 0 ? (stats.totalBookings / stats.totalClients).toFixed(1) : 0}
              </div>
              <div className="text-sm text-gray-500">Записей на клиента</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {stats.totalServices > 0 ? (stats.totalBookings / stats.totalServices).toFixed(1) : 0}
              </div>
              <div className="text-sm text-gray-500">Записей на услугу</div>
            </div>
          </div>
        </div>

        {/* Блок экспорта отчетов удален по требованию */}
      </div>
      </Maket>
    </ZashchitaAvtorizacii>
  );
}


