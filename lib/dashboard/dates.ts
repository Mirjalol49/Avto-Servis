import { addDays, format, startOfDay, subDays } from "date-fns";

export function getDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function getLastNDays(today: Date, count: number) {
  const start = startOfDay(subDays(today, count - 1));

  return Array.from({ length: count }, (_, index) => {
    return getDateKey(addDays(start, index));
  });
}
