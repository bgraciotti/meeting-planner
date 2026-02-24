# Meeting Planner - Raycast Extension for Windows

Compare 24-hour timetables across multiple cities to find the best meeting time. Inspired by [timeanddate.com Meeting Planner](https://www.timeanddate.com/worldclock/meeting.html).

## Features

- **Interactive City Selector**: Search and select up to 3 cities to compare with São Paulo
- **24-Hour Timetable**: Table-like layout with city names as headers and color-coded time tags
- **Color-Coded Hours**: Green (business), Yellow (shoulder), Red (night) for all cities including São Paulo
- **Smart Filtering**: Filter to show only good hours or business-only hours
- **Session Memory**: Remembers your selected cities for 5 minutes (configurable)
- **Current Hour Highlight**: Automatically scrolls to the current hour
- **Add/Remove Cities**: Modify city selection from the action menu (Ctrl+K)
- **Copy to Clipboard**: Copy a single time slot or the full timetable
- **DST-Aware**: Automatically handles Daylight Saving Time transitions
- **30+ Cities**: Support for major cities across Americas, Europe, Asia, and Oceania

## How to Install

1. Install Node JS (`winget install -e --id OpenJS.NodeJS`)
2. Clone or copy the repository
3. Run: `npm install` then `npm run dev`

## Usage

1. Open Raycast and search for "Meeting Planner"
2. Search and select up to 3 cities to compare (Enter to toggle, Ctrl+Enter to confirm)
3. Browse the 24-hour timetable with color-coded time tags
4. Use the dropdown to filter by Good Hours or Business Hours Only
5. Use Ctrl+K to add/remove cities from the timetable

## Keyboard Shortcuts

### City Selector
- **Enter**: Select/deselect a city
- **Ctrl+Enter**: Show timetable with selected cities

### Timetable
- **Enter**: Copy selected time slot to clipboard
- **Ctrl+Shift+C**: Copy full timetable to clipboard
- **Ctrl+N**: Add a city
- **Ctrl+K**: Open action menu (remove cities, etc.)

## Settings

| Setting | Description | Default |
|---|---|---|
| Business Hours Start | Hour when business hours begin (0-23) | 8 |
| Business Hours End | Hour when business hours end (0-23) | 19 |
| Session Timeout | Minutes to remember selected cities | 5 |

## Color Coding

| Color | Hours (default) | Meaning |
|---|---|---|
| Green | 08:00 - 19:00 | Business hours |
| Yellow | 06:00 - 08:00, 19:00 - 22:00 | Shoulder hours (acceptable) |
| Red | 22:00 - 06:00 | Night / sleep hours (avoid) |

## Available Cities

**Americas**: New York, Los Angeles, Chicago, Toronto, Buenos Aires, Santiago, Bogota, Mexico City
**Europe**: London, Lisbon, Paris, Berlin, Amsterdam, Madrid, Rome, Warsaw, Stockholm, Zurich, Helsinki, Istanbul
**Asia/Oceania**: Dubai, Mumbai, Bangkok, Singapore, Shanghai, Hong Kong, Tokyo, Sydney, Auckland

## Changelog

### Version 1.1.0
- 🚀 **Interactive city selector**: Select cities dynamically instead of via preferences
- 🎨 **Table-like layout**: City names as section header, only time tags in rows
- ✨ **Session memory**: Remembers cities for configurable timeout (default 5 min)
- 🟢 **São Paulo color coding**: Reference city now also shows color-coded times
- ⌨️ **Add/Remove cities**: Manage cities from the timetable action menu
- 🔧 **Updated hour ranges**: Business 8-19, Shoulder 6-8/19-22, Night 22-6

### Version 1.0.0
- 🚀 **Initial release**: 24-hour meeting planner with multi-city comparison

## License

MIT
