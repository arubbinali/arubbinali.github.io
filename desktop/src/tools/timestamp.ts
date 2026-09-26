export const discordFormats = [
  ["t", "Short time"], ["T", "Long time"], ["d", "Short date"], ["D", "Long date"],
  ["f", "Date & time"], ["F", "Full date & time"], ["R", "Relative time"],
] as const;
export type DiscordFormat = typeof discordFormats[number][0];
export function dateInput(date: Date, utc: boolean) {
  const offset = utc ? 0 : date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 19);
}
export function parseTimestamp(value: string, utc: boolean): number | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value)) return null;
  const date = new Date(value + (utc ? "Z" : ""));
  if (!Number.isFinite(date.getTime())) return null;
  // Reject rolled-over dates and local times inside daylight-saving gaps.
  if (dateInput(date, utc).slice(0, value.length) !== value) return null;
  return Math.floor(date.getTime() / 1000);
}
export function timestampPreview(timestamp: number, format: DiscordFormat, utc: boolean, now = Date.now()) {
  const date = new Date(timestamp * 1000);
  if (format === "R") {
    const seconds = timestamp - now / 1000;
    const unit = Math.abs(seconds) >= 86400 ? "day" : Math.abs(seconds) >= 3600 ? "hour" : Math.abs(seconds) >= 60 ? "minute" : "second";
    const divisor = { day: 86400, hour: 3600, minute: 60, second: 1 }[unit];
    return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(Math.round(seconds / divisor), unit);
  }
  const styles: Record<Exclude<DiscordFormat, "R">, Intl.DateTimeFormatOptions> = {
    t: { timeStyle: "short" }, T: { timeStyle: "medium" }, d: { dateStyle: "short" },
    D: { dateStyle: "long" }, f: { dateStyle: "long", timeStyle: "short" }, F: { dateStyle: "full", timeStyle: "short" },
  };
  return new Intl.DateTimeFormat(undefined, { ...styles[format], timeZone: utc ? "UTC" : undefined }).format(date);
}
