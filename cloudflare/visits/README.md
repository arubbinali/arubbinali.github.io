# doaor visit counter

The homepage calls this Worker at `https://visits.doaor.com/`. `GET /` reads both counts. Every homepage `POST /` adds one page load; it adds one visit only when the browser lacks the `__Host-doaor_visit_session` cookie. The host-only cookie is a session cookie shared by tabs calling the same Worker; it contains a random ID, not a name or account identifier. Both totals live in Cloudflare D1, independently of GitHub Pages deployments.

The Worker must run on the `visits.doaor.com` custom domain. A `workers.dev` URL would be cross-site to the homepage and would not reliably support this session-cookie design. The Cloudflare zone for `doaor.com` must be active. The counter is deliberately not shipped with a fake number if the API is unavailable.

The D1 database and Worker configuration are already set up. To redeploy after a Worker change:

1. Sign in with Wrangler on the deploying machine.
2. Run `npx wrangler deploy` from this folder.
3. Confirm `GET https://visits.doaor.com/` returns the current total.

`schema.sql` initializes a fresh database. Existing databases created before the page-load counter need the one-time `002_page_loads.sql` migration before deploying this Worker. Do not rerun the migration after it succeeds.

The browser may restore session cookies after a restart. Visitors who block or clear cookies, or who use another browser, can be counted again. This is a practical per-browser-session display, not a fraud-proof unique-person metric.

The persistent counts are stored in Cloudflare D1 database `doaor-visits` (database ID `c9c860d8-3e07-4df4-ba26-159e50a33b61`), table `visit_counter`, row `id = 1`. Column `total` holds Visits; `page_loads` holds Views. On 2026-09-26, those two columns were initialized to at least 40 and 120 respectively using the `doaor.com` Web Analytics screenshot for the preceding 30 days. These are approximate site-wide historical starting points, not exact all-time homepage counts. Subsequent visits and homepage loads increment the D1 row; redeploying the site or Worker does not reset it. Do not rerun the historical initialization when redeploying.
