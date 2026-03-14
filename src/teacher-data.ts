import { App, TFile, normalizePath } from "obsidian";
import {
  normalizeClassSummaryAggregate,
  normalizeLessonSummaryAggregate,
  normalizeStudentRoster,
  normalizeStudentPhotoMap,
  normalizeStarModeLedger,
} from "./defaults";
import type {
  AggregateSourceState,
  ClassSummaryAggregate,
  LessonSummaryAggregate,
  StudentRoster,
  StarModeLedger,
  TeacherPageData,
  TeacherStudentPhotoMap,
  TeacherStudentPhotoSourceState,
  TeacherStudentRosterSourceState,
  TeacherPageSettings,
} from "./types";

export async function loadTeacherPageData(
  app: App,
  settings: TeacherPageSettings,
): Promise<TeacherPageData> {
  const [classSummary, lessonSummary, starLedger, roster, studentPhotoMap] = await Promise.all([
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
    loadStudentRoster(
      app,
      settings.roster.rosterJsonPath,
    ),
    loadStudentPhotoMap(
      app,
      settings.studentPhotos.mappingJsonPath,
    ),
  ]);

  return {
    classSummary,
    lessonSummary,
    starLedger,
    roster,
    studentPhotoMap,
  };
}

async function loadAggregateFile<T>(
  app: App,
  kind: "class" | "lesson" | "star",
  path: string,
  expectedType: "class-summary" | "lesson-summary" | "star-ledger" | "student-roster",
  parser: (value: unknown) => T,
): Promise<AggregateSourceState<T>> {
  const normalizedPath = normalizePath(path.trim());

  if (!normalizedPath) {
    return {
      kind,
      path: "",
      status: "missing",
      message: "집계 파일 경로가 아직 비어 있습니다. Settings -> classpage에서 경로를 먼저 입력해 주세요.",
      data: null,
    };
  }

  const file = app.vault.getAbstractFileByPath(normalizedPath);
  if (!(file instanceof TFile)) {
    return {
      kind,
      path: normalizedPath,
      status: "missing",
      message: "설정된 경로에 집계 파일이 없습니다. 처음 연결 중이라면 정상일 수 있으니 파일 생성과 경로를 다시 확인해 주세요.",
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
      ? `JSON 형식 오류: ${error.message}. 필요하면 학생 명단 가져오기 도우미에서 다시 저장해도 됩니다.`
      : error instanceof Error
        ? `${error.message} 필요하면 학생 명단 가져오기 도우미에서 다시 저장해도 됩니다.`
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
  expectedType: "class-summary" | "lesson-summary" | "star-ledger" | "student-roster",
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

async function loadStudentRoster(
  app: App,
  path: string,
): Promise<TeacherStudentRosterSourceState> {
  const normalizedPath = normalizePath(path.trim());

  if (!normalizedPath) {
    return {
      path: "",
      status: "disabled",
      message:
        "학생 명단 JSON이 아직 설정되지 않았습니다. 학생 명단 가져오기 도우미에서 CSV를 저장하거나 기존 JSON 경로를 연결하면 응답이 없는 학생도 미제출로 함께 표시합니다.",
      data: null,
    };
  }

  const file = app.vault.getAbstractFileByPath(normalizedPath);
  if (!(file instanceof TFile)) {
    return {
      path: normalizedPath,
      status: "missing",
      message:
        "설정된 경로에 학생 명단 JSON 파일이 없습니다. 경로와 파일 이름을 다시 확인해 주세요. 명단이 없어도 다른 화면은 계속 사용할 수 있습니다.",
      data: null,
    };
  }

  try {
    const raw = await app.vault.cachedRead(file);
    const parsed = JSON.parse(raw) as unknown;

    if (!hasExpectedAggregateType(parsed, "student-roster")) {
      const actualType = getAggregateTypeLabel(parsed);
      throw new Error(
        `학생 명단 JSON은 type이 student-roster 이어야 합니다. 현재 파일은 ${actualType} 입니다.`,
      );
    }

    return {
      path: normalizedPath,
      status: "loaded",
      message: "학생 명단을 읽었습니다.",
      data: normalizeStudentRoster(parsed),
    };
  } catch (error) {
    const message = error instanceof SyntaxError
      ? `JSON 형식 오류: ${error.message}. 사진 없이도 선생님 화면은 계속 사용할 수 있습니다.`
      : error instanceof Error
        ? `${error.message} 사진 없이도 선생님 화면은 계속 사용할 수 있습니다.`
        : "알 수 없는 오류";

    return {
      path: normalizedPath,
      status: error instanceof SyntaxError || error instanceof Error ? "invalid" : "error",
      message,
      data: null,
    };
  }
}

async function loadStudentPhotoMap(
  app: App,
  path: string,
): Promise<TeacherStudentPhotoSourceState> {
  const normalizedPath = normalizePath(path.trim());

  if (!normalizedPath) {
    return {
      path: "",
      status: "disabled",
      message: "학생 사진 매핑 파일이 설정되지 않았습니다. 사진이 없어도 선생님 화면은 정상이며, 학생은 이니셜 아바타로 표시합니다.",
      data: null,
    };
  }

  const file = app.vault.getAbstractFileByPath(normalizedPath);
  if (!(file instanceof TFile)) {
    return {
      path: normalizedPath,
      status: "missing",
      message: "설정된 경로에 학생 사진 매핑 JSON 파일이 없습니다. 경로를 다시 확인해 주세요. 파일이 없어도 이니셜 아바타로 계속 볼 수 있습니다.",
      data: null,
    };
  }

  try {
    const raw = await app.vault.cachedRead(file);
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(
        "학생 사진 매핑 JSON은 { \"classroom|number|name\": \"path/to/image\" } 형식의 객체여야 합니다.",
      );
    }
    const data = normalizeStudentPhotoMap(parsed);
    return {
      path: normalizedPath,
      status: "loaded",
      message: "학생 사진 매핑을 읽었습니다.",
      data,
    };
  } catch (error) {
    const message = error instanceof SyntaxError
      ? `JSON 형식 오류: ${error.message}`
      : error instanceof Error
        ? error.message
        : "알 수 없는 오류";

    return {
      path: normalizedPath,
      status: error instanceof SyntaxError || error instanceof Error ? "invalid" : "error",
      message,
      data: null,
    };
  }
}
