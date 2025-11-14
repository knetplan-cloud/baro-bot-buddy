# Cursor AI로 마이그레이션 가이드

## 📦 제공된 파일 목록

### 📄 문서
1. **README_CURSOR_AI.md** - 메인 개발 가이드
2. **BAROBILL_CHATBOT_DATA_STRATEGY.md** - 데이터 관리 전략
3. **PROJECT_SETUP_CHECKLIST.md** - 프로젝트 셋업 체크리스트
4. **CURSOR_AI_MIGRATION_GUIDE.md** (이 파일)

### 🛠️ 도구
1. **BAROBILL_CHATBOT_DATA_TEMPLATE.xlsx** - 기획자용 엑셀 템플릿
2. **excel_to_json_converter.py** - 엑셀→JSON 자동 변환 스크립트
3. **validate_knowledge_base.py** - JSON 검증 스크립트
4. **requirements.txt** - Python 의존성

### 🌐 웹 파일
1. **barobill-ai-chatbot-fixed.html** - 최종 수정된 챗봇 HTML

---

## 🚀 빠른 시작 (5분)

### Step 1: 프로젝트 폴더 생성
```bash
mkdir -p ~/barobill-chatbot
cd ~/barobill-chatbot
```

### Step 2: 파일 배치
다운로드한 모든 파일을 다음과 같이 배치:

```
barobill-chatbot/
├── README_CURSOR_AI.md
├── tools/
│   ├── BAROBILL_CHATBOT_DATA_TEMPLATE.xlsx
│   ├── excel_to_json_converter.py
│   ├── validate_knowledge_base.py
│   └── requirements.txt
├── docs/
│   ├── BAROBILL_CHATBOT_DATA_STRATEGY.md
│   └── PROJECT_SETUP_CHECKLIST.md
└── public/
    └── barobill-ai-chatbot-fixed.html
```

### Step 3: Python 환경 설정
```bash
pip install -r tools/requirements.txt
```

### Step 4: 테스트
```bash
# 엑셀→JSON 변환 테스트
python tools/excel_to_json_converter.py \
  -i tools/BAROBILL_CHATBOT_DATA_TEMPLATE.xlsx \
  -o test-output.json \
  --validate

# 검증 테스트
python tools/validate_knowledge_base.py -f test-output.json
```

---

## 📖 다음 읽을 문서

1. **[README_CURSOR_AI.md](./README_CURSOR_AI.md)** ← 먼저 읽기
   - 프로젝트 전체 구조
   - 개발 워크플로우
   - 엑셀 작성 가이드
   
2. **[PROJECT_SETUP_CHECKLIST.md](./PROJECT_SETUP_CHECKLIST.md)**
   - 단계별 셋업 가이드
   - 체크리스트 확인

3. **[BAROBILL_CHATBOT_DATA_STRATEGY.md](./BAROBILL_CHATBOT_DATA_STRATEGY.md)**
   - 데이터 관리 전략
   - Best Practices
   - 상세 작성 가이드

---

## 🎯 각 파일의 역할

### 1. BAROBILL_CHATBOT_DATA_TEMPLATE.xlsx
**용도**: 기획자가 질문/답변 데이터를 작성하는 템플릿

**시트 구성**:
- `01_질문답변(Main)`: 실제 데이터 입력
- `02_동의어사전`: 동의어 정의
- `03_카테고리매핑`: 구분별 설정
- `04_작성가이드`: 작성 방법 안내

**사용법**:
1. 엑셀 파일 열기
2. `01_질문답변(Main)` 시트에 데이터 입력
3. 저장
4. 변환 스크립트 실행

---

### 2. excel_to_json_converter.py
**용도**: 엑셀 파일을 JSON으로 자동 변환

**사용법**:
```bash
python tools/excel_to_json_converter.py \
  --input 입력파일.xlsx \
  --output 출력파일.json \
  --validate
```

**주요 기능**:
- 엑셀 다중 시트 처리
- 자동 데이터 검증
- 동의어 자동 매핑
- 메타데이터 자동 생성

---

### 3. validate_knowledge_base.py
**용도**: JSON 파일의 데이터 품질 검증

**사용법**:
```bash
python tools/validate_knowledge_base.py \
  --file 파일명.json \
  --strict  # 엄격 모드 (선택)
```

**검증 항목**:
- JSON 문법 오류
- 필수 필드 누락
- 중복 ID
- 우선순위 범위
- 답변 길이
- 키워드 개수

---

### 4. barobill-ai-chatbot-fixed.html
**용도**: 최종 수정된 챗봇 HTML 파일

**특징**:
- 외부 JSON 로드 기능
- 블루 배경 (#496bf3)
- 간결한 히어로 섹션
- 줄간격 최적화
- 어투 설정 반영

**실행 방법**:
```bash
# 직접 실행
open barobill-ai-chatbot-fixed.html

# 또는 로컬 서버
python -m http.server 8000
# http://localhost:8000/barobill-ai-chatbot-fixed.html
```

---

## 🔄 워크플로우 요약

### 일반적인 작업 흐름

```
1. 기획자가 엑셀 템플릿에 질문/답변 작성
   ↓
2. excel_to_json_converter.py 실행
   ↓
3. JSON 파일 생성
   ↓
4. validate_knowledge_base.py로 검증
   ↓
5. 프로젝트에 JSON 파일 통합
   ↓
6. 개발 서버 재시작 (Hot Reload)
   ↓
7. 브라우저에서 테스트
   ↓
8. Git 커밋 및 푸시
```

---

## ⚙️ Cursor AI 설정 팁

### 1. 프로젝트 열기
```bash
# Cursor AI에서 프로젝트 폴더 열기
cursor ~/barobill-chatbot
```

### 2. 추천 Extensions
- Python
- Prettier - Code formatter
- ESLint
- Excel Viewer (엑셀 파일 확인용)

### 3. workspace settings.json 추가
```json
{
  "python.defaultInterpreterPath": "venv/bin/python",
  "editor.formatOnSave": true,
  "files.associations": {
    "*.md": "markdown",
    "*.json": "jsonc"
  }
}
```

---

## 🐛 문제 해결

### Python 스크립트 실행 오류
```bash
# 1. Python 버전 확인
python --version  # 3.8 이상 필요

# 2. 라이브러리 재설치
pip install --upgrade pandas openpyxl

# 3. 권한 문제
chmod +x tools/*.py
```

### 엑셀 파일 인코딩 오류
```bash
# CSV로 변환 후 UTF-8로 저장
# 또는 엑셀에서 "다른 이름으로 저장" → UTF-8 CSV
```

### JSON 파일이 Hot Reload 안 됨
```bash
# 개발 서버 재시작
npm run dev

# 또는 브라우저 강제 새로고침
# Ctrl + Shift + R (Windows/Linux)
# Cmd + Shift + R (Mac)
```

---

## 📞 지원

**질문이나 문제가 있다면**:
1. README_CURSOR_AI.md의 문제 해결 섹션 확인
2. PROJECT_SETUP_CHECKLIST.md의 각 단계 재확인
3. 개발팀에 문의: dev@barobill.co.kr

---

## 🎓 학습 자료

### 추천 순서
1. ✅ **이 파일** (CURSOR_AI_MIGRATION_GUIDE.md)
2. ✅ **README_CURSOR_AI.md** - 전체 프로젝트 이해
3. ✅ **PROJECT_SETUP_CHECKLIST.md** - 단계별 진행
4. ✅ **BAROBILL_CHATBOT_DATA_STRATEGY.md** - 심화 학습

### 실습 가이드
1. 엑셀 템플릿 열어서 샘플 데이터 확인
2. 변환 스크립트 실행해보기
3. 검증 스크립트 실행해보기
4. HTML 파일 브라우저에서 열어보기
5. 새로운 질문 추가해보기

---

## 🎉 성공적인 시작을 위한 팁

### ✅ DO
- 체크리스트를 하나씩 확인하며 진행
- 각 도구를 먼저 테스트해보기
- 문서를 자주 참고하기
- Git으로 버전 관리하기

### ❌ DON'T
- 한번에 모든 것을 이해하려고 하지 말기
- 문서를 건너뛰지 말기
- 테스트 없이 프로덕션 배포하지 말기
- 백업 없이 JSON 파일 수정하지 말기

---

**행운을 빕니다! 🚀**

프로젝트가 성공적으로 진행되길 바랍니다.  
문제가 있으면 언제든지 문의해주세요!

---

**문서 버전**: v1.0  
**최종 수정일**: 2025-01-15  
**작성자**: AI Development Team
