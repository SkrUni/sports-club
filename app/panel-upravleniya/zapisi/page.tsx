'use client';

import { useState, useEffect } from 'react';
import Maket from '@/components/Maket';
import ZashchitaAvtorizacii from '@/components/ZashchitaAvtorizacii';

interface Booking {
  id: number;
  client_id: number;
  service_id: number;
  trainer_id: number | null;
  booking_date: string;
  booking_time: string;
  status: string;
  notes: string;
  created_at: string;
  client_name: string;
  service_name: string;
  service_price: number;
  staff_name?: string | null;
  staff_specialization?: 'trainer' | 'masseur' | null;
}

interface Client {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
  price: number;
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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [availability, setAvailability] = useState<StaffAvailability | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    service_id: '',
    trainer_id: '',
    booking_date: new Date().toISOString().split('T')[0],
    booking_time: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedStaffId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const staffQuery = selectedStaffId !== 'all' ? `&staffId=${selectedStaffId}` : '';
      const [bookingsRes, clientsRes, servicesRes, staffRes] = await Promise.all([
        fetch(`/api/zapisi?date=${selectedDate}${staffQuery}`),
        fetch('/api/klienty'),
        fetch('/api/uslugi'),
        fetch('/api/staff')
      ]);

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.bookings);
      }

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData.clients);
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData.services);
      }

      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaff(staffData.staff);
        if (
          selectedStaffId !== 'all' &&
          !staffData.staff.some((member: StaffMember) => String(member.id) === selectedStaffId)
        ) {
          setSelectedStaffId('all');
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadAvailability = async () => {
      if (selectedStaffId === 'all') {
        setAvailability(null);
        return;
      }

      setAvailabilityLoading(true);
      try {
        const response = await fetch(
          `/api/staff/${selectedStaffId}/availability?date=${selectedDate}`
        );
        if (response.ok) {
          const data = await response.json();
          setAvailability(data.availability);
        } else {
          setAvailability(null);
        }
      } catch (error) {
        console.error('Ошибка загрузки доступности сотрудника:', error);
        setAvailability(null);
      } finally {
        setAvailabilityLoading(false);
      }
    };

    loadAvailability();
  }, [selectedStaffId, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault() уже вызван в форме
    console.log('=== handleSubmit ВЫЗВАН ===');
    console.log('formData:', JSON.stringify(formData, null, 2));
    
    // Проверка валидности формы
    if (!formData.client_id || !formData.service_id || !formData.booking_date || !formData.booking_time) {
      console.error('Форма не заполнена полностью');
      console.error('client_id:', formData.client_id);
      console.error('service_id:', formData.service_id);
      console.error('booking_date:', formData.booking_date);
      console.error('booking_time:', formData.booking_time);
      setError('Заполните все обязательные поля');
      setSubmitting(false);
      return;
    }
    
    console.log('Все поля заполнены, начинаем отправку...');
    setError('');
    setSubmitting(true);
    
    console.log('Отправка данных записи:', formData);
    
    const bookingData = {
      client_id: parseInt(formData.client_id),
      service_id: parseInt(formData.service_id),
      trainer_id: formData.trainer_id ? parseInt(formData.trainer_id) : null,
      booking_date: formData.booking_date,
      booking_time: formData.booking_time,
      notes: formData.notes
    };

    console.log('Данные для отправки:', bookingData);

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
          return;
        }
      } else {
        const text = await response.text();
        console.log('Текст ответа (не JSON):', text);
        if (text && text.length < 500) {
          responseData = { error: text };
        }
      }

      console.log('Ответ сервера:', responseData);

      if (response.ok) {
        console.log('Запись успешно создана');
        fetchData();
        setShowModal(false);
        setFormData({
          client_id: '',
          service_id: '',
          trainer_id: '',
          booking_date: new Date().toISOString().split('T')[0],
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Запланировано';
      case 'completed': return 'Завершено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  if (loading) {
    return (
      <ZashchitaAvtorizacii allowedRoles={['sys_admin', 'admin']}>
        <Maket>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Загрузка...</div>
          </div>
        </Maket>
      </ZashchitaAvtorizacii>
    );
  }

  return (
    <ZashchitaAvtorizacii allowedRoles={['sys_admin', 'admin']}>
      <Maket>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Записи</h1>
            <p className="mt-1 text-sm text-gray-500">
              Управление записями клиентов
            </p>
          </div>
          <button
            onClick={() => {
              console.log('=== ОТКРЫТИЕ МОДАЛЬНОГО ОКНА ===');
              console.log('Текущий formData:', JSON.stringify(formData, null, 2));
              console.log('submitting:', submitting);
              setSubmitting(false); // Сбрасываем состояние отправки
              setError(''); // Очищаем ошибки
              setShowModal(true);
            }}
            className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-lg">➕</span>
              <span>Создать запись</span>
            </span>
          </button>
        </div>

        {/* Фильтры */}
        <div className="card">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <label className="form-label">Выберите дату:</label>
              <input
                type="date"
                className="form-input w-auto"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="form-label">Сотрудник:</label>
              <select
                className="form-input w-auto"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
              >
                <option value="all">Все сотрудники</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({getSpecializationLabel(member.specialization)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {selectedStaffId !== 'all' && (
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Доступность: {getStaffName(selectedStaffId, staff)}
            </h3>
            {availabilityLoading ? (
              <p className="text-gray-500 text-sm">Загрузка доступных окон...</p>
            ) : availability ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Свободные окна</p>
                  {availability.availableSlots.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {availability.availableSlots.map((slot) => (
                        <span
                          key={slot}
                          className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">На выбранную дату свободных окон нет</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Занятые окна</p>
                  {availability.bookedSlots.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {availability.bookedSlots.map((slot) => (
                        <span
                          key={`booked-${slot}`}
                          className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">На выбранную дату нет записей</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Не удалось загрузить доступность сотрудника</p>
            )}
          </div>
        )}

        {/* Список записей */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Время
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Клиент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Услуга
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Специалист
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Цена
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Примечания
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Создано
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.booking_time}ч
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.staff_name
                          ? `${booking.staff_name}${booking.staff_specialization ? ` (${getSpecializationLabel(booking.staff_specialization as 'trainer' | 'masseur')})` : ''}`
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.client_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.service_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.service_price.toLocaleString()} ₽
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {booking.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.created_at).toLocaleDateString('ru-RU')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Нет записей на выбранную дату
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Модальное окно */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Создать запись
                </h3>
                <form 
                  onSubmit={(e) => {
                    console.log('=== ФОРМА ОТПРАВЛЯЕТСЯ ===');
                    console.log('Событие:', e.type);
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Вызываем handleSubmit...');
                    handleSubmit(e);
                  }} 
                  className="space-y-4"
                  noValidate
                >
                  {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-red-600 text-sm">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="form-label">Клиент *</label>
                    <select
                      required
                      className="form-input"
                      value={formData.client_id}
                      onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                    >
                      <option value="">Выберите клиента</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Услуга *</label>
                    <select
                      required
                      className="form-input"
                      value={formData.service_id}
                      onChange={(e) => setFormData({...formData, service_id: e.target.value})}
                    >
                      <option value="">Выберите услугу</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} - {service.price} ₽
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Специалист</label>
                    <select
                      className="form-input"
                      value={formData.trainer_id}
                      onChange={(e) => setFormData({ ...formData, trainer_id: e.target.value })}
                    >
                      <option value="">Без назначения</option>
                      {staff.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({getSpecializationLabel(member.specialization)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Дата *</label>
                    <input
                      type="date"
                      required
                      className="form-input"
                      value={formData.booking_date}
                      onChange={(e) => setFormData({...formData, booking_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">Время (часы) *</label>
                    <input
                      type="number"
                      min="6"
                      max="23"
                      required
                      className="form-input"
                      value={formData.booking_time}
                      onChange={(e) => {
                        console.log('Время изменено:', e.target.value);
                        setFormData({...formData, booking_time: e.target.value});
                      }}
                      placeholder="6-23"
                    />
                  </div>
                  <div>
                    <label className="form-label">Примечания</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      onClick={(e) => {
                        console.log('=== КНОПКА СОЗДАТЬ НАЖАТА ===');
                        console.log('Событие кнопки:', e.type);
                        console.log('formData в момент клика:', JSON.stringify(formData, null, 2));
                        console.log('submitting:', submitting);
                        console.log('disabled:', e.currentTarget.disabled);
                      }}
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
                            <span>Создать</span>
                          </>
                        )}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setError('');
                        setFormData({
                          client_id: '',
                          service_id: '',
                          trainer_id: '',
                          booking_date: new Date().toISOString().split('T')[0],
                          booking_time: '',
                          notes: ''
                        });
                      }}
                      className="group relative flex-1 inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      disabled={submitting}
                    >
                      <span className="flex items-center gap-2">
                        <span>❌</span>
                        <span>Отмена</span>
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      </Maket>
    </ZashchitaAvtorizacii>
  );
}

function getSpecializationLabel(specialization: 'trainer' | 'masseur'): string {
  return specialization === 'trainer' ? 'Тренер' : 'Массажист';
}

function getStaffName(selectedId: string, staffList: StaffMember[]): string {
  const id = Number(selectedId);
  if (Number.isNaN(id)) {
    return 'Сотрудник не выбран';
  }
  const member = staffList.find((item) => item.id === id);
  if (!member) {
    return 'Сотрудник не найден';
  }
  return `${member.name} (${getSpecializationLabel(member.specialization)})`;
}
