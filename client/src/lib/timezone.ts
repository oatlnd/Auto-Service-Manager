import { format } from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";

export const SRI_LANKA_TIMEZONE = "Asia/Colombo";

export function getSriLankaTime(): Date {
  return toZonedTime(new Date(), SRI_LANKA_TIMEZONE);
}

export function formatSriLankaDate(date: Date, formatStr: string): string {
  return formatInTimeZone(date, SRI_LANKA_TIMEZONE, formatStr);
}

export function getSriLankaDateString(): string {
  return formatInTimeZone(new Date(), SRI_LANKA_TIMEZONE, "yyyy-MM-dd");
}

export function getSriLankaTimeString(): string {
  return formatInTimeZone(new Date(), SRI_LANKA_TIMEZONE, "HH:mm");
}
