const FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
};

function partsToMs(parts: Intl.DateTimeFormatPart[]): number {
  const get = (type: string) => parseInt(parts.find((p) => p.type === type)!.value);
  return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
}

export function getTimezoneOffsetMinutes(timezone: string, date: Date): number {
  const utcMs = partsToMs(new Intl.DateTimeFormat("en-US", { ...FORMAT_OPTIONS, timeZone: "UTC" }).formatToParts(date));
  const localMs = partsToMs(
    new Intl.DateTimeFormat("en-US", { ...FORMAT_OPTIONS, timeZone: timezone }).formatToParts(date),
  );
  return (localMs - utcMs) / 60000;
}

export function getTodayInTimezone(timezone: string): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  return {
    year: parseInt(parts.find((p) => p.type === "year")!.value),
    month: parseInt(parts.find((p) => p.type === "month")!.value),
    day: parseInt(parts.find((p) => p.type === "day")!.value),
  };
}

export function getCurrentHourInTimezone(timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  return parseInt(parts.find((p) => p.type === "hour")!.value);
}

export interface TimezoneResult {
  hour: number;
  minute: number;
  dayOffset: number;
}

export function computeTimeForHour(
  spHour: number,
  referenceTimezone: string,
  targetTimezone: string,
): TimezoneResult {
  const spToday = getTodayInTimezone(referenceTimezone);
  // Use noon UTC as anchor to safely compute SP offset (avoids DST ambiguity at midnight)
  const noonUTC = new Date(Date.UTC(spToday.year, spToday.month - 1, spToday.day, 12, 0, 0));
  const spOffsetMinutes = getTimezoneOffsetMinutes(referenceTimezone, noonUTC);

  // UTC instant corresponding to spHour:00 in São Paulo
  const spLocalMs = Date.UTC(spToday.year, spToday.month - 1, spToday.day, spHour, 0, 0);
  const utcMs = spLocalMs - spOffsetMinutes * 60000;
  const utcInstant = new Date(utcMs);

  // Format in target timezone
  const tgtParts = new Intl.DateTimeFormat("en-US", {
    timeZone: targetTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(utcInstant);

  const tgtHour = parseInt(tgtParts.find((p) => p.type === "hour")!.value);
  const tgtMinute = parseInt(tgtParts.find((p) => p.type === "minute")!.value);
  const tgtDay = parseInt(tgtParts.find((p) => p.type === "day")!.value);

  // Compute day offset relative to SP
  const spParts = new Intl.DateTimeFormat("en-US", {
    timeZone: referenceTimezone,
    day: "2-digit",
  }).formatToParts(utcInstant);
  const spDay = parseInt(spParts.find((p) => p.type === "day")!.value);

  let dayOffset = tgtDay - spDay;
  // Handle month boundary
  if (dayOffset > 15) dayOffset -= 31;
  if (dayOffset < -15) dayOffset += 31;

  return { hour: tgtHour, minute: tgtMinute, dayOffset };
}
