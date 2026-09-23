const SHANGHAI_TIME_ZONE = "Asia/Shanghai";

export function getTodayDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SHANGHAI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function formatChineseDate(date: string, includeYear = true) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: SHANGHAI_TIME_ZONE,
    ...(includeYear ? { year: "numeric" as const } : {}),
    month: "long",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00+08:00`));
}

export function getQuarterStart(date = getTodayDate()) {
  const [year, month] = date.split("-").map(Number);
  const quarterStartMonth = Math.floor((month - 1) / 3) * 3 + 1;
  return `${year}-${String(quarterStartMonth).padStart(2, "0")}-01`;
}

export function getNextQuarterStart(date = getTodayDate()) {
  const [year, month] = date.split("-").map(Number);
  const nextMonth = Math.floor((month - 1) / 3) * 3 + 4;
  const nextYear = nextMonth > 12 ? year + 1 : year;
  const normalizedMonth = nextMonth > 12 ? nextMonth - 12 : nextMonth;
  return `${nextYear}-${String(normalizedMonth).padStart(2, "0")}-01`;
}

export function getIsoWeekStart(date = getTodayDate()) {
  const value = new Date(`${date}T00:00:00Z`);
  const isoDay = value.getUTCDay() || 7;
  value.setUTCDate(value.getUTCDate() - isoDay + 1);
  return value.toISOString().slice(0, 10);
}

export function getIsoWeekEnd(weekStart: string) {
  const value = new Date(`${weekStart}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + 6);
  return value.toISOString().slice(0, 10);
}

export function formatWeekRange(weekStart: string) {
  return `${formatChineseDate(weekStart, false)}—${formatChineseDate(getIsoWeekEnd(weekStart), false)}`;
}
