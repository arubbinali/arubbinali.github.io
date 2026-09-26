# doaor visit counter

The homepage calls this Worker at `https://visits.doaor.com/`. `GET /` reads the count. `POST /` adds one visit only when the browser lacks the `__Host-doaor_visit_session` cookie. The host-only cookie is a session cookie shared by tabs calling the same Worker; it contains a random ID, not a name or account identifier. The total lives in Cloudflare D1, independently of GitHub Pages deployments.

The Worker must run on the `visits.doaor.com` custom domain. A `workers.dev` URL would be cross-site to the homepage and would not reliably support this session-cookie design. The Cloudflare zone for `doaor.com` must be active. The counter is deliberately not shipped with a fake number if the API is unavailable.

The D1 database and Worker configuration are already set up. To redeploy after a Worker change:

1. Sign in with Wrangler on the deploying machine.
2. Run `npx wrangler deploy` from this folder.
3. Confirm `GET https://visits.doaor.com/` returns the current total.

`schema.sql` initializes the single counter row. It is safe to run again and does not reset an existing total.

The browser may restore session cookies after a restart. Visitors who block or clear cookies, or who use another browser, can be counted again. This is a practical per-browser-session display, not a fraud-proof unique-person metric.
