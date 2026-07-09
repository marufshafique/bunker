-- Add migration script here
ALTER TABLE Files RENAME COLUMN subscribed_at TO uploaded_at;
