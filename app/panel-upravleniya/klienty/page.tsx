'use client';

import { useState, useEffect } from 'react';
import Maket from '@/components/Maket';
import ZashchitaAvtorizacii from '@/components/ZashchitaAvtorizacii';

interface Client {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/klienty');
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients);
      }
    } catch (error) {
      console.error('Ошибка загрузки клиентов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const clientData = {
      name: formData.name,
      email: formData.email
    };

    try {
      const response = await fetch('/api/klienty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (response.ok) {
        fetchClients();
        setShowModal(false);
        setFormData({
          name: '',
          email: ''
        });
      }
    } catch (error) {
      console.error('Ошибка сохранения клиента:', error);
    }
  };

  const handleDelete = async (id: number, clientName: string) => {
    if (confirm(`Вы уверены, что хотите удалить клиента "${clientName}"? Это действие нельзя отменить.`)) {
      try {
        const response = await fetch(`/api/klienty/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchClients();
        } else {
          const error = await response.json();
          alert(`Ошибка: ${error.error}`);
        }
      } catch (error) {
        console.error('Ошибка удаления клиента:', error);
        alert('Ошибка при удалении клиента');
      }
    }
  };

  // Тип членства удален

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
            <h1 className="text-2xl font-bold text-gray-900">Клиенты</h1>
            <p className="mt-1 text-sm text-gray-500">
              Управление базой клиентов
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-lg">➕</span>
              <span>Добавить клиента</span>
            </span>
          </button>
        </div>

        {/* Список клиентов */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Имя
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата регистрации
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {client.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.email || '-'}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(client.created_at).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(client.id, client.name)}
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
                  Добавить клиента
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="form-label">Имя *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
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
                          name: '',
                          email: ''
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
