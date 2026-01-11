import { BadRequestError } from '@/common/errors';

const MYSQL_DATETIME_RE = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/;

export function parseMySqlDateTime(value: string): Date | null {
  const match = MYSQL_DATETIME_RE.exec(value.trim());
  if (!match) {
    return null;
  }

  const [
    _,
    yearRaw,
    monthRaw,
    dayRaw,
    hourRaw,
    minuteRaw,
    secondRaw,
    millisecondRaw,
  ] = match;

  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  const second = Number(secondRaw);
  const millisecond = millisecondRaw ? Number(millisecondRaw.padEnd(3, '0')) : 0;

  const date = new Date(year, month - 1, day, hour, minute, second, millisecond);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
    || date.getHours() !== hour
    || date.getMinutes() !== minute
    || date.getSeconds() !== second
  ) {
    return null;
  }

  return date;
}

export function normalizeOptionalDateTime(input: unknown, fieldName: string): Date | null | undefined {
  if (input === undefined) {
    return undefined;
  }

  if (input === null || input === '') {
    return null;
  }

  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) {
      throw new BadRequestError({ message: `${fieldName}格式不正确！` });
    }
    return input;
  }

  if (typeof input === 'string') {
    const parsed = parseMySqlDateTime(input);
    if (!parsed) {
      throw new BadRequestError({ message: `${fieldName}格式不正确！` });
    }
    return parsed;
  }

  throw new BadRequestError({ message: `${fieldName}格式不正确！` });
}
