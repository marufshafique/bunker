-- Create Files table
CREATE TABLE files (
  id TEXT PRIMARY KEY,
  original_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  subscribed_at timestamptz NOT NULL
)
