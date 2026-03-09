# classpage Drive 자동 갱신 + Mac 자동 복사 가이드

이 문서는 아래 구조를 초보자도 따라할 수 있게 설명합니다.

`Google Form -> Google Sheets -> Apps Script -> Google Drive 폴더 -> Mac 동기화 폴더 -> Obsidian 볼트 classpage-data -> classpage 교사용 페이지`

이 방식의 장점은 다음과 같습니다.

- `classpage` 플러그인을 무겁게 만들지 않습니다.
- 중간 결과인 JSON 파일을 눈으로 직접 확인할 수 있습니다.
- 문제가 생기면 어느 단계에서 막혔는지 추적하기 쉽습니다.
- URL fetch나 인증 처리를 플러그인 안에 넣지 않아도 됩니다.

## 1. 추천 자동 연동 구조

가장 단순하고 안정적인 운영 방식은 아래입니다.

1. Apps Script가 `refreshAllSummaries()`로 `class-summary.json`, `lesson-summary.json`을 Google Drive 폴더에 갱신합니다.
2. Google Drive for desktop이 그 폴더를 Mac 로컬 동기화 폴더로 내려받습니다.
3. Mac의 짧은 쉘 스크립트가 그 JSON 파일을 Obsidian 볼트의 `classpage-data/` 폴더로 복사합니다.
4. `classpage`는 기존처럼 로컬 JSON만 읽습니다.

이 구조를 권장하는 이유는 다음과 같습니다.

- Apps Script는 Drive 파일 갱신까지만 담당합니다.
- Mac은 로컬 파일 복사만 담당합니다.
- Obsidian 플러그인은 계속 로컬 파일 읽기만 담당합니다.

역할이 섞이지 않아서 유지보수가 쉽습니다.

## 2. 시작 전에 준비할 것

아래가 준비되어 있으면 됩니다.

1. `classpage`가 BRAT로 설치된 Obsidian 볼트
2. Apps Script 설정이 끝난 상태
3. `refreshAllSummaries()`가 이미 동작하는 상태
4. Google Drive for desktop이 Mac에 설치된 상태
5. Obsidian 볼트 안에 `classpage-data/` 폴더를 만들 수 있는 상태

아직 Apps Script 설정이 끝나지 않았다면 [docs/BEGINNER_SETUP.md](/Users/hangbokee/classpage/docs/BEGINNER_SETUP.md) 의 6단계부터 16단계까지 먼저 끝내는 편이 좋습니다.

## 3. Apps Script 측 운영 방식

Apps Script 쪽에서는 아래만 유지하면 됩니다.

1. 응답 시트를 읽는다.
2. `refreshAllSummaries()`를 실행한다.
3. 지정한 Drive 폴더에 JSON 두 개를 쓴다.

### 3-1. Config.gs에서 확인할 값

아래 값이 중요합니다.

- `output.driveFolderId`
- `output.classFileName`
- `output.lessonFileName`

권장값은 아래와 같습니다.

- `classFileName`: `class-summary.json`
- `lessonFileName`: `lesson-summary.json`

이 파일명은 가능하면 바꾸지 않는 편이 좋습니다.  
Mac 복사 스크립트와 Obsidian 설정이 이 이름을 기준으로 맞춰지기 때문입니다.

### 여기서 복사할 값

- Google Drive 폴더 URL에서 `driveFolderId`

### 여기서 수정할 값

- [Config.gs](/Users/hangbokee/classpage/automation/apps-script/Config.gs) 의 `output.driveFolderId`

### 정상이라면 보이는 결과

- `refreshAllSummaries()` 실행 후 Drive 폴더 안에 `class-summary.json`
- `refreshAllSummaries()` 실행 후 Drive 폴더 안에 `lesson-summary.json`

### 자주 틀리는 부분

- Drive 폴더가 아니라 파일 URL을 복사함
- `driveFolderId`를 비워 둔 채 파일 생성이 안 된다고 생각함
- 파일명까지 바꿔 놓고 Mac 스크립트는 옛 이름을 그대로 둠

## 4. Google Drive 폴더 준비하기

Apps Script가 JSON을 쓸 전용 폴더를 하나 만드는 것을 권장합니다.

예시 폴더 이름:

- `classpage-sync`
- `classpage-json`

### 4-1. Drive 폴더 만들기

1. Google Drive를 엽니다.
2. 새 폴더를 만듭니다.
3. 예를 들어 `classpage-sync` 라는 이름을 붙입니다.
4. 폴더를 열고 URL을 확인합니다.

예시 URL:

```text
https://drive.google.com/drive/folders/1QwErTyUiOpAsDfGhJkLzXcVbNm123456
```

여기서 `1QwErTyUiOpAsDfGhJkLzXcVbNm123456` 가 `driveFolderId` 입니다.

### 4-2. Apps Script 연결

1. `Config.gs`를 엽니다.
2. `output.driveFolderId`에 방금 복사한 값을 넣습니다.
3. `refreshAllSummaries()`를 실행합니다.

### 정상이라면 보이는 결과

- Drive 폴더에 JSON 파일 2개가 생깁니다.

## 5. Apps Script 자동 갱신 설정

초보자에게는 시간 기반 트리거가 가장 단순합니다.

### 권장 방식

- `installRefreshTrigger()`를 한 번 실행
- 15분 간격으로 `refreshAllSummaries()` 자동 실행

이 방식이 좋은 이유는 다음과 같습니다.

- 폼 제출 즉시 트리거보다 설정이 단순합니다.
- 실패했을 때 원인 추적이 쉽습니다.
- 최신 상태에 충분히 가까운 교사용 대시보드를 만들 수 있습니다.

### 여기서 실행할 함수

- `installRefreshTrigger()`

### 정상이라면 보이는 결과

- Apps Script 트리거 목록에 `refreshAllSummaries` 시간 트리거가 생깁니다.

### 자주 틀리는 부분

- `refreshAllSummaries()`만 한 번 실행하고 자동 트리거는 만들지 않음
- 권한 승인 창을 닫아 버려 트리거 생성이 끝나지 않음

## 6. Mac에서 Google Drive 동기화 폴더 찾기

Google Drive for desktop을 쓰면 보통 아래 같은 위치에 동기화 폴더가 생깁니다.

예시:

```text
/Users/사용자이름/Library/CloudStorage/GoogleDrive-계정이름/My Drive/classpage-sync
```

또는 계정/설정에 따라 폴더 이름이 조금 다를 수 있습니다.

### 가장 쉬운 확인 방법

1. Finder를 엽니다.
2. 왼쪽 사이드바에서 Google Drive를 찾습니다.
3. 방금 만든 `classpage-sync` 폴더를 엽니다.
4. `class-summary.json`, `lesson-summary.json` 이 실제로 내려오는지 확인합니다.

### 여기서 복사할 값

- Mac에서 보이는 실제 Drive 폴더 절대 경로

### 정상이라면 보이는 결과

- Finder에서 JSON 두 파일이 보입니다.
- 파일을 열면 Apps Script가 만든 JSON 내용이 들어 있습니다.

### 자주 틀리는 부분

- 웹의 Google Drive 경로와 Mac 로컬 경로를 혼동함
- 아직 Google Drive for desktop 동기화가 끝나기 전에 다음 단계로 넘어감
- 로컬에 `내 드라이브`가 아니라 다른 계정 폴더를 보고 있음

## 7. Obsidian 볼트의 대상 폴더 정하기

`classpage`는 로컬 JSON 파일만 읽습니다.  
따라서 목표 폴더는 Obsidian 볼트 안의 `classpage-data/` 입니다.

예시:

```text
/Users/사용자이름/Documents/Obsidian/MySchoolVault/classpage-data
```

### 준비 방법

1. Obsidian에서 현재 쓰는 볼트를 엽니다.
2. 파일 탐색기에서 볼트 루트에 `classpage-data` 폴더를 만듭니다.
3. 폴더가 실제로 존재하는지 Finder에서도 확인합니다.

### 여기서 복사할 값

- Obsidian 볼트 안 `classpage-data` 폴더의 절대 경로

### 정상이라면 보이는 결과

- Finder에서 `classpage-data` 폴더가 보입니다.

## 8. 가장 단순한 Mac 자동 복사 방식

가장 단순한 방식은 짧은 쉘 스크립트 하나를 주기적으로 실행하는 것입니다.

권장 이유:

- 설치가 쉽습니다.
- 중간 파일을 눈으로 확인할 수 있습니다.
- 실패 시 스크립트만 따로 테스트할 수 있습니다.

이 저장소에는 예시 스크립트를 넣어 두었습니다.

- [sync_classpage_json.sh](/Users/hangbokee/classpage/automation/mac/sync_classpage_json.sh)

## 9. 쉘 스크립트 적용 방법

### 9-1. 스크립트 복사

원하는 위치에 스크립트를 둡니다.

권장 예시:

```text
/Users/사용자이름/bin/sync-classpage-json.sh
```

### 9-2. 스크립트에서 수정할 값

스크립트 상단의 아래 두 값만 바꾸면 됩니다.

- `DRIVE_JSON_DIR`
- `OBSIDIAN_JSON_DIR`

예시:

```bash
DRIVE_JSON_DIR="$HOME/Library/CloudStorage/GoogleDrive-myaccount/My Drive/classpage-sync"
OBSIDIAN_JSON_DIR="$HOME/Documents/Obsidian/MySchoolVault/classpage-data"
```

### 9-3. 실행 권한 주기

터미널에서 아래를 실행합니다.

```bash
chmod +x /Users/사용자이름/bin/sync-classpage-json.sh
```

### 9-4. 수동 테스트

터미널에서 아래를 실행합니다.

```bash
/Users/사용자이름/bin/sync-classpage-json.sh
```

### 정상이라면 보이는 결과

- `synced class-summary.json`
- `synced lesson-summary.json`

또는 파일이 바뀌지 않았다면 `unchanged` 메시지가 보일 수 있습니다.

### 자주 틀리는 부분

- 스크립트 안 경로에 따옴표를 빼먹음
- 공백이 들어간 경로를 그대로 두고 따옴표를 안 씀
- `chmod +x`를 하지 않아 실행이 안 됨

## 10. macOS에서 가장 가벼운 주기 실행 방법

가장 가벼운 기본 방법은 `launchd` 입니다.  
추가 앱을 설치하지 않아도 되고, macOS 기본 방식이라 안정적입니다.

이 저장소에는 예시 plist를 넣어 두었습니다.

- [com.classpage.sync-json.plist.example](/Users/hangbokee/classpage/automation/mac/com.classpage.sync-json.plist.example)

### 10-1. plist에서 수정할 값

아래 placeholder를 실제 절대 경로로 바꿉니다.

- `__SCRIPT_PATH__`
- `__STDOUT_PATH__`
- `__STDERR_PATH__`

예시:

- `__SCRIPT_PATH__` -> `/Users/사용자이름/bin/sync-classpage-json.sh`
- `__STDOUT_PATH__` -> `/Users/사용자이름/Library/Logs/classpage-sync.out.log`
- `__STDERR_PATH__` -> `/Users/사용자이름/Library/Logs/classpage-sync.err.log`

### 10-2. LaunchAgents에 배치

수정한 파일을 아래 위치에 둡니다.

```text
/Users/사용자이름/Library/LaunchAgents/com.classpage.sync-json.plist
```

### 10-3. 로드하기

터미널에서 아래를 실행합니다.

```bash
launchctl bootstrap "gui/$(id -u)" "$HOME/Library/LaunchAgents/com.classpage.sync-json.plist"
launchctl kickstart -k "gui/$(id -u)/com.classpage.sync-json"
```

이미 같은 항목을 한 번 올린 적이 있으면 먼저 아래를 실행한 뒤 다시 올립니다.

```bash
launchctl bootout "gui/$(id -u)" "$HOME/Library/LaunchAgents/com.classpage.sync-json.plist"
launchctl bootstrap "gui/$(id -u)" "$HOME/Library/LaunchAgents/com.classpage.sync-json.plist"
launchctl kickstart -k "gui/$(id -u)/com.classpage.sync-json"
```

### 정상이라면 보이는 결과

- 로그인 후 자동으로 스크립트가 실행됩니다.
- 기본 예시는 5분마다 동작합니다.
- 로그 파일에 실행 기록이 남습니다.

### 자주 틀리는 부분

- plist 안 placeholder를 실제 경로로 안 바꿈
- 스크립트는 있는데 plist가 다른 파일명을 가리킴
- `launchctl`을 실행했는데 로그 파일이 생기지 않음
  이 경우 plist 경로나 파일 권한을 다시 확인합니다.

## 11. classpage 설정은 그대로 로컬 경로만 사용하기

Obsidian `Settings -> classpage` 에서는 기존 로컬 경로를 그대로 유지하면 됩니다.

- 학급 집계 JSON 경로: `classpage-data/class-summary.json`
- 수업 집계 JSON 경로: `classpage-data/lesson-summary.json`

이 구조의 핵심은 여기입니다.

- Apps Script는 Drive까지
- Mac 스크립트는 볼트 복사까지
- classpage는 로컬 읽기만

## 12. 초보자용 적용 순서

처음에는 아래 순서대로 하면 됩니다.

1. [docs/BEGINNER_SETUP.md](/Users/hangbokee/classpage/docs/BEGINNER_SETUP.md) 로 수동 연결을 먼저 성공시킵니다.
2. Apps Script `output.driveFolderId`를 설정합니다.
3. `refreshAllSummaries()`를 실행해서 Drive에 JSON이 생기는지 봅니다.
4. `installRefreshTrigger()`를 실행합니다.
5. Mac에서 Google Drive 동기화 폴더에 JSON이 내려오는지 봅니다.
6. `classpage-data/` 폴더의 절대 경로를 확인합니다.
7. [sync_classpage_json.sh](/Users/hangbokee/classpage/automation/mac/sync_classpage_json.sh) 의 두 경로를 수정합니다.
8. 쉘 스크립트를 수동 실행해 JSON이 볼트로 복사되는지 봅니다.
9. Obsidian 교사용 페이지에서 `연결됨` 상태가 보이는지 확인합니다.
10. 마지막으로 `launchd`를 연결해 주기 실행을 붙입니다.

## 13. 자주 생길 수 있는 문제와 확인 포인트

### 문제 1. Drive에는 JSON이 없고 Apps Script만 있다

먼저 확인할 것:

- `output.driveFolderId`
- `refreshAllSummaries()` 직접 실행 결과
- Apps Script 권한 승인

### 문제 2. Drive에는 JSON이 있는데 Mac 로컬 폴더에는 없다

먼저 확인할 것:

- Google Drive for desktop 동기화 상태
- Finder에서 실제 동기화 폴더를 보고 있는지
- 계정이 여러 개인 경우 올바른 계정 폴더인지

### 문제 3. Mac에는 JSON이 있는데 Obsidian에는 반영되지 않는다

먼저 확인할 것:

- 쉘 스크립트의 `DRIVE_JSON_DIR`
- 쉘 스크립트의 `OBSIDIAN_JSON_DIR`
- 수동 실행 시 오류 메시지가 없는지

### 문제 4. 교사용 페이지에서 여전히 빈 상태가 보인다

먼저 확인할 것:

- `Settings -> classpage` 의 JSON 경로
- 실제 볼트 안 `classpage-data/` 파일 존재 여부
- JSON 파일 이름이 정확한지

### 문제 5. JSON이 깨져서 읽히지 않는다

이 저장소의 예시 스크립트는 복사 전에 JSON 형식을 검사합니다.  
스크립트 실행 로그에 `invalid JSON` 이 보이면, 먼저 Drive 쪽 원본 파일 내용을 열어 봅니다.

## 14. 추천 운영 습관

운영은 아래처럼 하면 가장 안정적입니다.

1. 처음에는 수동 미리 보기와 수동 복사로 한 번 성공한다.
2. 그 다음 Drive 자동 갱신을 붙인다.
3. 그 다음 Mac 자동 복사를 붙인다.
4. 마지막에만 `launchd` 주기 실행을 붙인다.

이 순서가 좋은 이유는 문제가 생겼을 때 어디가 원인인지 한 단계씩 좁힐 수 있기 때문입니다.
