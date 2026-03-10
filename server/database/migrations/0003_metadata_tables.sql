-- Migration number: 0003 	 2026-03-09T00:00:00.000Z
CREATE TABLE IF NOT EXISTS folders_metadata (
  name TEXT PRIMARY KEY,
  color TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tags_metadata (
  name TEXT PRIMARY KEY,
  color TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
