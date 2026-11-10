-- Run after 20261109130745_likes.sql on the same Neon branch.
-- Serialize new visitor rows so concurrent requests cannot exceed the UTC cap.
BEGIN;

CREATE INDEX IF NOT EXISTS content_likes_created_at_idx
  ON content_likes (created_at);

CREATE OR REPLACE FUNCTION save_content_like(
  p_type text,
  p_id text,
  p_visitor_id uuid,
  p_count smallint,
  p_revision integer
)
RETURNS TABLE (like_count smallint, revision integer)
LANGUAGE plpgsql
AS $function$
DECLARE
  day_start timestamptz;
  saved_at timestamptz;
BEGIN
  -- A transaction-scoped lock covers the check and write, including requests
  -- for different content or visitor IDs. Existing rows remain updateable.
  PERFORM pg_advisory_xact_lock(704582319);
  saved_at := clock_timestamp();
  day_start := date_trunc('day', saved_at AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';

  IF NOT EXISTS (
    SELECT 1 FROM content_likes
    WHERE content_type = p_type AND content_id = p_id AND visitor_id = p_visitor_id
  ) AND (
    SELECT count(*) FROM content_likes
    WHERE created_at >= day_start AND created_at < day_start + interval '1 day'
  ) >= 100 THEN
    RETURN;
  END IF;

  RETURN QUERY
    INSERT INTO content_likes AS likes
      (content_type, content_id, visitor_id, like_count, revision, created_at)
    VALUES (p_type, p_id, p_visitor_id, p_count, p_revision, saved_at)
    ON CONFLICT (content_type, content_id, visitor_id) DO UPDATE
    SET like_count = CASE WHEN EXCLUDED.revision > likes.revision
      THEN EXCLUDED.like_count ELSE likes.like_count END,
      revision = GREATEST(likes.revision, EXCLUDED.revision)
    RETURNING likes.like_count, likes.revision;
END
$function$;

COMMIT;
