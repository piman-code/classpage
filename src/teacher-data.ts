import { App, TFile, normalizePath } from "obsidian";
import {
  normalizeClassSummaryAggregate,
  normalizeLessonSummaryAggregate,
  normalizeStarModeLedger,
} from "./defaults";
import type {
  AggregateSourceState,
  ClassSummaryAggregate,
  LessonSummaryAggregate,
  StarModeLedger,
  TeacherPageData,
  TeacherPageSettings,
} from "./types";

export async function loadTeacherPageData(
  app: App,
  settings: TeacherPageSettings,
): Promise<TeacherPageData> {
  const [classSummary, lessonSummary, starLedger] = await Promise.all([
    loadAggregateFile<ClassSummaryAggregate>(
      app,
      "class",
      settings.sources.classSummaryPath,
      "class-summary",
      normalizeClassSummaryAggregate,
    ),
    loadAggregateFile<LessonSummaryAggregate>(
      app,
      "lesson",
      settings.sources.lessonSummaryPath,
      "lesson-summary",
      normalizeLessonSummaryAggregate,
    ),
    loadAggregateFile<StarModeLedger>(
      app,
      "star",
      settings.sources.starLedgerPath,
      "star-ledger",
      normalizeStarModeLedger,
    ),
  ]);

  return {
    classSummary,
    lessonSummary,
    starLedger,
  };
}

async function loadAggregateFile<T>(
  app: App,
  kind: "class" | "lesson" | "star",
  path: string,
  expectedType: "class-summary" | "lesson-summary" | "star-ledger",
  parser: (value: unknown) => T,
): Promise<AggregateSourceState<T>> {
  const normalizedPath = normalizePath(path.trim());

  if (!normalizedPath) {
    return {
      kind,
      path: "",
      status: "missing",
      message: "집계 파일 경로가 비어 있습니다. Settings -> classpage에서 집계 파일 경로를 먼저 입력해 주세요.",
      data: null,
    };
  }

  const file = app.vault.getAbstractFileByPath(normalizedPath);
  if (!(file instanceof TFile)) {
    return {
      kind,
      path: normalizedPath,
      status: "missing",
      message: "설정된 경로에 집계 파일이 없습니다. 처음 연결 중이라면 정상입니다. 파일 생성과 경로를 다시 확인해 주세요.",
      data: null,
    };
  }

  try {
    const raw = await app.vault.cachedRead(file);
    const parsed = JSON.parse(raw) as unknown;

    if (!hasExpectedAggregateType(parsed, expectedType)) {
      const actualType = getAggregateTypeLabel(parsed);
      throw new Error(
        `기대한 집계 형식은 ${expectedType}인데 현재 파일은 ${actualType} 입니다.`,
      );
    }

    return {
      kind,
      path: normalizedPath,
      status: "loaded",
      message: "집계 결과를 정상적으로 읽었습니다.",
      data: parser(parsed),
    };
  } catch (error) {
    const message = error instanceof SyntaxError
      ? `JSON 형식 오류: ${error.message}`
      : error instanceof Error
        ? error.message
        : "알 수 없는 오류";
    const status = error instanceof SyntaxError || error instanceof Error
      ? "invalid"
      : "error";

    return {
      kind,
      path: normalizedPath,
      status,
      message,
      data: null,
    };
  }
}

function hasExpectedAggregateType(
  value: unknown,
  expectedType: "class-summary" | "lesson-summary" | "star-ledger",
): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (value as { type?: unknown }).type === expectedType;
}

function getAggregateTypeLabel(value: unknown): string {
  if (!value || typeof value !== "object") {
    return "알 수 없는 형식";
  }

  const type = (value as { type?: unknown }).type;
  return typeof type === "string" && type.trim().length > 0
    ? type
    : "type 없음";
}
