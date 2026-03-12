# classpage 별점모드 MVP

## 1. 목표

별점모드는 학급 운영에서 학생의 긍정적 행동을 빠르게 기록하고, 선생님이 나중에 누적 결과를 확인할 수 있게 하는 가벼운 보상 시스템입니다.

이 MVP의 목적은 다음과 같습니다.

- 출석, 참여, 역할 수행 같은 행동을 빠르게 적립한다.
- 감점은 가능하지만 기본적으로 학생 화면에는 드러내지 않는다.
- 총점만 직접 저장하지 않고, 이벤트 로그를 기준으로 합산한다.
- 기존 classpage 구조를 깨지 않고 `Google Form -> Google Sheets -> Apps Script -> JSON -> classpage` 흐름 안에 자연스럽게 들어간다.

## 2. 운영 원칙

1. 기본은 가점 중심
2. 감점은 선생님 전용 조정으로 숨김 처리
3. 학생 공개 점수와 선생님 내부 조정을 분리
4. 총점보다 이벤트 이력이 우선
5. 자동 적립은 단순한 규칙부터 시작
6. 경쟁보다 성장과 누적 기록을 우선

## 3. MVP 범위

### 포함

- 별점 규칙 정의
- 이벤트 로그 기반 데이터 구조
- 학생별 누적 점수 계산
- 규칙별 발생 summary 집계
- 학생 공개 적립 / 선생님 전용 조정 구분
- 선생님 화면에서 규칙과 최근 적립 내역 확인
- Apps Script에서 JSON 생성 가능하도록 계약 정의

### 제외

- 상점 / 교환소 / 아이템 구매
- 학생 간 실시간 랭킹 경쟁 UI
- 복잡한 권한 체계
- 반 여러 개를 동시에 다루는 대시보드
- 감점 내역 학생 공개

## 4. 기본 규칙 초안

초기값은 아래처럼 둡니다.

| ruleId | 라벨 | 카테고리 | 점수 | 공개 범위 | 입력 경로 | enabled | 설명 |
| --- | --- | --- | ---: | --- | --- | --- | --- |
| arrival | 등교 | attendance | +5 | student | class-form | true | 학급용 폼 제출 시 자동 적립 |
| attendance-check | 출석체크 | attendance | +1 | student | class-form | true | 학급용 폼 제출 완료 |
| lesson-submit | 수업 제출 | participation | +1 | student | lesson-form | true | 수업용 폼 제출 완료 |
| assignment-complete | 복습/수행 완료 | participation | +1 | student | lesson-form | true | 수업용 폼의 복습/수행 상태가 완료로 분류되면 자동 적립 |
| no-incorrect | 오답 없음 | participation | +1 | student | lesson-form | true | 수업용 폼에서 복습/수행 상태가 완료이고 오답이 없으면 자동 적립 |
| manual-praise | 수동 칭찬 | service | +2 | student | manual | true | 선생님이 공개 가점을 수동으로 부여 |
| teacher-adjustment | 선생님 전용 조정 | adjustment | -2 | teacher | manual | true | 필요할 때만 선생님 내부 조정 |

다음 단계에서 추가 후보:

- 준비물 완비 +2
- 친구 도움 +3
- 수업 참여 +2
- 학습일지 제출 +1
- 복습 완전히 함 +2

## 5. 데이터 모델

MVP는 총점 테이블보다 이벤트 로그를 기준으로 움직입니다.

### 5-1. StarRuleSettings

규칙의 source of truth는 Apps Script `Config.gs`입니다.

```ts
interface StarAutoCriteria {
  assignmentStatusIn: string[];
  minimumCorrectCount: number | null;
  maximumIncorrectCount: number | null;
}

interface StarRuleSettings {
  ruleId: string;
  label: string;
  category: "attendance" | "participation" | "service" | "adjustment" | "custom";
  delta: number;
  visibility: "student" | "teacher";
  description: string;
  enabled: boolean;
  sources: Array<"manual" | "class-form" | "lesson-form" | "system">;
  allowCustomDelta: boolean;
  autoCriteria: StarAutoCriteria | null;
}
```

- `ruleId`
  자동 적립과 수동 조정에서 공통으로 쓰는 규칙 식별자
- `sources`
  어떤 입력 경로에서 이 규칙을 허용하는지 정의
- `allowCustomDelta`
  수동 조정 시트에서 기본 점수 대신 행별 점수를 허용할지 결정
- `autoCriteria`
  자동 적립일 때 구조화 입력 필드로만 판정하는 조건

### 5-2. StarEvent

한 번의 적립 또는 조정 1건을 뜻합니다.

```ts
interface StarEvent {
  id: string;
  studentKey: string;
  student: {
    classroom: string;
    number: string;
    name: string;
  };
  ruleId: string;
  category: "attendance" | "participation" | "service" | "adjustment" | "custom";
  delta: number;
  visibility: "student" | "teacher";
  source: "manual" | "class-form" | "lesson-form" | "system";
  occurredAt: string;
  note: string;
  actor: string;
  batchId: string;
}
```

### 5-3. StarStudentTotal

학생별 합산 결과입니다.

```ts
interface StarStudentTotal {
  studentKey: string;
  student: {
    classroom: string;
    number: string;
    name: string;
  };
  total: number;
  visibleTotal: number;
  hiddenAdjustmentTotal: number;
  eventCount: number;
}
```

### 5-4. StarRuleEventSummary

규칙별 발생 요약입니다.

```ts
interface StarRuleEventSummary {
  ruleId: string;
  label: string;
  category: "attendance" | "participation" | "service" | "adjustment" | "custom";
  visibility: "student" | "teacher";
  eventCount: number;
  manualCount: number;
  automaticCount: number;
  sourceSummary: {
    manual: number;
    "class-form": number;
    "lesson-form": number;
    system: number;
  };
}
```

- `ruleId`
  규칙 정의와 연결되는 요약 키
- `label`
  classpage가 규칙 lookup 없이도 바로 보여줄 수 있는 표시용 라벨
- `eventCount`
  기간 안에서 이 규칙이 실제로 발생한 총 건수
- `manualCount`, `automaticCount`
  수동 조정과 자동 적립을 읽기 전용 화면에서 바로 구분하기 위한 단서
- `sourceSummary`
  어떤 입력 경로에서 이 규칙이 발생했는지 더 자세히 확인할 수 있는 요약

### 5-5. StarModeLedger

classpage가 읽는 별점 JSON 계약입니다.

```ts
interface StarModeLedger {
  type: "star-ledger";
  generatedAt: string;
  periodLabel: string;
  classroom?: string;
  excludedResponseCount: number;
  eventCount: number;
  source: {
    formName: string;
    formUrl: string;
    sheetName: string;
    aggregatorNote: string;
  };
  sourceSummary: {
    manual: number;
    "class-form": number;
    "lesson-form": number;
    system: number;
  };
  rules: StarRuleSettings[];
  ruleSummary: StarRuleEventSummary[];
  totals: StarStudentTotal[];
  recentEvents: StarEvent[];
}
```

- `ruleSummary`
  Apps Script가 계산한 규칙별 총 발생 수입니다. classpage는 이 값을 우선 사용해 규칙별 발생 현황과 자동/수동 분리를 정확히 보여줍니다.

## 6. studentKey 규칙

학생 식별은 이름이 아니라 가능한 한 이메일 기반으로 합니다.

우선순위:

1. `email-sha256|이메일기반불투명키`
2. 반/번호/이름 조합
3. 그래도 없으면 `학생 미확인`

즉, Google 로그인 + 이메일 수집이 켜져 있으면 이메일 기반 불투명 키가 기본 키입니다.

## 7. 자동 적립 규칙

현재 자동 적립은 아래 규칙만 사용합니다.

1. 학급용 출석체크 제출: `+1`
2. 등교 확인(학급용 폼 제출 시): `+5`
3. 수업용 폼 제출: `+1`
4. 수업용 복습/수행 완료: `+1`
5. 수업용 복습/수행 완료 + 오답 없음: `+1`

주의:

- `등교 +5`와 `출석체크 +1`은 같은 이벤트로 묶지 말고 별도 규칙으로 남기는 편이 좋습니다.
- 그래야 나중에 운영자가 한쪽만 끄거나 점수만 바꾸기 쉽습니다.
- 자동 적립은 `복습 계획에서 정규화한 복습/수행 상태`, `문제 맞은 개수`, `틀린 개수` 같은 구조화 입력만 사용합니다.
- `도움을 준 친구`, `선생님께 하고 싶은 말` 같은 자유서술 문장은 자동 적립 조건으로 쓰지 않습니다.
- 학생 식별이 안 되거나 시각/수업 그룹을 만들 수 없으면 자동 적립 이벤트를 만들지 않습니다.
- 자동 적립은 응답 원본을 다시 읽어 매번 재계산하므로, `refreshAllSummaries()`를 다시 실행해도 같은 응답이 누적 저장되는 구조가 아닙니다.

## 8. 수동 적립 규칙

선생님이 직접 넣는 이벤트는 아래를 추천합니다.

- 청소 +5
- 친구 도움 +3
- 준비물 완비 +2
- 수업 참여 +2

선생님 전용 조정:

- 지각 -2
- 정리 미흡 -2
- 반복 미제출 -2

### 수동 조정 시트 권장 구조

기본 입력원은 Google Sheets의 `별점 수동 조정` 시트입니다.

최소 컬럼:

- `timestamp`
- `ruleId`
- `studentKey` 또는 `email/classroom/number/name`

권장 컬럼:

- `delta`
- `visibility`
- `note`
- `teacher`
- `batchId`

운영 기준:

- `studentKey`가 있으면 그 값을 우선 사용합니다.
- `studentKey`가 없으면 이메일, 그래도 없으면 반/번호/이름 조합으로 식별합니다.
- `delta`는 `allowCustomDelta: true`인 규칙에서만 행별 덮어쓰기를 허용합니다.
- `batchId`는 일괄 부여 묶음을 추적할 때 사용합니다.

### 일괄 부여 시트 운영

여러 학생에게 같은 규칙을 한 번에 적용할 때는 `별점 일괄 부여` 시트를 씁니다.

권장 컬럼:

- `적용`
- `상태`
- `타임스탬프`
- `batchId`
- `선생님`
- `규칙 ID`
- `점수`
- `공개 범위`
- `메모`
- `studentKey` 또는 `이메일 주소/반/번호/이름`

운영 방식:

- 선생님은 일괄 부여 시트에서 여러 학생 행을 준비합니다.
- `적용`을 체크하거나 `적용`으로 표시한 뒤 `refreshAllSummaries()` 또는 `applyPendingStarBatchGrants()`를 실행합니다.
- Apps Script가 대기 행을 `별점 수동 조정` 시트의 이벤트 행으로 복사하고, 원본 행의 `상태`를 `적용 완료`로 바꿉니다.
- ledger는 최종적으로 `별점 수동 조정` 이벤트만 읽으므로 감사와 재집계 기준이 한 곳에 남습니다.

## 9. 표시 원칙

### 학생 공개 화면

학생에게 보여줄 수 있는 값:

- 이번 주 획득 별점
- 최근 적립 3~5건
- 공개 적립 기준 누적 점수
- 칭찬 문구

학생에게 숨길 값:

- 감점 내역
- 선생님 전용 조정 점수
- 내부 메모

### 선생님 화면

선생님이 봐야 할 값:

- 학생별 총점
- 학생 공개 누적점수
- 숨김 조정 합계
- 최근 적립/조정 이벤트
- 규칙별 발생 횟수
- 학생 이름 기준 가벼운 필터와 숨김 조정 반영 학생 빠른 보기

## 10. classpage UI 권장 방향

### 선생님 화면 MVP 카드

- 상태: 기본 연결 / 데이터 없음
- 대상 학급 표시
- 활성 규칙 수
- 학생 공개 규칙 수
- 선생님 전용 규칙 수
- 수동 조정 반영 여부
- 규칙별 발생 현황 카드
- `allowCustomDelta`, `visibility`, `source` 확인
- 플러그인에서 직접 쓰지 않는다는 운영 안내
- 최근 이벤트 목록
- 상위 학생 5명
- 학생 이름 기준 가벼운 필터 / 숨김 조정 학생 빠른 보기

### 다음 단계 UI

- 학생별 전체 이벤트 drill-down
- 규칙별/기간 필터 확장
- 자동 적립 / 수동 적립 구분 탭

## 11. Apps Script 구현 방향

별점모드는 기존 요약 JSON과 별도 파일로 두는 것이 안전합니다.

추천 파일명:

- `star-ledger.json`

추천 함수:

- `buildStarLedger_()`
- `previewStarLedger()`
- `applyPendingStarBatchGrants()`
- `refreshAllSummaries()`에서 함께 생성

자동 적립 입력원은 처음엔 아래만 사용합니다.

- 학급용 응답 시트
- 수업용 응답 시트
- 선생님 수동 조정 시트

일괄 부여가 필요하면 아래 순서를 추가합니다.

- `별점 일괄 부여` 시트에서 여러 학생 행 준비
- `applyPendingStarBatchGrants()` 또는 `refreshAllSummaries()` 실행
- `별점 수동 조정` 시트에 이벤트 행 생성
- `star-ledger.json` 재생성

규칙 편집은 `Config.gs`에서 하고, classpage는 결과를 읽기만 하는 것이 현재 범위입니다.

## 12. 운영상 주의점

- 점수는 행동을 기록하는 도구이지 벌점 시스템의 전면화가 아니어야 합니다.
- 감점은 학생 공개화하지 않는 편이 좋습니다.
- 전체 공개 랭킹은 경쟁 스트레스를 만들 수 있으므로 MVP에서는 제외합니다.
- 반 전체 비교보다 개인 누적과 성장 중심이 더 바람직합니다.

## 13. Codex 구현 우선순위

1. `star-ledger` 타입/계약 정리
2. Apps Script에서 별점 이벤트 JSON 생성
3. 선생님 페이지에서 누적 점수/최근 이벤트 표시
4. 학급용/수업용 자동 적립 연결
5. 선생님 수동 조정 시트 연결

규칙 편집, 수동 부여, 일괄 부여를 어디에 두는 것이 맞는지는
[docs/STAR_MODE_EXPANSION_PLAN.md](./STAR_MODE_EXPANSION_PLAN.md) 에서 이어서 정리합니다.
