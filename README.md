# 바로빌 AI 챗봇 (Barobill AI Buddy)

바로빌의 세금계산서 전문 AI 챗봇 "빌리"입니다.

## 프로젝트 정보

- **GitHub**: https://github.com/knetplan-cloud/baro-bot-buddy
- **Lovable 프로젝트**: https://lovable.dev/projects/a48a3376-1886-4e44-ab51-03f37c0fcb2b

## 주요 기능

- 🤖 AI 기반 세금계산서 상담
- 📚 지식베이스 관리 시스템
- 📅 날짜 패턴 자동 인식 및 신고 마감일 계산
- 💬 사용자 피드백 수집 및 관리
- 🎯 우선순위 기반 답변 매칭

## 로컬 개발 환경 설정

### 필수 요구사항

- Node.js 18+ 및 npm
- Supabase 프로젝트 (피드백 테이블 필요)

### 설치 및 실행

```sh
# 1. 저장소 클론
git clone https://github.com/knetplan-cloud/baro-bot-buddy.git
cd baro-bot-buddy

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 Supabase 정보 입력

# 4. 개발 서버 실행
npm run dev
```

### 환경 변수 설정

`.env` 파일을 생성하고 다음 정보를 입력하세요:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Supabase 정보 확인 방법:**
1. Supabase 대시보드 접속
2. Project Settings → API
3. Project URL과 anon public key 복사

## 기술 스택

- **프레임워크**: React 18 + TypeScript
- **빌드 도구**: Vite
- **UI 라이브러리**: shadcn-ui + Tailwind CSS
- **백엔드**: Supabase (Database, Functions)
- **AI**: Google Gemini (via Lovable AI Gateway)

## 프로젝트 구조

```
baro-bot-buddy/
├── src/
│   ├── components/      # React 컴포넌트
│   ├── pages/           # 페이지 컴포넌트
│   ├── lib/             # 유틸리티 및 엔진
│   │   ├── chatbot-engine.ts  # 챗봇 매칭 엔진
│   │   └── date-utils.ts      # 날짜 처리 유틸리티
│   ├── data/            # 지식베이스 JSON
│   └── integrations/    # Supabase 설정
├── supabase/
│   ├── functions/       # Edge Functions
│   └── migrations/      # 데이터베이스 마이그레이션
└── KNOWLEDGE_BASE_GUIDE.md  # 지식베이스 관리 가이드
```

## 주요 기능 상세

### 1. 지식베이스 관리
- Admin 페이지 (`/admin`)에서 지식베이스 직접 관리
- JSON 파일 직접 편집 가능
- 자세한 가이드: [KNOWLEDGE_BASE_GUIDE.md](./KNOWLEDGE_BASE_GUIDE.md)

### 2. 날짜 패턴 인식
- 질문에서 날짜 자동 추출
- 신고 마감일 자동 계산
- 동적 변수 치환 (`{date}`, `{deadline}`, `{today}`)

### 3. 피드백 시스템
- 사용자 피드백 수집
- Admin 페이지에서 피드백 관리

## 배포

### Vercel 배포

```sh
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

환경 변수는 Vercel 대시보드에서 설정하세요.

### Netlify 배포

```sh
# Netlify CLI 설치
npm i -g netlify-cli

# 배포
netlify deploy --prod
```

## 개발 워크플로우

### 브랜치 전략

- `main`: 안정 버전 (프로덕션)
- `develop`: 개발 버전 (Cursor에서 작업)
- `lovable-backup`: Lovable 버전 백업

### Cursor에서 개발하기

1. `develop` 브랜치로 전환
2. 로컬에서 개발 및 테스트
3. 커밋 및 푸시
4. 테스트 완료 후 `main`으로 병합

## Supabase 설정

### 피드백 테이블 생성

Supabase SQL Editor에서 다음 SQL 실행:

```sql
-- supabase/migrations/create_feedback_table.sql 파일 참고
```

자세한 내용은 [KNOWLEDGE_BASE_GUIDE.md](./KNOWLEDGE_BASE_GUIDE.md)를 참고하세요.

## 문서

- [지식베이스 관리 가이드](./KNOWLEDGE_BASE_GUIDE.md) - 지식베이스 작성 및 관리 방법
- [Supabase 설정 가이드](./KNOWLEDGE_BASE_GUIDE.md#피드백-기능-사용-가이드) - 피드백 테이블 설정

## 라이선스

Private - 바로빌 내부 프로젝트
