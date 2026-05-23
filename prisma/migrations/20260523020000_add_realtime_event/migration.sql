-- CreateTable
CREATE TABLE "RealtimeEvent" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL DEFAULT 'dashboard',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RealtimeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RealtimeEvent_topic_createdAt_idx" ON "RealtimeEvent"("topic", "createdAt");

-- Keep browser realtime payloads intentionally small and non-sensitive.
ALTER TABLE "RealtimeEvent" ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON TABLE "RealtimeEvent" TO anon;

CREATE POLICY "Allow anon refresh event reads"
ON "RealtimeEvent"
FOR SELECT
TO anon
USING (true);

-- Do not publish sensitive operational rows directly through the public anon key.
DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'Customer',
    'Car',
    'JobOrder',
    'JobPhoto',
    'Part',
    'JobPart',
    'Master',
    'Invoice',
    'User',
    'AuditLog'
  ]
  LOOP
    IF EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = table_name
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE public.%I', table_name);
    END IF;
  END LOOP;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'RealtimeEvent'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public."RealtimeEvent";
  END IF;
END $$;
