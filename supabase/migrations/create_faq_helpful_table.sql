-- FAQ 도움됨 클릭 기록 테이블 생성
CREATE TABLE IF NOT EXISTS faq_helpful (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  faq_id TEXT NOT NULL,
  user_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_faq_helpful_faq_id ON faq_helpful(faq_id);
CREATE INDEX IF NOT EXISTS idx_faq_helpful_created_at ON faq_helpful(created_at DESC);

-- RLS (Row Level Security) 설정
ALTER TABLE faq_helpful ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 도움됨 클릭을 기록할 수 있도록
CREATE POLICY "Anyone can insert faq helpful"
  ON faq_helpful FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 모든 사용자가 도움됨 수를 조회할 수 있도록
CREATE POLICY "Anyone can view faq helpful"
  ON faq_helpful FOR SELECT
  TO anon, authenticated
  USING (true);

-- 주석 추가
COMMENT ON TABLE faq_helpful IS 'FAQ 도움됨 클릭 기록 테이블';
COMMENT ON COLUMN faq_helpful.faq_id IS 'FAQ 항목의 ID';
COMMENT ON COLUMN faq_helpful.user_ip IS '사용자 IP 주소 (중복 방지용)';

