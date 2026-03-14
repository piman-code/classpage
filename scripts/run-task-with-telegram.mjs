import { spawn } from "node:child_process";
import process from "node:process";
import {
  ensureTelegramChatId,
  ensureTelegramToken,
  extractTelegramResultBlock,
  formatCommandLabel,
  getTelegramConfig,
  loadLocalEnv,
  printHelpAndExit,
  readTextFromFile,
  sendTelegramText,
  summarizeOutputTail,
} from "./telegram-common.mjs";

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelpAndExit(`
사용법:
  npm run telegram:wrap -- --summary-file .tmp/final.txt -- zsh -lc 'node task.js'
  npm run telegram:wrap -- --send-on-failure -- zsh -lc 'echo "## TELEGRAM RESULT"; echo "작업 완료"; echo "## END TELEGRAM RESULT"'

권장 방식:
  1. 실행 명령이 끝난 뒤 짧은 요약 파일을 하나 남깁니다.
  2. --summary-file 로 그 파일을 지정합니다.
  3. wrapper가 #codex받음 을 먼저 보내고, 바로 뒤에 본문을 자동으로 보냅니다.

옵션:
  --summary-file <path>        전송할 최종 요약 파일
  --chat-id <id>               .env.local 대신 다른 chat id 사용
  --ack-message <text>         성공 후 보낼 확인 메시지
  --failure-ack-message <text> 실패 후 보낼 확인 메시지
  --send-on-failure            실패해도 실패 요약을 텔레그램으로 보냄
  --skip-ack                   본문만 보내고 확인 메시지는 생략
  --tail-lines <n>             요약 파일이 없을 때 stdout 마지막 줄 수
  --tail-chars <n>             요약 파일이 없을 때 최대 문자 수
  --dry-run                    실제 전송 없이 본문/확인 메시지만 출력
  --help                       도움말

메모:
  - stdout 안에 "## TELEGRAM RESULT" ... "## END TELEGRAM RESULT" 구간이 있으면 그 부분을 우선 보냅니다.
  - 그렇지 않으면 마지막 출력 일부를 요약으로 사용합니다.
    `);
  }

  if (options.command.length === 0) {
    throw new Error("실행할 명령이 없습니다. -- 뒤에 명령을 넣어 주세요.");
  }

  await loadLocalEnv();
  const config = getTelegramConfig({
    chatId: options.chatId,
    ackMessage: options.ackMessage,
    failureAckMessage: options.failureAckMessage,
  });

  const execution = await runCommand(options.command);
  const reportText = await buildReportText(execution, options);

  if (!options.skipAck) {
    const ackMessage = execution.exitCode === 0
      ? config.ackMessage
      : options.sendOnFailure
        ? config.failureAckMessage
        : "";

    if (ackMessage) {
      if (options.dryRun) {
        console.log(`[dry-run] 확인 메시지: ${ackMessage}`);
        console.log("");
      } else {
        ensureTelegramToken(config.token);
        ensureTelegramChatId(config.chatId);
        await sendTelegramText({
          token: config.token,
          chatId: config.chatId,
          text: ackMessage,
          disableNotification: true,
        });
        console.log(`확인 메시지를 전송했습니다: ${ackMessage}`);
      }
    }
  }

  if (execution.exitCode === 0 || options.sendOnFailure) {
    if (options.dryRun) {
      console.log("[dry-run] 텔레그램 본문");
      console.log(reportText);
    } else {
      ensureTelegramToken(config.token);
      ensureTelegramChatId(config.chatId);
      await sendTelegramText({
        token: config.token,
        chatId: config.chatId,
        text: reportText,
      });
      console.log("텔레그램 본문을 전송했습니다.");
    }
  }

  if (execution.exitCode !== 0) {
    process.exit(execution.exitCode);
  }
}

async function runCommand(command) {
  return new Promise((resolve, reject) => {
    const child = spawn(command[0], command.slice(1), {
      stdio: ["inherit", "pipe", "pipe"],
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString("utf8");
      stdout += text;
      process.stdout.write(text);
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString("utf8");
      stderr += text;
      process.stderr.write(text);
    });

    child.on("error", (error) => reject(error));
    child.on("close", (exitCode, signal) => {
      resolve({
        command,
        stdout,
        stderr,
        exitCode: exitCode ?? 1,
        signal: signal ?? "",
      });
    });
  });
}

async function buildReportText(execution, options) {
  if (options.summaryFile) {
    const summary = (await readTextFromFile(options.summaryFile)).trim();
    if (summary) {
      return summary;
    }
  }

  const markerBlock = extractTelegramResultBlock(execution.stdout)
    || extractTelegramResultBlock(execution.stderr);
  if (markerBlock) {
    return markerBlock;
  }

  const fallbackBody = summarizeOutputTail(
    [execution.stdout, execution.stderr].filter(Boolean).join("\n"),
    {
      tailLines: options.tailLines,
      tailChars: options.tailChars,
    },
  );

  const statusLabel = execution.exitCode === 0 ? "작업 완료" : "작업 실패";
  const lines = [
    `${statusLabel}`,
    `명령: ${formatCommandLabel(execution.command)}`,
    execution.exitCode === 0
      ? ""
      : `종료 코드: ${execution.exitCode}${execution.signal ? ` / signal ${execution.signal}` : ""}`,
    fallbackBody ? "" : "추가 요약 출력이 없습니다.",
    fallbackBody,
  ].filter(Boolean);

  return lines.join("\n");
}

function parseArgs(argv) {
  const options = {
    summaryFile: "",
    chatId: "",
    ackMessage: "",
    failureAckMessage: "",
    sendOnFailure: false,
    skipAck: false,
    tailLines: 40,
    tailChars: 3500,
    dryRun: false,
    help: false,
    command: [],
  };

  let commandIndex = argv.indexOf("--");
  if (commandIndex === -1) {
    commandIndex = argv.length;
  } else {
    options.command = argv.slice(commandIndex + 1);
  }

  for (let index = 0; index < commandIndex; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case "--summary-file":
        options.summaryFile = argv[index + 1] ?? "";
        index += 1;
        break;
      case "--chat-id":
        options.chatId = argv[index + 1] ?? "";
        index += 1;
        break;
      case "--ack-message":
        options.ackMessage = argv[index + 1] ?? "";
        index += 1;
        break;
      case "--failure-ack-message":
        options.failureAckMessage = argv[index + 1] ?? "";
        index += 1;
        break;
      case "--send-on-failure":
        options.sendOnFailure = true;
        break;
      case "--skip-ack":
        options.skipAck = true;
        break;
      case "--tail-lines":
        options.tailLines = Number(argv[index + 1] ?? "40");
        index += 1;
        break;
      case "--tail-chars":
        options.tailChars = Number(argv[index + 1] ?? "3500");
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

  if (!Number.isFinite(options.tailLines) || options.tailLines <= 0) {
    throw new Error("--tail-lines 는 1 이상의 숫자여야 합니다.");
  }

  if (!Number.isFinite(options.tailChars) || options.tailChars <= 0) {
    throw new Error("--tail-chars 는 1 이상의 숫자여야 합니다.");
  }

  return options;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
