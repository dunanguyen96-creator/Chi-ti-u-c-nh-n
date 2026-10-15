function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toIcsDate(date: Date): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

// A data: URI holding a single all-day VEVENT with a 1-day-before reminder —
// opening/downloading it lets any phone calendar (Google, Apple, Outlook...)
// import the event without a server round-trip.
export function buildCalendarEventUrl({
  title,
  date,
  description,
}: {
  title: string;
  date: Date;
  description?: string;
}): string {
  const dt = toIcsDate(date);
  const uid = `${dt}-${Math.random().toString(36).slice(2)}@quanlychitieu`;
  const stamp = toIcsDate(new Date());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Quan ly chi tieu//VN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}T000000Z`,
    `DTSTART;VALUE=DATE:${dt}`,
    `DTEND;VALUE=DATE:${dt}`,
    `SUMMARY:${escapeIcsText(title)}`,
    description ? `DESCRIPTION:${escapeIcsText(description)}` : "",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Nhắc thanh toán",
    "TRIGGER:-P1D",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}
