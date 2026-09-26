const ALLOWED_ORIGINS = new Set(["https://doaor.com", "https://www.doaor.com"]);
const READ_ORIGINS = new Set([...ALLOWED_ORIGINS, "http://localhost:3000"]);
const COOKIE_NAME = "__Host-doaor_visit_session";
const SESSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
      const hasSession = sessionCookie(request);
      if (request.method === "POST" && !hasSession) {
        const updated = await env.DB.prepare(
          "UPDATE visit_counter SET total = total + 1 WHERE id = 1 RETURNING total",
        ).run();
        visits = updated.results[0]?.total;
        const id = crypto.randomUUID();
        headers.append(
          "Set-Cookie",
          `${COOKIE_NAME}=${id}; Path=/; Secure; HttpOnly; SameSite=Lax`,
        );
      } else {
        const row = await env.DB.prepare("SELECT total FROM visit_counter WHERE id = 1").first();
        visits = row?.total;
      }
      if (!Number.isSafeInteger(visits)) throw new Error("Visit counter is not initialized");
      return new Response(JSON.stringify({ visits }), { headers });
    } catch {
      return new Response(JSON.stringify({ error: "Counter unavailable" }), { status: 503, headers });
    }
  },
};
