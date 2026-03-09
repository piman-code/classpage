# classpage 자동화 레이어

처음부터 직접 설치하고 연결해야 한다면 [docs/BEGINNER_SETUP.md](/Users/hangbokee/classpage/docs/BEGINNER_SETUP.md)를 먼저 보는 편이 좋습니다.  
이 문서는 전체 구조와 규칙을 설명하는 개요 문서입니다.

## 1. 전체 자동화 구조

자동화 레이어의 역할은 단순합니다.

1. Google Form 응답이 Google Sheets에 쌓입니다.
2. Apps Script가 응답 시트와 허가 학생 명단 시트를 읽습니다.
3. 응답 이메일을 허가 학생 명단과 대조합니다.
4. 허가된 응답만 규칙 기반으로 `class-summary.json`과 `lesson-summary.json`을 계산합니다.
5. 제외된 응답 수만 최소 정보로 남깁니다.
6. 결과를 Drive 파일로 쓰거나, `doGet`으로 JSON 응답을 제공합니다.
7. classpage는 그 JSON을 읽기만 합니다.

여기서 중요한 점은 다음과 같습니다.

- 원본 응답은 Google Sheets에 남깁니다.
- 허가 학생 검증은 별도 allowlist 시트에서 합니다.
- 계산 규칙은 Apps Script `Config.gs`에 둡니다.
- 결과 JSON은 classpage 계약에 맞춰 만듭니다.
- classpage는 집계 로직을 모릅니다.

구현 파일은 아래입니다.

- [automation/apps-script/Config.gs](/Users/hangbokee/classpage/automation/apps-script/Config.gs)
- [automation/apps-script/Code.gs](/Users/hangbokee/classpage/automation/apps-script/Code.gs)
- [automation/apps-script/appsscript.json](/Users/hangbokee/classpage/automation/apps-script/appsscript.json)

## 2. 학급용 집계 규칙

학급용 집계는 응답을 읽은 뒤 먼저 allowlist 검증을 통과한 학생만 남깁니다.  
허가되지 않은 이메일 응답은 `excludedResponseCount`로만 남고, 실제 분포/학생 목록 계산에는 들어가지 않습니다.

학급용 집계는 기본적으로 "최신 날짜의 학생별 마지막 응답"만 사용합니다.  
같은 날 같은 학생이 여러 번 제출했으면 마지막 응답만 남깁니다.

### 정서 상태 분포

`Config.gs`의 `rules.classSummary.emotionBuckets`를 사용합니다.

- `안정`
  좋음, 행복, 기쁨, 편안, 보통, 괜찮음 계열
- `피곤함`
  피곤, 졸림, 지침, 힘듦 계열
- `불안`
  불안, 걱정, 긴장, 슬픔, 우울, 짜증 계열
- `기타`
  어떤 버킷에도 들어가지 않는 응답

### 목표 달성 분포

`rules.classSummary.goalBuckets`를 사용합니다.

- `달성`
  달성, 완료, 다 함, 100%
- `부분 달성`
  부분, 절반, 조금, 보통
- `미달`
  미달, 못함, 안 함, 낮음

### 도움이 필요한 학생

`supportScoreThreshold` 이상이면 목록에 넣습니다.

점수 규칙은 다음과 같습니다.

- 정서 상태가 `피곤함` 또는 `불안`이면 +1
- 어제 할 일이 `부분 달성`이면 +1
- 어제 할 일이 `미달`이면 +2
- 기분 이유나 선생님께 할 말에 도움 요청성 키워드가 있으면 +1
- 최근 도움 받은 친구 기록이 있으면 +1

즉, 정서 주의 + 목표 미달 같은 조합이면 바로 교사용 목록에 올라갑니다.

### 칭찬/격려 후보

`최근 도움을 준 친구와 그 이유`가 일정 길이 이상이면 후보로 올립니다.  
이건 "친구를 도운 행동이 명시적으로 기록된 경우만 칭찬 후보로 본다"는 보수적인 규칙입니다.

현재 단계에서는 이 칭찬 후보가 학급용 보상/포인트 후보의 가장 얇은 출발점입니다.  
실제 포인트 확정이나 사용 기능은 넣지 않습니다.

## 3. 수업용 집계 규칙

수업용 집계도 마찬가지로 allowlist 검증을 먼저 통과한 응답만 반영합니다.

수업용 집계는 기본적으로 "가장 최근 수업 그룹(date + period + subject)의 학생별 마지막 응답"만 사용합니다.

### 어려워한 개념

`개념 1`, `개념 2`와 각 이해도 응답을 함께 읽습니다.

- 이해도는 `낮음 / 보통 / 높음`으로 분류
- `낮음` 응답 수를 개념별로 셈
- 평균 이해도를 함께 계산
- 결과를 `difficultConcepts`에 넣음

즉, 어떤 개념에서 `낮음` 응답이 많이 나오면 그 개념이 상위에 뜹니다.

### 평균 정답 / 평균 오답

- `문제 맞은 개수` 평균
- `틀린 개수` 평균

숫자 필드는 문자열이어도 숫자로 정규화해서 계산합니다.

### 과제 수행 분포

`rules.lessonSummary.assignmentBuckets`를 사용합니다.

- `완료`
- `부분 완료`
- `미완료`
- `기타`

### 보충 필요 학생

`supportScoreThreshold` 이상이면 목록에 넣습니다.

점수 규칙은 다음과 같습니다.

- 오답 수가 기준 이상이면 +2
- 오답이 1개 이상이면 +1
- 이해도가 낮은 개념이 있으면 +1
- 과제가 `부분 완료`면 +1
- 과제가 `미완료`면 +2
- 틀린 이유나 선생님께 할 말에 설명 필요 키워드가 있으면 +1

### 학생별 정오답 / 과제 현황

최신 수업 그룹의 학생별 마지막 응답을 그대로 남깁니다.

- 정답 수
- 오답 수
- 과제 상태
- followUp

`followUp`은 점수 기반으로 정합니다.

- 지원 점수 높음: `보충 설명 필요`
- 정답 수 높고 과제 완료: `심화 가능`
- 오답은 있지만 긴급도 낮음: `오답 원인 확인`

현재 단계에서는 `followUp: 심화 가능` 응답을 수업용 우수 수행 후보의 가장 가벼운 신호로 봅니다.  
별도 상점 시스템이나 포인트 차감/사용 로직은 아직 넣지 않습니다.

## 4. allowlist 시트 규칙

allowlist는 Google Sheets의 별도 시트로 관리합니다.

권장 헤더는 아래입니다.

- `이메일 주소`
- `반`
- `번호`
- `이름`
- `허가`

작동 방식은 다음과 같습니다.

1. 응답 시트의 이메일 주소를 읽습니다.
2. allowlist 시트의 이메일 주소와 소문자 기준으로 비교합니다.
3. 정확히 일치하면 허가 응답으로 봅니다.
4. 일치하지 않으면 집계에서 제외합니다.

`허가` 열은 선택적입니다.

- 비어 있으면 허가로 간주
- `false`, `0`, `no`, `제외`, `비활성`이면 제외로 간주

allowlist를 따로 두는 이유는 다음과 같습니다.

- 폼을 새로 만들어도 명단을 그대로 유지하기 쉽습니다.
- 응답 원본과 허가 명단이 섞이지 않습니다.
- 이름이나 번호 입력 실수보다 이메일 일치를 더 신뢰할 수 있습니다.

## 5. 생성되는 JSON 구조와 갱신 방식

### 생성되는 파일

- `class-summary.json`
- `lesson-summary.json`

두 파일에는 공통적으로 아래 최소 정보가 추가됩니다.

- `responseCount`
  허가된 학생 응답 수
- `excludedResponseCount`
  allowlist에서 제외된 응답 수

### 생성 방식

Apps Script는 두 가지 방식으로 결과를 제공합니다.

1. `refreshAllSummaries()`
   두 JSON을 계산하고, `driveFolderId`가 설정되어 있으면 Drive 파일을 갱신합니다.
2. `doGet(e)`
   `summary=class`, `summary=lesson`, `summary=all`에 따라 JSON 응답을 바로 반환합니다.

즉, 운영 방식은 둘 중 하나를 고르면 됩니다.

- Drive 파일 갱신 후 동기화
- Web App으로 배포한 뒤 외부 자동화가 JSON pull

### 추천 갱신 방식

첫 단계는 `installRefreshTrigger()`로 15분 간격 시간 트리거를 거는 방식을 추천합니다.  
폼 제출 즉시 트리거보다 덜 예민하고, 디버깅도 쉽습니다.

Drive 자동 갱신 후 Mac에서 Obsidian 볼트로 자동 복사하는 운영 방식은 [docs/DRIVE_SYNC_SETUP.md](/Users/hangbokee/classpage/docs/DRIVE_SYNC_SETUP.md) 에 정리했습니다.

## 6. 운영자가 수정할 수 있는 규칙/설정 포인트

운영자가 가장 자주 바꿀 곳은 [automation/apps-script/Config.gs](/Users/hangbokee/classpage/automation/apps-script/Config.gs) 입니다.

### 시트 연결

- `spreadsheetId`
- `sheetName`
- 각 열 이름(headers)

### allowlist 시트 연결

- `sources.allowlist.spreadsheetId`
- `sources.allowlist.sheetName`
- `sources.allowlist.headers.email`
- `sources.allowlist.headers.classroom`
- `sources.allowlist.headers.number`
- `sources.allowlist.headers.name`
- `sources.allowlist.headers.active`

### 출력 위치

- `output.driveFolderId`
- 파일명

### 학급용 규칙

- 정서 버킷 키워드
- 목표 달성 버킷 키워드
- 도움 필요 학생 점수 기준
- 칭찬 후보 최소 글자 수

### 수업용 규칙

- 이해도 버킷 키워드와 점수
- 과제 수행 버킷 키워드
- 오답 임계값
- 보충 필요 학생 점수 기준
- 심화 가능 기준 정답 수

## 7. 디버깅 방법

Apps Script에서 아래 함수만 기억하면 됩니다.

- `validateAutomationSetup()`
  응답 시트, allowlist 시트, 출력 폴더 연결 확인
- `previewClassSummary()`
  학급용 집계 JSON 미리 보기
- `previewLessonSummary()`
  수업용 집계 JSON 미리 보기
- `refreshAllSummaries()`
  실제 생성 및 파일 갱신

## 8. 왜 이 구조가 classpage와 잘 맞는가

이 자동화 구조는 classpage를 무겁게 만들지 않습니다.

- 수집: Google Form
- 원본 보관: Google Sheets
- 검증: allowlist 시트와 이메일 대조
- 규칙 계산: Apps Script
- 표시: classpage

따라서 운영자는 화면을 바꾸고 싶으면 classpage 설정을,  
숫자와 학생 목록을 바꾸고 싶으면 Apps Script 규칙을,  
원본 문항을 바꾸고 싶으면 Google Form을 수정하면 됩니다.
