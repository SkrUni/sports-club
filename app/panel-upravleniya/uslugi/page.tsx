'use client';

import { useState, useEffect } from 'react';
import Maket from '@/components/Maket';
import ZashchitaAvtorizacii from '@/components/ZashchitaAvtorizacii';

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  is_active: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/uslugi');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services);
      }
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const serviceData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      category: formData.category
    };

    try {
      const url = editingService ? `/api/services/${editingService.id}` : '/api/services';
      const method = editingService ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (response.ok) {
        fetchServices();
        setShowModal(false);
        setEditingService(null);
        setFormData({
          name: '',
          description: '',
          price: '',
          duration: '',
          category: ''
        });
      }
    } catch (error) {
      console.error('Ошибка сохранения услуги:', error);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Вы уверены, что хотите удалить эту услугу?')) {
      try {
        const response = await fetch(`/api/uslugi/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchServices();
        }
      } catch (error) {
        console.error('Ошибка удаления услуги:', error);
      }
    }
  };

  const categories = ['Фитнес', 'Йога', 'Плавание', 'Теннис', 'Бокс', 'Танцы', 'Массаж', 'Другое'];

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
            <h1 className="text-2xl font-bold text-gray-900">Услуги</h1>
            <p className="mt-1 text-sm text-gray-500">
              Управление услугами спортивного клуба
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-lg">➕</span>
              <span>Добавить услугу</span>
            </span>
          </button>
        </div>

        {/* Список услуг */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Категория
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Цена
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Длительность
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {service.name}
                        </div>
                        {service.description && (
                          <div className="text-sm text-gray-500">
                            {service.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.price.toLocaleString()} ₽
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.duration} мин
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        ✏️ Редактировать
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Удалить
                      </button>
                    </td>
                  </tr>
                ))}
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
                  {editingService ? 'Редактировать услугу' : 'Добавить услугу'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="form-label">Название</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">Описание</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">Цена (₽)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="form-input"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">Длительность (минуты)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="form-input"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">Категория</label>
                    <select
                      required
                      className="form-input"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="">Выберите категорию</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
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
                        <span>{editingService ? '💾' : '✅'}</span>
                        <span>{editingService ? 'Сохранить' : 'Добавить'}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingService(null);
                        setFormData({
                          name: '',
                          description: '',
                          price: '',
                          duration: '',
                          category: ''
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


