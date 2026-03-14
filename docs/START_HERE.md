# classpage 시작 순서

이 문서는 `README`보다 먼저 보는 실행 문서입니다. 설명보다 먼저 아래 순서로 한 번 연결해보는 것을 권장합니다. `classpage`는 초보자/고급자 모드를 나누기보다, 실제 선생님이 바로 따라 할 수 있는 한 가지 흐름을 먼저 성공시키는 쪽으로 정리되어 있습니다.

## 1. 오늘 바로 해볼 가장 짧은 성공 경로

1. BRAT로 `classpage`를 설치합니다.
   확인: 학생용 페이지와 선생님 페이지가 모두 열립니다.
2. Apps Script에 `Config.gs`, `Code.gs`, `appsscript.json`을 붙여넣고 `previewClassSummary()` 또는 `previewLessonSummary()`를 먼저 한 번 실행합니다.
   확인: `type`, `responseCount`, `periodLabel` 같은 기본 필드가 보입니다.
3. 만들어진 JSON을 `classpage-data/` 아래에 넣고 경로를 연결합니다.
   확인: 선생님 페이지의 집계 연결 상태가 `연결됨`으로 바뀝니다.
4. 선생님 페이지에서 학급 또는 수업 카드 하나라도 실제로 보이면 첫 연결은 성공입니다.
5. 선생님 페이지 설정에서 보기 프리셋을 하나 골라, 내 기준에 맞는 우선순위로 바꿉니다.

여기까지 되면 충분한 첫 성공입니다. 처음부터 학급/수업/별점 세 파일을 모두 완벽하게 붙일 필요는 없습니다.

## 2. 실사용 전 최소 확인

1. 학급용 Form과 수업용 Form을 Google Sheets에 연결합니다.
2. Google 로그인과 이메일 수집이 켜져 있는지 확인합니다.
3. `validateAutomationSetup()`을 실행해 시트 연결이 `ok: true`인지 봅니다.
4. `previewClassSummary()`, `previewLessonSummary()`, `previewStarLedger()`를 실행합니다.
5. `classpage-data/class-summary.json`, `classpage-data/lesson-summary.json`, `classpage-data/star-ledger.json`을 볼트에 넣고 경로를 연결합니다.
6. 미제출 학생까지 보고 싶다면 `Settings -> classpage -> 학생 명단 가져오기 도우미`에서 CSV를 불러오거나 붙여넣어 `student-roster.json`을 저장합니다. 저장하면 학생 명단 JSON 경로도 함께 맞춰집니다. 이미 JSON이 있다면 `학생 명단 JSON 경로`만 연결해도 됩니다.

처음 연결할 때 기억하면 좋은 점:

- 선생님 페이지가 처음엔 비어 보여도 정상입니다. 아직 집계 파일이 없다는 뜻일 수 있습니다.
- 처음부터 세 파일을 완벽하게 다 붙일 필요는 없습니다. 학급 집계나 수업 집계 하나만 먼저 보여도 첫 성공으로 충분합니다.
- 별점 수동 조정은 여전히 Google Sheets `별점 수동 조정` 시트에서 합니다.

현재 버전에서 바로 되는 것:

- 학급/수업/별점 집계 읽기
- 학생 명단 JSON 연결 후 미제출 학생 확인
- CSV 파일 선택 또는 표 붙여넣기로 학생 명단 JSON 저장
- 학생 사진 매핑 또는 이니셜 아바타 fallback
- 선생님 화면 프리셋/정렬/강조 설정

아직 안 되는 것:

- XLSX 파일 직접 불러오기
- Google Sheets 직접 수정

중요:

- 실운영 JSON과 실제 경로가 들어간 로컬 스크립트/로그는 공개 저장소에 커밋하지 않는 편이 안전합니다.
- 예시 파일을 새로 만들 때는 익명 데이터만 사용합니다.

## 3. 막히면 어디를 먼저 볼까

- 설치가 안 열리면
  [docs/BEGINNER_SETUP.md](./BEGINNER_SETUP.md)의 3단계와 4단계를 먼저 봅니다.
- Apps Script가 안 읽히면
  [docs/BEGINNER_SETUP.md](./BEGINNER_SETUP.md)의 9단계부터 15단계까지 봅니다.
- 선생님 화면이 비어 있으면
  [docs/BEGINNER_SETUP.md](./BEGINNER_SETUP.md)의 16단계와 17단계를 먼저 봅니다. 처음 연결 중에는 빈 상태가 정상일 수 있습니다.
- 구조가 헷갈리면
  [docs/OPERATING_MODEL.md](./OPERATING_MODEL.md)를 봅니다.
- 집계 규칙을 바꾸고 싶으면
  [docs/AUTOMATION_LAYER.md](./AUTOMATION_LAYER.md)를 봅니다.

## 4. 다음에 읽을 문서

- [docs/BEGINNER_SETUP.md](./BEGINNER_SETUP.md)
  처음 연결을 끝까지 따라가는 상세 문서입니다.
- [docs/STUDENT_IDENTITY_MODEL.md](./STUDENT_IDENTITY_MODEL.md)
  이메일 기반 학생 식별과 선택형 보완 방식 기준을 설명합니다.
- [docs/STAR_MODE_MVP.md](./STAR_MODE_MVP.md)
  별점모드 공개/비공개 규칙과 MVP 범위를 설명합니다.
- [docs/NEXT_STAGE_ROADMAP.md](./NEXT_STAGE_ROADMAP.md)
  현재, 다음, 이후, 선택 기능을 구분한 방향 문서입니다.
- [docs/templates/STUDENT_PUBLIC_SHARE_NOTE_TEMPLATE.md](./templates/STUDENT_PUBLIC_SHARE_NOTE_TEMPLATE.md)
  학생 공개용 공지/오늘 할 일/공개 별점 안내 템플릿입니다.

## 5. 제품 설명은 그다음

`classpage`의 기본 원칙은 단순합니다.

- 학생 화면은 공지, 오늘 할 일, 제출 버튼처럼 바로 필요한 안내를 보여줍니다.
- 선생님 화면은 학급 관리, 수업 관리, 별점 요약만 빠르게 확인합니다.
- 계산과 학생 검증은 Google Sheets + Apps Script 같은 바깥 레이어에서 처리합니다.
- AI 인사이트나 위험 학생 알림은 지금 필수가 아니라 다음 단계 후보입니다.
