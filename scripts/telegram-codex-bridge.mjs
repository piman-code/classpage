import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import {
  access,
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import {
  ensureTelegramChatId,
  ensureTelegramToken,
  getTelegramConfig,
  printHelpAndExit,
  loadLocalEnv,
  sendTelegramText,
  summarizeOutputTail,
  formatCommandLabel,
} from "./telegram-common.mjs";

const DEFAULT_TRIGGER_COMMANDS = ["#codex작업시작"];
const DEFAULT_STOP_COMMANDS = ["#중지"];
const DEFAULT_STATUS_COMMANDS = ["#상태"];
const DEFAULT_RESUME_COMMANDS = ["#작업재개"];
const DEFAULT_PROGRESS_MESSAGE = "#codex작업중";
const DEFAULT_MODE_PREFIX = "#행복이 모드";
const DEFAULT_STOPPING_MESSAGE = "#codex중지요청";
const DEFAULT_STOPPED_MESSAGE = "#codex중지됨";
const DEFAULT_COMPLETED_MESSAGE = "#codex완료";
const DEFAULT_STATE_FILE = ".tmp/telegram-codex-bridge/state.json";
const DEFAULT_JOB_ROOT = ".tmp/telegram-codex-bridge/jobs";
const DEFAULT_POLL_TIMEOUT_SEC = 20;
const DEFAULT_IDLE_SLEEP_MS = 1500;
const DEFAULT_DESKTOP_THREAD_SOURCES = ["vscode"];
const DEFAULT_DESKTOP_THREAD_LIMIT = 20;

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelpAndExit(`
사용법:
  npm run telegram:bridge
  npm run telegram:bridge -- --once

동작:
  - 텔레그램에서 #codex작업시작 메시지를 폴링으로 감지합니다.
  - 답장한 메시지 또는 트리거 뒤에 붙인 본문을 Codex CLI 프롬프트로 사용합니다.
  - #상태 는 현재 작업 상태를 알려주고, #중지 는 현재 작업 중지를 요청합니다.
  - #작업재개 는 마지막으로 중지된 작업을 이어서 다시 시작합니다.
  - #codex작업중 -> #codex받음 -> 결과 본문 순서로 텔레그램에 답장합니다.

옵션:
  --once                 현재 쌓인 업데이트만 한 번 처리하고 종료
  --dry-run              텔레그램 전송과 Codex 실행 없이 계획만 출력
  --chat-id <id>         .env.local 대신 다른 chat id 사용
  --state-file <path>    마지막 처리 update id 저장 파일
  --job-root <path>      프롬프트/로그/결과 파일을 남길 폴더
  --workdir <path>       Codex CLI를 실행할 작업 루트
  --poll-timeout <sec>   Telegram getUpdates long polling timeout
  --idle-sleep-ms <ms>   폴링 실패 후 잠깐 대기 시간
  --help                 도움말

환경변수:
  CLASSPAGE_TELEGRAM_TRIGGER_COMMAND
  CLASSPAGE_TELEGRAM_STOP_COMMAND
  CLASSPAGE_TELEGRAM_STATUS_COMMAND
  CLASSPAGE_TELEGRAM_RESUME_COMMAND
  CLASSPAGE_TELEGRAM_PROGRESS_MESSAGE
  CLASSPAGE_TELEGRAM_MODE_PREFIX
  CLASSPAGE_TELEGRAM_STOPPING_MESSAGE
  CLASSPAGE_TELEGRAM_STOPPED_MESSAGE
  CLASSPAGE_TELEGRAM_COMPLETED_MESSAGE
  CLASSPAGE_CODEX_WORKDIR
  CLASSPAGE_CODEX_EXECUTABLE
  CLASSPAGE_TELEGRAM_BRIDGE_STATE_FILE
  CLASSPAGE_TELEGRAM_BRIDGE_JOB_ROOT
    `);
  }

  await loadLocalEnv();
  const telegramConfig = getTelegramConfig({
    chatId: options.chatId,
  });
  ensureTelegramToken(telegramConfig.token);
  ensureTelegramChatId(telegramConfig.chatId);

  const bridgeConfig = {
    ...telegramConfig,
    triggerCommands: resolveTriggerCommands(
      process.env.CLASSPAGE_TELEGRAM_TRIGGER_COMMAND,
    ),
    stopCommands: resolveCommandAliases(
      process.env.CLASSPAGE_TELEGRAM_STOP_COMMAND,
      DEFAULT_STOP_COMMANDS,
    ),
    statusCommands: resolveCommandAliases(
      process.env.CLASSPAGE_TELEGRAM_STATUS_COMMAND,
      DEFAULT_STATUS_COMMANDS,
    ),
    resumeCommands: resolveCommandAliases(
      process.env.CLASSPAGE_TELEGRAM_RESUME_COMMAND,
      DEFAULT_RESUME_COMMANDS,
    ),
    progressMessage:
      process.env.CLASSPAGE_TELEGRAM_PROGRESS_MESSAGE
      || DEFAULT_PROGRESS_MESSAGE,
    modePrefix:
      process.env.CLASSPAGE_TELEGRAM_MODE_PREFIX
      || DEFAULT_MODE_PREFIX,
    stoppingMessage:
      process.env.CLASSPAGE_TELEGRAM_STOPPING_MESSAGE
      || DEFAULT_STOPPING_MESSAGE,
    stoppedMessage:
      process.env.CLASSPAGE_TELEGRAM_STOPPED_MESSAGE
      || DEFAULT_STOPPED_MESSAGE,
    completedMessage:
      process.env.CLASSPAGE_TELEGRAM_COMPLETED_MESSAGE
      || DEFAULT_COMPLETED_MESSAGE,
    workdir: path.resolve(
      options.workdir
      || process.env.CLASSPAGE_CODEX_WORKDIR
      || process.cwd(),
    ),
    codexExecutable:
      process.env.CLASSPAGE_CODEX_EXECUTABLE
      || "codex",
    stateFile: path.resolve(
      options.stateFile
      || process.env.CLASSPAGE_TELEGRAM_BRIDGE_STATE_FILE
      || DEFAULT_STATE_FILE,
    ),
    jobRoot: path.resolve(
      options.jobRoot
      || process.env.CLASSPAGE_TELEGRAM_BRIDGE_JOB_ROOT
      || DEFAULT_JOB_ROOT,
    ),
    desktopWatchEnabled: resolveBooleanEnv(
      process.env.CLASSPAGE_CODEX_DESKTOP_WATCH_ENABLED,
      true,
    ),
    desktopStateDbPath: await resolveDesktopStateDbPath(
      process.env.CLASSPAGE_CODEX_DESKTOP_STATE_DB,
    ),
    desktopThreadSources: resolveDesktopThreadSources(
      process.env.CLASSPAGE_CODEX_DESKTOP_THREAD_SOURCES,
    ),
    desktopThreadLimit: resolvePositiveInteger(
      process.env.CLASSPAGE_CODEX_DESKTOP_THREAD_LIMIT,
      DEFAULT_DESKTOP_THREAD_LIMIT,
    ),
    pollTimeoutSec: options.pollTimeoutSec,
    idleSleepMs: options.idleSleepMs,
    dryRun: options.dryRun,
  };

  await access(bridgeConfig.workdir).catch(() => {
    throw new Error(`Codex 작업 경로를 찾지 못했습니다: ${bridgeConfig.workdir}`);
  });
  await mkdir(path.dirname(bridgeConfig.stateFile), { recursive: true });
  await mkdir(bridgeConfig.jobRoot, { recursive: true });

  const state = await loadState(bridgeConfig.stateFile);
  const runtime = {
    activeJob: null,
    lastKnownJob: null,
  };
  const recoveredStateChanged = syncRuntimeActiveJobFromState(runtime, state);
  if (recoveredStateChanged) {
    await saveState(bridgeConfig.stateFile, state);
  }
  if (bridgeConfig.desktopWatchEnabled) {
    const bootstrapped = await bootstrapDesktopThreadWatch(state, bridgeConfig);
    if (bootstrapped) {
      await saveState(bridgeConfig.stateFile, state);
    }
  }

  console.log(`텔레그램 bridge 시작: chat ${bridgeConfig.chatId} / workdir ${bridgeConfig.workdir}`);
  console.log(`감지 명령: ${bridgeConfig.triggerCommands.join(", ")}`);
  console.log(`상태 명령: ${bridgeConfig.statusCommands.join(", ")} / 중지 명령: ${bridgeConfig.stopCommands.join(", ")} / 재개 명령: ${bridgeConfig.resumeCommands.join(", ")}`);
  if (bridgeConfig.desktopWatchEnabled) {
    const dbSummary = bridgeConfig.desktopStateDbPath || "찾지 못함";
    console.log(`데스크톱 watcher: 켜짐 / source ${bridgeConfig.desktopThreadSources.join(", ")} / db ${dbSummary}`);
  } else {
    console.log("데스크톱 watcher: 꺼짐");
  }

  do {
    try {
      const runtimeStateChanged = syncRuntimeActiveJobFromState(runtime, state);
      if (runtimeStateChanged) {
        await saveState(bridgeConfig.stateFile, state);
      }

      const updates = await fetchTelegramUpdates(
        bridgeConfig.token,
        state.lastUpdateId + 1,
        bridgeConfig.pollTimeoutSec,
      );
      let stateChanged = false;

      for (const update of updates) {
        const handled = await handleUpdate(update, bridgeConfig, runtime, state);
        state.lastUpdateId = update.update_id;
        stateChanged = true;

        if (handled) {
          console.log(`처리 완료: update ${update.update_id}`);
        }
      }

      const desktopStateChanged = await scanDesktopThreads(state, bridgeConfig);
      if (stateChanged || desktopStateChanged) {
        await saveState(bridgeConfig.stateFile, state);
      }

      if (options.once) {
        if (runtime.activeJob) {
          await runtime.activeJob.completion.catch(() => {});
        }
        break;
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      if (options.once) {
        process.exit(1);
      }
      await sleep(bridgeConfig.idleSleepMs);
    }
  } while (!options.once);
}

async function handleUpdate(update, config, runtime, state) {
  const message = update.message;
  if (!message || typeof message !== "object") {
    return false;
  }

  if (String(message.chat?.id ?? "") !== String(config.chatId)) {
    return false;
  }

  if (message.from?.is_bot) {
    return false;
  }

  const messageText = extractMessageBody(message);
  syncRuntimeActiveJobFromState(runtime, state);
  const matchedStatusCommand = findMatchedTrigger(messageText, config.statusCommands);
  if (matchedStatusCommand) {
    await maybeSendTelegramText(config, {
      text: buildBridgeStatusReport(config, runtime),
      replyToMessageId: message.message_id,
      disableNotification: true,
    });
    return true;
  }

  const matchedStopCommand = findMatchedTrigger(messageText, config.stopCommands);
  if (matchedStopCommand) {
    await handleStopCommand(message, config, runtime, state);
    return true;
  }

  const matchedResumeCommand = findMatchedTrigger(messageText, config.resumeCommands);
  if (matchedResumeCommand) {
    await handleResumeCommand(message, config, runtime, state);
    return true;
  }

  const matchedTrigger = findMatchedTrigger(messageText, config.triggerCommands);
  if (!matchedTrigger) {
    return false;
  }

  if (runtime.activeJob) {
    await maybeSendTelegramText(config, {
      text: buildBusyReport(runtime.activeJob),
      replyToMessageId: message.message_id,
      disableNotification: true,
    });
    return true;
  }

  const promptSource = resolvePromptSource(message, matchedTrigger);
  if (!promptSource.prompt.trim()) {
    const helpText = [
      config.failureAckMessage,
      "작업 프롬프트를 찾지 못했습니다.",
      `방법 1: 프롬프트가 적힌 메시지에 답장하고 ${matchedTrigger} 을 보내세요.`,
      `방법 2: ${matchedTrigger} 뒤에 바로 작업 내용을 붙여 보내세요.`,
    ].join("\n");
    await maybeSendTelegramText(config, {
      text: helpText,
      replyToMessageId: message.message_id,
    });
    return true;
  }

  try {
    const job = await startCodexJob({
      updateId: update.update_id,
      commandMessageId: message.message_id,
      prompt: buildCodexPrompt(promptSource.prompt, config.modePrefix, config.workdir),
      promptSource,
      config,
    });

    if (job.immediateResult) {
      const immediateResult = job.immediateResult;
      if (immediateResult.success) {
        await maybeSendTelegramText(config, {
          text: config.ackMessage,
          replyToMessageId: message.message_id,
          disableNotification: true,
        });
        await maybeSendTelegramText(config, {
          text: appendCompletedMarker(immediateResult.reportText, config.completedMessage),
          replyToMessageId: message.message_id,
        });
      } else {
        await maybeSendTelegramText(config, {
          text: config.failureAckMessage,
          replyToMessageId: message.message_id,
          disableNotification: true,
        });
        await maybeSendTelegramText(config, {
          text: immediateResult.reportText,
          replyToMessageId: message.message_id,
        });
      }
      return true;
    }

    runtime.activeJob = job.activeJob;
    state.activeJob = snapshotActiveJob(runtime.activeJob);
    state.resumableJob = null;
    attachActiveJobCompletion(runtime.activeJob, runtime, state, config);
  } catch (error) {
    const messageText = error instanceof Error
      ? error.message
      : String(error);
    await maybeSendTelegramText(config, {
      text: config.failureAckMessage,
      replyToMessageId: message.message_id,
      disableNotification: true,
    });
    await maybeSendTelegramText(config, {
      text: [
        "Codex bridge 실행 중 예기치 않은 오류가 발생했습니다.",
        messageText,
      ].join("\n"),
      replyToMessageId: message.message_id,
    });
  }

  return true;
}

function attachActiveJobCompletion(activeJob, runtime, state, config) {
  activeJob.completion
    .then(async (jobResult) => {
      if (jobResult.cancelled) {
        state.resumableJob = snapshotResumableJob(activeJob, jobResult);
      }

      const ackMessage = jobResult.cancelled
        ? config.stoppedMessage
        : jobResult.success
          ? config.ackMessage
          : config.failureAckMessage;
      await maybeSendTelegramText(config, {
        text: ackMessage,
        replyToMessageId: activeJob.commandMessageId,
        disableNotification: true,
      });
      await maybeSendTelegramText(config, {
        text: jobResult.success && !jobResult.cancelled
          ? appendCompletedMarker(jobResult.reportText, config.completedMessage)
          : jobResult.reportText,
        replyToMessageId: activeJob.commandMessageId,
      });
    })
    .catch(async (error) => {
      const messageText = error instanceof Error
        ? error.message
        : String(error);
      await maybeSendTelegramText(config, {
        text: config.failureAckMessage,
        replyToMessageId: activeJob.commandMessageId,
        disableNotification: true,
      });
      await maybeSendTelegramText(config, {
        text: [
          "Codex bridge 실행 중 예기치 않은 오류가 발생했습니다.",
          messageText,
        ].join("\n"),
        replyToMessageId: activeJob.commandMessageId,
      });
    })
    .finally(() => {
      if (runtime.activeJob?.jobId === activeJob.jobId) {
        runtime.activeJob = null;
      }
      if (state.activeJob?.jobId === activeJob.jobId) {
        state.activeJob = null;
      }
      if (!state.resumableJob || state.resumableJob.jobId !== activeJob.jobId) {
        runtime.lastKnownJob = null;
      } else {
        runtime.lastKnownJob = {
          ...state.resumableJob,
          staleReason: "stopped",
        };
      }
      saveState(config.stateFile, state).catch((error) => {
        console.error(error instanceof Error ? error.message : String(error));
      });
    });
}

async function handleStopCommand(message, config, runtime, state) {
  if (!runtime.activeJob) {
    if (state.resumableJob) {
      await maybeSendTelegramText(config, {
        text: [
          "현재 실행 중인 Codex 작업은 없습니다.",
          `재개 가능한 마지막 작업: ${state.resumableJob.jobId}`,
          `재개 명령: ${config.resumeCommands.join(", ")}`,
        ].join("\n"),
        replyToMessageId: message.message_id,
        disableNotification: true,
      });
      return;
    }

    if (runtime.lastKnownJob) {
      await maybeSendTelegramText(config, {
        text: [
          "직전 작업 정보는 있지만 현재 제어 가능한 Codex 프로세스는 없습니다.",
          `작업 번호: ${runtime.lastKnownJob.jobId}`,
          "bridge가 재시작되었거나 작업이 이미 종료된 상태일 수 있습니다.",
        ].join("\n"),
        replyToMessageId: message.message_id,
        disableNotification: true,
      });
      return;
    }
    await maybeSendTelegramText(config, {
      text: "현재 실행 중인 Codex 작업이 없습니다.",
      replyToMessageId: message.message_id,
      disableNotification: true,
    });
    return;
  }

  if (runtime.activeJob.stopRequested) {
    await maybeSendTelegramText(config, {
      text: [
        config.stoppingMessage,
        "이미 중지 요청을 받은 상태입니다.",
        `작업 번호: ${runtime.activeJob.jobId}`,
      ].join("\n"),
      replyToMessageId: message.message_id,
      disableNotification: true,
    });
    return;
  }

  runtime.activeJob.stopRequested = true;
  runtime.activeJob.stopRequestedAt = new Date().toISOString();
  runtime.activeJob.markStopRequested();
  state.activeJob = snapshotActiveJob(runtime.activeJob);
  await saveState(config.stateFile, state);
  terminateActiveJob(runtime.activeJob);
  await maybeSendTelegramText(config, {
    text: [
      config.stoppingMessage,
      "현재 작업을 멈추는 중입니다.",
      `작업 번호: ${runtime.activeJob.jobId}`,
    ].join("\n"),
    replyToMessageId: message.message_id,
    disableNotification: true,
  });
}

async function handleResumeCommand(message, config, runtime, state) {
  if (runtime.activeJob) {
    await maybeSendTelegramText(config, {
      text: buildBusyReport(runtime.activeJob),
      replyToMessageId: message.message_id,
      disableNotification: true,
    });
    return;
  }

  if (!state.resumableJob) {
    await maybeSendTelegramText(config, {
      text: [
        "재개할 수 있는 중지 작업이 없습니다.",
        "먼저 작업을 시작한 뒤 #중지 로 멈춘 작업이 있어야 합니다.",
      ].join("\n"),
      replyToMessageId: message.message_id,
      disableNotification: true,
    });
    return;
  }

  try {
    const resumedPrompt = await buildResumePrompt(state.resumableJob);
    const resumedPreview = buildResumePreview(state.resumableJob);
    const job = await startCodexJob({
      updateId: message.update_id ?? Date.now(),
      commandMessageId: message.message_id,
      prompt: resumedPrompt,
      promptSource: {
        type: "resume",
        prompt: resumedPreview,
      },
      config,
      progressDetail: `중지된 작업 ${state.resumableJob.jobId} 를 이어서 다시 시작합니다.`,
    });

    if (job.immediateResult) {
      await maybeSendTelegramText(config, {
        text: config.ackMessage,
        replyToMessageId: message.message_id,
        disableNotification: true,
      });
      await maybeSendTelegramText(config, {
        text: job.immediateResult.reportText,
        replyToMessageId: message.message_id,
      });
      state.resumableJob = null;
      await saveState(config.stateFile, state);
      return;
    }

    runtime.activeJob = job.activeJob;
    state.activeJob = snapshotActiveJob(runtime.activeJob);
    state.resumableJob = null;
    await saveState(config.stateFile, state);
    attachActiveJobCompletion(runtime.activeJob, runtime, state, config);
  } catch (error) {
    const messageText = error instanceof Error
      ? error.message
      : String(error);
    await maybeSendTelegramText(config, {
      text: [
        "작업 재개 준비 중 오류가 발생했습니다.",
        messageText,
      ].join("\n"),
      replyToMessageId: message.message_id,
    });
  }
}

async function startCodexJob({
  updateId,
  commandMessageId,
  prompt,
  promptSource,
  config,
  progressDetail = "",
}) {
  const jobId = buildJobId(updateId);
  const jobDir = path.join(config.jobRoot, jobId);
  await mkdir(jobDir, { recursive: true });

  const promptFile = path.join(jobDir, "prompt.txt");
  const resultFile = path.join(jobDir, "result.txt");
  const stdoutFile = path.join(jobDir, "stdout.log");
  const stderrFile = path.join(jobDir, "stderr.log");
  const metadataFile = path.join(jobDir, "metadata.json");

  const metadata = {
    jobId,
    updateId,
    commandMessageId,
    workdir: config.workdir,
    triggerCommands: config.triggerCommands,
    promptSourceType: promptSource.type,
    promptPreview: promptSource.prompt.slice(0, 500),
    createdAt: new Date().toISOString(),
  };
  await writeFile(promptFile, `${prompt}\n`, "utf8");
  await writeFile(metadataFile, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");

  await maybeSendTelegramText(config, {
    text: [
      config.progressMessage,
      progressDetail || "요청을 받았습니다. Codex CLI로 작업을 시작합니다.",
      `작업 번호: ${jobId}`,
    ].join("\n"),
    replyToMessageId: commandMessageId,
    disableNotification: true,
  });

  if (config.dryRun) {
    const reportText = [
      "dry-run 모드입니다.",
      `작업 번호: ${jobId}`,
      `작업 경로: ${config.workdir}`,
      "",
      "프롬프트 미리보기:",
      promptSource.prompt,
    ].join("\n");
    await writeFile(resultFile, `${reportText}\n`, "utf8");
    await writeFile(stdoutFile, "", "utf8");
    await writeFile(stderrFile, "", "utf8");
    return {
      immediateResult: {
        success: true,
        reportText,
        jobDir,
        cancelled: false,
      },
    };
  }

  const command = buildCodexCommand(config.codexExecutable, config.workdir, resultFile);
  const execution = startSpawnCommand(command, prompt);

  return {
    activeJob: {
      jobId,
      updateId,
      commandMessageId,
      command,
      jobDir,
      promptPreview: promptSource.prompt.slice(0, 500),
      startedAt: new Date().toISOString(),
      stopRequested: false,
      stopRequestedAt: "",
      pid: execution.child.pid,
      promptFile,
      resultFile,
      stdoutFile,
      stderrFile,
      child: execution.child,
      markStopRequested: execution.markStopRequested,
      completion: execution.completion.then(async (executionResult) => {
        await writeFile(stdoutFile, executionResult.stdout, "utf8");
        await writeFile(stderrFile, executionResult.stderr, "utf8");

        const resultText = await readFile(resultFile, "utf8").catch(() => "");
        const cancelled = isCancelledExecution(executionResult, resultText, executionResult.stopRequested);
        const reportText = buildJobReport({
          success: executionResult.exitCode === 0,
          resultText,
          stdout: executionResult.stdout,
          stderr: executionResult.stderr,
          command,
          jobId,
          jobDir,
          exitCode: executionResult.exitCode,
          signal: executionResult.signal,
          cancelled,
        });

        return {
          success: executionResult.exitCode === 0,
          reportText,
          jobDir,
          cancelled,
        };
      }),
    },
  };
}

async function bootstrapDesktopThreadWatch(state, config) {
  if (!config.desktopWatchEnabled) {
    return false;
  }

  const desktopState = ensureDesktopState(state);
  if (desktopState.bootstrappedAt) {
    return false;
  }

  const threads = await listDesktopThreads(config);
  for (const thread of threads) {
    const latestFinal = await readLatestDesktopFinal(thread.rolloutPath);
    const fileInfo = await readFileInfo(thread.rolloutPath);
    desktopState.threads[thread.id] = buildDesktopThreadState({
      lastSentKey: latestFinal ? buildDesktopFinalKey(latestFinal) : "",
      lastFileSize: fileInfo.size,
      lastFileMtimeMs: fileInfo.mtimeMs,
    });
  }

  desktopState.bootstrappedAt = new Date().toISOString();
  console.log(`데스크톱 watcher 초기화: ${threads.length}개 스레드 기준점 저장`);
  return true;
}

async function scanDesktopThreads(state, config) {
  if (!config.desktopWatchEnabled) {
    return false;
  }

  const threads = await listDesktopThreads(config);
  const desktopState = ensureDesktopState(state);
  let stateChanged = false;

  for (const thread of threads) {
    const fileInfo = await readFileInfo(thread.rolloutPath);
    const currentThreadState = desktopState.threads[thread.id]
      || buildDesktopThreadState();
    const fileUnchanged = (
      currentThreadState.lastFileSize === fileInfo.size
      && currentThreadState.lastFileMtimeMs === fileInfo.mtimeMs
    );

    if (fileUnchanged) {
      if (!desktopState.threads[thread.id]) {
        desktopState.threads[thread.id] = currentThreadState;
        stateChanged = true;
      }
      continue;
    }

    const latestFinal = await readLatestDesktopFinal(thread.rolloutPath);
    const latestFinalKey = latestFinal ? buildDesktopFinalKey(latestFinal) : "";
    const shouldSend = Boolean(
      latestFinal
      && desktopState.bootstrappedAt
      && latestFinalKey
      && latestFinalKey !== currentThreadState.lastSentKey
    );

    if (shouldSend) {
      await maybeSendTelegramText(config, {
        text: config.ackMessage,
        disableNotification: true,
      });
      await maybeSendTelegramText(config, {
        text: buildDesktopThreadReport(thread, latestFinal),
      });
      console.log(`데스크톱 결과 전송: ${thread.id}`);
      currentThreadState.lastSentKey = latestFinalKey;
    } else if (!currentThreadState.lastSentKey && latestFinalKey) {
      currentThreadState.lastSentKey = latestFinalKey;
    }

    currentThreadState.lastFileSize = fileInfo.size;
    currentThreadState.lastFileMtimeMs = fileInfo.mtimeMs;
    desktopState.threads[thread.id] = currentThreadState;
    stateChanged = true;
  }

  return stateChanged;
}

function buildCodexCommand(executable, workdir, resultFile) {
  return [
    executable,
    "exec",
    "--dangerously-bypass-approvals-and-sandbox",
    "--skip-git-repo-check",
    "--cd",
    workdir,
    "--output-last-message",
    resultFile,
    "-",
  ];
}

function buildJobReport({
  success,
  resultText,
  stdout,
  stderr,
  command,
  jobId,
  jobDir,
  exitCode,
  signal,
  cancelled,
}) {
  if (cancelled) {
    const lines = [
      "중지 요청을 받아 현재 작업을 멈췄습니다.",
      `작업 번호: ${jobId}`,
      `명령: ${formatCommandLabel(command)}`,
      `로컬 로그: ${jobDir}`,
      resultText.trim() ? "" : "완료 직전까지 저장된 최종 요약은 없습니다.",
      resultText.trim() ? resultText.trim() : summarizeOutputTail(
        [stdout, stderr].filter(Boolean).join("\n"),
        {
          tailLines: 40,
          tailChars: 2400,
        },
      ),
    ].filter(Boolean);
    return lines.join("\n");
  }

  if (success && resultText.trim()) {
    return resultText.trim();
  }

  const fallbackSummary = summarizeOutputTail(
    [resultText, stdout, stderr].filter(Boolean).join("\n"),
    {
      tailLines: 60,
      tailChars: 3200,
    },
  );

  const lines = [
    success ? "Codex 작업은 끝났지만 최종 요약 파일이 비어 있어 마지막 출력 일부를 대신 보냅니다." : "Codex 작업 중 오류가 발생했습니다.",
    `작업 번호: ${jobId}`,
    `명령: ${formatCommandLabel(command)}`,
    success ? "" : `종료 코드: ${exitCode}${signal ? ` / signal ${signal}` : ""}`,
    `로컬 로그: ${jobDir}`,
    fallbackSummary ? "" : "추가 출력은 없습니다.",
    fallbackSummary,
  ].filter(Boolean);

  return lines.join("\n");
}

async function maybeSendTelegramText(config, payload) {
  if (config.dryRun) {
    console.log("[dry-run] telegram send");
    console.log(payload.text);
    return;
  }

  await sendTelegramText({
    token: config.token,
    chatId: config.chatId,
    text: payload.text,
    disableNotification: payload.disableNotification ?? false,
    replyToMessageId: payload.replyToMessageId ?? null,
  });
}

function startSpawnCommand(command, prompt) {
  const child = spawn(command[0], command.slice(1), {
    stdio: ["pipe", "pipe", "pipe"],
    env: process.env,
    detached: process.platform !== "win32",
  });

  let stdout = "";
  let stderr = "";
  let stopRequested = false;

  const completion = new Promise((resolve, reject) => {
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
        stdout,
        stderr,
        exitCode: exitCode ?? 1,
        signal: signal ?? "",
        stopRequested,
      });
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });

  return {
    child,
    completion,
    markStopRequested() {
      stopRequested = true;
    },
  };
}

async function fetchTelegramUpdates(token, offset, timeoutSec) {
  const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      offset,
      timeout: timeoutSec,
      allowed_updates: ["message"],
    }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) {
    const description = data?.description || response.statusText || "알 수 없는 오류";
    throw new Error(`텔레그램 업데이트 조회 실패: ${description}`);
  }

  return Array.isArray(data.result) ? data.result : [];
}

function resolvePromptSource(message, triggerCommand) {
  const messageText = extractMessageBody(message);
  const inlinePrompt = messageText.slice(triggerCommand.length).trim();
  const repliedText = extractMessageBody(message.reply_to_message ?? {});

  if (repliedText.trim() && inlinePrompt) {
    return {
      type: "reply+inline",
      prompt: `${cleanupPromptText(repliedText)}\n\n추가 지시:\n${inlinePrompt}`,
    };
  }

  if (repliedText.trim()) {
    return {
      type: "reply",
      prompt: cleanupPromptText(repliedText),
    };
  }

  if (inlinePrompt) {
    return {
      type: "inline",
      prompt: cleanupPromptText(inlinePrompt),
    };
  }

  return {
    type: "empty",
    prompt: "",
  };
}

function buildCodexPrompt(prompt, modePrefix, workdir) {
  return [
    modePrefix,
    "",
    "이 요청은 텔레그램 행복이봇을 통해 들어온 Codex CLI 작업입니다.",
    `작업 루트는 ${workdir} 입니다.`,
    "최종 답변은 한국어로 작성하고, 텔레그램에 그대로 보내기 쉽게 짧고 읽기 쉽게 정리해 주세요.",
    "가능하면 변경 파일, 핵심 결과, 남은 한계를 짧게 포함해 주세요.",
    "",
    "작업 요청:",
    cleanupPromptText(prompt),
  ].join("\n");
}

function buildDesktopThreadReport(thread, latestFinal) {
  const threadLabel = summarizeThreadLabel(thread.title || thread.id);
  return [
    `[classpage 데스크톱 스레드]`,
    `스레드: ${threadLabel}`,
    "",
    latestFinal.text,
  ].join("\n");
}

function resolveTriggerCommands(rawValue) {
  return resolveCommandAliases(rawValue, DEFAULT_TRIGGER_COMMANDS);
}

function findMatchedTrigger(messageText, triggerCommands) {
  const sorted = [...triggerCommands].sort((left, right) => right.length - left.length);
  return sorted.find((trigger) => messageText.startsWith(trigger)) || "";
}

function resolveDesktopThreadSources(rawValue) {
  const configured = (rawValue || "")
    .split(/[\n,]/)
    .map((value) => value.trim())
    .filter(Boolean);
  const merged = [...configured, ...DEFAULT_DESKTOP_THREAD_SOURCES];
  return merged.filter((value, index, array) => array.indexOf(value) === index);
}

function resolveCommandAliases(rawValue, defaults) {
  const configured = (rawValue || "")
    .split(/[\n,]/)
    .map((value) => value.trim())
    .filter(Boolean);
  const source = configured.length > 0 ? configured : defaults;
  return source.filter((value, index, array) => array.indexOf(value) === index);
}

function resolveBooleanEnv(rawValue, fallback) {
  if (!rawValue) {
    return fallback;
  }
  const normalized = rawValue.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  return fallback;
}

function resolvePositiveInteger(rawValue, fallback) {
  const value = Number(rawValue);
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return Math.floor(value);
}

function cleanupPromptText(value) {
  return value
    .replace(/^#(?:codex작업시작|codex보냄|행복이)\s*/m, "")
    .replace(/^\s+|\s+$/g, "")
    .trim();
}

function extractMessageBody(message) {
  const text = typeof message?.text === "string"
    ? message.text
    : typeof message?.caption === "string"
      ? message.caption
      : "";
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function buildJobId(updateId) {
  const now = new Date();
  const timestamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    "-",
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
  return `${timestamp}-u${updateId}`;
}

async function loadState(filePath) {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      lastUpdateId: Number.isFinite(parsed?.lastUpdateId)
        ? parsed.lastUpdateId
        : 0,
      activeJob: normalizeActiveJobState(parsed?.activeJob),
      resumableJob: normalizeResumableJobState(parsed?.resumableJob),
      desktop: normalizeDesktopState(parsed?.desktop),
    };
  } catch (error) {
    if (isMissingFileError(error)) {
      return {
        lastUpdateId: 0,
        activeJob: null,
        resumableJob: null,
        desktop: normalizeDesktopState(),
      };
    }
    throw error;
  }
}

async function saveState(filePath, state) {
  await writeFile(filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function normalizeDesktopState(rawState = {}) {
  const rawThreads = rawState && typeof rawState === "object"
    ? rawState.threads
    : undefined;
  const threads = {};
  if (rawThreads && typeof rawThreads === "object") {
    for (const [threadId, threadState] of Object.entries(rawThreads)) {
      threads[threadId] = buildDesktopThreadState(threadState);
    }
  }

  return {
    bootstrappedAt:
      rawState && typeof rawState.bootstrappedAt === "string"
        ? rawState.bootstrappedAt
        : "",
    threads,
  };
}

function ensureDesktopState(state) {
  if (!state.desktop) {
    state.desktop = normalizeDesktopState();
  }
  return state.desktop;
}

function normalizeActiveJobState(rawState) {
  if (!rawState || typeof rawState !== "object") {
    return null;
  }

  const pid = Number(rawState.pid);
  if (!Number.isFinite(pid) || pid <= 0) {
    return null;
  }

  return {
    jobId: typeof rawState.jobId === "string" ? rawState.jobId : "",
    updateId: Number.isFinite(rawState.updateId) ? rawState.updateId : 0,
    commandMessageId: Number.isFinite(rawState.commandMessageId) ? rawState.commandMessageId : 0,
    jobDir: typeof rawState.jobDir === "string" ? rawState.jobDir : "",
    promptPreview: typeof rawState.promptPreview === "string" ? rawState.promptPreview : "",
    startedAt: typeof rawState.startedAt === "string" ? rawState.startedAt : "",
    stopRequested: Boolean(rawState.stopRequested),
    stopRequestedAt: typeof rawState.stopRequestedAt === "string" ? rawState.stopRequestedAt : "",
    promptFile: typeof rawState.promptFile === "string" ? rawState.promptFile : "",
    resultFile: typeof rawState.resultFile === "string" ? rawState.resultFile : "",
    stdoutFile: typeof rawState.stdoutFile === "string" ? rawState.stdoutFile : "",
    stderrFile: typeof rawState.stderrFile === "string" ? rawState.stderrFile : "",
    pid,
  };
}

function snapshotActiveJob(activeJob) {
  return normalizeActiveJobState({
    jobId: activeJob.jobId,
    updateId: activeJob.updateId,
    commandMessageId: activeJob.commandMessageId,
    jobDir: activeJob.jobDir,
    promptPreview: activeJob.promptPreview,
    startedAt: activeJob.startedAt,
    stopRequested: activeJob.stopRequested,
    stopRequestedAt: activeJob.stopRequestedAt,
    promptFile: activeJob.promptFile,
    resultFile: activeJob.resultFile,
    stdoutFile: activeJob.stdoutFile,
    stderrFile: activeJob.stderrFile,
    pid: activeJob.pid || activeJob.child?.pid,
  });
}

function normalizeResumableJobState(rawState) {
  if (!rawState || typeof rawState !== "object") {
    return null;
  }

  const jobId = typeof rawState.jobId === "string" ? rawState.jobId : "";
  const promptFile = typeof rawState.promptFile === "string" ? rawState.promptFile : "";
  const jobDir = typeof rawState.jobDir === "string" ? rawState.jobDir : "";
  if (!jobId || !promptFile || !jobDir) {
    return null;
  }

  return {
    jobId,
    updateId: Number.isFinite(rawState.updateId) ? rawState.updateId : 0,
    commandMessageId: Number.isFinite(rawState.commandMessageId) ? rawState.commandMessageId : 0,
    jobDir,
    promptPreview: typeof rawState.promptPreview === "string" ? rawState.promptPreview : "",
    startedAt: typeof rawState.startedAt === "string" ? rawState.startedAt : "",
    stopRequestedAt: typeof rawState.stopRequestedAt === "string" ? rawState.stopRequestedAt : "",
    stoppedAt: typeof rawState.stoppedAt === "string" ? rawState.stoppedAt : "",
    promptFile,
    resultFile: typeof rawState.resultFile === "string" ? rawState.resultFile : "",
    stdoutFile: typeof rawState.stdoutFile === "string" ? rawState.stdoutFile : "",
    stderrFile: typeof rawState.stderrFile === "string" ? rawState.stderrFile : "",
    summaryPreview: typeof rawState.summaryPreview === "string" ? rawState.summaryPreview : "",
  };
}

function snapshotResumableJob(activeJob, jobResult) {
  return normalizeResumableJobState({
    jobId: activeJob.jobId,
    updateId: activeJob.updateId,
    commandMessageId: activeJob.commandMessageId,
    jobDir: activeJob.jobDir,
    promptPreview: activeJob.promptPreview,
    startedAt: activeJob.startedAt,
    stopRequestedAt: activeJob.stopRequestedAt,
    stoppedAt: new Date().toISOString(),
    promptFile: activeJob.promptFile,
    resultFile: activeJob.resultFile,
    stdoutFile: activeJob.stdoutFile,
    stderrFile: activeJob.stderrFile,
    summaryPreview: summarizeThreadLabel(jobResult.reportText || "", 200),
  });
}

function buildRecoveredActiveJob(activeJobState) {
  return {
    ...activeJobState,
    recovered: true,
    child: null,
    markStopRequested() {},
    completion: Promise.resolve({
      success: false,
      reportText: "",
      jobDir: activeJobState.jobDir,
      cancelled: false,
    }),
  };
}

function syncRuntimeActiveJobFromState(runtime, state) {
  let stateChanged = false;

  if (runtime.activeJob) {
    if (!isProcessRunning(runtime.activeJob.pid || runtime.activeJob.child?.pid)) {
      const snapshot = snapshotActiveJob(runtime.activeJob);
      if (snapshot.stopRequested) {
        state.resumableJob = snapshotResumableJob(snapshot, {
          reportText: "",
        });
        runtime.lastKnownJob = {
          ...state.resumableJob,
          staleReason: "stopped",
        };
      } else {
        runtime.lastKnownJob = {
          ...snapshot,
          staleReason: "process-missing",
        };
      }
      runtime.activeJob = null;
      state.activeJob = null;
      stateChanged = true;
      return stateChanged;
    }

    const snapshot = snapshotActiveJob(runtime.activeJob);
    if (JSON.stringify(snapshot) !== JSON.stringify(state.activeJob)) {
      state.activeJob = snapshot;
      stateChanged = true;
    }
    return stateChanged;
  }

  if (!state.activeJob) {
    if (state.resumableJob) {
      runtime.lastKnownJob = {
        ...state.resumableJob,
        staleReason: "stopped",
      };
    } else if (!runtime.activeJob) {
      runtime.lastKnownJob = null;
    }
    return stateChanged;
  }

  if (isProcessRunning(state.activeJob.pid)) {
    runtime.activeJob = buildRecoveredActiveJob(state.activeJob);
    return stateChanged;
  }

  if (state.activeJob.stopRequested) {
    state.resumableJob = snapshotResumableJob(state.activeJob, {
      reportText: "",
    });
    runtime.lastKnownJob = {
      ...state.resumableJob,
      staleReason: "stopped",
    };
  } else {
    runtime.lastKnownJob = {
      ...state.activeJob,
      staleReason: "bridge-restarted-or-job-finished",
    };
  }
  state.activeJob = null;
  stateChanged = true;
  return stateChanged;
}

function buildDesktopThreadState(rawState = {}) {
  return {
    lastSentKey:
      rawState && typeof rawState.lastSentKey === "string"
        ? rawState.lastSentKey
        : "",
    lastFileSize:
      rawState && Number.isFinite(rawState.lastFileSize)
        ? rawState.lastFileSize
        : -1,
    lastFileMtimeMs:
      rawState && Number.isFinite(rawState.lastFileMtimeMs)
        ? rawState.lastFileMtimeMs
        : -1,
  };
}

async function resolveDesktopStateDbPath(rawValue) {
  if (rawValue) {
    return path.resolve(expandHome(rawValue));
  }

  const codexHome = path.join(os.homedir(), ".codex");
  const entries = await readdir(codexHome, { withFileTypes: true }).catch(() => []);
  const candidateStats = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && /^state_\d+\.sqlite$/.test(entry.name))
      .map(async (entry) => {
        const filePath = path.join(codexHome, entry.name);
        const fileInfo = await stat(filePath).catch(() => null);
        return fileInfo
          ? { filePath, mtimeMs: fileInfo.mtimeMs }
          : null;
      }),
  );

  return candidateStats
    .filter(Boolean)
    .sort((left, right) => right.mtimeMs - left.mtimeMs)[0]?.filePath || "";
}

async function listDesktopThreads(config) {
  if (!config.desktopStateDbPath) {
    return [];
  }

  const sourceFilter = config.desktopThreadSources
    .map((value) => `'${escapeSqlText(value)}'`)
    .join(", ");
  const query = [
    "select",
    "id,",
    "rollout_path as rolloutPath,",
    "source,",
    "cwd,",
    "title,",
    "updated_at as updatedAt",
    "from threads",
    `where cwd = '${escapeSqlText(config.workdir)}'`,
    "and archived = 0",
    `and source in (${sourceFilter})`,
    "order by updated_at desc",
    `limit ${config.desktopThreadLimit};`,
  ].join(" ");

  const execution = await spawnCapture([
    "sqlite3",
    "-json",
    config.desktopStateDbPath,
    query,
  ]);
  if (execution.exitCode !== 0) {
    throw new Error(
      `Codex 데스크톱 스레드 조회 실패: ${execution.stderr.trim() || execution.stdout.trim() || execution.exitCode}`,
    );
  }

  const parsed = JSON.parse(execution.stdout || "[]");
  return Array.isArray(parsed)
    ? parsed.filter((row) =>
      row
      && typeof row.id === "string"
      && typeof row.rolloutPath === "string"
      && typeof row.title === "string"
    )
    : [];
}

async function readLatestDesktopFinal(rolloutPath) {
  const raw = await readFile(rolloutPath, "utf8").catch(() => "");
  if (!raw.trim()) {
    return null;
  }

  const lines = raw.split(/\r?\n/).filter(Boolean);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const record = safeParseJson(lines[index]);
    if (!record || typeof record !== "object") {
      continue;
    }

    const finalFromEvent = extractDesktopFinalFromEvent(record);
    if (finalFromEvent) {
      return finalFromEvent;
    }

    const finalFromResponseItem = extractDesktopFinalFromResponseItem(record);
    if (finalFromResponseItem) {
      return finalFromResponseItem;
    }
  }

  return null;
}

function extractDesktopFinalFromEvent(record) {
  if (
    record.type !== "event_msg"
    || record.payload?.type !== "agent_message"
    || record.payload?.phase !== "final_answer"
  ) {
    return null;
  }

  const text = typeof record.payload.message === "string"
    ? record.payload.message.trim()
    : "";
  if (!text) {
    return null;
  }

  return {
    timestamp: typeof record.timestamp === "string" ? record.timestamp : "",
    text,
  };
}

function extractDesktopFinalFromResponseItem(record) {
  if (
    record.type !== "response_item"
    || record.payload?.type !== "message"
    || record.payload?.role !== "assistant"
    || record.payload?.phase !== "final_answer"
  ) {
    return null;
  }

  const text = extractResponseMessageText(record.payload.content);
  if (!text) {
    return null;
  }

  return {
    timestamp: typeof record.timestamp === "string" ? record.timestamp : "",
    text,
  };
}

function extractResponseMessageText(content) {
  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((item) => item && item.type === "output_text" && typeof item.text === "string"
      ? item.text
      : "")
    .join("\n")
    .trim();
}

function buildDesktopFinalKey(latestFinal) {
  return createHash("sha1")
    .update(`${latestFinal.timestamp}\n${latestFinal.text}`)
    .digest("hex");
}

function terminateActiveJob(activeJob) {
  const child = activeJob?.child ?? null;
  const pid = activeJob?.pid || child?.pid;
  if (!pid) {
    return;
  }

  if (process.platform !== "win32") {
    try {
      process.kill(-pid, "SIGTERM");
    } catch {
      if (child) {
        child.kill("SIGTERM");
      }
    }

    setTimeout(() => {
      if (isProcessRunning(pid)) {
        try {
          process.kill(-pid, "SIGKILL");
        } catch {
          if (child) {
            child.kill("SIGKILL");
          }
        }
      }
    }, 3000).unref();
    return;
  }

  try {
    if (child) {
      child.kill("SIGTERM");
    } else {
      process.kill(pid, "SIGTERM");
    }
  } catch {}
}

function isCancelledExecution(executionResult, resultText, stopRequested) {
  if (!stopRequested) {
    return false;
  }
  if (executionResult.signal) {
    return true;
  }
  if (executionResult.exitCode !== 0) {
    return true;
  }
  return !resultText.trim();
}

function buildBridgeStatusReport(config, runtime) {
  const lines = [
    "bridge 상태",
    `감지 명령: ${config.triggerCommands.join(", ")}`,
    `중지 명령: ${config.stopCommands.join(", ")}`,
    `상태 명령: ${config.statusCommands.join(", ")}`,
    `재개 명령: ${config.resumeCommands.join(", ")}`,
    `데스크톱 watcher: ${config.desktopWatchEnabled ? "켜짐" : "꺼짐"}`,
  ];

  if (!runtime.activeJob) {
    if (runtime.lastKnownJob) {
      lines.push(
        "직전 작업 정보는 있지만 현재 실행 중인 Codex 프로세스는 없습니다.",
        `마지막 작업 번호: ${runtime.lastKnownJob.jobId}`,
        `마지막 작업 시작: ${formatStatusTime(runtime.lastKnownJob.startedAt)}`,
        "bridge 재시작 또는 작업 종료 과정에서 상태가 유실되었을 수 있습니다.",
      );
      if (runtime.lastKnownJob.staleReason === "stopped") {
        lines.push(`재개 가능 명령: ${config.resumeCommands.join(", ")}`);
      }
      return lines.join("\n");
    }
    lines.push("현재 실행 중인 Codex 작업이 없습니다.");
    return lines.join("\n");
  }

  lines.push(
    `현재 작업: ${runtime.activeJob.stopRequested ? "중지 요청됨" : "진행 중"}`,
    `작업 번호: ${runtime.activeJob.jobId}`,
    `시작 시각: ${formatStatusTime(runtime.activeJob.startedAt)}`,
    `작업 경로: ${config.workdir}`,
    `프롬프트 미리보기: ${summarizeThreadLabel(runtime.activeJob.promptPreview || "없음", 120)}`,
  );

  if (runtime.activeJob.stopRequestedAt) {
    lines.push(`중지 요청 시각: ${formatStatusTime(runtime.activeJob.stopRequestedAt)}`);
  }

  return lines.join("\n");
}

function buildBusyReport(activeJob) {
  return [
    "현재 다른 Codex 작업이 진행 중입니다.",
    `작업 번호: ${activeJob.jobId}`,
    `현재 상태: ${activeJob.stopRequested ? "중지 요청됨" : "진행 중"}`,
    "진행 상황은 #상태 로 확인하고, 멈추려면 #중지 를 보내 주세요.",
  ].join("\n");
}

function appendCompletedMarker(reportText, completedMessage) {
  const normalized = String(reportText || "").trim();
  if (!normalized) {
    return completedMessage;
  }
  if (normalized.endsWith(completedMessage)) {
    return normalized;
  }
  return `${normalized}\n\n${completedMessage}`;
}

async function buildResumePrompt(resumableJob) {
  const originalPrompt = await readFile(resumableJob.promptFile, "utf8").catch(() => "");
  if (!originalPrompt.trim()) {
    throw new Error(`이전 작업 프롬프트를 찾지 못했습니다: ${resumableJob.promptFile}`);
  }

  const priorOutput = await summarizeResumableOutput(resumableJob);
  return [
    originalPrompt.trim(),
    "",
    "추가 지시:",
    `- 이전 작업 번호 ${resumableJob.jobId} 는 사용자의 #중지 요청으로 중단되었습니다.`,
    "- 이미 끝난 내용은 반복하지 말고, 중단된 지점부터 자연스럽게 이어서 마무리하세요.",
    "- 이전에 완료한 설명과 중복되는 긴 재서술은 피하고, 필요한 부분만 이어서 정리하세요.",
    priorOutput
      ? `- 이전 실행의 마지막 출력 일부를 참고하세요.\n\n이전 출력 일부:\n${priorOutput}`
      : "- 이전 실행에서 남은 출력은 거의 없습니다. 현재 프롬프트를 기준으로 이어서 진행하세요.",
  ].join("\n");
}

async function summarizeResumableOutput(resumableJob) {
  const outputParts = await Promise.all([
    resumableJob.resultFile ? readFile(resumableJob.resultFile, "utf8").catch(() => "") : "",
    resumableJob.stdoutFile ? readFile(resumableJob.stdoutFile, "utf8").catch(() => "") : "",
    resumableJob.stderrFile ? readFile(resumableJob.stderrFile, "utf8").catch(() => "") : "",
  ]);

  return summarizeOutputTail(
    outputParts.filter(Boolean).join("\n"),
    {
      tailLines: 60,
      tailChars: 2600,
    },
  );
}

function buildResumePreview(resumableJob) {
  return [
    `중지된 작업 ${resumableJob.jobId} 재개`,
    resumableJob.promptPreview || "",
  ].filter(Boolean).join(" - ");
}

function formatStatusTime(value) {
  if (!value) {
    return "알 수 없음";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("ko-KR", { hour12: false });
}

function isProcessRunning(pid) {
  const numericPid = Number(pid);
  if (!Number.isFinite(numericPid) || numericPid <= 0) {
    return false;
  }

  try {
    process.kill(numericPid, 0);
    return true;
  } catch {
    return false;
  }
}

async function readFileInfo(filePath) {
  const fileInfo = await stat(filePath).catch(() => null);
  if (!fileInfo) {
    return {
      size: -1,
      mtimeMs: -1,
    };
  }

  return {
    size: fileInfo.size,
    mtimeMs: fileInfo.mtimeMs,
  };
}

async function spawnCapture(command, input = "") {
  return new Promise((resolve, reject) => {
    const child = spawn(command[0], command.slice(1), {
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", (error) => reject(error));
    child.on("close", (exitCode, signal) => {
      resolve({
        stdout,
        stderr,
        exitCode: exitCode ?? 1,
        signal: signal ?? "",
      });
    });

    child.stdin.write(input);
    child.stdin.end();
  });
}

function summarizeThreadLabel(value, maxLength = 90) {
  const normalized = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) {
    return "제목 없음";
  }
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function escapeSqlText(value) {
  return String(value).replace(/'/g, "''");
}

function safeParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function expandHome(value) {
  if (!value.startsWith("~/")) {
    return value;
  }
  return path.join(os.homedir(), value.slice(2));
}

function parseArgs(argv) {
  const options = {
    once: false,
    dryRun: false,
    chatId: "",
    stateFile: "",
    jobRoot: "",
    workdir: "",
    pollTimeoutSec: DEFAULT_POLL_TIMEOUT_SEC,
    idleSleepMs: DEFAULT_IDLE_SLEEP_MS,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case "--once":
        options.once = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--chat-id":
        options.chatId = argv[index + 1] ?? "";
        index += 1;
        break;
      case "--state-file":
        options.stateFile = argv[index + 1] ?? "";
        index += 1;
        break;
      case "--job-root":
        options.jobRoot = argv[index + 1] ?? "";
        index += 1;
        break;
      case "--workdir":
        options.workdir = argv[index + 1] ?? "";
        index += 1;
        break;
      case "--poll-timeout":
        options.pollTimeoutSec = Number(argv[index + 1] ?? DEFAULT_POLL_TIMEOUT_SEC);
        index += 1;
        break;
      case "--idle-sleep-ms":
        options.idleSleepMs = Number(argv[index + 1] ?? DEFAULT_IDLE_SLEEP_MS);
        index += 1;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      default:
        throw new Error(`알 수 없는 옵션입니다: ${arg}`);
    }
  }

  if (!Number.isFinite(options.pollTimeoutSec) || options.pollTimeoutSec <= 0) {
    throw new Error("--poll-timeout 은 1 이상의 숫자여야 합니다.");
  }
  if (!Number.isFinite(options.idleSleepMs) || options.idleSleepMs < 0) {
    throw new Error("--idle-sleep-ms 는 0 이상의 숫자여야 합니다.");
  }

  return options;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

async function sleep(ms) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isMissingFileError(error) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "ENOENT");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
