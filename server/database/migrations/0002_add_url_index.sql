-- Migration number: 0002 	 2024-06-06T00:00:00.000Z
CREATE INDEX IF NOT EXISTS idx_links_url ON links(url);
