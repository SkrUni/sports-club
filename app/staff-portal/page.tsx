'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types/roles';

interface StoredUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

interface StaffMember {
  id: number;
  name: string;
  specialization: 'trainer' | 'masseur';
  work_start: string;
  work_end: string;
  slot_duration: number;
}

interface StaffAvailability {
  date: string;
  availableSlots: string[];
  bookedSlots: string[];
}

interface Booking {
  id: number;
  booking_date: string;
  booking_time: string;
  status: string;
  notes: string;
  service_name: string;
  client_name: string;
}

const allowedRoles: UserRole[] = ['trainer', 'masseur'];

export default function StaffPortalPage() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availability, setAvailability] = useState<StaffAvailability | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const localUser = localStorage.getItem('user');
    const authToken = localStorage.getItem('auth-token');

    if (!localUser || !authToken) {
      router.replace('/vhod');
      return;
    }

    const parsedUser: StoredUser = JSON.parse(localUser);
    if (!allowedRoles.includes(parsedUser.role)) {
      router.replace(getFallbackRoute(parsedUser.role));
      return;
    }

    setUser(parsedUser);
    loadStaffProfile();
  }, [router]);

  useEffect(() => {
    if (!staff) {
      return;
    }
    loadBookings();
  }, [staff, selectedDate]);

  useEffect(() => {
    if (!staff) {
      return;
    }
    loadAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff, selectedDate]);

  const upcomingBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        const date = new Date(booking.booking_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      })
      .sort((a, b) => a.booking_date.localeCompare(b.booking_date));
  }, [bookings]);

  const loadStaffProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await fetch('/api/staff/me');
      if (!response.ok) {
        throw new Error('Не удалось получить профиль сотрудника');
      }
      const data = await response.json();
      setStaff(data.staff);
    } catch (error) {
      console.error('Ошибка загрузки профиля сотрудника:', error);
      setStaff(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await fetch(`/api/bookings?date=${selectedDate}`);
      if (!response.ok) {
        throw new Error('Не удалось получить записи');
      }
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Ошибка загрузки записей сотрудника:', error);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadAvailability = async () => {
    if (!staff) {
      return;
    }
    try {
      setLoadingAvailability(true);
      const response = await fetch(`/api/staff/${staff.id}/availability?date=${selectedDate}`);
      if (!response.ok) {
        throw new Error('Не удалось получить доступность');
      }
      const data = await response.json();
      setAvailability(data.availability || null);
    } catch (error) {
      console.error('Ошибка загрузки доступности:', error);
      setAvailability(null);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Ошибка выхода:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('auth-token');
      router.replace('/vhod');
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-gray-700 text-lg font-semibold">Загрузка кабинета...</div>
      </div>
    );
  }

  if (!staff || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-rose-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Профиль не найден</h1>
          <button
            onClick={() => router.replace('/vhod')}
            className="text-blue-600 hover:underline font-semibold"
          >
            Вернуться на страницу входа
          </button>
        </div>
      </div>
    );
  }

  const isTrainer = staff.specialization === 'trainer';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Декоративные элементы фона */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Рабочий кабинет
            </h1>
            <p className="text-lg text-gray-700 font-medium">
              <span className="font-bold text-emerald-600">{user.name}</span> · {isTrainer ? '🏋️ Тренер' : '💆 Массажист'}
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
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl hover:shadow-green-500/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-500">
                  <span className="text-2xl">⏰</span>
                </div>
                <h2 className="text-xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Рабочий график
                </h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🕐</span>
                  <p className="text-base font-bold text-gray-900">
              {staff.work_start} – {staff.work_end}
            </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">⏱️</span>
                  <p className="text-sm font-semibold text-gray-700">
                    Длительность окна: <span className="text-emerald-600">{staff.slot_duration} мин</span>
            </p>
                </div>
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 md:col-span-2">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-500">
                  <span className="text-2xl">📅</span>
                </div>
                <h2 className="text-xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
                  Выбор даты
                </h2>
              </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                  <label className="text-sm font-bold text-gray-700">Дата:</label>
                <input
                  type="date"
                    className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-gray-900 font-medium shadow-sm hover:shadow-md"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
                <p className="text-sm text-gray-600 font-medium">
                Выберите дату для просмотра расписания и доступности
              </p>
              </div>
            </div>
          </div>
        </section>

        <section className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl hover:shadow-green-500/20 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-500">
                  <span className="text-2xl">🪟</span>
                </div>
                <h2 className="text-xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Доступные окна
                </h2>
              </div>
            {loadingAvailability && (
                <span className="text-sm text-gray-600 font-medium animate-pulse">Загрузка доступности...</span>
            )}
          </div>
          {availability ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200">
                  <h3 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>✅</span>
                    <span>Свободные окна</span>
                  </h3>
                {availability.availableSlots.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availability.availableSlots.map((slot) => (
                      <span
                        key={`free-${slot}`}
                          className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-bold rounded-full border border-green-300 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                ) : (
                    <p className="text-sm text-gray-600 font-medium">
                      Свободных окон на выбранную дату нет. Свяжитесь с администратором для обновления расписания.
                  </p>
                )}
              </div>
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-5 border border-red-200">
                  <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>❌</span>
                    <span>Занятые окна</span>
                  </h3>
                {availability.bookedSlots.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availability.bookedSlots.map((slot) => (
                      <span
                        key={`busy-${slot}`}
                          className="px-4 py-2 bg-gradient-to-r from-red-100 to-pink-100 text-red-800 text-sm font-bold rounded-full border border-red-300 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                ) : (
                    <p className="text-sm text-gray-600 font-medium">На выбранную дату еще нет записей.</p>
                )}
              </div>
            </div>
          ) : (
              <p className="text-sm text-gray-600 font-medium">
                Не удалось загрузить доступность. Попробуйте обновить страницу или обратиться к администратору.
            </p>
          )}
          </div>
        </section>

        <section className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-500">
                  <span className="text-2xl">📋</span>
                </div>
                <h2 className="text-xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
                  Записи на выбранную дату
                </h2>
              </div>
            {loadingBookings && (
                <span className="text-sm text-gray-600 font-medium animate-pulse">Загрузка записей...</span>
            )}
          </div>
          {bookings.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl mb-3">
                  <span className="text-3xl">📅</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">На выбранную дату записей нет.</p>
              </div>
          ) : (
              <div className="overflow-x-auto rounded-2xl">
                <table className="min-w-full divide-y divide-gray-200/50">
                  <thead className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50">
                  <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Время
                    </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Клиент
                    </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Услуга
                    </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Статус
                    </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Примечания
                    </th>
                  </tr>
                </thead>
                  <tbody className="bg-white/50 divide-y divide-gray-200/30">
                  {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold text-emerald-700 bg-emerald-100 rounded-lg">
                            <span>🕐</span>
                        {booking.booking_time}
                          </span>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">👤</span>
                            <div className="text-sm font-semibold text-gray-900">{booking.client_name}</div>
                          </div>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🎯</span>
                            <span className="text-sm font-semibold text-gray-900">{booking.service_name}</span>
                          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={booking.status} />
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                          {booking.notes || <span className="text-gray-400">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </section>

        <section className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl hover:shadow-teal-500/20 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-500">
                <span className="text-2xl">🔮</span>
              </div>
              <h2 className="text-xl font-extrabold bg-gradient-to-r from-teal-600 via-green-600 to-emerald-600 bg-clip-text text-transparent">
                Предстоящие записи
              </h2>
            </div>
          {upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl mb-3">
                  <span className="text-3xl">📆</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">У вас нет предстоящих записей.</p>
              </div>
          ) : (
              <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                  <div key={`upcoming-${booking.id}`} className="group/item relative bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-2xl p-5 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    <div className="relative flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">📅</span>
                          <span className="text-sm font-bold text-teal-700">
                            {new Date(booking.booking_date).toLocaleDateString('ru-RU', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })} · {booking.booking_time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">🎯</span>
                          <div className="text-base font-bold text-gray-900">{booking.service_name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">👤</span>
                          <div className="text-sm font-semibold text-gray-700">{booking.client_name}</div>
                        </div>
                        {booking.notes && (
                          <div className="mt-2 text-sm text-gray-600 bg-white/60 rounded-lg p-2 border border-gray-200">
                            <span className="font-semibold">Примечание:</span> {booking.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <StatusBadge status={booking.status} />
                      </div>
                    </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: string }> = {
    scheduled: { 
      label: 'Запланировано', 
      className: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200',
      icon: '📅'
    },
    completed: { 
      label: 'Завершено', 
      className: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200',
      icon: '✅'
    },
    cancelled: { 
      label: 'Отменено', 
      className: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200',
      icon: '❌'
    },
  };

  const entry = map[status] || { 
    label: status, 
    className: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300',
    icon: '❓'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${entry.className}`}>
      <span>{entry.icon}</span>
      <span>{entry.label}</span>
    </span>
  );
}

function getFallbackRoute(role: UserRole): string {
  switch (role) {
    case 'sys_admin':
      return '/panel-upravleniya';
    case 'admin':
      return '/panel-upravleniya/zapisi';
    case 'user':
      return '/client-portal';
    default:
      return '/';
  }
}



