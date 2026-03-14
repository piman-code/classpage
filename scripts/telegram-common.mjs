import { readFile } from "node:fs/promises";
import process from "node:process";

const DEFAULT_ENV_FILES = [".env.local", ".env"];
const TELEGRAM_RESULT_START_MARKERS = [
  "## TELEGRAM RESULT",
  "<!-- TELEGRAM RESULT START -->",
];
const TELEGRAM_RESULT_END_MARKERS = [
  "## END TELEGRAM RESULT",
  "<!-- TELEGRAM RESULT END -->",
];

export async function loadLocalEnv(envFiles = DEFAULT_ENV_FILES) {
  for (const envFile of envFiles) {
    try {
      const raw = await readFile(envFile, "utf8");
      applyEnvContent(raw);
    } catch (error) {
      if (!isMissingFileError(error)) {
        throw error;
      }
    }
  }
}

export function getTelegramConfig(overrides = {}) {
  return {
    botUsername:
      overrides.botUsername
      || process.env.CLASSPAGE_TELEGRAM_BOT_USERNAME
      || "@hangbokee_bot",
    token:
      overrides.token
      || process.env.CLASSPAGE_TELEGRAM_BOT_TOKEN
      || "",
    chatId:
      overrides.chatId
      || process.env.CLASSPAGE_TELEGRAM_CHAT_ID
      || "",
    ackMessage:
      overrides.ackMessage
      ?? process.env.CLASSPAGE_TELEGRAM_ACK_MESSAGE
      ?? "#codex받음",
    failureAckMessage:
      overrides.failureAckMessage
      ?? process.env.CLASSPAGE_TELEGRAM_FAILURE_ACK_MESSAGE
      ?? "#codex실패",
  };
}

export function ensureTelegramToken(token) {
  if (!token) {
    throw new Error(
      "CLASSPAGE_TELEGRAM_BOT_TOKEN 이 없습니다. .env.local 에 토큰을 넣어 주세요.",
    );
  }
}

export function ensureTelegramChatId(chatId) {
  if (!chatId) {
    throw new Error(
      "CLASSPAGE_TELEGRAM_CHAT_ID 가 없습니다. 먼저 봇과 대화를 시작한 뒤 npm run telegram:chat-id 로 chat id를 확인해 주세요.",
    );
  }
}

export async function sendTelegramText({
  token,
  chatId,
  text,
  disableNotification = false,
  replyToMessageId = null,
}) {
  ensureTelegramToken(token);
  ensureTelegramChatId(chatId);

  const chunks = splitTelegramMessage(text);
  const results = [];
  for (const chunk of chunks) {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: chunk,
        disable_web_page_preview: true,
        disable_notification: disableNotification,
        reply_to_message_id: replyToMessageId ?? undefined,
        allow_sending_without_reply: replyToMessageId ? true : undefined,
      }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.ok) {
      const description = data?.description || response.statusText || "알 수 없는 오류";
      throw new Error(`텔레그램 전송 실패: ${description}`);
    }

    results.push(data.result);
  }

  return results;
}

export function splitTelegramMessage(text, maxLength = 3500) {
  const normalized = normalizeText(text).trim();
  if (!normalized) {
    return ["보낼 내용이 없습니다."];
  }

  if (normalized.length <= maxLength) {
    return [normalized];
  }

  const lines = normalized.split("\n");
  const chunks = [];
  let current = "";

  for (const line of lines) {
    const candidate = current ? `${current}\n${line}` : line;
    if (candidate.length <= maxLength) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push(current);
      current = "";
    }

    if (line.length <= maxLength) {
      current = line;
      continue;
    }

    let remaining = line;
    while (remaining.length > maxLength) {
      chunks.push(remaining.slice(0, maxLength));
      remaining = remaining.slice(maxLength);
    }
    current = remaining;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.filter((chunk) => chunk.trim().length > 0);
}

export async function readTextFromFile(filePath) {
  return readFile(filePath, "utf8");
}

export async function readStdinText() {
  if (process.stdin.isTTY) {
    return "";
  }

  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(typeof chunk === "string" ? chunk : chunk.toString("utf8"));
  }
  return chunks.join("");
}

export function extractTelegramResultBlock(rawText) {
  const normalized = normalizeText(rawText);
  const startIndex = TELEGRAM_RESULT_START_MARKERS
    .map((marker) => normalized.lastIndexOf(marker))
    .filter((index) => index >= 0)
    .sort((left, right) => right - left)[0];

  if (typeof startIndex !== "number") {
    return "";
  }

  const startMarker = TELEGRAM_RESULT_START_MARKERS.find((marker) =>
    normalized.indexOf(marker, startIndex) === startIndex
  );
  if (!startMarker) {
    return "";
  }

  const start = startIndex + startMarker.length;
  const endCandidates = TELEGRAM_RESULT_END_MARKERS
    .map((marker) => normalized.indexOf(marker, start))
    .filter((index) => index >= 0)
    .sort((left, right) => left - right);
  const end = endCandidates.length > 0 ? endCandidates[0] : normalized.length;

  return normalized.slice(start, end).trim();
}

export function summarizeOutputTail(rawText, options = {}) {
  const tailLines = Number.isFinite(options.tailLines) ? options.tailLines : 40;
  const tailChars = Number.isFinite(options.tailChars) ? options.tailChars : 3500;
  const normalized = normalizeText(rawText).trim();
  if (!normalized) {
    return "";
  }

  const lines = normalized.split("\n");
  const lastLines = lines.slice(-tailLines).join("\n").trim();
  if (lastLines.length <= tailChars) {
    return lastLines;
  }

  return lastLines.slice(-tailChars).trim();
}

export function formatCommandLabel(command) {
  return command.map((part) => quoteShellWord(part)).join(" ");
}

export function printHelpAndExit(text, exitCode = 0) {
  console.log(text.trim());
  process.exit(exitCode);
}

function applyEnvContent(raw) {
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const exportLine = trimmed.startsWith("export ")
      ? trimmed.slice("export ".length)
      : trimmed;
    const separatorIndex = exportLine.indexOf("=");
    if (separatorIndex < 0) {
      continue;
    }

    const key = exportLine.slice(0, separatorIndex).trim();
    const value = exportLine.slice(separatorIndex + 1).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = stripWrappingQuotes(value);
  }
}

function stripWrappingQuotes(value) {
  if (
    (value.startsWith("\"") && value.endsWith("\""))
    || (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function quoteShellWord(value) {
  if (/^[A-Za-z0-9_./:-]+$/.test(value)) {
    return value;
  }

  return JSON.stringify(value);
}

function normalizeText(value) {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function isMissingFileError(error) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "ENOENT");
}
