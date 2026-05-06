-- seniors 테이블
CREATE TABLE IF NOT EXISTS seniors (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  region       TEXT NOT NULL,
  desired_job  TEXT NOT NULL,
  career_years INTEGER,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- jobs 테이블
CREATE TABLE IF NOT EXISTS jobs (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title            TEXT NOT NULL,
  region           TEXT NOT NULL,
  job_type         TEXT NOT NULL,
  required_career  INTEGER,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- matches 테이블
CREATE TABLE IF NOT EXISTS matches (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  senior_id    UUID NOT NULL REFERENCES seniors(id) ON DELETE CASCADE,
  job_id       UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  score        INTEGER NOT NULL DEFAULT 0,
  score_region INTEGER NOT NULL DEFAULT 0,
  score_job    INTEGER NOT NULL DEFAULT 0,
  score_career INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (senior_id, job_id)
);

-- RLS 비활성화 (수업용 환경)
ALTER TABLE seniors DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
