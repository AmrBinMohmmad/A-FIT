import { Meal } from '@/storage/meals';

/**
 * Strips time and compares whether two dates fall on the same calendar day (Midnight 00:00 reset boundary).
 */
export function isSameDay(dateA: Date | string, dateB: Date | string = new Date()): boolean {
  if (!dateA || !dateB) return false;
  const d1 = new Date(dateA);
  const d2 = new Date(dateB);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false;

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Checks if a date string or object corresponds to today (Midnight reset).
 */
export function isToday(date: Date | string): boolean {
  return isSameDay(date, new Date());
}

/**
 * Filters a list of meals to only those created on the given target date.
 */
export function filterMealsByDay(meals: Meal[], targetDate: Date = new Date()): Meal[] {
  return meals.filter((meal) => {
    const rawDate = meal.createdAt || (meal as any).created_at;
    if (!rawDate) return isToday(targetDate);
    return isSameDay(rawDate, targetDate);
  });
}

/**
 * Converts a Date object to YYYY-MM-DD string for API queries.
 */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats a Date object to a friendly Arabic label:
 * - "اليوم، 4 سبتمبر"
 * - "أمس، 3 سبتمبر"
 * - "الخميس، 4 سبتمبر"
 */
export function formatDateArabic(date: Date): string {
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ];

  const dayNumber = date.getDate();
  const monthName = months[date.getMonth()];

  if (isSameDay(date, now)) {
    return `اليوم، ${dayNumber} ${monthName}`;
  }

  if (isSameDay(date, yesterday)) {
    return `أمس، ${dayNumber} ${monthName}`;
  }

  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayName = days[date.getDay()];
  return `${dayName}، ${dayNumber} ${monthName}`;
}

