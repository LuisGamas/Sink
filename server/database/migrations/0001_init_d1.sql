-- Migration number: 0001 	 2024-05-18T00:00:00.000Z
DROP TABLE IF EXISTS links;
CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  slug TEXT NOT NULL,
  comment TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expiration INTEGER,
  starts_at INTEGER,
  title TEXT,
  description TEXT,
  image TEXT,
  apple TEXT,
  google TEXT,
  cloaking BOOLEAN DEFAULT 0,
  redirect_with_query BOOLEAN DEFAULT 0,
  password TEXT,
  unsafe BOOLEAN DEFAULT 0,
  tags TEXT,
  folder TEXT
);

CREATE INDEX IF NOT EXISTS idx_links_slug ON links(slug);
CREATE INDEX IF NOT EXISTS idx_links_folder ON links(folder);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at);
