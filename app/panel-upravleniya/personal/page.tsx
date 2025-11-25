'use client';

import { useEffect, useState } from 'react';
import Maket from '@/components/Maket';
import ZashchitaAvtorizacii from '@/components/ZashchitaAvtorizacii';

type Specialization = 'trainer' | 'masseur';

interface StaffMember {
  id: number;
  name: string;
  specialization: Specialization;
  work_start: string;
  work_end: string;
  slot_duration: number;
  created_at: string;
  user_id: number | null;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

const defaultStaffForm = {
  name: '',
  email: '',
  password: '',
  specialization: 'trainer' as Specialization,
  work_start: '09:00',
  work_end: '18:00',
  slot_duration: '60',
};

const defaultAdminForm = {
  name: '',
  email: '',
  password: '',
};

export default function PersonnelPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [staffForm, setStaffForm] = useState(defaultStaffForm);
  const [adminForm, setAdminForm] = useState(defaultAdminForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, adminsRes] = await Promise.all([fetch('/api/staff'), fetch('/api/admins')]);

      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaff(staffData.staff || []);
      }

      if (adminsRes.ok) {
        const adminsData = await adminsRes.json();
        setAdmins(adminsData.admins || []);
      }
    } catch (err) {
      console.error('Ошибка загрузки данных персонала:', err);
      setError('Не удалось загрузить данные персонала. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingStaff(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: staffForm.name,
          email: staffForm.email,
          password: staffForm.password,
          specialization: staffForm.specialization,
          work_start: staffForm.work_start,
          work_end: staffForm.work_end,
          slot_duration: Number(staffForm.slot_duration),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось создать сотрудника');
      }

      setMessage(`Сотрудник "${staffForm.name}" успешно создан`);
      setStaffForm(defaultStaffForm);
      await fetchData();
    } catch (err: any) {
      console.error('Ошибка создания сотрудника:', err);
      setError(err?.message || 'Не удалось создать сотрудника');
    } finally {
      setCreatingStaff(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAdmin(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось создать администратора');
      }

      setMessage(`Администратор "${adminForm.name}" успешно создан`);
      setAdminForm(defaultAdminForm);
      await fetchData();
    } catch (err: any) {
      console.error('Ошибка создания администратора:', err);
      setError(err?.message || 'Не удалось создать администратора');
    } finally {
      setCreatingAdmin(false);
    }
  };

  return (
    <ZashchitaAvtorizacii allowedRoles={['sys_admin']}>
      <Maket>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Управление персоналом</h1>
            <p className="mt-1 text-sm text-gray-500">
              Создание и контроль учетных записей администраторов, тренеров и массажистов
            </p>
          </div>

          {(message || error) && (
            <div
              className={`rounded-md p-4 ${
                message ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {message || error}
            </div>
          )}

          {loading ? (
            <div className="card">
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-600">Загрузка данных...</div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Создать нового администратора
                  </h2>
                  <form className="space-y-4" onSubmit={handleCreateAdmin}>
                    <div>
                      <label className="form-label">Имя *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        value={adminForm.name}
                        onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-input"
                        required
                        value={adminForm.email}
                        onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="form-label">Пароль *</label>
                      <input
                        type="password"
                        className="form-input"
                        required
                        minLength={6}
                        value={adminForm.password}
                        onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                      />
                    </div>
                    <button
                      type="submit"
                      className="group relative w-full inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      disabled={creatingAdmin}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="relative z-10 flex items-center gap-2">
                        {creatingAdmin ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            <span>Создание...</span>
                          </>
                        ) : (
                          <>
                            <span>👤</span>
                            <span>Создать администратора</span>
                          </>
                        )}
                      </span>
                    </button>
                  </form>
                </div>

                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Создать сотрудника (тренера или массажиста)
                  </h2>
                  <form className="space-y-4" onSubmit={handleCreateStaff}>
                    <div>
                      <label className="form-label">Имя *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        value={staffForm.name}
                        onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-input"
                        required
                        value={staffForm.email}
                        onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="form-label">Пароль *</label>
                      <input
                        type="password"
                        className="form-input"
                        required
                        minLength={6}
                        value={staffForm.password}
                        onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="form-label">Специализация *</label>
                      <select
                        className="form-input"
                        value={staffForm.specialization}
                        onChange={(e) =>
                          setStaffForm({
                            ...staffForm,
                            specialization: e.target.value as Specialization,
                          })
                        }
                      >
                        <option value="trainer">Тренер</option>
                        <option value="masseur">Массажист</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="form-label">Начало рабочего дня</label>
                        <input
                          type="time"
                          min="06:00"
                          max="23:00"
                          step="3600"
                          className="form-input"
                          value={staffForm.work_start}
                          onChange={(e) => {
                            // Округляем до целого часа
                            const time = e.target.value;
                            if (time) {
                              const [hours] = time.split(':');
                              setStaffForm({ ...staffForm, work_start: `${hours}:00` });
                            } else {
                              setStaffForm({ ...staffForm, work_start: '' });
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="form-label">Окончание рабочего дня</label>
                        <input
                          type="time"
                          min="06:00"
                          max="23:00"
                          step="3600"
                          className="form-input"
                          value={staffForm.work_end}
                          onChange={(e) => {
                            // Округляем до целого часа
                            const time = e.target.value;
                            if (time) {
                              const [hours] = time.split(':');
                              setStaffForm({ ...staffForm, work_end: `${hours}:00` });
                            } else {
                              setStaffForm({ ...staffForm, work_end: '' });
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="form-label">Длительность окна (мин)</label>
                        <input
                          type="number"
                          min={15}
                          step={15}
                          className="form-input"
                          value={staffForm.slot_duration}
                          onChange={(e) =>
                            setStaffForm({ ...staffForm, slot_duration: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="group relative w-full inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      disabled={creatingStaff}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="relative z-10 flex items-center gap-2">
                        {creatingStaff ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            <span>Создание...</span>
                          </>
                        ) : (
                          <>
                            <span>👥</span>
                            <span>Создать сотрудника</span>
                          </>
                        )}
                      </span>
                    </button>
                  </form>
                </div>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Список администраторов</h2>
                {admins.length === 0 ? (
                  <p className="text-sm text-gray-500">Администраторы пока не созданы.</p>
                ) : (
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
                            Создан
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {admins.map((admin) => (
                          <tr key={admin.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {admin.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {admin.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(admin.created_at).toLocaleDateString('ru-RU')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Сотрудники клуба</h2>
                {staff.length === 0 ? (
                  <p className="text-sm text-gray-500">Сотрудники пока не добавлены.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Имя
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Специализация
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Рабочие часы
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Длительность окна
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {staff.map((member) => (
                          <tr key={member.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {member.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                              {member.specialization === 'trainer' ? 'Тренер' : 'Массажист'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {member.work_start} – {member.work_end}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {member.slot_duration} мин
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Maket>
    </ZashchitaAvtorizacii>
  );
}



