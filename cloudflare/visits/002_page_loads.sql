ALTER TABLE visit_counter ADD COLUMN page_loads INTEGER NOT NULL DEFAULT 0 CHECK (page_loads >= 0);
