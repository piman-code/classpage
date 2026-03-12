# classpage 운영 구조

처음 세팅을 직접 따라 해야 한다면 [docs/START_HERE.md](./START_HERE.md)와 [docs/BEGINNER_SETUP.md](./BEGINNER_SETUP.md)를 먼저 보고, 이 문서는 구조와 책임 분리를 이해하는 용도로 보는 것을 권장합니다.

## 1. 전체 구조 요약

`classpage`는 네 개의 층으로 나눠 생각하면 가장 이해하기 쉽습니다.

1. 학생용 페이지
   학생이 보는 화면입니다. 오늘의 할 일, 공지사항, Google Form 버튼만 담당합니다.
2. 선생님용 페이지
   선생님이 보는 화면입니다. 이미 계산된 요약 결과만 빠르게 확인합니다.
3. 집계 레이어
   Google Sheets / Apps Script / 외부 자동화가 학생 응답을 로그인 이메일 기준으로 정리하고, 필요하면 allowlist로 보완한 뒤 요약 JSON과 별점 ledger로 변환합니다.
4. 표시 레이어
   classpage가 JSON 파일을 읽어 요약 카드와 목록으로 보여줍니다.

핵심 원칙은 다음과 같습니다.

- 수집은 Google Form
- 원본 저장은 Google Sheets
- 기본 식별은 Google 로그인 이메일
- 선택 보완은 allowlist
- 계산은 Apps Script 또는 외부 자동화
- 표시는 classpage

## 2. 데이터 흐름 설명

### 학급용 폼

1. 학생이 학급용 Google Form을 제출합니다.
2. 응답이 Google Sheets에 쌓입니다.
3. Apps Script가 로그인 이메일 기준으로 학생을 식별합니다.
4. 필요하면 allowlist로 표시용 반/번호/이름을 보완합니다.
5. 정서 상태, 목표 달성 정도, 도움이 필요한 학생, 칭찬 후보를 계산합니다.
6. 결과를 `class-summary.json`으로 만듭니다.
7. JSON 파일이 Obsidian 볼트의 `classpage-data/class-summary.json`에 들어오면 classpage가 표시합니다.

### 수업용 폼

1. 학생이 수업용 Google Form을 제출합니다.
2. 응답이 Google Sheets에 쌓입니다.
3. Apps Script가 로그인 이메일 기준으로 학생을 식별합니다.
4. 필요하면 allowlist로 표시용 반/번호/이름을 보완합니다.
5. 어려워한 부분, 정오답 현황, 복습/수행 상태, 보충 지도 필요 학생을 계산합니다.
6. 결과를 `lesson-summary.json`으로 만들되, top-level에는 가장 최근 전체 수업 그룹을 두고 `subjectSummaries[].groups[]`에는 과목별 여러 수업 그룹을 함께 넣습니다.
7. 각 수업 group에는 `lessonDate`, `periodOrder`, `unitKey`, `lessonKey` 같은 정렬/필터용 구조화 필드와, 선생님이 읽는 `label`을 함께 넣습니다.
8. JSON 파일이 Obsidian 볼트의 `classpage-data/lesson-summary.json`에 들어오면 classpage가 선생님 화면에서 과목, 단원, 날짜, 수업 그룹을 순서대로 좁혀 보며 표시합니다.

### 별점모드

1. 학급용 폼과 수업용 폼 응답이 Google Sheets에 쌓입니다.
2. Apps Script가 로그인 이메일 기준으로 학생을 식별합니다.
3. 필요하면 allowlist로 표시용 정보를 보완한 뒤 이벤트 로그로 변환합니다.
4. 학급용 폼 제출은 `등교 +5`, `출석체크 +1`을 자동 적립합니다.
5. 수업용 폼 제출은 `수업 제출 +1`을 자동 적립합니다.
6. 필요하면 선생님 수동 조정 시트를 읽어 선생님 전용 조정을 합칩니다.
7. 결과를 `star-ledger.json`으로 만들고 classpage가 선생님용 화면에서 읽습니다.

## 3. 학생용 페이지 구조

학생용 페이지는 정적 설정 화면입니다.

- 상단 제목 / 설명 / 상태 문구
- 오늘의 할 일
- 공지사항
- 학급용 Google Form 버튼
- 수업용 Google Form 버튼
- 공개 가능한 별점/칭찬 안내는 현재 학생용 자동 출력 대신 공유 템플릿으로 별도 운영

여기에는 학생 응답 데이터가 직접 들어오지 않습니다.

## 4. 선생님용 페이지 구조

선생님용 페이지는 집계 결과 화면입니다.

- 상단 상태 카드
  학급 / 수업 / 별점 연결 상태와 최근 집계 유무를 먼저 확인하고, 카드를 눌러 해당 영역만 볼 수 있음
- 집계 연결 상태
  구조와 파일 경로는 필요할 때만 아래 고급 정보에서 확인
- 학급용 폼 집계
  정서 상태, 목표 달성 분포, 도움이 필요한 학생, 칭찬/격려 후보
- 수업용 폼 집계
  과목 선택 + 단원/날짜 필터 + 수업 그룹 선택 흐름으로 어려워한 개념, 복습/수행 분포, 보충 지도 필요 학생, 학생별 정오답/복습 현황
- 별점모드
  기본 연결 상태, 최근 이벤트, 학생별 누적 점수, 학생 공개 점수와 선생님 전용 조정 구분

선생님용 페이지는 원문 응답을 직접 나열하지 않고, 판단에 필요한 요약 중심으로 구성합니다.
다만 drill-down이 필요한 카드에서는 최신 학생 응답 스냅샷을 함께 읽어, 학생 목록과 근거를 단계적으로 펼쳐 볼 수 있습니다.

중요:

- `class-summary.json`, `lesson-summary.json`, `star-ledger.json`은 선생님용 내부용 산출물입니다.
- `class-summary.json`, `lesson-summary.json`의 `studentResponses`는 선생님용 drill-down용 최신 응답 스냅샷입니다.
- 학생 공개용 안내는 raw JSON을 그대로 보여주지 말고 공개 가능한 값만 따로 추려서 공유하는 편이 안전합니다.

## 5. 집계 레이어에서 계산할 항목

### 학급용 폼 집계

- 정서 상태 분포
- 어제 할 일 달성도 분포
- 도움이 필요한 학생 목록
- 칭찬/격려 후보 학생 목록

### 수업용 폼 집계

- 어려워한 개념 목록
- 평균 정답 / 평균 오답
- 복습/수행 분포
- 보충 지도가 필요한 학생 목록
- 학생별 정오답 및 복습 현황

### 별점모드 집계

- 자동 적립 이벤트 생성
- 학생별 누적 점수 계산
- 학생 공개 점수 / 선생님 전용 조정 분리
- 최근 이벤트 정렬

## 6. classpage에서 표시만 할 항목

classpage는 아래를 계산하지 않고 표시만 합니다.

- 응답 수
- 제외된 응답 수
- 정서 상태 분포
- 목표 달성 분포
- 어려워한 개념
- 학생별 정오답
- 복습/수행 상태
- 도움이 필요한 학생
- 칭찬/격려 후보
- 별점모드 최근 이벤트
- 학생별 공개 점수 / 선생님 전용 조정 합계
- drill-down용 학생 최신 응답 스냅샷
- `lesson-summary.json`의 `subjectSummaries[].groups[]`
- `lesson-summary.json`의 `lessonDate`, `periodOrder`, `unitKey`, `lessonKey`
- 위 구조화 필드를 이용한 과목 안 단원/날짜/수업 그룹 탐색 상태

이 값들은 모두 외부 집계 JSON 결과여야 합니다.

이때 raw JSON 전체를 학생에게 그대로 공유하지 않는 것이 중요합니다.

## 7. 설정 포인트 목록

### 정적 설정

`Settings -> classpage`

- 학생용 페이지 제목 / 설명 / 상태 문구
- 오늘의 할 일 제목 / 내용
- 공지사항 제목 / 내용
- 학급용 폼 링크 / 버튼 문구
- 수업용 폼 링크 / 버튼 문구
- 선생님용 페이지 제목 / 설명 / 상태 문구
- 별점 섹션 제목
- 학급 집계 JSON 경로
- 수업 집계 JSON 경로
- 별점 JSON 경로

### 사용자 입력 원본

- Google Form 응답
- Google Sheets 응답 행

classpage 설정에서 직접 바꾸지 않습니다.

### 집계 결과

- `class-summary.json`
- `lesson-summary.json`
- `star-ledger.json`

이 파일 내용을 바꾸면 선생님용 화면 내용이 바뀝니다.

## 8. 어디를 수정해야 무엇이 바뀌는가

- 학생용 문구를 바꾸고 싶다
  `Settings -> classpage` 또는 [src/defaults.ts](../src/defaults.ts)
- 학생용 Google Form 링크를 바꾸고 싶다
  `Settings -> classpage`
- 선생님용 페이지 제목이나 설명을 바꾸고 싶다
  `Settings -> classpage`
- 선생님용 숫자나 학생 목록이 바뀌게 하고 싶다
  Google Sheets / Apps Script / JSON 생성 로직
- 선생님용 화면이 읽는 파일 위치를 바꾸고 싶다
  `Settings -> classpage`의 집계 JSON 경로

## 9. 현재 구현 파일

- [src/main.ts](../src/main.ts)
  학생용/선생님용 화면과 설정 탭
- [src/defaults.ts](../src/defaults.ts)
  기본 설정값, 집계 계약 정규화
- [src/types.ts](../src/types.ts)
  학생용/선생님용/집계 데이터 타입
- [src/teacher-data.ts](../src/teacher-data.ts)
  집계 JSON 로더
- [automation/apps-script/Config.gs](../automation/apps-script/Config.gs)
  Apps Script 집계 규칙과 시트/출력 설정
- [automation/apps-script/Code.gs](../automation/apps-script/Code.gs)
  학급용/수업용/별점 JSON 생성기

## 10. 현재 의도적으로 넣지 않은 기능

- Google Sheets 직접 연동
- 원문 응답 전체 브라우저
- 선생님용 편집 화면
- 복잡한 필터와 다중 클래스 관리

## 11. 다음 단계 제안

가장 자연스러운 다음 단계는 [docs/NEXT_STAGE_ROADMAP.md](./NEXT_STAGE_ROADMAP.md)에 맞춰 아래 순서로 보는 것이 적절합니다.

1. 학생 공개용 공지/별점 안내를 얇은 공유 템플릿에서 시작하기
2. 선생님용 화면의 학급 관리와 수업 관리를 더 분리된 흐름으로 다듬기
3. Apps Script 결과를 Obsidian 볼트 안으로 가져오는 마지막 동기화 단계를 운영 환경에 맞게 붙이기

첫 단계에서는 수집-집계-표시의 분리를 유지하는 것이 가장 중요합니다.
