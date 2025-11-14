# 바로빌 챗봇 개발 가이드 (Cursor AI용)

> **프로젝트**: 바로빌 AI 챗봇 고도화  
> **개발 환경**: Vite + React  
> **데이터 관리**: Excel → JSON 워크플로우  
> **버전**: 2.0

---

## 📁 프로젝트 구조

```
barobill-chatbot/
│
├── src/
│   ├── data/
│   │   └── barobill-knowledge.json      # 지식베이스 JSON 파일
│   ├── components/                       # React 컴포넌트
│   └── ...
│
├── tools/                                # 데이터 관리 도구
│   ├── BAROBILL_CHATBOT_DATA_TEMPLATE.xlsx    # 기획자용 엑셀 템플릿
│   ├── excel_to_json_converter.py              # 엑셀→JSON 변환기
│   ├── validate_knowledge_base.py              # JSON 검증기
│   └── BAROBILL_CHATBOT_DATA_STRATEGY.md       # 전략 문서
│
├── docs/
│   ├── KNOWLEDGE_BASE_GUIDE.md           # 지식베이스 관리 가이드
│   └── README.md                         # 이 파일
│
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 빠른 시작

### 1. 개발 서버 실행

```bash
# 의존성 설치
npm ci

# 개발 서버 시작
npm run dev

# 또는 Vite 직접 실행
npx vite
```

**로컬 주소**: `http://localhost:8080` (또는 Vite가 지정한 포트)

### 2. 지식베이스 수정

#### 방법 A: JSON 파일 직접 수정
```bash
# JSON 파일 열기
code src/data/barobill-knowledge.json

# 수정 후 저장
# 개발 서버가 자동으로 Hot Reload
```

#### 방법 B: 엑셀로 관리 (권장)
```bash
# 1. 엑셀 템플릿 열기
open tools/BAROBILL_CHATBOT_DATA_TEMPLATE.xlsx

# 2. 데이터 작성/수정

# 3. JSON으로 변환
python tools/excel_to_json_converter.py \
  -i tools/작성한파일.xlsx \
  -o src/data/barobill-knowledge.json \
  --validate

# 4. 개발 서버 재시작 (자동 반영)
```

---

## 📊 데이터 관리 워크플로우

### 전체 프로세스

```mermaid
graph LR
    A[기획자: 엑셀 작성] --> B[변환 스크립트 실행]
    B --> C[JSON 생성]
    C --> D[검증 스크립트]
    D -->|성공| E[프로젝트 통합]
    D -->|실패| A
    E --> F[Git Commit]
    F --> G[배포]
```

### 단계별 상세 가이드

#### Step 1: 엑셀 템플릿 작성

**파일**: `tools/BAROBILL_CHATBOT_DATA_TEMPLATE.xlsx`

**시트 구성**:
1. **01_질문답변(Main)**: 실제 데이터 입력
2. **02_동의어사전**: 동의어 정의
3. **03_카테고리매핑**: 구분별 설정
4. **04_작성가이드**: 작성 방법 안내

**필수 컬럼**:
| 컬럼명 | 설명 | 예시 |
|--------|------|------|
| ID | 고유 식별자 | KB-TX-001 |
| 구분 | 질문 유형 | 개념, 문제해결, 실무가이드 |
| 대분류 | 카테고리 | 세금계산서, 부가가치세 |
| 질문 | 사용자 질문 | 세금계산서 발급 방법은? |
| 우선순위 | 1-10 (10이 최우선) | 7 |
| 키워드 | 쉼표 구분 | 세금계산서,발급,방법 |
| 제외키워드 | 쉼표 구분 (선택) | 수정,취소 |
| 격식체답변 | ~입니다 어투 | 세금계산서 발급은... |
| 해요체답변 | ~해요 어투 | 세금계산서 발급은... |
| 평어체답변 | ~함 어투 | 세금계산서 발급은... |

#### Step 2: JSON 변환

```bash
# 기본 변환
python tools/excel_to_json_converter.py \
  --input tools/데이터.xlsx \
  --output src/data/barobill-knowledge.json

# 검증 포함 변환 (권장)
python tools/excel_to_json_converter.py \
  -i tools/데이터.xlsx \
  -o src/data/barobill-knowledge.json \
  --validate
```

**출력 예시**:
```
============================================================
바로빌 챗봇 데이터 변환 시작
============================================================

[1/4] 엑셀 파일 로드 중...
✓ 시트 로드: 01_질문답변(Main) (50행)
✓ 시트 로드: 02_동의어사전 (20행)

[2/4] 질문&답변 데이터 변환 중...
✓ 변환 완료: KB-TX-001 - 세금계산서 발급 방법...
✓ 변환 완료: KB-TX-002 - 종이 세금계산서 차이...
...

[3/4] 동의어 사전 변환 중...
✓ 동의어 등록: 세금계산서 → 4개
✓ 동의어 등록: 발급 → 3개
...

[4/4] 메타데이터 생성 중...

============================================================
✅ 변환 완료!
============================================================
  - 총 항목 수: 50개
  - 동의어 수: 15개

💾 JSON 파일 저장: src/data/barobill-knowledge.json

🎉 작업이 성공적으로 완료되었습니다!
```

#### Step 3: 데이터 검증

```bash
# 기본 검증
python tools/validate_knowledge_base.py -f src/data/barobill-knowledge.json

# 엄격 모드 (경고도 실패로 처리)
python tools/validate_knowledge_base.py -f src/data/barobill-knowledge.json --strict
```

**출력 예시**:
```
============================================================
바로빌 챗봇 지식베이스 검증 시작
============================================================
✓ JSON 파일 로드 성공: src/data/barobill-knowledge.json

[1/5] 기본 구조 검증...
  ✓ 기본 구조 정상

[2/5] 항목별 데이터 검증...
  ✓ 50개 항목 검증 완료

[3/5] 중복 데이터 검증...
  ✓ 중복 데이터 없음

[4/5] 동의어 사전 검증...
  ✓ 15개 동의어 검증 완료

[5/5] 통계 생성...
  ✓ 통계 생성 완료

============================================================
검증 결과 리포트
============================================================

📊 통계:
  • 총 항목 수: 50개
  • 동의어 수: 15개
  • 평균 키워드 수: 5.2개/항목

  📈 타입별 분포:
    - knowledge: 30개 (60.0%)
    - case: 15개 (30.0%)
    - intent: 5개 (10.0%)

  📂 카테고리별 분포 (상위 5개):
    - 세금계산서: 20개 (40.0%)
    - 수정세금계산서: 10개 (20.0%)
    - 부가가치세: 8개 (16.0%)
    ...

============================================================
✅ 검증 성공!
============================================================

🎉 JSON 파일을 프로젝트에 안전하게 사용할 수 있습니다!
```

#### Step 4: 프로젝트 통합 및 테스트

```bash
# 개발 서버 재시작
npm run dev

# 브라우저에서 테스트
# http://localhost:8080
```

**테스트 체크리스트**:
- [ ] 새 질문이 정상적으로 인식되는가?
- [ ] 키워드 매칭이 잘 되는가?
- [ ] 어투 변경이 작동하는가?
- [ ] 관련 가이드 링크가 정상인가?
- [ ] FAQ 섹션에 표시되는가?

#### Step 5: Git 커밋

```bash
# 변경사항 확인
git status

# JSON 파일 추가
git add src/data/barobill-knowledge.json

# 커밋
git commit -m "chore: 지식베이스 업데이트 - 50개 항목 추가"

# 푸시
git push origin main
```

---

## 📝 엑셀 작성 가이드

### ID 작성 규칙

**형식**: `[타입코드]-[카테고리약어]-[일련번호]`

| 타입코드 | 설명 |
|----------|------|
| INT | Intent (인사) |
| KB | Knowledge Base (개념/가이드) |
| CASE | Case (문제해결) |

| 카테고리약어 | 설명 |
|--------------|------|
| TX | 세금계산서 |
| VAT | 부가가치세 |
| CERT | 인증서 |
| SVC | 바로빌서비스 |

**예시**:
- `INT-GREET-001`: 인사 > 인사말 #1
- `KB-TX-001`: 세금계산서 > 개념 #1
- `CASE-TX-RETURN-001`: 세금계산서 > 반품 케이스 #1

### 우선순위 설정 가이드

| 우선순위 | 적용 대상 |
|----------|-----------|
| 10 | 인사/자기소개 |
| 9 | 중요 Case (날짜 포함) |
| 8 | 일반 Case / 중요 FAQ |
| 7 | 일반 Case |
| 6 | 중요 Knowledge |
| 5 | 일반 Knowledge |
| 4 | 서비스 안내 |

**점수 계산 공식**:
```
최종 점수 = (키워드 매칭 × 10) + (제목 매칭 × 20) + 우선순위
→ 15점 이상이어야 답변 제공
```

### 키워드 작성 팁

**DO ✅**:
```
세금계산서,발급,방법,어떻게,절차,발행,작성
```

**DON'T ❌**:
```
것,하다,이다,을,를,의,가
```

### 어투별 답변 작성 예시

#### 격식체 (Formal)
```
세금계산서 발급은 [매출문서 작성] 메뉴에서 가능합니다.

1. 바로빌에 로그인하십시오
2. '세금계산서 발급' 메뉴를 선택하십시오
3. 공급받는자 정보를 입력하십시오

발급 즉시 국세청에 자동으로 전송됩니다.
```

#### 해요체 (Casual)
```
세금계산서 발급? [매출문서 작성] 메뉴에서 하면 돼요!

받는 사람 정보랑 금액 적고 전자서명하면 끝이에요. 
바로 국세청에 자동 전송돼요! 📤
```

#### 평어체 (Plain)
```
세금계산서 발급은 [매출문서 작성] 메뉴에서 진행함. 
거래처 정보와 금액을 입력 후 발급하면 국세청 자동 전송됨.
```

---

## 🛠️ 개발 가이드

### 챗봇 로직 수정

**파일 위치**: `src/components/Chatbot.jsx` (예시)

#### 키워드 매칭 로직

```javascript
// src/utils/matcher.js
export function findMatchingContent(userMessage, knowledgeBase) {
  const message = userMessage.toLowerCase();
  let bestMatch = null;
  let highestScore = 0;

  Object.values(knowledgeBase.items).forEach(item => {
    let score = 0;
    
    // 키워드 매칭 (1개당 10점)
    item.keywords.forEach(k => {
      if (message.includes(k.toLowerCase())) score += 10;
    });
    
    // 제목 매칭 (20점)
    if (message.includes(item.title.toLowerCase())) score += 20;
    
    // 우선순위 가산점
    score += item.priority;
    
    // Negative keywords 필터링
    const hasNegativeKeyword = item.negativeKeywords?.some(
      nk => message.includes(nk.toLowerCase())
    );
    if (hasNegativeKeyword) score = 0;
    
    if (score > highestScore && score >= 15) {
      highestScore = score;
      bestMatch = item;
    }
  });

  return bestMatch;
}
```

### Admin 페이지 접근

**URL**: `http://localhost:8080/admin`

**기능**:
- 지식베이스 항목 CRUD
- JSON 다운로드
- 피드백 관리
- 통계 확인

---

## 🔧 문제 해결 (Troubleshooting)

### Q1. 변환 스크립트 실행 안 됨

```bash
# Python 버전 확인 (3.8 이상 필요)
python --version

# 라이브러리 설치
pip install pandas openpyxl

# 또는
pip install -r tools/requirements.txt
```

### Q2. JSON 파일 Hot Reload 안 됨

```bash
# Vite 개발 서버 재시작
npm run dev

# 또는 브라우저 강력 새로고침
# Ctrl + Shift + R (Windows/Linux)
# Cmd + Shift + R (Mac)
```

### Q3. 챗봇이 답변을 못 찾음

**원인**:
- 키워드 매칭 점수 부족 (15점 미만)
- 제외 키워드에 걸림

**해결**:
1. 키워드를 더 추가
2. 우선순위 UP
3. 제외 키워드 확인

**디버깅**:
```javascript
// 브라우저 콘솔(F12)에서 확인
console.log('매칭 점수:', score);
console.log('임계값:', 15);
```

### Q4. 엑셀 파일 인코딩 오류

```bash
# 엑셀 파일을 UTF-8로 다시 저장
# 또는 CSV로 변환 후 UTF-8 저장
```

---

## 📚 참고 문서

| 문서 | 설명 |
|------|------|
| [KNOWLEDGE_BASE_GUIDE.md](./KNOWLEDGE_BASE_GUIDE.md) | 지식베이스 관리 상세 가이드 |
| [BAROBILL_CHATBOT_DATA_STRATEGY.md](./BAROBILL_CHATBOT_DATA_STRATEGY.md) | 데이터 전략 및 Best Practices |
| [Vite 공식 문서](https://vitejs.dev/) | Vite 개발 서버 설정 |

---

## 📈 개발 로드맵

### v2.0 (현재)
- [x] 엑셀 → JSON 워크플로우 구축
- [x] 데이터 검증 시스템
- [x] 우선순위 기반 매칭
- [x] 어투별 답변 지원

### v2.1 (2025 Q1)
- [ ] 피드백 분석 대시보드
- [ ] 날짜 템플릿 고도화
- [ ] Context Awareness (문맥 유지)
- [ ] Fuzzy Matching (오타 보정)

### v2.2 (2025 Q2)
- [ ] 다국어 지원 (영어)
- [ ] 음성 입력 지원
- [ ] 대화 내보내기 (PDF)
- [ ] 즐겨찾기 기능

---

## 👥 팀 연락처

| 팀 | 담당자 | 연락처 |
|-----|--------|--------|
| 기획 | 기획팀 | planning@barobill.co.kr |
| 개발 | 개발팀 | dev@barobill.co.kr |
| QA | QA팀 | qa@barobill.co.kr |

**긴급 문의**: Slack #chatbot-support

---

## 📜 라이선스

© 2025 Barobill. All rights reserved.

---

**문서 버전**: v2.0  
**최종 수정일**: 2025-01-15  
**작성자**: AI Development Team
