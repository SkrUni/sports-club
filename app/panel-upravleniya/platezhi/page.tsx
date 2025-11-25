'use client';

import { useState, useEffect } from 'react';
import Maket from '@/components/Maket';
import ZashchitaAvtorizacii from '@/components/ZashchitaAvtorizacii';

interface Payment {
  id: number;
  client_id: number;
  service_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  client_name: string;
  service_name: string;
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

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    client_id: '',
    service_id: '',
    amount: '',
    payment_method: 'cash'
  });

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      const [paymentsRes, clientsRes, servicesRes] = await Promise.all([
        fetch(`/api/platezhi?start_date=${startDate}&end_date=${endDate}`),
        fetch('/api/klienty'),
        fetch('/api/uslugi')
      ]);

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData.payments);
      }

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData.clients);
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData.services);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentData = {
      client_id: parseInt(formData.client_id),
      service_id: parseInt(formData.service_id),
      amount: parseFloat(formData.amount),
      payment_method: formData.payment_method
    };

    try {
      const response = await fetch('/api/platezhi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        fetchData();
        setShowModal(false);
        setFormData({
          client_id: '',
          service_id: '',
          amount: '',
          payment_method: 'cash'
        });
      }
    } catch (error) {
      console.error('Ошибка создания платежа:', error);
    }
  };

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === parseInt(serviceId));
    if (service) {
      setFormData({...formData, service_id: serviceId, amount: service.price.toString()});
    }
  };

  const paymentMethods = [
    { value: 'cash', label: 'Наличные' },
    { value: 'card', label: 'Карта' },
    { value: 'transfer', label: 'Перевод' }
  ];

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Платежи</h1>
            <p className="mt-1 text-sm text-gray-500">
              Управление платежами клиентов
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-lg">➕</span>
              <span>Добавить платеж</span>
            </span>
          </button>
        </div>

        {/* Фильтры и статистика */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Фильтры</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Дата с:</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Дата по:</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Статистика</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Общая сумма:</span>
                <span className="text-sm font-medium text-gray-900">{totalAmount.toLocaleString()} ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Количество платежей:</span>
                <span className="text-sm font-medium text-gray-900">{payments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Средний чек:</span>
                <span className="text-sm font-medium text-gray-900">
                  {payments.length > 0 ? (totalAmount / payments.length).toFixed(0) : 0} ₽
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Способы оплаты</h3>
            <div className="space-y-2">
              {paymentMethods.map((method) => {
                const methodPayments = payments.filter(p => p.payment_method === method.value);
                const methodTotal = methodPayments.reduce((sum, p) => sum + p.amount, 0);
                return (
                  <div key={method.value} className="flex justify-between">
                    <span className="text-sm text-gray-500">{method.label}:</span>
                    <span className="text-sm font-medium text-gray-900">{methodTotal.toLocaleString()} ₽</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Список платежей */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Клиент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Услуга
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сумма
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Способ оплаты
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.payment_date).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.client_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.service_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.amount.toLocaleString()} ₽
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {paymentMethods.find(m => m.value === payment.payment_method)?.label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payment.status === 'completed' ? 'Завершен' : 
                           payment.status === 'pending' ? 'В ожидании' : 'Отменен'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Нет платежей за выбранный период
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
                  Добавить платеж
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                      onChange={(e) => handleServiceChange(e.target.value)}
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
                    <label className="form-label">Сумма (₽) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="form-input"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">Способ оплаты *</label>
                    <select
                      required
                      className="form-input"
                      value={formData.payment_method}
                      onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                    >
                      {paymentMethods.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="group relative flex-1 inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="relative z-10 flex items-center gap-2">
                        <span>✅</span>
                        <span>Добавить</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setFormData({
                          client_id: '',
                          service_id: '',
                          amount: '',
                          payment_method: 'cash'
                        });
                      }}
                      className="group relative flex-1 inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
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


