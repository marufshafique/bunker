-- Add folder relation to files table
ALTER TABLE files
  ADD COLUMN folder_id uuid,
  ADD FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
