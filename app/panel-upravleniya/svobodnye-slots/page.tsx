'use client';

import { useEffect, useMemo, useState } from 'react';
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
}

interface StaffAvailability {
  date: string;
  availableSlots: string[];
  bookedSlots: string[];
}

interface AvailabilityEntry {
  staff: StaffMember;
  availability: StaffAvailability | null;
  loading: boolean;
}

export default function FreeSlotsPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [availabilityMap, setAvailabilityMap] = useState<Record<number, AvailabilityEntry>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [specializationFilter, setSpecializationFilter] = useState<'all' | Specialization>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (staff.length > 0) {
      fetchAvailabilityForAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, staff]);

  useEffect(() => {
    // Refetch availability when filter changes to ensure map is up-to-date
    if (staff.length > 0) {
      fetchAvailabilityForAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specializationFilter]);

  const filteredStaff = useMemo(() => {
    if (specializationFilter === 'all') {
      return staff;
    }
    return staff.filter((member) => member.specialization === specializationFilter);
  }, [staff, specializationFilter]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/staff');
      if (!response.ok) {
        throw new Error('Не удалось получить список сотрудников');
      }
      const data = await response.json();
      setStaff(data.staff || []);
    } catch (error) {
      console.error('Ошибка загрузки списка сотрудников:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailabilityForAll = async () => {
    const entries: Record<number, AvailabilityEntry> = {};

    for (const member of staff) {
      if (specializationFilter !== 'all' && member.specialization !== specializationFilter) {
        continue;
      }

      entries[member.id] = {
        staff: member,
        availability: null,
        loading: true,
      };
    }

    setAvailabilityMap(entries);

    const requests = Object.values(entries).map(async (entry) => {
      try {
        const response = await fetch(
          `/api/staff/${entry.staff.id}/availability?date=${selectedDate}`
        );
        if (response.ok) {
          const data = await response.json();
          return {
            staffId: entry.staff.id,
            availability: data.availability as StaffAvailability,
          };
        }
      } catch (error) {
        console.error('Ошибка загрузки доступности:', error);
      }
      return { staffId: entry.staff.id, availability: null };
    });

    const results = await Promise.all(requests);

    setAvailabilityMap((prev) => {
      const updated = { ...prev };
      for (const result of results) {
        if (updated[result.staffId]) {
          updated[result.staffId] = {
            ...updated[result.staffId],
            availability: result.availability,
            loading: false,
          };
        }
      }
      return updated;
    });
  };

  return (
    <ZashchitaAvtorizacii allowedRoles={['sys_admin', 'admin']}>
      <Maket>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Свободные окна специалистов</h1>
            <p className="mt-1 text-sm text-gray-500">
              Просмотр доступности тренеров и массажистов на выбранную дату
            </p>
          </div>

          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <label className="form-label">Дата:</label>
                <input
                  type="date"
                  className="form-input w-auto"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="form-label">Специализация:</label>
                <select
                  className="form-input w-auto"
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value as 'all' | Specialization)}
                >
                  <option value="all">Все</option>
                  <option value="trainer">Тренеры</option>
                  <option value="masseur">Массажисты</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="card">
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-600">Загрузка сотрудников...</div>
              </div>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="card">
              <p className="text-sm text-gray-500">
                Сотрудники с выбранной специализацией отсутствуют.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredStaff.map((member) => {
                const entry = availabilityMap[member.id];
                return (
                  <div key={member.id} className="card">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{member.name}</h2>
                        <p className="text-sm text-gray-500">
                          {member.specialization === 'trainer' ? 'Тренер' : 'Массажист'} · Рабочее
                          время: {member.work_start} – {member.work_end}
                        </p>
                      </div>
                    </div>
                    {entry?.loading ? (
                      <p className="text-sm text-gray-500">Загрузка доступности...</p>
                    ) : entry?.availability ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Свободные окна</p>
                          {entry.availability.availableSlots.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {entry.availability.availableSlots.map((slot) => (
                                <span
                                  key={`${member.id}-${slot}`}
                                  className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                                >
                                  {slot}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Свободных окон нет</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Занятые окна</p>
                          {entry.availability.bookedSlots.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {entry.availability.bookedSlots.map((slot) => (
                                <span
                                  key={`${member.id}-booked-${slot}`}
                                  className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                                >
                                  {slot}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Записей на выбранную дату нет</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Не удалось загрузить доступность сотрудника.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Maket>
    </ZashchitaAvtorizacii>
  );
}



