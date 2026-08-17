export const TIMEZONE_OPTIONS = [
  { id: "Asia/Riyadh", city: "Jeddah", country: "Saudi Arabia", aliases: "riyadh ksa saudi mecca makkah" },
  { id: "Asia/Kuala_Lumpur", city: "Kuala Lumpur", country: "Malaysia", aliases: "kl malaysia" },
  { id: "Europe/London", city: "London", country: "United Kingdom", aliases: "uk england britain gmt" },
  { id: "America/New_York", city: "New York", country: "United States", aliases: "nyc usa eastern" },
  { id: "Asia/Tokyo", city: "Tokyo", country: "Japan", aliases: "japan jst" },
  { id: "Asia/Singapore", city: "Singapore", country: "Singapore", aliases: "sg" },
  { id: "Asia/Dubai", city: "Dubai", country: "United Arab Emirates", aliases: "uae abu dhabi" },
  { id: "Asia/Bahrain", city: "Manama", country: "Bahrain", aliases: "bahrain" },
  { id: "Asia/Qatar", city: "Doha", country: "Qatar", aliases: "qatar" },
  { id: "Asia/Kuwait", city: "Kuwait City", country: "Kuwait", aliases: "kuwait" },
  { id: "Asia/Muscat", city: "Muscat", country: "Oman", aliases: "oman" },
  { id: "Asia/Jakarta", city: "Jakarta", country: "Indonesia", aliases: "indonesia" },
  { id: "Asia/Bangkok", city: "Bangkok", country: "Thailand", aliases: "thailand" },
  { id: "Asia/Manila", city: "Manila", country: "Philippines", aliases: "philippines" },
  { id: "Asia/Hong_Kong", city: "Hong Kong", country: "Hong Kong", aliases: "hk china" },
  { id: "Asia/Shanghai", city: "Shanghai", country: "China", aliases: "china beijing cst" },
  { id: "Asia/Kolkata", city: "Mumbai", country: "India", aliases: "india delhi kolkata ist" },
  { id: "Asia/Karachi", city: "Karachi", country: "Pakistan", aliases: "pakistan islamabad" },
  { id: "Asia/Seoul", city: "Seoul", country: "South Korea", aliases: "korea" },
  { id: "Australia/Sydney", city: "Sydney", country: "Australia", aliases: "australia nsw" },
  { id: "Australia/Melbourne", city: "Melbourne", country: "Australia", aliases: "australia victoria" },
  { id: "Pacific/Auckland", city: "Auckland", country: "New Zealand", aliases: "nz" },
  { id: "Europe/Paris", city: "Paris", country: "France", aliases: "france cet" },
  { id: "Europe/Berlin", city: "Berlin", country: "Germany", aliases: "germany cet" },
  { id: "Europe/Amsterdam", city: "Amsterdam", country: "Netherlands", aliases: "holland dutch" },
  { id: "Europe/Moscow", city: "Moscow", country: "Russia", aliases: "russia" },
  { id: "Asia/Gaza", city: "Gaza", country: "Palestine", aliases: "palestine palestinian" },
  { id: "trl/Dagestan", timeZone: "Europe/Moscow", city: "Dagestan", country: "Russia", aliases: "makhachkala dagestan russia" },
  { id: "Europe/Istanbul", city: "Istanbul", country: "Türkiye", aliases: "turkey" },
  { id: "Africa/Cairo", city: "Cairo", country: "Egypt", aliases: "egypt" },
  { id: "Africa/Johannesburg", city: "Johannesburg", country: "South Africa", aliases: "south africa cape town" },
  { id: "America/Chicago", city: "Chicago", country: "United States", aliases: "usa central" },
  { id: "America/Denver", city: "Denver", country: "United States", aliases: "usa mountain" },
  { id: "America/Los_Angeles", city: "Los Angeles", country: "United States", aliases: "la usa california pacific" },
  { id: "America/Toronto", city: "Toronto", country: "Canada", aliases: "canada eastern" },
  { id: "America/Vancouver", city: "Vancouver", country: "Canada", aliases: "canada pacific" },
  { id: "America/Mexico_City", city: "Mexico City", country: "Mexico", aliases: "mexico" },
  { id: "America/Sao_Paulo", city: "São Paulo", country: "Brazil", aliases: "sao paulo brazil" },
];

export function getDefaultTimezones() {
  const defaultIds = ["Europe/Istanbul", "Asia/Gaza", "trl/Dagestan"];
  return defaultIds.map((id) => TIMEZONE_OPTIONS.find((option) => option.id === id));
}

export function searchTimezones(query, selectedIds = []) {
  const search = query.trim().toLocaleLowerCase();
  return TIMEZONE_OPTIONS.filter((option) => {
    if (selectedIds.includes(option.id)) return false;
    if (!search) return true;
    return `${option.city} ${option.country} ${option.aliases} ${option.id}`.toLocaleLowerCase().includes(search);
  });
}

export function formatTimezone(zone, date = new Date()) {
  const timeZone = zone.timeZone || zone.id;
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  const calendar = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  const offsetParts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  }).formatToParts(date);
  const offset = offsetParts.find((part) => part.type === "timeZoneName")?.value || timeZone;
  return { time, calendar, offset: offset.replace("GMT", "GMT") };
}
