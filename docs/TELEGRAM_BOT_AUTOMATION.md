# 텔레그램 행복이봇 자동 결과 전송 가이드

이 문서는 `@hangbokee_bot`으로 작업 지시를 주고, 작업이 끝난 뒤 결과 메시지와 `#codex받음` 같은 확인 메시지를 자동으로 보내고 싶을 때 쓰는 로컬 자동화 가이드입니다.

중요:

- 토큰과 `chat id`는 이 저장소에 넣지 않습니다.
- 실제 비밀값은 로컬 `.env.local` 파일에만 둡니다.
- 이 자동화는 `classpage` 플러그인 본체 기능이 아니라, 개인 운영용 보조 스크립트입니다.
- 현재 기본 운영 모드는 텔레그램에서 `#codex작업시작`을 받아 Codex CLI를 실행하는 inbound bridge입니다.
- Codex Desktop 스레드 자동 전달은 옵션 기능이며, 현재 기본 예시는 꺼진 상태로 설명합니다.
- 텔레그램에서 들어온 작업은 여전히 별도 `codex exec` 세션으로 실행됩니다.

## 1. 들어 있는 스크립트

- `npm run telegram:chat-id`
  먼저 봇과 대화를 시작한 뒤 현재 `chat id`를 찾습니다.
- `npm run telegram:send`
  이미 만들어 둔 결과 메시지를 텔레그램으로 보냅니다.
- `npm run telegram:wrap`
  명령을 실행하고, 끝나면 `#codex받음` 같은 확인 메시지를 먼저 보내고, 바로 뒤에 결과 메시지를 자동 전송합니다.
- `npm run telegram:bridge`
  텔레그램에서 `#codex작업시작`을 감지해 Codex CLI를 실행하고, 끝나면 `#codex받음`과 결과 메시지를 답장으로 보냅니다. 성공적으로 끝난 결과 본문 맨 끝에는 `#codex완료`가 붙습니다.

권장 흐름은 `telegram:wrap` 입니다.

## 2. 비밀값은 어디에 넣는가

저장소 루트에 `.env.local` 파일을 만듭니다.

예시는 [.env.example](/Users/hangbokee/classpage/.env.example)에 있습니다.

```env
CLASSPAGE_TELEGRAM_BOT_USERNAME=@hangbokee_bot
CLASSPAGE_TELEGRAM_BOT_TOKEN=실제_토큰
CLASSPAGE_TELEGRAM_CHAT_ID=실제_chat_id
CLASSPAGE_TELEGRAM_ACK_MESSAGE=#codex받음
CLASSPAGE_TELEGRAM_FAILURE_ACK_MESSAGE=#codex실패
CLASSPAGE_TELEGRAM_TRIGGER_COMMAND=#codex작업시작
CLASSPAGE_TELEGRAM_STOP_COMMAND=#중지
CLASSPAGE_TELEGRAM_STATUS_COMMAND=#상태
CLASSPAGE_TELEGRAM_RESUME_COMMAND=#작업재개
CLASSPAGE_TELEGRAM_PROGRESS_MESSAGE=#codex작업중
CLASSPAGE_TELEGRAM_MODE_PREFIX=#행복이 모드
CLASSPAGE_TELEGRAM_STOPPING_MESSAGE=#codex중지요청
CLASSPAGE_TELEGRAM_STOPPED_MESSAGE=#codex중지됨
CLASSPAGE_TELEGRAM_COMPLETED_MESSAGE=#codex완료
CLASSPAGE_CODEX_WORKDIR=/Users/hangbokee/classpage
CLASSPAGE_CODEX_EXECUTABLE=codex
CLASSPAGE_CODEX_DESKTOP_WATCH_ENABLED=false
CLASSPAGE_CODEX_DESKTOP_THREAD_SOURCES=vscode
```

주의:

- `.env.local`은 `.gitignore`에 들어 있으므로 커밋되지 않습니다.
- 토큰은 채팅으로 보내지 말고, 직접 이 파일에만 넣는 편이 안전합니다.

## 3. chat id 찾는 방법

1. 텔레그램에서 `@hangbokee_bot`과 대화를 시작합니다.
2. 아무 메시지나 한 번 보냅니다.
3. 아래 명령을 실행합니다.

```bash
npm run telegram:chat-id
```

출력된 값 중 원하는 숫자를 `.env.local`의 `CLASSPAGE_TELEGRAM_CHAT_ID`에 넣으면 됩니다.

## 4. 가장 간단한 수동 전송

결과 메시지 파일이 이미 있다면:

```bash
npm run telegram:send -- --file .tmp/result.txt --ack-message "#codex받음"
```

바로 텍스트를 보내고 싶다면:

```bash
printf '작업이 끝났습니다.\n1. 수정한 파일 ...' | npm run telegram:send -- --stdin --ack-message "#codex받음"
```

## 5. 자동 래퍼로 보내기

가장 실용적인 방식은 "명령 실행 -> 결과 파일 읽기 -> `#codex받음` 전송 -> 텔레그램 본문 전송" 순서입니다.

예시:

```bash
npm run telegram:wrap -- --summary-file .tmp/codex-final.txt -- zsh -lc 'node some-task.js'
```

이 명령은 아래 순서로 동작합니다.

1. `node some-task.js`를 실행합니다.
2. 명령이 끝나면 `.tmp/codex-final.txt`를 읽습니다.
3. `#codex받음`을 먼저 보냅니다.
4. 그다음 결과 본문을 텔레그램으로 보냅니다.

즉, 작업 본문과 확인 메시지를 따로 복붙하지 않아도 됩니다.

## 6. 결과 파일이 없을 때

`--summary-file`이 없으면 wrapper는 아래 순서로 요약을 찾습니다.

1. stdout/stderr 안의 `## TELEGRAM RESULT` 블록
2. 없으면 마지막 출력 일부

예:

```bash
npm run telegram:wrap -- -- zsh -lc 'echo "로그"; echo "## TELEGRAM RESULT"; echo "작업 완료"; echo "1. 수정한 파일 ..."; echo "## END TELEGRAM RESULT"'
```

이 경우 `## TELEGRAM RESULT`와 `## END TELEGRAM RESULT` 사이 내용만 전송합니다.

로그가 많은 작업이라면 `--summary-file`을 쓰는 편이 훨씬 안정적입니다.

## 7. 실패했을 때도 보내고 싶다면

실패 알림까지 보내려면 `--send-on-failure`를 붙입니다.

```bash
npm run telegram:wrap -- --send-on-failure --summary-file .tmp/codex-final.txt -- zsh -lc 'node some-task.js'
```

이 경우:

- 성공하면 `#codex받음` + 본문
- 실패하면 `#codex실패` + 실패 본문

처럼 보낼 수 있습니다.

## 8. dry-run으로 먼저 확인하기

실제 전송 전, 내용만 보고 싶다면:

```bash
npm run telegram:wrap -- --dry-run --summary-file .tmp/codex-final.txt -- zsh -lc 'echo test'
```

이 명령은 텔레그램에 보내지 않고, 지금 어떤 본문과 확인 메시지가 나갈지만 터미널에 보여줍니다.

## 9. 추천 운영 방식

가장 덜 헷갈리는 방식은 아래입니다.

1. 작업 스크립트가 끝날 때 `.tmp/codex-final.txt` 같은 짧은 요약 파일을 만듭니다.
2. `npm run telegram:wrap -- --summary-file ... -- <명령>` 형태로 실행합니다.
3. 텔레그램에는 지금 Codex 최종 답변처럼 짧은 마감 요약만 보냅니다.
4. 전송 시 `#codex받음`이 먼저 찍히고, 바로 뒤에 결과 본문이 따라옵니다.

## 10. 지금 이 자동화의 한계

- 텔레그램 inbound bridge는 별도 `codex exec` 세션으로 동작합니다.
- 데스크톱 스레드 자동 전달은 `classpage` 작업 폴더와 `vscode` source 기준으로 감지합니다.
- 이미 끝나 있던 과거 스레드는 처음 켤 때 한 번 기준점만 잡고, 그 이후 새 final 답변부터 전달합니다.
- `XLSX`, Google Sheets, classpage 플러그인 본체 기능과는 별개입니다.

## 11. 텔레그램 inbound bridge 쓰기

이제는 아래 흐름도 가능합니다.

1. 행복이봇이 작업 프롬프트를 채팅에 올립니다.
2. 사용자가 그 메시지에 답장으로 `#codex작업시작`을 보냅니다.
3. bridge가 답장한 원문을 프롬프트로 꺼냅니다.
4. `#codex작업중`을 먼저 답장으로 남깁니다.
5. 로컬에서 `codex exec`를 실행합니다.
6. 끝나면 `#codex받음`과 결과 본문을 차례로 답장합니다.

즉, 텔레그램에서는 보통 이렇게 보입니다.

```text
행복이봇:
(작업 프롬프트)

사용자:
#codex작업시작

행복이봇:
#codex작업중

행복이봇:
#codex받음

행복이봇:
(작업 결과)
```

추가 명령도 함께 쓸 수 있습니다.

- `#상태`
  현재 bridge가 idle인지, 작업 중인지, 중지 요청이 들어간 상태인지 알려줍니다.
- `#중지`
  지금 진행 중인 Codex CLI 작업이 있으면 멈추도록 요청합니다.
- `#작업재개`
  마지막으로 `#중지`된 작업이 있으면 그 프롬프트와 직전 출력 일부를 이어받아 다시 시작합니다.

성공적으로 끝난 작업 결과 본문 맨 끝에는 `#codex완료`가 붙습니다. 그래서 `#상태`를 조회했을 때 이미 idle이어도, 직전에 온 결과 메시지가 정상 완료였는지 채팅만 보고 바로 구분할 수 있습니다.

작업이 이미 돌고 있을 때 새 `#codex작업시작`을 보내면, bridge는 새 작업을 바로 겹쳐 돌리지 않고 `#상태` 또는 `#중지`를 먼저 안내합니다.

## 11-A. classpage 데스크톱 스레드 자동 전달

이 기능은 옵션입니다. 현재 기본 예시는 `CLASSPAGE_CODEX_DESKTOP_WATCH_ENABLED=false`로 두고, 텔레그램 inbound 작업만 켠 상태를 기준으로 설명합니다.

이제 `classpage` 프로젝트에서 열린 Codex Desktop 스레드도 자동 전달됩니다.

동작 방식은 아래와 같습니다.

1. Codex Desktop에서 `/Users/hangbokee/classpage` 스레드가 진행됩니다.
2. 최종 답변이 `final_answer`로 저장되면 bridge가 이를 감지합니다.
3. 텔레그램에 `#codex받음`을 먼저 보냅니다.
4. 이어서 `[classpage 데스크톱 스레드]` 머리말과 함께 최종 답변 본문을 보냅니다.

즉, 이 데스크톱 스레드에서 바로 작업해도 결과가 행복이봇 채팅으로 따라갑니다.

### 11-1. bridge 시작

```bash
npm run telegram:bridge
```

이 명령은 계속 실행되면서 아래 2가지를 함께 감시합니다.

- 새 `#codex작업시작` 텔레그램 메시지
- `classpage` 데스크톱 스레드의 새 final 답변

한 번만 확인하고 끝내고 싶다면:

```bash
npm run telegram:bridge -- --once
```

### 11-2. 어떤 메시지를 프롬프트로 쓰는가

- 가장 권장하는 방식은 `작업 프롬프트가 적힌 메시지에 답장`한 뒤 `#codex작업시작`만 보내는 것입니다.
- 또는 트리거 뒤에 바로 작업 내용을 붙여도 됩니다.
- 둘 다 있으면 `답장한 원문 + 추가 지시`를 함께 프롬프트로 씁니다.

예:

```text
#codex작업시작
빌드 오류까지 같이 확인해줘
```

### 11-3. 로컬에 남는 파일

bridge는 아래 폴더에 작업 기록을 남깁니다.

- `.tmp/telegram-codex-bridge/state.json`
- `.tmp/telegram-codex-bridge/jobs/.../prompt.txt`
- `.tmp/telegram-codex-bridge/jobs/.../result.txt`
- `.tmp/telegram-codex-bridge/jobs/.../stdout.log`
- `.tmp/telegram-codex-bridge/jobs/.../stderr.log`

이때 `state.json`에는 텔레그램 update id 뿐 아니라, 어떤 데스크톱 스레드 final 답변을 이미 보냈는지도 함께 저장됩니다.

오류가 나면 텔레그램 메시지에도 해당 작업 폴더 경로가 함께 들어갑니다.

### 11-4. 주의

- bridge는 한 번에 하나의 작업을 순서대로 처리합니다.
- 작업 중 새 `#codex작업시작`이 오면 겹쳐 실행하지 않고, 현재 작업이 있다는 안내를 먼저 보냅니다.
- 작업 중 `#상태`는 바로 응답하고, `#중지`는 현재 child process를 종료하도록 요청합니다.
- 데스크톱 스레드 전달은 텔레그램 long polling 사이클에 맞춰 확인하므로, 보통 수 초에서 최대 약 20초 정도 늦게 도착할 수 있습니다.
- 기본 실행은 로컬 전체 작업이 가능한 `codex exec --dangerously-bypass-approvals-and-sandbox` 기준입니다.
- 따라서 이 bridge는 본인 컴퓨터에서만 돌리는 편이 안전합니다.

## 12. 터미널 없이 항상 켜 두기

Mac에서는 `launchd`로 bridge를 로그인 후 자동 시작하게 만들 수 있습니다.

이 방식을 쓰면:

- 터미널 창을 계속 열어둘 필요가 없습니다.
- Mac을 재부팅해도 다시 로그인하면 자동으로 bridge가 시작됩니다.
- stdout / stderr 로그는 로컬 파일로 남습니다.

주의:

- 일반 사용자 기준으로는 `로그인 후 자동 시작`입니다.
- Mac이 꺼져 있거나, 로그아웃된 상태에서는 동작하지 않습니다.

### 12-1. 설치

아래 명령을 한 번 실행합니다.

```bash
chmod +x automation/mac/*.sh
./automation/mac/install_telegram_codex_bridge_launchd.sh
```

설치가 끝나면 아래 LaunchAgent가 생성됩니다.

- `~/Library/LaunchAgents/com.classpage.telegram-codex-bridge.plist`

그리고 bridge는 바로 시작됩니다.

### 12-2. 상태 확인

```bash
./automation/mac/status_telegram_codex_bridge_launchd.sh
```

또는:

```bash
launchctl print gui/$(id -u)/com.classpage.telegram-codex-bridge
```

### 12-3. 로그 보기

로그는 아래에 남습니다.

- `.tmp/telegram-codex-bridge/launchd/stdout.log`
- `.tmp/telegram-codex-bridge/launchd/stderr.log`

문제가 생기면 이 파일을 먼저 보면 됩니다.

### 12-4. 중지 / 제거

```bash
./automation/mac/uninstall_telegram_codex_bridge_launchd.sh
```

이 명령은 bridge를 중지하고 LaunchAgent plist를 지웁니다.

### 12-5. 권장 확인 순서

1. `.env.local`에 토큰, chat id, workdir이 들어 있는지 확인합니다.
2. `./automation/mac/install_telegram_codex_bridge_launchd.sh`를 실행합니다.
3. 텔레그램에서 작업 프롬프트 메시지에 답장으로 `#codex작업시작`을 보냅니다.
4. `#codex작업중`이 보이는지 확인합니다.
5. 완료 후 `#codex받음`과 결과 본문 끝의 `#codex완료`가 답장으로 오는지 확인합니다.
