# classpage

`classpage`는 교실 운영용 Obsidian 플러그인입니다. 학생용 화면에서는 오늘의 할 일, 공지사항, Google Form 제출 버튼을 보여주고, 교사용 화면에서는 외부 집계 레이어가 만든 요약 JSON과 별점 ledger를 읽어 빠르게 판단할 수 있게 합니다.

## 어디서 시작할까

실행은 [docs/START_HERE.md](/Users/hangbokee/classpage/docs/START_HERE.md)에서 시작하는 것이 가장 빠릅니다.  
이 `README`는 저장소 소개와 문서 지도를 맡고, 실제 연결 순서는 `START_HERE`와 `BEGINNER_SETUP`에 둡니다.

1. [docs/START_HERE.md](/Users/hangbokee/classpage/docs/START_HERE.md)
   BRAT 설치부터 JSON 연결까지, 가장 짧은 성공 순서만 먼저 봅니다.
2. [docs/BEGINNER_SETUP.md](/Users/hangbokee/classpage/docs/BEGINNER_SETUP.md)
   처음 설치하는 사람이 끝까지 따라가는 상세 문서입니다.
3. [docs/OPERATING_MODEL.md](/Users/hangbokee/classpage/docs/OPERATING_MODEL.md), [docs/AUTOMATION_LAYER.md](/Users/hangbokee/classpage/docs/AUTOMATION_LAYER.md)
   구조와 집계 규칙이 왜 이렇게 나뉘는지 확인합니다.
4. [docs/NEXT_STAGE_ROADMAP.md](/Users/hangbokee/classpage/docs/NEXT_STAGE_ROADMAP.md)
   이미 있는 것과 다음 단계, 나중 단계의 경계를 봅니다.
5. [docs/templates/STUDENT_PUBLIC_SHARE_NOTE_TEMPLATE.md](/Users/hangbokee/classpage/docs/templates/STUDENT_PUBLIC_SHARE_NOTE_TEMPLATE.md)
   학생 공개용 안내문을 빠르게 복붙할 때 씁니다.

## 문서 지도

- [docs/START_HERE.md](/Users/hangbokee/classpage/docs/START_HERE.md)
  실제 시작점입니다. 설명보다 실행 순서를 먼저 보여줍니다.
- [docs/BEGINNER_SETUP.md](/Users/hangbokee/classpage/docs/BEGINNER_SETUP.md)
  실제 설치와 연결을 처음부터 끝까지 따라가는 문서입니다.
- [docs/OPERATING_MODEL.md](/Users/hangbokee/classpage/docs/OPERATING_MODEL.md)
  학생 화면, 교사용 화면, 집계 레이어, 표시 레이어가 어떻게 나뉘는지 설명합니다.
- [docs/AUTOMATION_LAYER.md](/Users/hangbokee/classpage/docs/AUTOMATION_LAYER.md)
  Apps Script에서 무엇을 계산하고 어떤 JSON을 만드는지 설명합니다.
- [docs/STUDENT_IDENTITY_MODEL.md](/Users/hangbokee/classpage/docs/STUDENT_IDENTITY_MODEL.md)
  이메일 기반 학생 식별과 선택형 allowlist 보완 규칙을 설명합니다.
- [docs/STAR_MODE_MVP.md](/Users/hangbokee/classpage/docs/STAR_MODE_MVP.md)
  별점모드 MVP 범위, 규칙 구조, 수동 조정 시트 기준을 설명합니다.
- [docs/STAR_MODE_EXPANSION_PLAN.md](/Users/hangbokee/classpage/docs/STAR_MODE_EXPANSION_PLAN.md)
  별점 규칙 편집, 수동 부여, 일괄 부여를 어디에 두는 것이 맞는지 정리한 확장 설계 문서입니다.
- [docs/NEXT_STAGE_ROADMAP.md](/Users/hangbokee/classpage/docs/NEXT_STAGE_ROADMAP.md)
  현재, 다음, 이후, 선택 기능을 구분한 제품 방향 문서입니다.
- [docs/DRIVE_SYNC_SETUP.md](/Users/hangbokee/classpage/docs/DRIVE_SYNC_SETUP.md)
  Drive 자동 갱신 + Mac 자동 복사 운영을 붙일 때 봅니다.

## 제품 설명

`classpage`는 수집, 집계, 표시를 한 곳에 몰아넣지 않습니다.

- 학생용 페이지
  오늘의 할 일, 공지사항, 학급용/수업용 Google Form 버튼
- 학생 공개 안내
  공개 가능한 별점/칭찬 정보는 현재 학생용 페이지 자동 출력보다 공유 템플릿 중심으로 운영
- 교사용 페이지
  학급/수업 운영 대시보드, 별점 읽기 전용 요약, 집계 연결 상태
- 집계 레이어
  Google Form 응답을 Google Sheets에 저장한 뒤 Apps Script 또는 외부 자동화가 JSON 생성
- 표시 레이어
  classpage가 볼트 안 JSON 파일을 읽어 렌더링

별점모드는 특히 아래 원칙으로 운영합니다.

- 규칙 편집: `automation/apps-script/Config.gs`
- 수동 조정: Google Sheets `별점 수동 조정` 시트
- 일괄 부여: `별점 일괄 부여` 시트에서 준비 후 `별점 수동 조정` 이벤트로 반영
- 자동 적립: 구조화 입력으로 안정적으로 판별되는 규칙만 사용
- classpage: 결과 확인용 읽기 전용 대시보드

기본 경로는 아래와 같습니다.

- `classpage-data/class-summary.json`
- `classpage-data/lesson-summary.json`
- `classpage-data/star-ledger.json`

예시 계약 파일은 아래를 참고하면 됩니다.

- [docs/contracts/class-summary.example.json](/Users/hangbokee/classpage/docs/contracts/class-summary.example.json)
- [docs/contracts/lesson-summary.example.json](/Users/hangbokee/classpage/docs/contracts/lesson-summary.example.json)
- [docs/contracts/star-ledger.example.json](/Users/hangbokee/classpage/docs/contracts/star-ledger.example.json)

주의:

- 위 계약 예시는 교사용 내부 JSON 예시입니다. 학생 공개용으로 raw 파일 자체를 공유하지 않는 편이 안전합니다.
- 학생 공개가 필요하면 [docs/templates/STUDENT_PUBLIC_SHARE_NOTE_TEMPLATE.md](/Users/hangbokee/classpage/docs/templates/STUDENT_PUBLIC_SHARE_NOTE_TEMPLATE.md)처럼 공개용으로 한 번 더 걸러서 사용합니다.

## 보안 및 운영 주의

- `classpage-data/` 아래의 실운영 JSON은 저장소에 커밋하지 않는 것을 전제로 합니다.
- `spreadsheetId`, `driveFolderId`, 실제 볼트 경로, 로그 파일이 들어간 로컬 메모나 스크립트 복사본도 공개 저장소에 넣지 않는 편이 안전합니다.
- 문서와 계약 예시의 학생 정보는 익명 예시만 사용해야 합니다.
- `class-summary.json`, `lesson-summary.json`, `star-ledger.json`은 교사용 내부 산출물로 보고, 학생 공개 데이터와 분리해서 운영하는 편이 안전합니다.
- `class-summary.json`과 `lesson-summary.json`의 `studentResponses`는 교사용 drill-down용 최신 응답 스냅샷일 수 있으므로, 학생 공개 자료로 그대로 재사용하지 않는 편이 안전합니다.

## 설치

### BRAT로 베타 설치

1. Obsidian에서 BRAT 플러그인을 설치하고 활성화합니다.
2. BRAT의 `Add beta plugin`에 저장소 주소 `https://github.com/piman-code/classpage`를 입력합니다.
3. 설치 후 Community Plugins에서 `classpage`를 활성화합니다.

설치 직후에는 [docs/START_HERE.md](/Users/hangbokee/classpage/docs/START_HERE.md)로 바로 이어가면 됩니다.

### 수동 설치

아래 파일을 볼트의 `.obsidian/plugins/classpage/` 폴더에 넣으면 됩니다.

- `manifest.json`
- `main.js`
- `styles.css`

## 개발

```bash
npm install
npm run typecheck
npm run build
```

## 현재 의도적으로 넣지 않은 것

- Google Form 응답 수집 자체
- classpage 플러그인 내부에서의 Google Sheets 직접 연결 및 집계 로직
- 원문 응답 전체 보기 기능
- 초보자/고급자 모드 분리
- 과한 범용화와 복잡한 상태 관리

`classpage`는 실제 교사가 바로 쓰기 쉬운 흐름을 우선하고, 복잡한 자동화나 해석 기능은 바깥 레이어 또는 다음 단계 기능으로 미룹니다.
