import assert from "node:assert/strict";
import test from "node:test";
import worker from "./worker.mjs";

function database(initial = 0, initialPageLoads = 0) {
  let total = initial;
  let pageLoads = initialPageLoads;
  return {
    get total() { return total; },
    get pageLoads() { return pageLoads; },
    prepare(query) {
      return {
        async run() {
          assert.match(query, /^UPDATE visit_counter/);
          total += /total = total \+ 1/.test(query) ? 1 : 0;
          pageLoads += 1;
          return { results: [{ total, page_loads: pageLoads }] };
        },
        async first() {
          assert.match(query, /^SELECT total/);
          return { total, page_loads: pageLoads };
        },
      };
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
