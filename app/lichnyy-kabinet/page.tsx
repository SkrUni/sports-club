'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Client {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface Booking {
  id: number;
  service_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  service_price: number;
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

interface StaffMember {
  id: number;
  name: string;
  specialization: string;
  work_start: string;
  work_end: string;
}

export default function ClientPortalPage() {
  const [client, setClient] = useState<Client | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [bookingForm, setBookingForm] = useState({
    service_id: '',
    trainer_id: '',
    booking_date: '',
    booking_time: '',
    notes: ''
  });
  const router = useRouter();

  useEffect(() => {
    // Проверяем, авторизован ли клиент
    const localUser = localStorage.getItem('user');
    if (!localUser) {
      router.push('/vhod');
      return;
    }

    const user = JSON.parse(localUser);
    
    // Если это администратор или сотрудник, перенаправляем на соответствующие панели
    if (user.role === 'sys_admin' || user.role === 'admin') {
      router.push('/direct-dashboard');
      return;
    }

    if (user.role === 'trainer' || user.role === 'masseur') {
      router.push('/staff-portal');
      return;
    }

    fetchClientData(user.id);
  }, [router]);

  const fetchClientData = async (userId: number) => {
    try {
      // Получаем данные клиента
      const clientResponse = await fetch(`/api/klienty/${userId}`);
      if (clientResponse.ok) {
        const clientData = await clientResponse.json();
        setClient(clientData.client);
      }

      // Получаем записи клиента
      const bookingsResponse = await fetch(`/api/zapisi-klienta/${userId}`);
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData.bookings);
      }

      // Получаем доступные услуги
      const servicesResponse = await fetch('/api/uslugi');
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        setServices(servicesData.services);
      }

      // Получаем список сотрудников (тренеры и массажисты)
      const staffResponse = await fetch('/api/staff');
      if (staffResponse.ok) {
        const staffData = await staffResponse.json();
        setStaff(staffData.staff || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных клиента:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSpecializationLabel = (specialization: string) => {
    const labels: { [key: string]: string } = {
      'trainer': 'Тренер',
      'masseur': 'Массажист'
    };
    return labels[specialization] || specialization;
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== СОЗДАНИЕ ЗАПИСИ КЛИЕНТОМ ===');
    console.log('bookingForm:', JSON.stringify(bookingForm, null, 2));
    
    if (!client) {
      console.error('Клиент не найден');
      return;
    }

    // Валидация формы
    if (!bookingForm.service_id || !bookingForm.booking_date || !bookingForm.booking_time) {
      console.error('Форма не заполнена полностью');
      setError('Заполните все обязательные поля');
      return;
    }

    setError('');
    setSubmitting(true);

    const bookingData = {
      client_id: client.id,
      service_id: parseInt(bookingForm.service_id),
      trainer_id: bookingForm.trainer_id ? parseInt(bookingForm.trainer_id) : null,
      booking_date: bookingForm.booking_date,
      booking_time: bookingForm.booking_time,
      notes: bookingForm.notes
    };

    console.log('Отправка данных записи:', bookingData);

    try {
      const response = await fetch('/api/zapisi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      console.log('Статус ответа:', response.status);
      console.log('Content-Type:', response.headers.get('content-type'));

      const contentType = response.headers.get('content-type') || '';
      let responseData: any = {};

      if (contentType.includes('application/json')) {
        try {
          const text = await response.text();
          console.log('Текст ответа:', text);
          responseData = text ? JSON.parse(text) : {};
        } catch (parseError) {
          console.error('Ошибка парсинга JSON:', parseError);
          setError('Ошибка обработки ответа сервера');
          setSubmitting(false);
          return;
        }
      } else {
        // Если ответ не JSON, пытаемся прочитать как текст
        const text = await response.text();
        console.log('Текст ответа (не JSON):', text);
        if (text && text.length < 500) {
          // Если текст короткий, возможно это сообщение об ошибке
          responseData = { error: text };
        }
      }

      console.log('Ответ сервера:', responseData);

      if (response.ok) {
        console.log('Запись успешно создана');
        // Обновляем список записей
        await fetchClientData(client.id);
        setShowBookingModal(false);
        setBookingForm({
          service_id: '',
          trainer_id: '',
          booking_date: '',
          booking_time: '',
          notes: ''
        });
        setError('');
      } else {
        // Извлекаем сообщение об ошибке
        let errorMessage = 'Ошибка создания записи';
        
        if (responseData.error) {
          errorMessage = responseData.error;
        } else if (response.status === 400) {
          errorMessage = 'Проверьте правильность заполнения формы';
        } else if (response.status === 403) {
          errorMessage = 'Недостаточно прав для выполнения этого действия';
        } else if (response.status === 404) {
          errorMessage = 'Запрашиваемый ресурс не найден';
        } else if (response.status === 500) {
          errorMessage = 'Ошибка сервера. Попробуйте позже';
        } else {
          errorMessage = `Ошибка создания записи (код ${response.status})`;
        }
        
        console.error('Ошибка от сервера:', errorMessage);
        setError(errorMessage);
      }
    } catch (error: any) {
      console.error('Ошибка создания записи:', error);
      setError(error.message || 'Ошибка подключения к серверу');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth-token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Клиент не найден</h1>
          <a href="/vhod" className="text-blue-600 hover:underline">
            Вернуться на страницу входа
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Декоративные элементы фона */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-3 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                Личный кабинет
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 font-medium">
                Добро пожаловать, <span className="font-bold text-indigo-600">{client.name}</span>! 👋
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="group relative inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg sm:rounded-xl hover:from-red-600 hover:to-red-700 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-500/50 transition-all duration-300 overflow-hidden whitespace-nowrap"
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
        <div className="px-4 py-6 sm:px-0">
          {/* Информация о клиенте */}
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl mb-4 sm:mb-6 hover:shadow-indigo-500/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative px-4 py-4 sm:px-6 sm:py-6 lg:p-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-500">
                  <span className="text-xl sm:text-2xl">👤</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Ваша информация
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group/item relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  <div className="relative">
                    <dt className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Имя</dt>
                    <dd className="text-lg font-bold text-gray-900">{client.name}</dd>
                  </div>
                </div>
                <div className="group/item relative bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-5 border border-indigo-100 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  <div className="relative">
                    <dt className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Email</dt>
                    <dd className="text-lg font-bold text-gray-900 break-all">{client.email || 'Не указан'}</dd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Записи клиента */}
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative px-4 py-4 sm:px-6 sm:py-6 lg:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-500">
                    <span className="text-xl sm:text-2xl">📅</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Ваши записи
                </h3>
                </div>
                <button
                  onClick={() => {
                    console.log('=== ОТКРЫТИЕ МОДАЛЬНОГО ОКНА СОЗДАНИЯ ЗАПИСИ ===');
                    setSubmitting(false);
                    setError('');
                    setShowBookingModal(true);
                  }}
                  className="group/btn relative inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg sm:rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 overflow-hidden w-full sm:w-auto"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="text-base sm:text-lg">➕</span>
                    <span>Создать запись</span>
                  </span>
                </button>
              </div>
              {bookings.length > 0 ? (
                <div className="overflow-x-auto rounded-xl sm:rounded-2xl -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <table className="min-w-full divide-y divide-gray-200/50">
                    <thead className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
                      <tr>
                        <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                          Услуга
                        </th>
                        <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                          Дата
                        </th>
                        <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                          Время
                        </th>
                        <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                          Статус
                        </th>
                        <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                          Цена
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 divide-y divide-gray-200/30">
                      {bookings.map((booking, index) => (
                        <tr key={booking.id} className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-200">
                          <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <span className="text-base sm:text-lg">🎯</span>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900">{booking.service_name}</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-700">
                            {new Date(booking.booking_date).toLocaleDateString('ru-RU', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-md sm:rounded-lg">
                              <span className="hidden sm:inline">🕐</span>
                            {booking.booking_time}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold rounded-full shadow-sm ${
                              booking.status === 'completed' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' :
                              booking.status === 'scheduled' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200' :
                              'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                            }`}>
                              <span className="hidden sm:inline">{booking.status === 'completed' ? '✅' :
                               booking.status === 'scheduled' ? '📅' : '❌'}</span>
                              <span className="hidden sm:inline">{booking.status === 'completed' ? ' Завершено' :
                               booking.status === 'scheduled' ? ' Запланировано' : ' Отменено'}</span>
                              <span className="inline sm:hidden">{booking.status === 'completed' ? '✅' :
                               booking.status === 'scheduled' ? '📅' : '❌'}</span>
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-bold text-gray-900 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-md sm:rounded-lg border border-yellow-200">
                              <span className="hidden sm:inline">💰</span>
                            {booking.service_price.toLocaleString()} ₽
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl sm:rounded-3xl mb-3 sm:mb-4">
                    <span className="text-3xl sm:text-4xl">📋</span>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-gray-600 mb-1 sm:mb-2">У вас пока нет записей</p>
                  <p className="text-xs sm:text-sm text-gray-500">Создайте первую запись, нажав кнопку выше</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно для создания записи */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl transform transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl sm:rounded-3xl"></div>
            <div className="relative p-5 sm:p-6 lg:p-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-xl sm:text-2xl">➕</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Создать новую запись
              </h3>
              </div>
              <form onSubmit={handleCreateBooking} className="space-y-5">
                {error && (
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-xl p-4 text-red-700 text-sm font-semibold shadow-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      <span>{error}</span>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <span>🎯</span>
                      <span>Услуга *</span>
                    </span>
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-gray-900 font-medium shadow-sm hover:shadow-md"
                    value={bookingForm.service_id}
                    onChange={(e) => setBookingForm({...bookingForm, service_id: e.target.value})}
                  >
                    <option value="">Выберите услугу</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {service.price} ₽ ({service.duration} мин)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <span>👤</span>
                      <span>Специалист (опционально)</span>
                    </span>
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 text-gray-900 font-medium shadow-sm hover:shadow-md"
                    value={bookingForm.trainer_id}
                    onChange={(e) => setBookingForm({...bookingForm, trainer_id: e.target.value})}
                  >
                    <option value="">Без назначения</option>
                    {staff.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({getSpecializationLabel(member.specialization)}) - {member.work_start} - {member.work_end}
                      </option>
                    ))}
                  </select>
                  {bookingForm.trainer_id && (
                    <p className="text-xs text-purple-600 mt-2 font-medium bg-purple-50 rounded-lg p-2 border border-purple-200">
                      ⏰ Время записи должно быть в пределах рабочего времени специалиста
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <span>📅</span>
                        <span>Дата *</span>
                      </span>
                    </label>
                  <input
                    type="date"
                    required
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-gray-900 font-medium shadow-sm hover:shadow-md"
                    value={bookingForm.booking_date}
                    onChange={(e) => setBookingForm({...bookingForm, booking_date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <span>🕐</span>
                        <span>Время *</span>
                      </span>
                    </label>
                  <input
                    type="time"
                    min="06:00"
                    max="23:00"
                    step="3600"
                    required
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-gray-900 font-medium shadow-sm hover:shadow-md"
                    value={bookingForm.booking_time}
                    onChange={(e) => {
                      // Округляем до целого часа
                      const time = e.target.value;
                      if (time) {
                        const [hours] = time.split(':');
                        setBookingForm({...bookingForm, booking_time: `${hours}:00`});
                      } else {
                        setBookingForm({...bookingForm, booking_time: ''});
                      }
                    }}
                  />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <span>📝</span>
                      <span>Примечания</span>
                    </span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-gray-900 font-medium shadow-sm hover:shadow-md resize-none"
                    rows={3}
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                    placeholder="Дополнительная информация..."
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group relative flex-1 inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10 flex items-center gap-2">
                      {submitting ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          <span>Создание...</span>
                        </>
                      ) : (
                        <>
                          <span>✅</span>
                          <span>Создать запись</span>
                        </>
                      )}
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => {
                      setShowBookingModal(false);
                      setError('');
                      setBookingForm({
                        service_id: '',
                        trainer_id: '',
                        booking_date: '',
                        booking_time: '',
                        notes: ''
                      });
                    }}
                    className="flex-1 px-6 py-3 text-base font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transform hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
