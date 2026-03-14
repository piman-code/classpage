import process from "node:process";
import {
  ensureTelegramChatId,
  ensureTelegramToken,
  getTelegramConfig,
  loadLocalEnv,
  printHelpAndExit,
  readStdinText,
  readTextFromFile,
  sendTelegramText,
} from "./telegram-common.mjs";

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelpAndExit(`
사용법:
  npm run telegram:send -- --file .tmp/result.txt
  printf '작업 결과' | npm run telegram:send -- --stdin

옵션:
  --file <path>         보낼 텍스트 파일 경로
  --text <message>      바로 보낼 텍스트
  --stdin               표준 입력에서 텍스트 읽기
  --chat-id <id>        .env.local 대신 다른 chat id 사용
  --ack-message <text>  본문 전송 전에 먼저 보낼 확인 메시지
  --dry-run             실제 전송 없이 내용만 출력
  --help                도움말
    `);
  }

  await loadLocalEnv();
  const config = getTelegramConfig({
    chatId: options.chatId,
  });
  const ackMessage = options.ackMessage || "";

  const text = await resolveMessageText(options);
  if (!text.trim()) {
    throw new Error("보낼 메시지가 비어 있습니다. --file, --text, --stdin 중 하나를 사용해 주세요.");
  }

  if (options.dryRun) {
    if (ackMessage) {
      console.log(`[dry-run] 확인 메시지: ${ackMessage}`);
      console.log("");
    }
    console.log("[dry-run] 텔레그램 본문");
    console.log(text);
    return;
  }

  ensureTelegramToken(config.token);
  ensureTelegramChatId(config.chatId);

  if (ackMessage) {
    await sendTelegramText({
      token: config.token,
      chatId: config.chatId,
      text: ackMessage,
      disableNotification: true,
    });
    console.log(`확인 메시지를 전송했습니다: ${ackMessage}`);
  }

  await sendTelegramText({
    token: config.token,
    chatId: config.chatId,
    text,
  });
  console.log("텔레그램 본문을 전송했습니다.");
}

async function resolveMessageText(options) {
  if (options.text) {
    return options.text;
  }

  if (options.file) {
    return readTextFromFile(options.file);
  }

  if (options.stdin) {
    return readStdinText();
  }

  const stdinText = await readStdinText();
  return stdinText;
}

function parseArgs(argv) {
  const options = {
    file: "",
    text: "",
    stdin: false,
    chatId: "",
    ackMessage: "",
    dryRun: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case "--file":
        options.file = argv[index + 1] ?? "";
        index += 1;
        break;
      case "--text":
        options.text = argv[index + 1] ?? "";
        index += 1;
        break;
      case "--stdin":
        options.stdin = true;
        break;
      case "--chat-id":
        options.chatId = argv[index + 1] ?? "";
        index += 1;
        break;
      case "--ack-message":
        options.ackMessage = argv[index + 1] ?? "";
        index += 1;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      default:
        throw new Error(`알 수 없는 옵션입니다: ${arg}`);
    }
  }

  return options;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
