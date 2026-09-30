import assert from "node:assert/strict";
import test from "node:test";
import worker from "./worker.mjs";

function database(initial = 0, initialPageLoads = 0) {
  let total = initial;
  let pageLoads = initialPageLoads;
  const buckets = new Map();
  return {
    get total() { return total; },
    get pageLoads() { return pageLoads; },
    async batch(statements) { return Promise.all(statements.map((statement) => statement.run())); },
    prepare(query) {
      let values = [];
      const statement = {
        bind(...next) { values = next; return statement; },
        async run() {
          if (/^UPDATE visit_counter/.test(query)) {
            total += /total = total \+ 1/.test(query) ? 1 : 0;
            pageLoads += 1;
            return { results: [{ total, page_loads: pageLoads }] };
          }
          assert.match(query, /^INSERT INTO traffic_buckets/);
          const [bucket] = values;
          buckets.set(bucket, { visits: total, views: pageLoads });
          return { results: [] };
        },
        async first() {
          assert.match(query, /^SELECT total/);
          return { total, page_loads: pageLoads };
        },
        async all() {
          assert.match(query, /^SELECT CAST\(bucket/);
          return { results: [...buckets].map(([at, point]) => ({ at, ...point })) };
        },
      };
      return statement;
    },
  };
}

function request(method, headers = {}) {
  return new Request("https://visits.doaor.com/", {
    method,
    headers: { Origin: "https://doaor.com", ...headers },
  });
}

test("reads the total without adding a visit", async () => {
  const DB = database(12, 40);
  const response = await worker.fetch(request("GET"), { DB });
  assert.deepEqual(await response.json(), { visits: 12, pageLoads: 40 });
  assert.equal(DB.total, 12);
  assert.equal(DB.pageLoads, 40);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("counts once and shares a session cookie across repeat requests", async () => {
  const DB = database(12, 40);
  const first = await worker.fetch(request("POST"), { DB });
  assert.deepEqual(await first.json(), { visits: 13, pageLoads: 41 });
  const cookie = first.headers.get("Set-Cookie");
  assert.match(cookie, /__Host-doaor_visit_session=[0-9a-f-]+/);
  assert.doesNotMatch(cookie, /Domain=/);
  assert.doesNotMatch(cookie, /Max-Age|Expires/);

  const second = await worker.fetch(request("POST", { Cookie: cookie.split(";")[0] }), { DB });
  assert.deepEqual(await second.json(), { visits: 13, pageLoads: 42 });
  assert.equal(DB.total, 13);
  assert.equal(DB.pageLoads, 42);
});

test("local preview can read but cannot add visits", async () => {
  const DB = database(7);
  const local = { Origin: "http://localhost:3000" };
  const read = await worker.fetch(request("GET", local), { DB });
  assert.equal(read.status, 200);
  assert.equal(read.headers.get("Access-Control-Allow-Origin"), local.Origin);
  const write = await worker.fetch(request("POST", local), { DB });
  assert.equal(write.status, 403);
  assert.equal(DB.total, 7);
  assert.equal(DB.pageLoads, 0);
});

test("rejects other origins", async () => {
  const DB = database();
  const response = await worker.fetch(request("POST", { Origin: "https://other.example" }), { DB });
  assert.equal(response.status, 403);
  assert.equal(DB.total, 0);
  assert.equal(DB.pageLoads, 0);
});

test("returns stored traffic buckets for chart ranges", async () => {
  const DB = database(12, 40);
  await worker.fetch(request("POST"), { DB });
  const response = await worker.fetch(new Request("https://visits.doaor.com/?range=24h", { headers: { Origin: "https://doaor.com" } }), { DB });
  const data = await response.json();
  assert.equal(data.visits, 13);
  assert.equal(data.pageLoads, 41);
  assert.equal(data.series.length, 1);
  assert.deepEqual({ visits: data.series[0].visits, views: data.series[0].views }, { visits: 13, views: 41 });
});
