-- Create Files table
CREATE TABLE files (
  id uuid NOT NULL,
  PRIMARY KEY (id),
  original_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at timestamptz NOT NULL
)
