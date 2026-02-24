import {
  Action,
  ActionPanel,
  Color,
  Icon,
  List,
  LocalStorage,
  getPreferenceValues,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import { useEffect, useMemo, useState } from "react";

import { Preferences, MeetingRow, CityTime, SelectedCity, SessionData } from "./types";
import { AVAILABLE_CITIES, getCityLabel } from "./cities";
import { computeTimeForHour, getCurrentHourInTimezone } from "./utils/timezone";
import { getHourColorZone, getZoneColor, formatCityTime, formatSpTime } from "./utils/colorCoding";

const DEFAULT_REFERENCE_TIMEZONE = "America/Sao_Paulo";
const SESSION_KEY = "meeting-planner-session";
const MAX_CITIES = 3;

function parseIntSafe(value: string | undefined, fallback: number): number {
  const parsed = parseInt(value ?? String(fallback));
  return isNaN(parsed) ? fallback : parsed;
}

function parseReferenceCity(pref: string | undefined): { timezone: string; label: string } {
  const value = pref || DEFAULT_REFERENCE_TIMEZONE;
  if (value.includes("::")) {
    const [timezone, label] = value.split("::");
    return { timezone, label };
  }
  return { timezone: value, label: getCityLabel(value) };
}

function cityKey(c: SelectedCity): string {
  return `${c.timezone}::${c.label}`;
}

// ─── Timetable View ──────────────────────────────────────────────────────────

function buildMeetingTable(
  referenceTimezone: string,
  selectedCities: SelectedCity[],
  businessStart: number,
  businessEnd: number,
): MeetingRow[] {
  const currentRefHour = getCurrentHourInTimezone(referenceTimezone);

  return Array.from({ length: 24 }, (_, refHour) => {
    const spColorZone = getHourColorZone(refHour, businessStart, businessEnd);
    const cities: CityTime[] = selectedCities.map((sc) => {
      const result = computeTimeForHour(refHour, referenceTimezone, sc.timezone);
      const colorZone = getHourColorZone(result.hour, businessStart, businessEnd);
      return {
        timezone: sc.timezone,
        label: sc.label,
        hour: result.hour,
        minute: result.minute,
        dayOffset: result.dayOffset,
        colorZone,
      };
    });

    return { spHour: refHour, spColorZone, isCurrentHour: refHour === currentRefHour, cities };
  });
}

function buildRowClipboardText(row: MeetingRow, spLabel: string): string {
  const parts = [`${spLabel}: ${formatSpTime(row.spHour)}`];
  row.cities.forEach((c) => {
    parts.push(`${c.label}: ${formatCityTime(c.hour, c.minute, c.dayOffset)}`);
  });
  return parts.join(" | ");
}

function Timetable({ selectedCities, onRemoveCity, onAddCity }: {
  selectedCities: SelectedCity[];
  onRemoveCity: (c: SelectedCity) => void;
  onAddCity: () => void;
}) {
  const prefs = getPreferenceValues<Preferences>();
  const businessStart = parseIntSafe(prefs.businessHoursStart, 8);
  const businessEnd = parseIntSafe(prefs.businessHoursEnd, 19);
  const [filterZone, setFilterZone] = useState<string>("all");

  const refCity = parseReferenceCity(prefs.referenceCity);

  const depsKey = selectedCities.map(cityKey).join(",");
  const rows = useMemo(() => {
    try {
      return buildMeetingTable(refCity.timezone, selectedCities, businessStart, businessEnd);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error loading timetable",
        message: error instanceof Error ? error.message : "Unknown error",
      });
      return [];
    }
  }, [depsKey, businessStart, businessEnd]);

  const filteredRows = rows.filter((row) => {
    if (filterZone === "all") return true;
    if (filterZone === "good") {
      return row.spColorZone !== "night" && row.cities.every((c) => c.colorZone !== "night");
    }
    if (filterZone === "business") {
      return row.spColorZone === "business" && row.cities.every((c) => c.colorZone === "business");
    }
    return true;
  });

  const refLabel = refCity.label;
  const currentHourId = rows.find((r) => r.isCurrentHour)?.spHour.toString();
  const fullTableText = rows.map((r) => buildRowClipboardText(r, refLabel)).join("\n");

  // Section title as table header
  const headerCities = [refLabel, ...selectedCities.map((c) => c.label)];
  const sectionTitle = headerCities.join("  ·  ");

  return (
    <List
      searchBarPlaceholder="Filter hours..."
      selectedItemId={currentHourId}
      searchBarAccessory={
        <List.Dropdown tooltip="Show Hours" value={filterZone} onChange={setFilterZone}>
          <List.Dropdown.Item title="All Hours" value="all" />
          <List.Dropdown.Item title="Good Hours (no night)" value="good" />
          <List.Dropdown.Item title="Business Hours Only" value="business" />
        </List.Dropdown>
      }
    >
      <List.Section title={sectionTitle}>
        {filteredRows.map((row) => {
          // SP time as title (left side) with icon colored by SP zone
          const spTime = formatSpTime(row.spHour);

          // Other cities as tag accessories (right side)
          const accessories: List.Item.Accessory[] = row.cities.map((city) => ({
            tag: {
              value: `${city.label} ${formatCityTime(city.hour, city.minute, city.dayOffset)}`,
              color: getZoneColor(city.colorZone),
            },
            tooltip: `${city.label}: ${formatCityTime(city.hour, city.minute, city.dayOffset)}${city.dayOffset !== 0 ? " (different day)" : ""}`,
          }));

          const clipboardText = buildRowClipboardText(row, refLabel);

          return (
            <List.Item
              key={row.spHour}
              id={row.spHour.toString()}
              title={row.isCurrentHour ? `${refLabel} ${spTime}  ← now` : `${refLabel} ${spTime}`}
              icon={{ source: Icon.Dot, tintColor: getZoneColor(row.spColorZone) }}
              keywords={[String(row.spHour), spTime]}
              accessories={accessories}
              actions={
                <ActionPanel>
                  <ActionPanel.Section title="Copy">
                    <Action.CopyToClipboard title="Copy This Time Slot" content={clipboardText} icon={Icon.Clipboard} />
                    <Action.CopyToClipboard
                      title="Copy All Times"
                      content={fullTableText}
                      icon={Icon.CopyClipboard}
                      shortcut={{ modifiers: ["ctrl", "shift"], key: "c" }}
                    />
                  </ActionPanel.Section>
                  <ActionPanel.Section title="Cities">
                    {selectedCities.length < MAX_CITIES && (
                      <Action
                        title="Add City"
                        icon={Icon.Plus}
                        shortcut={{ modifiers: ["ctrl"], key: "n" }}
                        onAction={onAddCity}
                      />
                    )}
                    {selectedCities.map((sc) => (
                      <Action
                        key={cityKey(sc)}
                        title={`Remove ${sc.label}`}
                        icon={Icon.Minus}
                        style={Action.Style.Destructive}
                        onAction={() => onRemoveCity(sc)}
                      />
                    ))}
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>
      {filteredRows.length === 0 && (
        <List.EmptyView icon={Icon.Clock} title="No hours match the filter" description="Try changing the filter in the dropdown above" />
      )}
    </List>
  );
}

// ─── City Selector View ──────────────────────────────────────────────────────

function CitySelector({ alreadySelected, onConfirm }: {
  alreadySelected: SelectedCity[];
  onConfirm: (cities: SelectedCity[]) => void;
}) {
  const [selected, setSelected] = useState<SelectedCity[]>(alreadySelected);
  const prefs = getPreferenceValues<Preferences>();
  const refCity = parseReferenceCity(prefs.referenceCity);
  const refLabel = refCity.label;
  const canConfirm = selected.length >= 1;
  const canAddMore = selected.length < MAX_CITIES;

  function isSelected(label: string, timezone: string): boolean {
    return selected.some((s) => s.label === label && s.timezone === timezone);
  }

  function toggleCity(city: { label: string; timezone: string }) {
    setSelected((prev) => {
      if (prev.some((s) => s.label === city.label && s.timezone === city.timezone)) {
        return prev.filter((s) => !(s.label === city.label && s.timezone === city.timezone));
      }
      if (prev.length >= MAX_CITIES) {
        showToast({ style: Toast.Style.Failure, title: `Maximum ${MAX_CITIES} cities allowed` });
        return prev;
      }
      return [...prev, { timezone: city.timezone, label: city.label }];
    });
  }

  const regions = [...new Set(AVAILABLE_CITIES.map((c) => c.region))];
  const selectedLabels = selected.map((s) => s.label).join(", ");

  return (
    <List searchBarPlaceholder="Search cities...">
      {/* Fixed "Show Timetable" item at top */}
      <List.Section title={`Reference city: ${refLabel} (Settings)`}>
        <List.Item
          key="show-timetable"
          title={canConfirm ? "Show Timetable" : "Select at least 1 city below"}
          subtitle={canConfirm ? `${refLabel} + ${selectedLabels}` : undefined}
          icon={canConfirm ? { source: Icon.Calendar, tintColor: Color.Green } : { source: Icon.Calendar, tintColor: Color.SecondaryText }}
          actions={
            canConfirm ? (
              <ActionPanel>
                <Action title="Show Timetable" icon={Icon.Calendar} onAction={() => onConfirm(selected)} />
              </ActionPanel>
            ) : undefined
          }
        />
      </List.Section>

      {/* Selected cities */}
      {selected.length > 0 && (
        <List.Section title={`Selected (${selected.length}/${MAX_CITIES})`}>
          {selected.map((sc) => {
            const city = AVAILABLE_CITIES.find((c) => c.timezone === sc.timezone && c.label === sc.label);
            return (
              <List.Item
                key={`selected-${cityKey(sc)}`}
                title={sc.label}
                subtitle={city?.utcOffset ?? sc.timezone}
                icon={{ source: Icon.CheckCircle, tintColor: Color.Green }}
                accessories={[{ tag: { value: city?.region ?? "", color: Color.Blue } }]}
                actions={
                  <ActionPanel>
                    <Action title="Remove City" icon={Icon.Minus} onAction={() => toggleCity(sc)} />
                    <Action title="Show Timetable" icon={Icon.Calendar} onAction={() => onConfirm(selected)} />
                  </ActionPanel>
                }
              />
            );
          })}
        </List.Section>
      )}

      {/* Available cities by region */}
      {regions.map((region) => {
        const citiesInRegion = AVAILABLE_CITIES.filter(
          (c) => c.region === region && !isSelected(c.label, c.timezone),
        );
        if (citiesInRegion.length === 0) return null;
        return (
          <List.Section key={region} title={region}>
            {citiesInRegion.map((city) => (
              <List.Item
                key={`${city.timezone}-${city.label}`}
                title={city.label}
                subtitle={city.utcOffset}
                icon={Icon.Globe}
                keywords={[city.label, ...city.keywords, city.region, city.utcOffset]}
                actions={
                  <ActionPanel>
                    {canAddMore ? (
                      <Action title="Select City" icon={Icon.Plus} onAction={() => toggleCity(city)} />
                    ) : (
                      <Action title="Limit Reached" icon={Icon.ExclamationMark} onAction={() => {
                        showToast({ style: Toast.Style.Failure, title: `Maximum ${MAX_CITIES} cities` });
                      }} />
                    )}
                    {canConfirm && (
                      <Action title="Show Timetable" icon={Icon.Calendar} onAction={() => onConfirm(selected)} />
                    )}
                  </ActionPanel>
                }
              />
            ))}
          </List.Section>
        );
      })}

      <List.EmptyView
        icon={Icon.Globe}
        title="No cities found"
        description="Try a different search term"
      />
    </List>
  );
}

// ─── Main Command ────────────────────────────────────────────────────────────

export default function Command() {
  const prefs = getPreferenceValues<Preferences>();
  const sessionTimeoutMin = parseIntSafe(prefs.sessionTimeout, 5);
  const { push } = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionCities, setSessionCities] = useState<SelectedCity[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await LocalStorage.getItem<string>(SESSION_KEY);
        if (raw) {
          const session: SessionData = JSON.parse(raw);
          const elapsed = (Date.now() - session.timestamp) / 60000;
          if (elapsed < sessionTimeoutMin && session.cities.length > 0) {
            setSessionCities(session.cities);
          }
        }
      } catch {
        // Invalid session data, ignore
      }
      setIsLoading(false);
    })();
  }, []);

  async function saveSession(cities: SelectedCity[]) {
    const session: SessionData = { cities, timestamp: Date.now() };
    await LocalStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setSessionCities(cities);
  }

  function handleConfirmCities(cities: SelectedCity[]) {
    saveSession(cities);
  }

  function handleRemoveCity(c: SelectedCity) {
    if (!sessionCities) return;
    const updated = sessionCities.filter((s) => !(s.label === c.label && s.timezone === c.timezone));
    if (updated.length === 0) {
      LocalStorage.removeItem(SESSION_KEY);
      setSessionCities(null);
    } else {
      saveSession(updated);
    }
  }

  function handleAddCity() {
    if (!sessionCities) return;
    push(
      <CitySelector
        alreadySelected={sessionCities}
        onConfirm={(cities) => {
          saveSession(cities);
        }}
      />,
    );
  }

  if (isLoading) {
    return <List isLoading />;
  }

  if (sessionCities && sessionCities.length > 0) {
    return (
      <Timetable
        selectedCities={sessionCities}
        onRemoveCity={handleRemoveCity}
        onAddCity={handleAddCity}
      />
    );
  }

  return (
    <CitySelector
      alreadySelected={[]}
      onConfirm={handleConfirmCities}
    />
  );
}
