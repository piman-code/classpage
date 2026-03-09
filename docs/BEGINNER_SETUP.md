# classpage 초보자 설치/설정 가이드

이 문서는 Obsidian과 BRAT, Google Form, Google Sheets, Apps Script가 아직 익숙하지 않은 사람을 기준으로 적었습니다.

이 문서는 아래 흐름을 처음부터 따라 하려는 운영자를 위한 안내입니다.

`Google Form -> Google Sheets -> Apps Script -> JSON -> classpage 교사용 페이지`

목표는 자동화 UI를 더 만드는 것이 아니라, 지금 있는 구조를 초보자도 이해하고 직접 연결할 수 있게 하는 것입니다.

## 0. 이 문서로 하게 될 일

이 문서를 끝까지 따라 하면 아래 상태까지 갈 수 있습니다.

1. Obsidian에 `classpage`를 BRAT로 설치합니다.
2. 학생용 페이지가 열리는지 확인합니다.
3. Google Form 응답을 Google Sheets에 연결합니다.
4. Apps Script에서 집계 JSON을 미리 봅니다.
5. `class-summary.json`, `lesson-summary.json`을 Obsidian 볼트에 넣습니다.
6. classpage 교사용 페이지에서 집계 결과가 보이는지 확인합니다.

처음에는 모든 것을 자동화하려고 하지 않는 편이 좋습니다.  
가장 쉬운 첫 성공 경로는 아래입니다.

1. BRAT로 플러그인 설치
2. Apps Script `preview...` 함수 실행
3. JSON을 직접 복사해서 볼트에 저장
4. classpage 교사용 페이지에서 표시 확인

## 1. 먼저 이해할 용어

### Google Form

학생이 실제로 답을 제출하는 입력 폼입니다.

### Google Sheets

Google Form 응답이 표 형태로 저장되는 시트입니다.  
이 문서에서는 이 시트를 "응답 시트"라고 부릅니다.

### spreadsheetId

응답 시트를 구분하는 고유 ID입니다.  
보통 스프레드시트 주소에서 `/d/` 와 `/edit` 사이에 있는 긴 문자열입니다.

예시:

```text
https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890/edit#gid=0
```

여기서 `1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890` 가 `spreadsheetId` 입니다.

### sheetName

응답 시트 아래쪽 탭 이름입니다.  
파일 이름이 아니라, 탭 이름입니다.

예시:

- `학급용 응답`
- `수업용 응답`
- `Form Responses 1`

### headers

응답 시트 1행에 있는 열 제목입니다.  
Apps Script는 이 제목을 기준으로 어느 열이 무엇인지 찾습니다.

예시:

- `타임스탬프`
- `반`
- `번호`
- `이름`
- `오늘 아침 기분`

### JSON

Apps Script가 집계해서 만들어 내는 최종 결과 파일입니다.  
`classpage` 교사용 페이지는 이 JSON 파일만 읽습니다.

## 2. 시작 전에 준비할 것

시작 전에 아래가 준비되어 있으면 됩니다.

1. 학급용 Google Form 1개
2. 수업용 Google Form 1개
3. Google 계정
4. Obsidian 설치
5. Obsidian 볼트 1개
6. 인터넷이 되는 브라우저

아직 `classpage` 플러그인을 설치하지 않았다면 바로 아래 단계부터 진행하면 됩니다.

## 3. Obsidian과 BRAT로 classpage 설치하기

이 프로젝트는 일반 웹앱이 아니라, Obsidian에서 BRAT로 설치해서 쓰는 플러그인입니다.

### 3-1. Community Plugins 허용

1. Obsidian을 엽니다.
2. 왼쪽 아래 `설정(Settings)`을 엽니다.
3. `Community plugins`로 들어갑니다.
4. `Restricted mode`가 켜져 있으면 끕니다.

### 정상이라면 보이는 결과

- Community plugins를 설치할 수 있는 화면이 보입니다.

### 자주 틀리는 부분

- Restricted mode를 끄지 않아 BRAT 설치 버튼이 보이지 않음

### 3-2. BRAT 설치

1. `Community plugins` 화면에서 `Browse`를 누릅니다.
2. 검색창에 `BRAT`를 입력합니다.
3. `Obsidian42 - BRAT` 플러그인을 설치합니다.
4. 설치 후 활성화합니다.

### 정상이라면 보이는 결과

- Community plugins 목록에 BRAT가 활성화되어 있습니다.

### 3-3. classpage 설치

1. BRAT 설정 또는 명령에서 `Add beta plugin`을 찾습니다.
2. 저장소 주소 `https://github.com/piman-code/classpage` 를 입력합니다.
3. 설치가 끝나면 Community plugins 목록에서 `classpage`를 활성화합니다.

### 여기서 복사할 값

- 저장소 주소: `https://github.com/piman-code/classpage`

### 정상이라면 보이는 결과

- Community plugins 목록에 `classpage`가 나타납니다.
- 활성화 스위치를 켤 수 있습니다.

### 자주 틀리는 부분

- 저장소 주소 대신 릴리스 URL이나 개별 파일 URL을 넣음
- BRAT는 설치했지만 `classpage` 플러그인 자체를 활성화하지 않음

## 4. 설치 직후 classpage가 열리는지 먼저 확인하기

자동화 연결 전에 플러그인 자체가 잘 열리는지 확인합니다.

1. Obsidian 왼쪽 리본에서 `교실 페이지 열기` 아이콘을 찾습니다.
2. 보이지 않으면 명령 팔레트에서 `교실 페이지 열기`를 실행합니다.
3. 학생용 페이지가 열리는지 확인합니다.
4. 상단 전환 버튼으로 `교사용 페이지`도 눌러봅니다.

### 정상이라면 보이는 결과

- 학생용 페이지에서 오늘의 할 일, 공지사항, 제출 바로가기 카드가 보입니다.
- 교사용 페이지에서는 아직 JSON이 없더라도 빈 상태 안내 카드가 보입니다.

### 자주 틀리는 부분

- 플러그인은 설치했지만 활성화하지 않음
- 리본 아이콘이 안 보일 때 명령 팔레트를 시도하지 않음
- 교사용 페이지에 데이터가 안 보이는 것을 설치 실패로 오해함
  처음에는 JSON이 없어서 빈 상태가 보이는 것이 정상입니다.

## 5. 전체 순서 한 번 보기

처음에는 아래 순서만 기억하면 됩니다.

1. Google Form 응답을 Google Sheets에 연결합니다.
2. 각 응답 시트의 `spreadsheetId`, `sheetName`, `headers`를 확인합니다.
3. Apps Script 프로젝트를 만듭니다.
4. `Config.gs`, `Code.gs`, `appsscript.json` 내용을 붙여넣습니다.
5. `Config.gs`에서 시트 연결값을 수정합니다.
6. `validateAutomationSetup()`을 실행해서 연결 상태를 확인합니다.
7. `previewClassSummary()`와 `previewLessonSummary()`를 실행해서 집계 결과를 미리 봅니다.
8. JSON 파일을 생성하거나 복사해서 Obsidian 볼트 안에 넣습니다.
9. classpage 설정에서 JSON 경로를 연결합니다.

## 6. Google Form 응답을 Google Sheets에 연결하기

학급용 폼과 수업용 폼 각각에 대해 한 번씩 진행합니다.

### 6-1. 학급용 폼 연결

1. 학급용 Google Form을 엽니다.
2. 상단의 `응답` 탭을 누릅니다.
3. 초록색 Sheets 아이콘을 누릅니다.
4. 새 시트를 만들거나 기존 시트를 연결합니다.

### 6-2. 수업용 폼 연결

1. 수업용 Google Form을 엽니다.
2. 상단의 `응답` 탭을 누릅니다.
3. 초록색 Sheets 아이콘을 누릅니다.
4. 새 시트를 만들거나 기존 시트를 연결합니다.

### 여기서 복사할 값

- 응답 시트의 스프레드시트 주소
- 응답 시트 아래 탭 이름

### 정상이라면 보이는 결과

- Google Form에 답을 제출하면 Google Sheets에 새 행이 추가됩니다.
- 첫 줄에는 질문 제목이 열 제목으로 보입니다.

### 자주 틀리는 부분

- Form만 만들고 응답 시트를 연결하지 않음
- 학급용 폼과 수업용 폼이 같은 시트에 뒤섞여 들어가게 만듦
- 질문 제목을 바꿨는데 응답 시트의 1행 제목 확인을 생략함

## 7. spreadsheetId 찾기

응답 시트를 열면 주소창에 긴 URL이 보입니다.

예시:

```text
https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890/edit#gid=0
```

여기서 아래 부분만 복사합니다.

```text
1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

### 여기서 복사할 값

- 학급용 응답 시트의 `spreadsheetId`
- 수업용 응답 시트의 `spreadsheetId`

### 정상이라면 보이는 결과

- `Config.gs`의 `spreadsheetId` 칸에 붙여넣을 긴 문자열이 준비됩니다.

### 자주 틀리는 부분

- 전체 URL을 그대로 넣음
- `/edit` 뒤의 문자열까지 같이 넣음
- Google Form URL을 넣고 Spreadsheet URL이 아니라고 놓침

## 8. sheetName과 headers 확인하기

### sheetName 확인 방법

1. 응답 시트를 엽니다.
2. 아래쪽 탭 이름을 확인합니다.
3. 탭 이름을 정확히 그대로 적습니다.

중요:

- `sheetName`은 파일 이름이 아닙니다.
- 아래 탭 이름과 한 글자라도 다르면 오류가 납니다.

### headers 확인 방법

1. 응답 시트 1행을 봅니다.
2. 각 열 제목을 그대로 확인합니다.
3. `Config.gs`의 `headers`와 하나씩 맞춰 봅니다.

중요:

- 띄어쓰기, 숫자, 괄호가 다르면 다른 이름으로 취급됩니다.
- Google Form 질문 제목을 바꾸면 응답 시트 열 제목도 다시 확인해야 합니다.

### 여기서 복사할 값

- `sheetName`
- 1행의 각 열 제목

### 정상이라면 보이는 결과

- `Config.gs`의 `headers.timestamp`, `headers.name` 같은 항목이 실제 시트 1행 제목과 정확히 대응됩니다.

### 자주 틀리는 부분

- `개념1 이해 정도`와 `개념 1 이해 정도`처럼 띄어쓰기를 다르게 적음
- 탭 이름이 `Form Responses 1`인데 `수업용 응답`이라고 가정함
- 시트 첫 행을 직접 수정해 놓고 `headers`는 옛 이름으로 둠

## 9. Apps Script 프로젝트 만들기

초보자에게는 "독립 Apps Script 프로젝트"를 권장합니다.  
이 방식은 학급용 시트와 수업용 시트가 서로 다른 파일이어도 연결하기 쉽습니다.

### 9-1. 프로젝트 만들기

1. [script.google.com](https://script.google.com)에 들어갑니다.
2. `새 프로젝트`를 만듭니다.
3. 프로젝트 이름을 `classpage-automation`처럼 알아보기 쉽게 바꿉니다.

### 9-2. 파일 만들기

프로젝트 안에서 아래 파일을 준비합니다.

1. `Config.gs`
2. `Code.gs`
3. `appsscript.json`

`appsscript.json`이 안 보이면 에디터 설정에서 `appsscript.json 표시`를 켭니다.

### 9-3. 무엇을 붙여넣어야 하나

아래 파일 내용을 그대로 붙여넣습니다.

- [Config.gs](/Users/hangbokee/classpage/automation/apps-script/Config.gs)
- [Code.gs](/Users/hangbokee/classpage/automation/apps-script/Code.gs)
- [appsscript.json](/Users/hangbokee/classpage/automation/apps-script/appsscript.json)

### 여기서 수정할 값

- 파일 내용은 먼저 그대로 붙여넣습니다.
- 붙여넣은 뒤 `Config.gs`만 수정합니다.

### 정상이라면 보이는 결과

- Apps Script 프로젝트 안에 `Config.gs`, `Code.gs`, `appsscript.json`이 모두 있습니다.

### 자주 틀리는 부분

- `Code.gs`만 붙여넣고 `Config.gs`를 만들지 않음
- `Config.gs` 파일 이름을 다른 이름으로 만들고 내용을 섞어 넣음
- `appsscript.json`을 수정하지 않아도 되는데, 파일 자체를 만들지 않음

## 10. Config.gs에서 반드시 수정해야 하는 값

처음에는 아래 네 종류만 보면 됩니다.

1. 응답 시트 연결
2. 시트 탭 이름
3. 열 제목(headers)
4. JSON 출력 위치

### 10-1. 가장 먼저 수정할 값

아래 값은 거의 반드시 수정해야 합니다.

- `sources.classForm.spreadsheetId`
- `sources.classForm.sheetName`
- `sources.lessonForm.spreadsheetId`
- `sources.lessonForm.sheetName`
- `sources.classForm.headers.*`
- `sources.lessonForm.headers.*`

### 10-2. 처음에는 비워도 되는 값

- `output.driveFolderId`

처음 테스트 단계에서는 비워 두어도 됩니다.  
먼저 `previewClassSummary()`와 `previewLessonSummary()`가 정상 동작하는지 확인하는 것이 우선입니다.

### 10-3. 초보자용 권장 원칙

- `spreadsheetId`는 빈칸으로 두지 말고 항상 직접 넣습니다.
- `sheetName`은 아래 탭 이름을 그대로 복사합니다.
- `headers`는 시트 1행과 한 글자도 다르지 않게 맞춥니다.

## 11. 학급용 설정 예시

아래는 학급용 폼 설정 예시입니다.

```javascript
classForm: {
  spreadsheetId: "1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890",
  sheetName: "학급용 응답",
  formName: "학급용 Google Form",
  formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeBR_cBQFf_CXo6ytCabIMfvStXn_QPSYadonYLKNR6WAT2bg/viewform?usp=header",
  headers: {
    timestamp: "타임스탬프",
    classroom: "반",
    number: "번호",
    name: "이름",
    mood: "오늘 아침 기분",
    moodReason: "기분의 이유",
    goal: "오늘의 목표",
    yesterdayAchievement: "어제 할일 달성도",
    teacherMessage: "선생님께 하고 싶은 말",
    helpedFriend: "최근 도움을 준 친구와 그 이유",
    helpedByFriend: "최근 도움 받은 친구와 그 이유",
  },
}
```

### 여기서 복사할 값

- 학급용 응답 시트 URL에서 `spreadsheetId`
- 아래 탭 이름인 `sheetName`
- 1행의 열 제목

### 여기서 수정할 값

- 실제 사용 중인 시트 이름
- 실제 1행 열 제목
- 학급용 Form URL이 바뀌었으면 `formUrl`

### 정상이라면 보이는 결과

- `previewClassSummary()` 실행 시 `type: "class-summary"`가 보입니다.
- `responseCount`가 0보다 크면 실제 응답을 읽은 것입니다.

## 12. 수업용 설정 예시

아래는 수업용 폼 설정 예시입니다.

```javascript
lessonForm: {
  spreadsheetId: "1ZyXwVuTsRqPoNmLkJiHgFeDcBa0987654321",
  sheetName: "수업용 응답",
  formName: "수업용 Google Form",
  formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSefjZ3vyJs6T5PkkrUQDo2JY1wNh8cHPdeieRWRFVsMzu-_NA/viewform?usp=header",
  headers: {
    timestamp: "타임스탬프",
    classroom: "반",
    number: "번호",
    name: "이름",
    subject: "과목",
    date: "날짜",
    period: "교시",
    lessonUnit: "오늘 배운 단원",
    concept1: "개념 1",
    concept1Understanding: "개념1 이해 정도",
    concept2: "개념 2",
    concept2Understanding: "개념2 이해 정도",
    correctCount: "문제 맞은 개수",
    incorrectCount: "틀린 개수",
    incorrectReason: "틀린 이유",
    teacherMessage: "선생님께 하고 싶은 말",
    assignmentStatus: "과제 수행 정도",
  },
}
```

### 여기서 복사할 값

- 수업용 응답 시트 URL에서 `spreadsheetId`
- 아래 탭 이름인 `sheetName`
- 1행의 열 제목

### 여기서 수정할 값

- 실제 시트 이름
- 실제 열 제목
- 수업용 Form URL이 바뀌었으면 `formUrl`

### 정상이라면 보이는 결과

- `previewLessonSummary()` 실행 시 `type: "lesson-summary"`가 보입니다.
- `subject`, `periodLabel`, `responseCount`가 실제 수업과 맞으면 정상입니다.

## 13. validateAutomationSetup() 실행하기

이 단계는 "시트 연결이 맞는지" 먼저 확인하는 단계입니다.

1. Apps Script 상단 함수 목록에서 `validateAutomationSetup`을 고릅니다.
2. `실행` 버튼을 누릅니다.
3. 처음 실행이라면 권한 승인 창이 뜹니다.
4. 본인 Google 계정으로 승인합니다.

### 여기서 수정할 값

- 없습니다. 먼저 실행만 하면 됩니다.

### 정상이라면 보이는 결과

반환값에 아래와 비슷한 내용이 보입니다.

```json
{
  "classSheet": { "ok": true, "message": "정상 연결" },
  "lessonSheet": { "ok": true, "message": "정상 연결" },
  "outputFolder": { "ok": false, "message": "driveFolderId가 비어 있습니다..." }
}
```

`driveFolderId`가 비어 있어 `outputFolder.ok`가 `false`여도, 미리 보기 단계에서는 문제 아닙니다.

### 자주 틀리는 부분

- 권한 승인 창을 닫아 버림
- `sheetName` 오타
- `spreadsheetId`에 시트 URL 전체를 넣음

## 14. previewClassSummary() / previewLessonSummary() 실행하기

이 단계는 "정말로 집계 JSON이 만들어지는지" 확인하는 단계입니다.

### 14-1. 학급용 미리 보기

1. 함수 목록에서 `previewClassSummary`를 고릅니다.
2. `실행` 버튼을 누릅니다.
3. 실행 결과 창이나 로그에서 JSON을 확인합니다.

### 14-2. 수업용 미리 보기

1. 함수 목록에서 `previewLessonSummary`를 고릅니다.
2. `실행` 버튼을 누릅니다.
3. 실행 결과 창이나 로그에서 JSON을 확인합니다.

### 정상이라면 보이는 결과

학급용은 아래 항목이 보입니다.

- `type: "class-summary"`
- `generatedAt`
- `periodLabel`
- `responseCount`
- `emotionSummary`
- `goalSummary`

수업용은 아래 항목이 보입니다.

- `type: "lesson-summary"`
- `generatedAt`
- `periodLabel`
- `subject`
- `overview`
- `difficultConcepts`
- `studentResults`

### 자주 틀리는 부분

- 학급용은 되는데 수업용만 안 됨
  보통 `headers` 이름이 안 맞거나, `date / period / subject` 열이 비어 있는 경우가 많습니다.
- `responseCount`가 0
  응답 시트 자체가 비었거나, 최근 수업 그룹으로 묶이는 기준이 예상과 다를 수 있습니다.
- `type`은 맞는데 값이 이상함
  열 제목이 다른 질문과 잘못 연결되었을 가능성이 큽니다.

## 15. JSON 생성이 잘 되었는지 확인하는 방법

초보자에게는 아래 두 단계로 확인하는 것을 권장합니다.

### 15-1. 첫 확인은 preview 함수로 한다

이 단계에서는 `driveFolderId` 없이도 됩니다.

이유:

- 시트 연결이 맞는지 바로 확인 가능
- 파일 저장까지 한 번에 보지 않아도 됨
- 오류 원인을 좁히기 쉬움

### 15-2. 그 다음에 Drive 파일 생성으로 간다

1. Google Drive에서 폴더 하나를 만듭니다.
2. 폴더를 열고 주소창 URL을 확인합니다.
3. 폴더 URL에서 마지막 ID를 복사합니다.
4. `Config.gs`의 `output.driveFolderId`에 넣습니다.
5. `refreshAllSummaries()`를 실행합니다.

Drive 폴더 주소 예시:

```text
https://drive.google.com/drive/folders/1QwErTyUiOpAsDfGhJkLzXcVbNm123456
```

여기서 `1QwErTyUiOpAsDfGhJkLzXcVbNm123456` 이 `driveFolderId` 입니다.

### 정상이라면 보이는 결과

- Drive 폴더 안에 `class-summary.json` 파일이 생깁니다.
- Drive 폴더 안에 `lesson-summary.json` 파일이 생깁니다.
- 다시 실행하면 같은 파일 내용이 갱신됩니다.

### 자주 틀리는 부분

- 폴더가 아니라 파일 주소를 복사함
- `driveFolderId`를 넣지 않았는데 파일 생성이 안 된다고 생각함
- 파일은 생겼지만 내용이 비어 있음
  이 경우 먼저 `previewClassSummary()`, `previewLessonSummary()` 결과부터 다시 확인합니다.

## 16. classpage에서 JSON 경로 연결하기

중요:

`classpage`는 Google Drive 링크를 직접 읽지 않습니다.  
`classpage`는 Obsidian 볼트 안의 로컬 JSON 파일 경로를 읽습니다.

따라서 처음 테스트는 아래처럼 하는 것이 가장 쉽습니다.

### 16-1. 볼트 안에 JSON 폴더 만들기

`볼트 루트`는 Obsidian에서 현재 열어 둔 작업 폴더의 맨 위를 뜻합니다.  
Obsidian 왼쪽 파일 탐색기에서 가장 바깥쪽 폴더가 보이면 그 위치가 볼트 루트입니다.

1. Obsidian 볼트 루트에 `classpage-data` 폴더를 만듭니다.
2. 아래 파일 두 개를 준비합니다.

- `classpage-data/class-summary.json`
- `classpage-data/lesson-summary.json`

처음에는 Obsidian 파일 탐색기에서 직접 새 폴더와 새 파일을 만드는 편이 가장 덜 헷갈립니다.

### 16-2. JSON 내용을 넣기

아래 둘 중 하나를 사용하면 됩니다.

1. `previewClassSummary()`, `previewLessonSummary()` 결과를 복사해 붙여넣기
2. Drive에 생성된 JSON 파일 내용을 복사해 붙여넣기

### 16-3. classpage 설정 확인

Obsidian에서 아래로 들어갑니다.

1. `Settings`
2. `classpage`
3. 교사용 페이지 설정

기본 경로는 아래처럼 맞춰 두면 됩니다.

- 학급 집계 JSON 경로: `classpage-data/class-summary.json`
- 수업 집계 JSON 경로: `classpage-data/lesson-summary.json`

### 정상이라면 보이는 결과

- 교사용 페이지에서 집계 연결 상태가 보입니다.
- 학급 집계 카드가 보입니다.
- 수업 집계 카드가 보입니다.

### 자주 틀리는 부분

- Drive URL을 경로 칸에 넣음
- `classpage-data/class-summary.json` 대신 절대 경로를 넣음
- 파일 이름이 `class-summary (1).json`처럼 달라짐
- JSON 내용이 깨져 있어 파싱되지 않음

### 16-4. classpage 설정에서 자주 바꾸는 항목

학생용 페이지 설정에서 주로 바꾸는 항목:

- 학급용 폼 Google Form 링크
- 수업용 폼 Google Form 링크
- 오늘의 할 일
- 공지사항

교사용 페이지 설정에서 주로 바꾸는 항목:

- 학급 집계 JSON 경로
- 수업 집계 JSON 경로

### 여기서 붙여넣는 위치

- 학급용 Form URL
  `Settings -> classpage -> 학급용 폼 -> Google Form 링크`
- 수업용 Form URL
  `Settings -> classpage -> 수업용 폼 -> Google Form 링크`
- 학급용 JSON 경로
  `Settings -> classpage -> 집계 JSON 경로 -> 학급 집계 JSON 경로`
- 수업용 JSON 경로
  `Settings -> classpage -> 집계 JSON 경로 -> 수업 집계 JSON 경로`

### 정상이라면 보이는 결과

- 학생용 페이지 버튼이 실제 Form으로 열립니다.
- 교사용 페이지에서 집계 파일 상태가 `연결됨`으로 바뀝니다.

## 17. 문제가 생겼을 때 어디를 먼저 확인할까

아래 순서대로 보면 대부분 원인을 찾을 수 있습니다.

### 1순위: validateAutomationSetup()

먼저 시트 연결이 정상인지 봅니다.

- `sheetName` 오타가 없는지
- `spreadsheetId`가 맞는지
- 권한 승인이 끝났는지

### 2순위: previewClassSummary() / previewLessonSummary()

시트는 열리지만 집계 값이 이상하면 여기서 드러납니다.

- `responseCount`
- `periodLabel`
- `subject`
- `emotionSummary`
- `difficultConcepts`

### 3순위: headers

가장 자주 틀리는 부분입니다.

- 시트 1행 제목과 `Config.gs`가 정확히 같은지
- 띄어쓰기 차이가 없는지
- 질문 제목을 바꾼 뒤 시트 열 제목도 다시 확인했는지

### 4순위: 볼트 안 JSON 파일

Apps Script는 정상인데 classpage에서 안 보이면 여기입니다.

- 파일이 실제로 볼트 안에 있는지
- 파일명이 정확한지
- JSON 문법이 깨지지 않았는지

### 5순위: classpage 경로 설정

- `classpage-data/class-summary.json`
- `classpage-data/lesson-summary.json`

이 두 경로가 실제 파일 위치와 맞는지 확인합니다.

## 18. 자주 생기는 실패 사례

### 사례 1. validate는 되는데 preview 결과가 이상함

원인 후보:

- `headers` 매핑이 잘못됨
- 질문 제목을 바꿨는데 시트 열 제목을 다시 확인하지 않음

### 사례 2. 학급용은 보이는데 수업용은 비어 있음

원인 후보:

- `date`, `period`, `subject` 열 이름이 다름
- 최신 수업 그룹으로 묶이는 기준이 현재 응답과 다름

### 사례 3. Apps Script에서는 JSON이 보이는데 Obsidian에서는 안 보임

원인 후보:

- JSON 파일이 볼트 안이 아니라 다른 폴더에 있음
- classpage 설정 경로가 틀림
- JSON 파일명이 다름

### 사례 4. Drive 파일은 생기는데 내용이 기대와 다름

원인 후보:

- 미리 보기 단계에서 규칙을 충분히 확인하지 않음
- 실제 응답 문구가 `emotionBuckets`, `goalBuckets`, `assignmentBuckets`와 잘 맞지 않음

## 19. 폼을 새로 만들었을 때 갱신해야 하는 항목 체크리스트

폼 문항이나 연결이 바뀌면 아래를 순서대로 확인하면 됩니다.

1. 새 Google Form URL 확인
2. 새 응답 시트의 `spreadsheetId` 확인
3. 새 응답 시트의 `sheetName` 확인
4. 새 응답 시트 1행 `headers` 확인
5. `Config.gs`의 `formUrl` 갱신
6. `Config.gs`의 `spreadsheetId` 갱신
7. `Config.gs`의 `sheetName` 갱신
8. `Config.gs`의 `headers` 갱신
9. `validateAutomationSetup()` 다시 실행
10. `previewClassSummary()` 또는 `previewLessonSummary()` 다시 실행
11. 학생용 페이지 버튼 링크도 새 Form URL로 바뀌어야 하면 classpage 설정에서 함께 수정

## 20. 지금 단계에서 굳이 하지 않아도 되는 것

처음 세팅 단계에서는 아래를 억지로 한 번에 붙일 필요가 없습니다.

- Web App 배포
- 폼 제출 즉시 트리거
- 복잡한 동기화 자동화
- 규칙 고도화

처음에는 아래만 되면 충분합니다.

1. 응답 시트 연결
2. `Config.gs` 수정
3. `preview...` 함수 정상 실행
4. JSON 파일 생성 또는 복사
5. classpage 교사용 페이지에서 표시 확인

## 21. 추천 시작 순서

처음 세팅할 때는 아래 순서를 권장합니다.

1. 학급용 폼만 먼저 연결합니다.
2. `previewClassSummary()`가 정상인지 확인합니다.
3. 그 다음 수업용 폼을 연결합니다.
4. `previewLessonSummary()`를 확인합니다.
5. 마지막에 JSON 파일을 볼트에 넣고 classpage에서 확인합니다.

이 순서가 좋은 이유는 문제가 생겼을 때 어디가 잘못되었는지 범위를 줄이기 쉽기 때문입니다.

수동 복사까지 성공한 뒤 Drive 자동 갱신 + Mac 자동 복사 방식으로 넘어가려면 [docs/DRIVE_SYNC_SETUP.md](/Users/hangbokee/classpage/docs/DRIVE_SYNC_SETUP.md) 를 이어서 보면 됩니다.
