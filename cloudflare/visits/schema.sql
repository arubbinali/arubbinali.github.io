CREATE TABLE IF NOT EXISTS visit_counter (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  total INTEGER NOT NULL DEFAULT 0 CHECK (total >= 0),
  page_loads INTEGER NOT NULL DEFAULT 0 CHECK (page_loads >= 0)
);

INSERT OR IGNORE INTO visit_counter (id, total) VALUES (1, 0);
