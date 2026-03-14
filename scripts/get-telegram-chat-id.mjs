import process from "node:process";
import {
  ensureTelegramToken,
  getTelegramConfig,
  loadLocalEnv,
  printHelpAndExit,
} from "./telegram-common.mjs";

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelpAndExit(`
사용법:
  npm run telegram:chat-id

먼저 할 일:
  1. 텔레그램에서 @hangbokee_bot 과 대화를 시작합니다.
  2. 아무 메시지나 한 번 보냅니다.
  3. .env.local 에 토큰을 넣습니다.
  4. 이 명령으로 chat id를 확인합니다.
    `);
  }

  await loadLocalEnv();
  const config = getTelegramConfig();
  ensureTelegramToken(config.token);

  const [meResponse, updatesResponse] = await Promise.all([
    fetch(`https://api.telegram.org/bot${config.token}/getMe`),
    fetch(`https://api.telegram.org/bot${config.token}/getUpdates`),
  ]);

  const meData = await meResponse.json();
  const updatesData = await updatesResponse.json();

  if (!meResponse.ok || !meData?.ok) {
    throw new Error(`봇 정보 조회 실패: ${meData?.description || meResponse.statusText}`);
  }
  if (!updatesResponse.ok || !updatesData?.ok) {
    throw new Error(`업데이트 조회 실패: ${updatesData?.description || updatesResponse.statusText}`);
  }

  const chats = collectChats(updatesData.result ?? []);
  console.log(`봇 확인: @${meData.result.username}`);
  if (chats.length === 0) {
    console.log("아직 읽을 chat id가 없습니다.");
    console.log(`${config.botUsername} 에 먼저 아무 메시지나 보낸 뒤 다시 실행해 주세요.`);
    return;
  }

  console.log("확인된 chat id:");
  for (const chat of chats) {
    console.log(`- ${chat.id} (${chat.type}${chat.title ? ` / ${chat.title}` : ""})`);
  }
  console.log("");
  console.log("원하는 chat id를 .env.local 의 CLASSPAGE_TELEGRAM_CHAT_ID 에 넣으면 됩니다.");
}

function collectChats(updates) {
  const chatMap = new Map();

  for (const update of updates) {
    const candidates = [
      update.message?.chat,
      update.edited_message?.chat,
      update.channel_post?.chat,
      update.edited_channel_post?.chat,
      update.callback_query?.message?.chat,
    ].filter(Boolean);

    for (const chat of candidates) {
      if (!chatMap.has(chat.id)) {
        chatMap.set(chat.id, {
          id: String(chat.id),
          type: chat.type || "unknown",
          title: chat.title || chat.username || [
            chat.first_name || "",
            chat.last_name || "",
          ].filter(Boolean).join(" ").trim(),
        });
      }
    }
  }

  return Array.from(chatMap.values());
}

function parseArgs(argv) {
  const options = {
    help: false,
  };

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    throw new Error(`알 수 없는 옵션입니다: ${arg}`);
  }

  return options;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
