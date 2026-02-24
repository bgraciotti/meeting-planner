/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Reference City - The reference city shown in the first column of the timetable */
  "referenceCity": "America/Sao_Paulo" | "America/Sao_Paulo::Rio de Janeiro" | "America/Sao_Paulo::Brasília" | "America/New_York" | "America/Chicago" | "America/Denver" | "America/Los_Angeles" | "America/Toronto" | "America/Vancouver" | "America/Mexico_City" | "America/Argentina/Buenos_Aires" | "America/Santiago" | "America/Bogota" | "America/Lima" | "Europe/London" | "Europe/Lisbon" | "Europe/Paris" | "Europe/Berlin" | "Europe/Madrid" | "Europe/Rome" | "Europe/Amsterdam" | "Europe/Warsaw" | "Europe/Stockholm" | "Europe/Istanbul" | "Europe/Moscow" | "Asia/Dubai" | "Asia/Kolkata" | "Asia/Bangkok" | "Asia/Singapore" | "Asia/Shanghai" | "Asia/Hong_Kong" | "Asia/Tokyo" | "Asia/Seoul" | "Australia/Sydney" | "Pacific/Auckland",
  /** Business Hours Start - Hour when business hours begin (0-23) */
  "businessHoursStart": string,
  /** Business Hours End - Hour when business hours end (0-23) */
  "businessHoursEnd": string,
  /** Session Timeout (minutes) - How long to remember selected cities before asking again */
  "sessionTimeout": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `meeting-planner` command */
  export type MeetingPlanner = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `meeting-planner` command */
  export type MeetingPlanner = {}
}

