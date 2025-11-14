-- 피드백 테이블 생성
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved'))
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);

-- RLS (Row Level Security) 설정
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 피드백을 작성할 수 있도록
CREATE POLICY "Anyone can insert feedback"
  ON feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 관리자만 조회/삭제 가능하도록 (인증 필요)
-- 주의: 실제 운영 환경에서는 적절한 인증 로직을 추가해야 합니다
CREATE POLICY "Admins can view feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete feedback"
  ON feedback FOR DELETE
  TO authenticated
  USING (true);

-- 주석 추가
COMMENT ON TABLE feedback IS '사용자 피드백 저장 테이블';
COMMENT ON COLUMN feedback.content IS '피드백 내용';
COMMENT ON COLUMN feedback.status IS '피드백 상태: pending(대기중), reviewed(검토완료), resolved(해결완료)';

