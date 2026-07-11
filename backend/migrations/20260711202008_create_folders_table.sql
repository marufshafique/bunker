-- Create Folders table
CREATE TABLE folders (
  id uuid NOT NULL,
  PRIMARY KEY (id),
  name TEXT NOT NULL,
  folder_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
)
