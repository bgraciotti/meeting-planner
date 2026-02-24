export type HourColorZone = "business" | "shoulder" | "night";

export interface CityTime {
  timezone: string;
  label: string;
  hour: number;
  minute: number;
  dayOffset: number;
  colorZone: HourColorZone;
}

export interface MeetingRow {
  spHour: number;
  spColorZone: HourColorZone;
  isCurrentHour: boolean;
  cities: CityTime[];
}

export interface CityEntry {
  timezone: string;
  label: string;
  region: string;
  utcOffset: string;
  keywords: string[];
}

// Stores both timezone and label to differentiate cities sharing the same timezone
export interface SelectedCity {
  timezone: string;
  label: string;
}

export interface SessionData {
  cities: SelectedCity[];
  timestamp: number;
}

export interface Preferences {
  referenceCity?: string;
  businessHoursStart?: string;
  businessHoursEnd?: string;
  sessionTimeout?: string;
}
