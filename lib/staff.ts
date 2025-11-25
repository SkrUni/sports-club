import db from './database';
import { StaffSpecialization } from './auth';

export interface StaffMember {
  id: number;
  user_id: number | null;
  name: string;
  specialization: StaffSpecialization;
  work_start: string;
  work_end: string;
  slot_duration: number;
  created_at: string;
}

export interface StaffAvailability {
  date: string;
  availableSlots: string[];
  bookedSlots: string[];
}

export function getStaffMemberByUserId(userId: number): StaffMember | null {
  const stmt = db.prepare(`
    SELECT 
      st.*,
      u.name as name,
      u.email as email
    FROM staff st
    JOIN users u ON st.user_id = u.id
    WHERE st.user_id = ?
  `);
  const staff = stmt.get(userId) as StaffMember | undefined;
  return staff ?? null;
}

export function getStaffMemberById(staffId: number): StaffMember | null {
  const stmt = db.prepare(`
    SELECT 
      st.*,
      u.name as name,
      u.email as email
    FROM staff st
    JOIN users u ON st.user_id = u.id
    WHERE st.id = ?
  `);
  const staff = stmt.get(staffId) as StaffMember | undefined;
  return staff ?? null;
}

export function listStaffMembers(): StaffMember[] {
  const stmt = db.prepare(`
    SELECT 
      st.*,
      u.name as name,
      u.email as email
    FROM staff st
    JOIN users u ON st.user_id = u.id
    ORDER BY u.name ASC
  `);
  return stmt.all() as StaffMember[];
}

export function upsertStaffSchedule(
  staffId: number,
  schedule: Partial<Pick<StaffMember, 'work_start' | 'work_end' | 'slot_duration'>>
): StaffMember | null {
  const staff = getStaffMemberById(staffId);
  if (!staff) {
    return null;
  }

  const workStart = schedule.work_start || staff.work_start;
  const workEnd = schedule.work_end || staff.work_end;
  const slotDuration = schedule.slot_duration || staff.slot_duration;

  db.prepare(
    `
      UPDATE staff
      SET work_start = ?, work_end = ?, slot_duration = ?
      WHERE id = ?
    `
  ).run(workStart, workEnd, slotDuration, staffId);

  return getStaffMemberById(staffId);
}

export function getStaffAvailability(
  staffId: number,
  date: string
): StaffAvailability | null {
  const staff = getStaffMemberById(staffId);
  if (!staff) {
    return null;
  }

  const workStartMinutes = timeToMinutes(staff.work_start);
  const workEndMinutes = timeToMinutes(staff.work_end);
  const slot = staff.slot_duration;

  if (workEndMinutes <= workStartMinutes || slot <= 0) {
    return {
      date,
      availableSlots: [],
      bookedSlots: [],
    };
  }

  const slots: string[] = [];
  for (let minutes = workStartMinutes; minutes + slot <= workEndMinutes; minutes += slot) {
    slots.push(minutesToTime(minutes));
  }

  const bookingsStmt = db.prepare(
    `
      SELECT booking_time
      FROM bookings
      WHERE trainer_id = ? AND booking_date = ? AND status != 'cancelled'
    `
  );
  const booked = bookingsStmt.all(staffId, date) as { booking_time: string }[];
  const bookedSlots = booked.map((b) => b.booking_time);

  const availableSlots = slots.filter((slotTime) => !bookedSlots.includes(slotTime));

  return {
    date,
    availableSlots,
    bookedSlots,
  };
}

function timeToMinutes(time: string): number {
  // Если время в формате "HH:MM", конвертируем в минуты
  if (time.includes(':')) {
    const normalizedTime = time.length > 5 ? time.substring(0, 5) : time;
    const [hours, minutes] = normalizedTime.split(':').map((part) => parseInt(part, 10));
    return hours * 60 + minutes;
  }
  // Если это просто число (часы), конвертируем в минуты
  const hours = parseInt(time, 10);
  if (isNaN(hours) || hours < 6 || hours > 23) {
    return 0;
  }
  return hours * 60;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Проверка, находится ли время записи в рабочем времени сотрудника
export function isTimeWithinWorkingHours(
  staffId: number,
  bookingTime: string
): { valid: boolean; error?: string } {
  const staff = getStaffMemberById(staffId);
  if (!staff) {
    return { valid: false, error: 'Сотрудник не найден' };
  }

  // Нормализуем время записи (формат "HH:00" или "HH:MM")
  const normalizedBookingTime = bookingTime.length > 5 ? bookingTime.substring(0, 5) : bookingTime;
  
  const bookingMinutes = timeToMinutes(normalizedBookingTime);
  const workStartMinutes = timeToMinutes(staff.work_start);
  const workEndMinutes = timeToMinutes(staff.work_end);

  // Проверяем, что время в допустимом диапазоне (6:00 - 23:00)
  const [bookingHours] = normalizedBookingTime.split(':').map(p => parseInt(p, 10));
  if (isNaN(bookingHours) || bookingHours < 6 || bookingHours > 23) {
    return {
      valid: false,
      error: `Некорректное время записи. Укажите время от 6:00 до 23:00`
    };
  }

  console.log(`[isTimeWithinWorkingHours] Проверка времени для сотрудника ${staff.name}:`);
  console.log(`  Рабочее время: ${staff.work_start} - ${staff.work_end}`);
  console.log(`  Время записи: ${normalizedBookingTime} (${bookingMinutes} минут)`);
  console.log(`  Начало работы: ${workStartMinutes} минут, Конец работы: ${workEndMinutes} минут`);

  if (bookingMinutes < workStartMinutes) {
    console.log(`  ❌ Время ${normalizedBookingTime} раньше начала рабочего дня`);
    return {
      valid: false,
      error: `Время записи ${normalizedBookingTime} раньше начала рабочего дня (${staff.work_start})`
    };
  }

  // Проверяем, что время записи строго меньше времени окончания работы
  if (bookingMinutes >= workEndMinutes) {
    console.log(`  ❌ Время ${normalizedBookingTime} позже или равно окончанию рабочего дня`);
    return {
      valid: false,
      error: `Время записи ${normalizedBookingTime} позже или равно окончанию рабочего дня (${staff.work_end})`
    };
  }

  // Дополнительная проверка: убеждаемся, что время записи + длительность слота не превышает конец рабочего дня
  const slotEndMinutes = bookingMinutes + staff.slot_duration;
  if (slotEndMinutes > workEndMinutes) {
    const slotEndTime = minutesToTime(slotEndMinutes);
    console.log(`  ❌ Время записи ${normalizedBookingTime} + длительность ${staff.slot_duration} мин превышает конец рабочего дня`);
    return {
      valid: false,
      error: `Время записи ${normalizedBookingTime} не подходит: занятие закончится в ${slotEndTime}, что позже окончания рабочего дня (${staff.work_end})`
    };
  }

  console.log(`  ✅ Время ${normalizedBookingTime} в пределах рабочего времени`);
  return { valid: true };
}

// Проверка доступности времени (не занято ли оно)
export function isTimeSlotAvailable(
  staffId: number,
  date: string,
  bookingTime: string
): { available: boolean; error?: string } {
  const bookingsStmt = db.prepare(
    `
      SELECT id
      FROM bookings
      WHERE trainer_id = ? AND booking_date = ? AND booking_time = ? AND status != 'cancelled'
    `
  );
  const existing = bookingsStmt.get(staffId, date, bookingTime) as { id: number } | undefined;

  if (existing) {
    return {
      available: false,
      error: `Время ${bookingTime} уже занято`
    };
  }

  return { available: true };
}

