-- Likes for notes and projects: three taps per visitor, with reset support.
-- Run this entire file against the intended branch in the Neon SQL Editor.
BEGIN;

CREATE TABLE IF NOT EXISTS content_likes (
  content_type text NOT NULL CHECK (content_type IN ('notes', 'projects', 'labs')),
  content_id text NOT NULL CHECK (length(content_id) BETWEEN 1 AND 200),
  visitor_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (content_type, content_id, visitor_id)
);

-- Existing rows represent one like. Preserve them when enabling three taps.
ALTER TABLE content_likes
  ADD COLUMN IF NOT EXISTS like_count smallint NOT NULL DEFAULT 1
  CHECK (like_count BETWEEN 1 AND 3);

-- Keep a revision even at zero likes so an older retry cannot undo a reset.
DO $migration$
BEGIN
  ALTER TABLE content_likes
    DROP CONSTRAINT IF EXISTS content_likes_like_count_check;
  ALTER TABLE content_likes
    ADD CONSTRAINT content_likes_like_count_check CHECK (like_count BETWEEN 0 AND 3);
  ALTER TABLE content_likes
    ADD COLUMN IF NOT EXISTS revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0);
END
$migration$;

COMMIT;
