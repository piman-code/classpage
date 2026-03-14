import {
  getStudentLookupKey,
  normalizeStudentNumberValue,
} from "./student-identity";
import type {
  StudentRoster,
  StudentRosterEntry,
} from "./types";

type SupportedColumnKey = "classroom" | "number" | "name" | "studentId" | "note";

export interface StudentRosterImportSummary {
  detectedDelimiter: "comma" | "tab" | "semicolon";
  totalDataRows: number;
  importedCount: number;
  skippedEmptyRows: number;
  skippedIncompleteRows: number;
  duplicateCount: number;
  missingRequiredColumns: string[];
  detectedColumns: Partial<Record<SupportedColumnKey, string>>;
  duplicateExamples: string[];
  previewStudents: StudentRosterEntry[];
  messages: string[];
}

export type StudentRosterImportResult =
  | {
      ok: true;
      roster: StudentRoster;
      summary: StudentRosterImportSummary;
    }
  | {
      ok: false;
      message: string;
      summary: StudentRosterImportSummary;
    };

const COLUMN_ALIASES: Record<SupportedColumnKey, string[]> = {
  classroom: [
    "classroom",
    "class",
    "classnumber",
    "반",
    "학급",
    "반명",
  ],
  number: [
    "number",
    "no",
    "studentnumber",
    "studentno",
    "번호",
    "출석번호",
  ],
  name: [
    "name",
    "studentname",
    "이름",
    "학생명",
    "성명",
  ],
  studentId: [
    "studentid",
    "id",
    "학번",
    "학생id",
    "학생번호",
  ],
  note: [
    "note",
    "memo",
    "remark",
    "비고",
    "메모",
  ],
};

export function importStudentRosterFromDelimitedText(
  text: string,
  options: {
    defaultClassroom?: string;
    sourceLabel?: string;
    generatedAt?: string;
  } = {},
): StudentRosterImportResult {
  const cleanedText = text.replace(/^\uFEFF/, "").trim();
  const emptySummary = buildEmptySummary();

  if (!cleanedText) {
    return {
      ok: false,
      message: "붙여넣은 CSV 내용이 비어 있습니다. CSV 파일 내용을 붙여넣거나 파일을 먼저 불러와 주세요.",
      summary: emptySummary,
    };
  }

  const detectedDelimiter = detectDelimiter(cleanedText);
  const rows = parseDelimitedText(cleanedText, getDelimiterCharacter(detectedDelimiter))
    .filter((row) => row.some((cell) => cell.trim().length > 0));

  if (rows.length === 0) {
    return {
      ok: false,
      message: "읽을 수 있는 행이 없습니다. 첫 줄에는 헤더가 있어야 하고, 그 아래에 학생 행이 있어야 합니다.",
      summary: {
        ...emptySummary,
        detectedDelimiter,
      },
    };
  }

  const headerRow = rows[0].map((value) => value.trim());
  const dataRows = rows.slice(1);
  const normalizedHeaders = headerRow.map((value) => normalizeHeaderName(value));
  const defaultClassroom = normalizeImportedClassroom(options.defaultClassroom ?? "");
  const detectedColumns = resolveDetectedColumns(headerRow, normalizedHeaders);
  const missingRequiredColumns = [
    !detectedColumns.classroom && !defaultClassroom ? "반(classroom/class/반/학급)" : "",
    !detectedColumns.number ? "번호(number/no/번호)" : "",
    !detectedColumns.name ? "이름(name/이름/학생명)" : "",
  ].filter(Boolean);

  const baseSummary: StudentRosterImportSummary = {
    ...emptySummary,
    detectedDelimiter,
    totalDataRows: dataRows.length,
    missingRequiredColumns,
    detectedColumns,
  };

  if (missingRequiredColumns.length > 0) {
    return {
      ok: false,
      message: `필수 컬럼을 찾지 못했습니다: ${missingRequiredColumns.join(", ")}.`,
      summary: {
        ...baseSummary,
        messages: [
          `필수 컬럼을 찾지 못했습니다: ${missingRequiredColumns.join(", ")}.`,
          "첫 줄 헤더를 확인해 주세요. 예: classroom, number, name",
          "엑셀이나 구글 시트에서 붙여넣었다면 제목 행이 첫 줄에 있어야 합니다.",
          defaultClassroom
            ? `기본 학급 ${defaultClassroom} 기준으로 읽도록 설정했으므로 반 컬럼은 없어도 됩니다.`
            : "반 컬럼이 없다면 기본 학급을 함께 입력해 주세요.",
        ],
      },
    };
  }

  const students: StudentRosterEntry[] = [];
  const seenKeys = new Set<string>();
  const duplicateExamples: string[] = [];
  let skippedEmptyRows = 0;
  let skippedIncompleteRows = 0;
  let duplicateCount = 0;

  for (const row of dataRows) {
    if (row.every((cell) => cell.trim().length === 0)) {
      skippedEmptyRows += 1;
      continue;
    }

    const classroom = normalizeImportedClassroom(
      getCellValue(row, headerRow, detectedColumns.classroom) || defaultClassroom,
    );
    const number = normalizeImportedNumber(
      getCellValue(row, headerRow, detectedColumns.number),
    );
    const name = normalizeImportedName(
      getCellValue(row, headerRow, detectedColumns.name),
    );
    const studentId = normalizeImportedText(
      getCellValue(row, headerRow, detectedColumns.studentId),
    );
    const note = normalizeImportedText(
      getCellValue(row, headerRow, detectedColumns.note),
    );

    if (!classroom || !number || !name) {
      skippedIncompleteRows += 1;
      continue;
    }

    const student: StudentRosterEntry = {
      classroom,
      number,
      name,
      studentId,
      note,
    };
    const key = getStudentLookupKey(student);
    if (key && seenKeys.has(key)) {
      duplicateCount += 1;
      if (duplicateExamples.length < 3) {
        duplicateExamples.push(formatImportedStudent(student));
      }
      continue;
    }

    if (key) {
      seenKeys.add(key);
    }
    students.push(student);
  }

  if (students.length === 0) {
    return {
      ok: false,
      message: "읽은 학생이 없습니다. 반, 번호, 이름이 모두 채워진 행이 있는지 확인해 주세요.",
      summary: {
        ...baseSummary,
        skippedEmptyRows,
        skippedIncompleteRows,
        duplicateCount,
        duplicateExamples,
        messages: [
          "읽은 학생이 없습니다.",
          skippedIncompleteRows > 0
            ? `반/번호/이름이 비어 있는 행 ${skippedIncompleteRows}개는 제외되었습니다.`
            : "반, 번호, 이름이 모두 들어 있는 학생 행이 필요합니다.",
        ],
      },
    };
  }

  const roster: StudentRoster = {
    type: "student-roster",
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    sourceLabel: normalizeImportedText(options.sourceLabel ?? "")
      || "classpage CSV 가져오기",
    defaultClassroom: defaultClassroom || getCommonClassroom(students),
    students,
  };
  const messages = [
    `학생 ${students.length}명을 읽었습니다.`,
    skippedEmptyRows > 0 ? `빈 행 ${skippedEmptyRows}개는 제외했습니다.` : "",
    skippedIncompleteRows > 0
      ? `반/번호/이름이 비어 있는 행 ${skippedIncompleteRows}개는 제외했습니다.`
      : "",
    duplicateCount > 0
      ? `중복 가능성이 있는 학생 ${duplicateCount}명은 한 번만 남겼습니다.`
      : "",
    duplicateExamples.length > 0
      ? `중복 예시: ${duplicateExamples.join(", ")}`
      : "",
    !detectedColumns.classroom && defaultClassroom
      ? `반 컬럼이 없어 기본 학급 ${defaultClassroom} 기준으로 읽었습니다.`
      : "",
  ].filter(Boolean);

  return {
    ok: true,
    roster,
    summary: {
      ...baseSummary,
      importedCount: students.length,
      skippedEmptyRows,
      skippedIncompleteRows,
      duplicateCount,
      duplicateExamples,
      previewStudents: students.slice(0, 5),
      messages,
    },
  };
}

function buildEmptySummary(): StudentRosterImportSummary {
  return {
    detectedDelimiter: "comma",
    totalDataRows: 0,
    importedCount: 0,
    skippedEmptyRows: 0,
    skippedIncompleteRows: 0,
    duplicateCount: 0,
    missingRequiredColumns: [],
    detectedColumns: {},
    duplicateExamples: [],
    previewStudents: [],
    messages: [],
  };
}

function detectDelimiter(text: string): StudentRosterImportSummary["detectedDelimiter"] {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim().length > 0) ?? "";
  const tabCount = (firstLine.match(/\t/g) ?? []).length;
  const semicolonCount = (firstLine.match(/;/g) ?? []).length;
  const commaCount = (firstLine.match(/,/g) ?? []).length;

  if (tabCount >= commaCount && tabCount >= semicolonCount && tabCount > 0) {
    return "tab";
  }

  if (semicolonCount > commaCount && semicolonCount > 0) {
    return "semicolon";
  }

  return "comma";
}

function getDelimiterCharacter(
  delimiter: StudentRosterImportSummary["detectedDelimiter"],
): string {
  switch (delimiter) {
    case "tab":
      return "\t";
    case "semicolon":
      return ";";
    default:
      return ",";
  }
}

function parseDelimitedText(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === "\"") {
      if (inQuotes && nextChar === "\"") {
        currentCell += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += char;
  }

  currentRow.push(currentCell);
  rows.push(currentRow);
  return rows;
}

function resolveDetectedColumns(
  originalHeaders: string[],
  normalizedHeaders: string[],
): Partial<Record<SupportedColumnKey, string>> {
  const result: Partial<Record<SupportedColumnKey, string>> = {};

  for (const [columnKey, aliases] of Object.entries(COLUMN_ALIASES) as Array<
    [SupportedColumnKey, string[]]
  >) {
    const matchIndex = normalizedHeaders.findIndex((header) => aliases.includes(header));
    if (matchIndex !== -1) {
      result[columnKey] = originalHeaders[matchIndex];
    }
  }

  return result;
}

function normalizeHeaderName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "").replace(/[_-]+/g, "");
}

function getCellValue(
  row: string[],
  headers: string[],
  targetHeader: string | undefined,
): string {
  if (!targetHeader) {
    return "";
  }

  const index = headers.indexOf(targetHeader);
  return index >= 0 ? row[index] ?? "" : "";
}

function normalizeImportedText(value: string): string {
  return value.trim();
}

function normalizeImportedClassroom(value: string): string {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return "";
  }

  const compact = trimmed.replace(/\s+/g, "");
  const gradeClassMatch = compact.match(/^(\d+)학년(\d+)반$/)
    || compact.match(/^(\d+)[-/](\d+)$/)
    || compact.match(/^(\d+)\.(\d+)$/);
  if (gradeClassMatch) {
    return `${Number(gradeClassMatch[1])}-${Number(gradeClassMatch[2])}`;
  }

  const classOnlyMatch = compact.match(/^(\d+)반$/) || compact.match(/^(\d+)$/);
  if (classOnlyMatch) {
    return `${Number(classOnlyMatch[1])}반`;
  }

  return trimmed;
}

function normalizeImportedNumber(value: string): string {
  return normalizeStudentNumberValue(value);
}

function normalizeImportedName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function getCommonClassroom(students: StudentRosterEntry[]): string {
  const classrooms = students
    .map((student) => student.classroom)
    .filter((value, index, array) => value.length > 0 && array.indexOf(value) === index);

  return classrooms.length === 1 ? classrooms[0] : "";
}

function formatImportedStudent(student: StudentRosterEntry): string {
  return [student.classroom, student.number ? `${student.number}번` : "", student.name]
    .filter(Boolean)
    .join(" ")
    .trim();
}
