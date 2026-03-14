# 행복이 Codex 자동연동 메모

이 문서는 `classpage` 작업을 Codex Desktop / Codex CLI / 텔레그램 행복이봇으로 함께 쓰는 현재 운영 방식을 볼트에서 바로 확인하려고 만든 짧은 메모입니다.

## 지금 되는 것

1. 텔레그램에서 Codex 전용 서브봇 메시지에 답장으로 `#codex작업시작`을 보내면 Codex CLI 작업이 시작됩니다.
2. 작업이 시작되면 텔레그램에 `#codex작업중`이 먼저 답장됩니다.
3. 작업이 끝나면 텔레그램에 `#codex받음`과 결과 본문이 이어서 전송되고, 결과 본문 끝에는 `#codex완료`가 붙습니다.
4. 작업 중 `#상태`를 보내면 현재 idle/진행 중/중지 요청 상태를 확인할 수 있습니다.
5. 작업 중 `#중지`를 보내면 현재 Codex CLI 작업을 멈추도록 요청할 수 있습니다.
6. `#중지`된 마지막 작업은 `#작업재개`로 이어서 다시 시작할 수 있습니다.

## 현재 동작 방식

- 텔레그램 inbound 작업만 Codex로 들어갑니다.
- 트리거는 현재 `#codex작업시작`만 받습니다.
- Codex Desktop 스레드는 텔레그램으로 자동 전달하지 않습니다.
- 자동 실행: `launchd`로 등록되어 있어서 터미널을 켜 두지 않아도 됩니다.
- 재부팅 후 동작: Mac을 다시 켠 뒤 `로그인하면` 자동으로 다시 시작됩니다.

## 기억할 점

- 이 데스크톱 스레드에 메시지를 쓰는 것만으로는 텔레그램 작업이 시작되지 않습니다.
- 텔레그램에서 `#codex작업시작`으로 보낸 요청만 Codex CLI로 들어갑니다.
- 한 번에 하나의 Codex 작업만 돌립니다. 이미 작업 중이면 새 요청을 바로 겹쳐 실행하지 않습니다.
- `#상태`, `#중지`, `#작업재개`는 텔레그램에서만 쓰는 운영 명령입니다.

## 설정 파일

- 실제 비밀값: `.env.local`
- 예시 설정: `.env.example`
- 상세 가이드: [docs/TELEGRAM_BOT_AUTOMATION.md](docs/TELEGRAM_BOT_AUTOMATION.md)

## 자주 쓰는 확인 명령

```bash
./automation/mac/status_telegram_codex_bridge_launchd.sh
```

```bash
./automation/mac/install_telegram_codex_bridge_launchd.sh
```

```bash
./automation/mac/uninstall_telegram_codex_bridge_launchd.sh
```

## 로그 위치

- stdout: `.tmp/telegram-codex-bridge/launchd/stdout.log`
- stderr: `.tmp/telegram-codex-bridge/launchd/stderr.log`
- 작업 기록: `.tmp/telegram-codex-bridge/jobs/`

## 권장 사용 흐름

### 텔레그램에서 바로 맡길 때

1. Codex 전용 서브봇이 작업 프롬프트를 올립니다.
2. 그 메시지에 답장으로 `#codex작업시작`을 보냅니다.
3. 필요하면 중간에 `#상태`로 확인하거나 `#중지`로 멈춥니다.
4. 멈춘 작업은 `#작업재개`로 이어서 다시 시작할 수 있습니다.
5. 결과가 `#codex받음`과 함께 돌아옵니다.

## 한 줄 정리

지금은 `텔레그램에서 #codex작업시작 한 요청만 Codex로 들어가고`, `launchd로 상시 실행`되는 단일 흐름으로 맞춘 상태입니다.
