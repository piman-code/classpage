import { App, TFile, normalizePath } from "obsidian";
import {
  normalizeClassSummaryAggregate,
  normalizeLessonSummaryAggregate,
} from "./defaults";
import type {
  AggregateSourceState,
  ClassSummaryAggregate,
  LessonSummaryAggregate,
  TeacherPageData,
  TeacherPageSettings,
} from "./types";

export async function loadTeacherPageData(
  app: App,
  settings: TeacherPageSettings,
): Promise<TeacherPageData> {
  const [classSummary, lessonSummary] = await Promise.all([
    loadAggregateFile<ClassSummaryAggregate>(
      app,
      "class",
      settings.sources.classSummaryPath,
      normalizeClassSummaryAggregate,
    ),
    loadAggregateFile<LessonSummaryAggregate>(
      app,
      "lesson",
      settings.sources.lessonSummaryPath,
      normalizeLessonSummaryAggregate,
    ),
  ]);

  return {
    classSummary,
    lessonSummary,
  };
}

async function loadAggregateFile<T>(
  app: App,
  kind: "class" | "lesson",
  path: string,
  parser: (value: unknown) => T,
): Promise<AggregateSourceState<T>> {
  const normalizedPath = normalizePath(path.trim());

  if (!normalizedPath) {
    return {
      kind,
      path: "",
      status: "missing",
      message: "집계 파일 경로가 비어 있습니다. Settings -> classpage에서 JSON 경로를 입력하세요.",
      data: null,
    };
  }

  const file = app.vault.getAbstractFileByPath(normalizedPath);
  if (!(file instanceof TFile)) {
    return {
      kind,
      path: normalizedPath,
      status: "missing",
      message: "설정된 경로에 JSON 파일이 없습니다. docs/BEGINNER_SETUP.md의 16단계를 확인하세요.",
      data: null,
    };
  }

  try {
    const raw = await app.vault.cachedRead(file);
    const parsed = JSON.parse(raw) as unknown;

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
