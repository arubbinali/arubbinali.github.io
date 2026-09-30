const ALLOWED_ORIGINS = new Set(["https://doaor.com", "https://www.doaor.com"]);
const READ_ORIGINS = new Set([...ALLOWED_ORIGINS, "http://localhost:3000"]);
const COOKIE_NAME = "__Host-doaor_visit_session";
const SESSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RANGES = {
  "24h": { age: 86400, interval: 3600 },
  "7d": { age: 604800, interval: 21600 },
  "30d": { age: 2592000, interval: 86400 },
  all: { age: null, interval: 604800 },
};

function sessionCookie(request) {
  const cookies = request.headers.get("Cookie") || "";
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  return match && SESSION_ID.test(match[1]) ? match[1] : null;
}

function responseHeaders(origin) {
  const headers = new Headers({
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    Vary: "Origin",
  });
  if (READ_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  }
  return headers;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const headers = responseHeaders(origin);

    if (url.pathname !== "/") return new Response("Not found", { status: 404 });
    if (origin && !READ_ORIGINS.has(origin)) {
      return new Response(JSON.stringify({ error: "Origin not allowed" }), { status: 403, headers });
    }
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== "GET" && request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: new Headers([...headers, ["Allow", "GET, POST, OPTIONS"]]),
      });
    }
    if (request.method === "POST" && !ALLOWED_ORIGINS.has(origin)) {
      return new Response(JSON.stringify({ error: "Origin required" }), { status: 403, headers });
    }

    try {
      let visits;
      let pageLoads;
      const hasSession = sessionCookie(request);
      if (request.method === "POST") {
        const bucket = Math.floor(Date.now() / 3600000) * 3600;
        const [updated] = await env.DB.batch([env.DB.prepare(
          `UPDATE visit_counter SET total = total + ${hasSession ? "0" : "1"},
            page_loads = page_loads + 1 WHERE id = 1 RETURNING total, page_loads`,
        ), env.DB.prepare(
          "INSERT INTO traffic_buckets(bucket,visits,page_loads) SELECT ?1,total,page_loads FROM visit_counter WHERE id=1 ON CONFLICT(bucket) DO UPDATE SET visits=excluded.visits,page_loads=excluded.page_loads",
        ).bind(bucket)]);
        visits = updated.results[0]?.total;
        pageLoads = updated.results[0]?.page_loads;
        if (!hasSession) {
          const id = crypto.randomUUID();
          headers.append(
            "Set-Cookie",
            `${COOKIE_NAME}=${id}; Path=/; Secure; HttpOnly; SameSite=Lax`,
          );
        }
      } else {
        const row = await env.DB.prepare("SELECT total, page_loads FROM visit_counter WHERE id = 1").first();
        visits = row?.total;
        pageLoads = row?.page_loads;
      }
      if (!Number.isSafeInteger(visits) || !Number.isSafeInteger(pageLoads)) {
        throw new Error("Visit counter is not initialized");
      }
      let series;
      const selectedRange = RANGES[url.searchParams.get("range")];
      if (request.method === "GET" && selectedRange) {
        const since = selectedRange.age === null ? 0 : Math.floor(Date.now() / 1000) - selectedRange.age;
        const result = await env.DB.prepare(
          "SELECT CAST(bucket / ?1 AS INTEGER) * ?1 AS at, MAX(visits) AS visits, MAX(page_loads) AS views FROM traffic_buckets WHERE bucket >= ?2 GROUP BY at ORDER BY at",
        ).bind(selectedRange.interval, since).all();
        series = result.results.map((point) => ({ at: point.at, visits: point.visits, views: point.views }));
        const currentAt = Math.floor(Date.now() / (selectedRange.interval * 1000)) * selectedRange.interval;
        if (series.at(-1)?.at === currentAt) {
          series[series.length - 1] = { at: currentAt, visits, views: pageLoads };
        } else {
          series.push({ at: currentAt, visits, views: pageLoads });
        }
      }
      return new Response(JSON.stringify({ visits, pageLoads, ...(series ? { series } : {}) }), { headers });
    } catch {
      return new Response(JSON.stringify({ error: "Counter unavailable" }), { status: 503, headers });
    }
  },
};
