import { Color } from "@raycast/api";
import { HourColorZone } from "../types";

export function getHourColorZone(hour: number, businessStart: number = 8, businessEnd: number = 19): HourColorZone {
  if (hour >= businessStart && hour < businessEnd) return "business";

  // Shoulder: 2 hours before business start, 3 hours after business end
  const shoulderMorningStart = businessStart - 2; // default: 6
  const shoulderEveningEnd = businessEnd + 3; // default: 22

  if ((hour >= shoulderMorningStart && hour < businessStart) || (hour >= businessEnd && hour < shoulderEveningEnd)) {
    return "shoulder";
  }

  return "night";
}

export function getZoneColor(zone: HourColorZone): Color {
  switch (zone) {
    case "business":
      return Color.Green;
    case "shoulder":
      return Color.Yellow;
    case "night":
      return Color.Red;
  }
}

export function formatCityTime(hour: number, minute: number, dayOffset: number): string {
  const h = String(hour).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  if (dayOffset > 0) return `${h}:${m} +${dayOffset}`;
  if (dayOffset < 0) return `${h}:${m} ${dayOffset}`;
  return `${h}:${m} +0`;
}

export function formatSpTime(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}
