export const TRAFFIC_API = "https://visits.doaor.com/";

export const TRAFFIC_RANGES = [
  ["24h", "24 hours", 86400],
  ["7d", "7 days", 604800],
  ["30d", "30 days", 2592000],
  ["all", "All time", Infinity],
];

export function normalizeTraffic(data) {
  const visits = Number(data?.visits);
  const pageLoads = Number(data?.pageLoads);
  const counts = {
    visits: Number.isFinite(visits) ? visits : null,
    pageLoads: Number.isFinite(pageLoads) ? pageLoads : null,
  };
  const points = Array.isArray(data?.series)
    ? data.series
      .map((point) => ({ at: Number(point.at), visits: Number(point.visits), views: Number(point.views) }))
      .filter((point) => Number.isFinite(point.at) && Number.isFinite(point.visits) && Number.isFinite(point.views))
      .sort((a, b) => a.at - b.at)
    : [];
  const last = points.at(-1);
  if (Number.isFinite(counts.visits) && Number.isFinite(counts.pageLoads) &&
      (!last || last.visits !== counts.visits || last.views !== counts.pageLoads)) {
    points.push({ at: Math.floor(Date.now() / 1000), visits: counts.visits, views: counts.pageLoads });
  }
  return { counts, points };
}

export async function fetchTraffic(range = "30d", signal) {
  const response = await fetch(`${TRAFFIC_API}?range=${range}`, {
    cache: "no-store",
    credentials: "include",
    signal,
  });
  if (!response.ok) throw new Error(`Traffic request failed with ${response.status}`);
  let data = await response.json();
  if (range === "all" && (data.series?.length || 0) < 80) {
    try {
      const recentResponse = await fetch(`${TRAFFIC_API}?range=30d`, {
        cache: "no-store",
        credentials: "include",
        signal,
      });
      if (recentResponse.ok) {
        const recent = await recentResponse.json();
        const merged = new Map([...(data.series || []), ...(recent.series || [])].map((point) => [Number(point.at), point]));
        data = { ...data, series: [...merged.values()].sort((a, b) => Number(a.at) - Number(b.at)) };
      }
    } catch {
      // The all-time response remains authoritative if the supplementary request fails.
    }
  }
  return normalizeTraffic(data);
}
