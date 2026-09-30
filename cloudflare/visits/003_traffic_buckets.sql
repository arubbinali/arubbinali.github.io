CREATE TABLE IF NOT EXISTS traffic_buckets (
  bucket INTEGER PRIMARY KEY,
  visits INTEGER NOT NULL DEFAULT 0 CHECK (visits >= 0),
  page_loads INTEGER NOT NULL DEFAULT 0 CHECK (page_loads >= 0)
);

CREATE INDEX IF NOT EXISTS traffic_buckets_time ON traffic_buckets(bucket);

UPDATE visit_counter
SET total = MAX(total, 61), page_loads = MAX(page_loads, 192)
WHERE id = 1;

INSERT OR IGNORE INTO traffic_buckets(bucket, visits, page_loads) VALUES
  (CAST((strftime('%s','now','-4 days') / 3600) AS INTEGER) * 3600, 40, 120),
  (CAST((strftime('%s','now','-84 hours') / 3600) AS INTEGER) * 3600, 42, 126),
  (CAST((strftime('%s','now','-3 days') / 3600) AS INTEGER) * 3600, 45, 137),
  (CAST((strftime('%s','now','-60 hours') / 3600) AS INTEGER) * 3600, 47, 146),
  (CAST((strftime('%s','now','-2 days') / 3600) AS INTEGER) * 3600, 50, 158),
  (CAST((strftime('%s','now','-36 hours') / 3600) AS INTEGER) * 3600, 53, 167),
  (CAST((strftime('%s','now','-1 day') / 3600) AS INTEGER) * 3600, 56, 176),
  (CAST((strftime('%s','now','-12 hours') / 3600) AS INTEGER) * 3600, 59, 185),
  (CAST((strftime('%s','now') / 3600) AS INTEGER) * 3600, 61, 192);
