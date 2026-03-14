import type {
  AggregateCountItem,
  AggregateSourceInfo,
  ClassPageFormSettings,
  ClassPageSectionSettings,
  ClassPageSettings,
  ClassSupportStudent,
  ClassStudentResponse,
  ClassSummaryAggregate,
  ConceptDifficulty,
  LessonConceptResponse,
  LessonGroupSummary,
  LessonOverview,
  LessonSubjectSummary,
  LessonSummaryAggregate,
  LessonSupportStudent,
  LessonStudentResponse,
  PraiseCandidate,
  StarAutoCriteria,
  StarEvent,
  StarRuleEventSummary,
  StarEventSource,
  StarModeLedger,
  StarRuleSettings,
  StarStudentTotal,
  StudentPageSettings,
  StudentRoster,
  StudentRosterEntry,
  StudentReference,
  StudentResult,
  TeacherDashboardPreferences,
  TeacherDashboardPreset,
  TeacherDashboardStudentSort,
  TeacherStudentPhotoMap,
  TeacherStudentPhotoSettings,
  TeacherStudentRosterSettings,
  TeacherPageSettings,
} from "./types";
import { normalizeStudentLookupKeyString } from "./student-identity";

type LegacySettingsShape = Partial<{
  pageTitle: string;
  pageDescription: string;
  statusMessage: string;
  today: ClassPageSectionSettings;
  notices: ClassPageSectionSettings;
  forms: {
    classForm?: Partial<ClassPageFormSettings>;
    lessonForm?: Partial<ClassPageFormSettings>;
  };
}>;

const DEFAULT_CLASS_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdBmPO3TZyp6jxjVgnXfSgypR0AzSC2yjSc9mRg7kjByPaLYA/viewform?usp=header";
const DEFAULT_LESSON_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeeKvU6VCMpItqXMEPiGVHJ5RW27FFur6_LbmFcBSqpxg-ujw/viewform?usp=header";

export const DEFAULT_TEACHER_DASHBOARD_PREFERENCES: TeacherDashboardPreferences = {
  preset: "default",
  defaultStudentSort: "number",
  highlightAtRiskStudents: true,
  highlightPraiseCandidates: true,
  highlightMissingSubmissions: true,
  prioritizeMissingSubmissionsInOverview: false,
  prioritizeLessonFollowUpInOverview: false,
};

const DEFAULT_STAR_RULES: StarRuleSettings[] = [
  {
    ruleId: "arrival",
    label: "등교",
    category: "attendance",
    delta: 5,
    visibility: "student",
    description: "학급용 폼 제출 시 자동 적립",
    enabled: true,
    sources: ["class-form"],
    allowCustomDelta: false,
    autoCriteria: null,
  },
  {
    ruleId: "attendance-check",
    label: "출석체크",
    category: "attendance",
    delta: 1,
    visibility: "student",
    description: "학급용 폼 제출 완료",
    enabled: true,
    sources: ["class-form"],
    allowCustomDelta: false,
    autoCriteria: null,
  },
  {
    ruleId: "lesson-submit",
    label: "수업 제출",
    category: "participation",
    delta: 1,
    visibility: "student",
    description: "수업용 폼 제출 완료",
    enabled: true,
    sources: ["lesson-form"],
    allowCustomDelta: false,
    autoCriteria: null,
  },
  {
    ruleId: "assignment-complete",
    label: "복습/수행 완료",
    category: "participation",
    delta: 1,
    visibility: "student",
    description: "수업용 폼의 복습/수행 상태가 완료로 분류되면 자동 적립",
    enabled: true,
    sources: ["lesson-form"],
    allowCustomDelta: false,
    autoCriteria: {
      assignmentStatusIn: ["완료"],
      minimumCorrectCount: null,
      maximumIncorrectCount: null,
    },
  },
  {
    ruleId: "no-incorrect",
    label: "오답 없음",
    category: "participation",
    delta: 1,
    visibility: "student",
    description: "수업용 폼에서 복습/수행 상태가 완료이고 오답이 없으면 자동 적립",
    enabled: true,
    sources: ["lesson-form"],
    allowCustomDelta: false,
    autoCriteria: {
      assignmentStatusIn: ["완료"],
      minimumCorrectCount: 1,
      maximumIncorrectCount: 0,
    },
  },
  {
    ruleId: "manual-praise",
    label: "수동 칭찬",
    category: "service",
    delta: 2,
    visibility: "student",
    description: "선생님이 공개 가점을 수동으로 부여",
    enabled: true,
    sources: ["manual"],
    allowCustomDelta: true,
    autoCriteria: null,
  },
  {
    ruleId: "teacher-adjustment",
    label: "선생님 전용 조정",
    category: "adjustment",
    delta: -2,
    visibility: "teacher",
    description: "선생님 내부 조정용 기본 규칙",
    enabled: true,
    sources: ["manual"],
    allowCustomDelta: true,
    autoCriteria: null,
  },
];

export const DEFAULT_SETTINGS: ClassPageSettings = {
  studentPage: {
    title: "우리 반 교실 페이지",
    description: "오늘 해야 할 일과 공지, 제출 폼만 빠르게 확인합니다.",
    statusMessage: "오늘 할 일을 확인한 뒤 학급용/수업용 폼을 제출합니다.",
    today: {
      title: "오늘의 할 일",
      items: [
        "등교 후 학급용 폼을 제출합니다.",
        "1교시 전 준비물과 오늘 일정을 확인합니다.",
        "수업을 마친 뒤 수업용 폼으로 이해 상태를 남깁니다.",
      ],
    },
    notices: {
      title: "공지사항",
      items: [
        "오늘 5교시 후 청소 구역 점검이 있습니다.",
        "가정통신문 제출이 필요한 학생은 종례 전까지 제출합니다.",
      ],
    },
    forms: {
      classForm: {
        title: "학급용 폼",
        description: "아침 일지와 오늘 상태를 제출하는 폼입니다.",
        buttonLabel: "학급용 폼 바로가기",
        url: DEFAULT_CLASS_FORM_URL,
        helperText: "등교 직후 제출",
      },
      lessonForm: {
        title: "수업용 폼",
        description: "수업 후 이해 정도와 느낀 점을 남기는 폼입니다.",
        buttonLabel: "수업용 폼 바로가기",
        url: DEFAULT_LESSON_FORM_URL,
        helperText: "수업 직후 제출",
      },
    },
  },
  teacherPage: {
    title: "선생님 페이지",
    description: "학급, 수업, 별점 상태를 빠르게 확인하는 선생님용 화면입니다.",
    statusMessage: "상태 카드로 필요한 영역만 확인합니다.",
    classSummaryTitle: "학급용 폼 집계",
    lessonSummaryTitle: "수업용 폼 집계",
    starLedgerTitle: "별점모드",
    classSummaryEmptyMessage:
      "학급 집계 파일이 아직 연결되지 않았습니다. 처음 연결 중이라면 정상입니다. 학급 집계를 한 번 생성한 뒤 class-summary.json 경로를 확인해 주세요.",
    lessonSummaryEmptyMessage:
      "수업 집계 파일이 아직 연결되지 않았습니다. 처음 연결 중이라면 정상입니다. 수업 집계를 한 번 생성한 뒤 lesson-summary.json 경로를 확인해 주세요.",
    starLedgerEmptyMessage:
      "별점 집계 파일이 아직 연결되지 않았습니다. 처음 연결 중이라면 정상입니다. star-ledger.json 생성과 경로 설정을 함께 확인해 주세요.",
    sources: {
      classSummaryPath: "classpage-data/class-summary.json",
      lessonSummaryPath: "classpage-data/lesson-summary.json",
      starLedgerPath: "classpage-data/star-ledger.json",
    },
    roster: {
      rosterJsonPath: "",
    },
    dashboardPreferences: {
      ...DEFAULT_TEACHER_DASHBOARD_PREFERENCES,
    },
    studentPhotos: {
      mappingJsonPath: "",
    },
  },
};

const DEFAULT_SOURCE_INFO: AggregateSourceInfo = {
  formName: "",
  formUrl: "",
  sheetName: "",
  aggregatorNote: "",
};

function normalizeString(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeOptionalString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalStringWithFallback(
  value: unknown,
  fallback: string,
): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeItems(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function normalizeNumber(value: unknown, fallback = 0): number {
  return Number.isFinite(value) ? Number(value) : fallback;
}

function normalizeOptionalNumber(value: unknown): number | null {
  return Number.isFinite(value) ? Number(value) : null;
}

function buildLessonStructuredKeyPart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[|/\\]+/g, "-");
}

function extractLessonDateFromLabel(value: string): string {
  const match = value.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
}

function extractLessonPeriodOrder(value: string): number | null {
  const periodMatch = value.match(/(\d+)\s*교시/);
  if (periodMatch) {
    return Number(periodMatch[1]);
  }

  const numericMatch = value.match(/(\d+)/);
  return numericMatch ? Number(numericMatch[1]) : null;
}

function buildLessonMachineKey(
  lessonDate: string,
  periodOrder: number | null,
  subjectKey: string,
  unitKey: string,
): string {
  return [
    lessonDate || "date-missing",
    periodOrder != null ? `p${periodOrder}` : "p0",
    subjectKey || "subject-missing",
    unitKey || "unit-missing",
  ].join("|");
}

function normalizeSection(
  value: unknown,
  fallback: ClassPageSectionSettings,
): ClassPageSectionSettings {
  const section = (value ?? {}) as Partial<ClassPageSectionSettings>;

  return {
    title: normalizeString(section.title, fallback.title),
    items: normalizeItems(section.items, fallback.items),
  };
}

function normalizeForm(
  value: unknown,
  fallback: ClassPageFormSettings,
): ClassPageFormSettings {
  const form = (value ?? {}) as Partial<ClassPageFormSettings>;

  return {
    title: normalizeString(form.title, fallback.title),
    description: normalizeOptionalStringWithFallback(
      form.description,
      fallback.description,
    ),
    buttonLabel: normalizeString(form.buttonLabel, fallback.buttonLabel),
    url: normalizeOptionalStringWithFallback(form.url, fallback.url),
    helperText: normalizeOptionalStringWithFallback(
      form.helperText,
      fallback.helperText,
    ),
  };
}

function normalizeStudentPage(
  value: unknown,
  fallback: StudentPageSettings,
): StudentPageSettings {
  const studentPage = (value ?? {}) as Partial<StudentPageSettings>;

  return {
    title: normalizeString(studentPage.title, fallback.title),
    description: normalizeOptionalStringWithFallback(
      studentPage.description,
      fallback.description,
    ),
    statusMessage: normalizeOptionalStringWithFallback(
      studentPage.statusMessage,
      fallback.statusMessage,
    ),
    today: normalizeSection(studentPage.today, fallback.today),
    notices: normalizeSection(studentPage.notices, fallback.notices),
    forms: {
      classForm: normalizeForm(
        studentPage.forms?.classForm,
        fallback.forms.classForm,
      ),
      lessonForm: normalizeForm(
        studentPage.forms?.lessonForm,
        fallback.forms.lessonForm,
      ),
    },
  };
}

export function getTeacherDashboardPresetDefaults(
  preset: TeacherDashboardPreset,
): TeacherDashboardPreferences {
  switch (preset) {
    case "risk-focus":
      return {
        preset,
        defaultStudentSort: "risk",
        highlightAtRiskStudents: true,
        highlightPraiseCandidates: false,
        highlightMissingSubmissions: true,
        prioritizeMissingSubmissionsInOverview: true,
        prioritizeLessonFollowUpInOverview: true,
      };
    case "praise-focus":
      return {
        preset,
        defaultStudentSort: "praise",
        highlightAtRiskStudents: false,
        highlightPraiseCandidates: true,
        highlightMissingSubmissions: false,
        prioritizeMissingSubmissionsInOverview: false,
        prioritizeLessonFollowUpInOverview: false,
      };
    case "submission-focus":
      return {
        preset,
        defaultStudentSort: "number",
        highlightAtRiskStudents: true,
        highlightPraiseCandidates: false,
        highlightMissingSubmissions: true,
        prioritizeMissingSubmissionsInOverview: true,
        prioritizeLessonFollowUpInOverview: false,
      };
    default:
      return {
        ...DEFAULT_TEACHER_DASHBOARD_PREFERENCES,
      };
  }
}

function normalizeTeacherDashboardPreset(value: unknown): TeacherDashboardPreset {
  switch (value) {
    case "risk-focus":
    case "praise-focus":
    case "submission-focus":
    case "default":
      return value;
    default:
      return DEFAULT_TEACHER_DASHBOARD_PREFERENCES.preset;
  }
}

function normalizeTeacherDashboardStudentSort(value: unknown): TeacherDashboardStudentSort {
  switch (value) {
    case "risk":
    case "praise":
    case "recent":
    case "number":
      return value;
    default:
      return DEFAULT_TEACHER_DASHBOARD_PREFERENCES.defaultStudentSort;
  }
}

function normalizeTeacherDashboardPreferences(
  value: Partial<TeacherDashboardPreferences>,
  fallback: TeacherDashboardPreferences,
): TeacherDashboardPreferences {
  const preset = normalizeTeacherDashboardPreset(value.preset ?? fallback.preset);
  const presetDefaults = getTeacherDashboardPresetDefaults(preset);

  return {
    preset,
    defaultStudentSort: normalizeTeacherDashboardStudentSort(
      value.defaultStudentSort ?? fallback.defaultStudentSort ?? presetDefaults.defaultStudentSort,
    ),
    highlightAtRiskStudents: typeof value.highlightAtRiskStudents === "boolean"
      ? value.highlightAtRiskStudents
      : fallback.highlightAtRiskStudents ?? presetDefaults.highlightAtRiskStudents,
    highlightPraiseCandidates: typeof value.highlightPraiseCandidates === "boolean"
      ? value.highlightPraiseCandidates
      : fallback.highlightPraiseCandidates ?? presetDefaults.highlightPraiseCandidates,
    highlightMissingSubmissions: typeof value.highlightMissingSubmissions === "boolean"
      ? value.highlightMissingSubmissions
      : fallback.highlightMissingSubmissions ?? presetDefaults.highlightMissingSubmissions,
    prioritizeMissingSubmissionsInOverview:
      typeof value.prioritizeMissingSubmissionsInOverview === "boolean"
        ? value.prioritizeMissingSubmissionsInOverview
        : fallback.prioritizeMissingSubmissionsInOverview
          ?? presetDefaults.prioritizeMissingSubmissionsInOverview,
    prioritizeLessonFollowUpInOverview:
      typeof value.prioritizeLessonFollowUpInOverview === "boolean"
        ? value.prioritizeLessonFollowUpInOverview
        : fallback.prioritizeLessonFollowUpInOverview
          ?? presetDefaults.prioritizeLessonFollowUpInOverview,
  };
}

function normalizeTeacherPage(
  value: unknown,
  fallback: TeacherPageSettings,
): TeacherPageSettings {
  const teacherPage = (value ?? {}) as Partial<TeacherPageSettings>;
  const roster = (teacherPage.roster ?? {}) as Partial<TeacherStudentRosterSettings>;
  const dashboardPreferences = (teacherPage.dashboardPreferences ?? {}) as Partial<TeacherDashboardPreferences>;
  const studentPhotos = (teacherPage.studentPhotos ?? {}) as Partial<TeacherStudentPhotoSettings>;

  return {
    title: normalizeString(teacherPage.title, fallback.title),
    description: normalizeOptionalStringWithFallback(
      teacherPage.description,
      fallback.description,
    ),
    statusMessage: normalizeOptionalStringWithFallback(
      teacherPage.statusMessage,
      fallback.statusMessage,
    ),
    classSummaryTitle: normalizeString(
      teacherPage.classSummaryTitle,
      fallback.classSummaryTitle,
    ),
    lessonSummaryTitle: normalizeString(
      teacherPage.lessonSummaryTitle,
      fallback.lessonSummaryTitle,
    ),
    starLedgerTitle: normalizeString(
      teacherPage.starLedgerTitle,
      fallback.starLedgerTitle,
    ),
    classSummaryEmptyMessage: normalizeOptionalStringWithFallback(
      teacherPage.classSummaryEmptyMessage,
      fallback.classSummaryEmptyMessage,
    ),
    lessonSummaryEmptyMessage: normalizeOptionalStringWithFallback(
      teacherPage.lessonSummaryEmptyMessage,
      fallback.lessonSummaryEmptyMessage,
    ),
    starLedgerEmptyMessage: normalizeOptionalStringWithFallback(
      teacherPage.starLedgerEmptyMessage,
      fallback.starLedgerEmptyMessage,
    ),
    sources: {
      classSummaryPath: normalizeString(
        teacherPage.sources?.classSummaryPath,
        fallback.sources.classSummaryPath,
      ),
      lessonSummaryPath: normalizeString(
        teacherPage.sources?.lessonSummaryPath,
        fallback.sources.lessonSummaryPath,
      ),
      starLedgerPath: normalizeString(
        teacherPage.sources?.starLedgerPath,
        fallback.sources.starLedgerPath,
      ),
    },
    roster: {
      rosterJsonPath: normalizeOptionalString(roster.rosterJsonPath),
    },
    dashboardPreferences: normalizeTeacherDashboardPreferences(
      dashboardPreferences,
      fallback.dashboardPreferences,
    ),
    studentPhotos: {
      mappingJsonPath: normalizeOptionalString(studentPhotos.mappingJsonPath),
    },
  };
}

export function normalizeSettings(value: unknown): ClassPageSettings {
  const settings = (value ?? {}) as Partial<ClassPageSettings> & LegacySettingsShape;

  const legacyStudentPage = {
    title: settings.pageTitle,
    description: settings.pageDescription,
    statusMessage: settings.statusMessage,
    today: settings.today,
    notices: settings.notices,
    forms: settings.forms,
  };

  return {
    studentPage: normalizeStudentPage(
      settings.studentPage ?? legacyStudentPage,
      DEFAULT_SETTINGS.studentPage,
    ),
    teacherPage: normalizeTeacherPage(
      settings.teacherPage,
      DEFAULT_SETTINGS.teacherPage,
    ),
  };
}

export function normalizeStudentPhotoMap(value: unknown): TeacherStudentPhotoMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { entries: {} };
  }

  const entries = Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>(
    (result, [rawKey, rawPath]) => {
      const key = normalizeStudentLookupKeyString(rawKey);
      const path = typeof rawPath === "string" ? rawPath.trim() : "";
      if (!key || !path) {
        return result;
      }

      result[key] = path;
      return result;
    },
    {},
  );

  return { entries };
}

function normalizeStudentRosterEntry(
  value: unknown,
  defaultClassroom: string,
): StudentRosterEntry {
  const entry = (value ?? {}) as Partial<StudentRosterEntry> & {
    classNumber?: unknown;
    studentNumber?: unknown;
  };

  return {
    classroom: normalizeOptionalString(entry.classroom)
      || normalizeOptionalString(entry.classNumber)
      || defaultClassroom,
    number: normalizeOptionalString(entry.number)
      || normalizeOptionalString(entry.studentNumber),
    name: normalizeOptionalString(entry.name),
    studentId: normalizeOptionalString(entry.studentId),
    note: normalizeOptionalString(entry.note),
  };
}

export function normalizeStudentRoster(value: unknown): StudentRoster {
  const roster = (value ?? {}) as Partial<StudentRoster> & {
    updatedAt?: unknown;
    label?: unknown;
    items?: unknown;
    classroom?: unknown;
    classNumber?: unknown;
  };
  const defaultClassroom = normalizeOptionalString(roster.defaultClassroom)
    || normalizeOptionalString(roster.classroom)
    || normalizeOptionalString(roster.classNumber);
  const rawStudents = Array.isArray(roster.students)
    ? roster.students
    : Array.isArray(roster.items)
      ? roster.items
      : [];

  return {
    type: "student-roster",
    generatedAt: normalizeOptionalString(roster.generatedAt)
      || normalizeOptionalString(roster.updatedAt),
    sourceLabel: normalizeOptionalString(roster.sourceLabel)
      || normalizeOptionalString(roster.label),
    defaultClassroom,
    students: rawStudents
      .map((item) => normalizeStudentRosterEntry(item, defaultClassroom))
      .filter((item) =>
        item.classroom.length > 0
        || item.number.length > 0
        || item.name.length > 0
        || item.studentId.length > 0
      ),
  };
}

function normalizeSourceInfo(value: unknown): AggregateSourceInfo {
  const info = (value ?? {}) as Partial<AggregateSourceInfo>;

  return {
    formName: normalizeOptionalString(info.formName),
    formUrl: normalizeOptionalString(info.formUrl),
    sheetName: normalizeOptionalString(info.sheetName),
    aggregatorNote: normalizeOptionalString(info.aggregatorNote),
  };
}

function normalizeCountItem(value: unknown): AggregateCountItem {
  const item = (value ?? {}) as Partial<AggregateCountItem>;

  return {
    label: normalizeOptionalString(item.label),
    count: normalizeNumber(item.count),
    note: normalizeOptionalString(item.note),
  };
}

function normalizeCountItems(value: unknown): AggregateCountItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeCountItem(item))
    .filter((item) => item.label.length > 0);
}

function normalizeStudentReference(value: unknown): StudentReference {
  const student = (value ?? {}) as Partial<StudentReference>;

  return {
    classroom: normalizeOptionalString(student.classroom),
    number: normalizeOptionalString(student.number),
    name: normalizeOptionalString(student.name),
  };
}

function normalizeClassSupportStudent(value: unknown): ClassSupportStudent {
  const student = (value ?? {}) as Partial<ClassSupportStudent>;

  return {
    student: normalizeStudentReference(student.student),
    mood: normalizeOptionalString(student.mood),
    reason: normalizeOptionalString(student.reason),
    goal: normalizeOptionalString(student.goal),
    yesterdayAchievement: normalizeOptionalString(student.yesterdayAchievement),
    teacherNote: normalizeOptionalString(student.teacherNote),
  };
}

function normalizePraiseCandidate(value: unknown): PraiseCandidate {
  const candidate = (value ?? {}) as Partial<PraiseCandidate>;

  return {
    student: normalizeStudentReference(candidate.student),
    reason: normalizeOptionalString(candidate.reason),
    mentionedPeer: normalizeOptionalString(candidate.mentionedPeer),
  };
}

function normalizeClassStudentResponse(value: unknown): ClassStudentResponse {
  const response = (value ?? {}) as Partial<ClassStudentResponse>;

  return {
    student: normalizeStudentReference(response.student),
    mood: normalizeOptionalString(response.mood),
    emotionLabel: normalizeOptionalStringWithFallback(
      response.emotionLabel,
      "미분류",
    ),
    moodReason: normalizeOptionalString(response.moodReason),
    goal: normalizeOptionalString(response.goal),
    yesterdayAchievement: normalizeOptionalString(response.yesterdayAchievement),
    goalLabel: normalizeOptionalStringWithFallback(response.goalLabel, "미분류"),
    teacherMessage: normalizeOptionalString(response.teacherMessage),
    helpedFriend: normalizeOptionalString(response.helpedFriend),
    helpedByFriend: normalizeOptionalString(response.helpedByFriend),
    teacherNote: normalizeOptionalString(response.teacherNote),
  };
}

function normalizeConceptDifficulty(value: unknown): ConceptDifficulty {
  const item = (value ?? {}) as Partial<ConceptDifficulty>;

  return {
    concept: normalizeOptionalString(item.concept),
    count: normalizeNumber(item.count),
    averageUnderstanding: normalizeOptionalStringWithFallback(
      item.averageUnderstanding,
      "미분류",
    ),
    note: normalizeOptionalString(item.note),
  };
}

function normalizeLessonSupportStudent(value: unknown): LessonSupportStudent {
  const student = (value ?? {}) as Partial<LessonSupportStudent>;

  return {
    student: normalizeStudentReference(student.student),
    correctCount: normalizeNumber(student.correctCount),
    incorrectCount: normalizeNumber(student.incorrectCount),
    misconception: normalizeOptionalStringWithFallback(
      student.misconception,
      "미분류",
    ),
    assignmentStatus: normalizeOptionalStringWithFallback(
      student.assignmentStatus,
      "미분류",
    ),
    teacherNote: normalizeOptionalString(student.teacherNote),
  };
}

function normalizeStudentResult(value: unknown): StudentResult {
  const result = (value ?? {}) as Partial<StudentResult>;

  return {
    student: normalizeStudentReference(result.student),
    correctCount: normalizeNumber(result.correctCount),
    incorrectCount: normalizeNumber(result.incorrectCount),
    assignmentStatus: normalizeOptionalStringWithFallback(
      result.assignmentStatus,
      "미분류",
    ),
    followUp: normalizeOptionalStringWithFallback(result.followUp, "미확인"),
  };
}

function normalizeLessonConceptResponse(value: unknown): LessonConceptResponse {
  const concept = (value ?? {}) as Partial<LessonConceptResponse>;

  return {
    concept: normalizeOptionalString(concept.concept),
    understanding: normalizeOptionalString(concept.understanding),
    understandingLabel: normalizeOptionalStringWithFallback(
      concept.understandingLabel,
      "미분류",
    ),
  };
}

function normalizeLessonStudentResponse(value: unknown): LessonStudentResponse {
  const response = (value ?? {}) as Partial<LessonStudentResponse>;

  return {
    student: normalizeStudentReference(response.student),
    lessonUnit: normalizeOptionalString(response.lessonUnit),
    correctCount: normalizeNumber(response.correctCount),
    incorrectCount: normalizeNumber(response.incorrectCount),
    assignmentStatus: normalizeOptionalStringWithFallback(
      response.assignmentStatus,
      "미분류",
    ),
    incorrectReason: normalizeOptionalString(response.incorrectReason),
    teacherMessage: normalizeOptionalString(response.teacherMessage),
    misconception: normalizeOptionalStringWithFallback(
      response.misconception,
      "미분류",
    ),
    followUp: normalizeOptionalStringWithFallback(response.followUp, "미확인"),
    teacherNote: normalizeOptionalString(response.teacherNote),
    concepts: Array.isArray(response.concepts)
      ? response.concepts
          .map((item) => normalizeLessonConceptResponse(item))
          .filter((item) => item.concept.length > 0 || item.understanding.length > 0)
      : [],
  };
}

function normalizeLessonOverview(value: unknown): LessonOverview {
  const overview = (value ?? {}) as Partial<LessonOverview>;

  return {
    averageCorrectCount: normalizeNumber(overview.averageCorrectCount),
    averageIncorrectCount: normalizeNumber(overview.averageIncorrectCount),
    assignmentCompletionLabel: normalizeOptionalStringWithFallback(
      overview.assignmentCompletionLabel,
      "미분류",
    ),
  };
}

function buildLessonGroupLabel(
  subject: string,
  periodLabel: string,
  unitLabel: string,
): string {
  const parts = [subject, periodLabel];
  if (unitLabel && !periodLabel.includes(unitLabel)) {
    parts.push(unitLabel);
  }

  return parts.filter(Boolean).join(" · ") || "수업 그룹";
}

function normalizeLessonGroupSummary(value: unknown): LessonGroupSummary {
  const summary = (value ?? {}) as Partial<LessonGroupSummary>;
  const studentResponses = Array.isArray(summary.studentResponses)
    ? summary.studentResponses.map((item) => normalizeLessonStudentResponse(item))
    : [];
  const periodLabel = normalizeString(summary.periodLabel, "응답 없음");
  const subject = normalizeOptionalString(summary.subject);
  const lessonUnit = normalizeOptionalString(summary.lessonUnit)
    || studentResponses[0]?.lessonUnit
    || "";
  const unitLabel = normalizeOptionalString(summary.unitLabel) || lessonUnit;
  const lessonDate = normalizeOptionalString(summary.lessonDate)
    || extractLessonDateFromLabel(periodLabel);
  const periodOrder = normalizeOptionalNumber(summary.periodOrder)
    ?? extractLessonPeriodOrder(periodLabel);
  const subjectKey = normalizeOptionalString(summary.subjectKey)
    || buildLessonStructuredKeyPart(subject);
  const unitKey = normalizeOptionalString(summary.unitKey)
    || buildLessonStructuredKeyPart(unitLabel);
  const lessonKey = normalizeOptionalString(summary.lessonKey)
    || buildLessonMachineKey(lessonDate, periodOrder, subjectKey, unitKey);

  return {
    groupKey: normalizeOptionalString(summary.groupKey)
      || [subject, periodLabel, lessonUnit].filter(Boolean).join("|"),
    lessonKey,
    label: normalizeOptionalString(summary.label)
      || buildLessonGroupLabel(subject, periodLabel, unitLabel || lessonUnit),
    lessonDate,
    periodOrder,
    subjectKey,
    unitKey,
    unitLabel,
    periodLabel,
    lessonUnit,
    classroom: normalizeOptionalString(summary.classroom),
    subject,
    responseCount: normalizeNumber(summary.responseCount),
    excludedResponseCount: normalizeNumber(summary.excludedResponseCount),
    overview: normalizeLessonOverview(summary.overview),
    difficultConcepts: Array.isArray(summary.difficultConcepts)
      ? summary.difficultConcepts
          .map((item) => normalizeConceptDifficulty(item))
          .filter((item) => item.concept.length > 0)
      : [],
    assignmentSummary: normalizeCountItems(summary.assignmentSummary),
    supportStudents: Array.isArray(summary.supportStudents)
      ? summary.supportStudents.map((item) => normalizeLessonSupportStudent(item))
      : [],
    studentResults: Array.isArray(summary.studentResults)
      ? summary.studentResults.map((item) => normalizeStudentResult(item))
      : [],
    studentResponses,
  };
}

function compareLessonGroupsForDisplay(left: LessonGroupSummary, right: LessonGroupSummary): number {
  if (left.lessonDate !== right.lessonDate) {
    return right.lessonDate.localeCompare(left.lessonDate);
  }

  if ((left.periodOrder ?? -1) !== (right.periodOrder ?? -1)) {
    return (right.periodOrder ?? -1) - (left.periodOrder ?? -1);
  }

  if (left.lessonKey !== right.lessonKey) {
    return left.lessonKey.localeCompare(right.lessonKey);
  }

  return left.label.localeCompare(right.label);
}

function hasLessonGroupData(summary: LessonGroupSummary): boolean {
  const meaningfulGroupKey = summary.groupKey.trim() !== ""
    && summary.groupKey.trim() !== "응답 없음";
  const meaningfulLabel = summary.label.trim() !== ""
    && summary.label.trim() !== "수업 그룹"
    && summary.label.trim() !== "응답 없음";
  const meaningfulPeriodLabel = summary.periodLabel.trim() !== ""
    && summary.periodLabel.trim() !== "응답 없음";

  return [
    meaningfulGroupKey ? summary.groupKey : "",
    meaningfulLabel ? summary.label : "",
    meaningfulPeriodLabel ? summary.periodLabel : "",
    summary.lessonUnit,
    summary.classroom,
    summary.subject,
  ].some((value) => value.trim().length > 0)
    || summary.responseCount > 0
    || summary.excludedResponseCount > 0
    || summary.difficultConcepts.length > 0
    || summary.assignmentSummary.length > 0
    || summary.supportStudents.length > 0
    || summary.studentResults.length > 0
    || summary.studentResponses.length > 0;
}

function cloneLessonGroupSummary(summary: LessonGroupSummary): LessonGroupSummary {
  return {
    ...summary,
    overview: { ...summary.overview },
    difficultConcepts: summary.difficultConcepts.map((item) => ({ ...item })),
    assignmentSummary: summary.assignmentSummary.map((item) => ({ ...item })),
    supportStudents: summary.supportStudents.map((item) => ({
      ...item,
      student: { ...item.student },
    })),
    studentResults: summary.studentResults.map((item) => ({
      ...item,
      student: { ...item.student },
    })),
    studentResponses: summary.studentResponses.map((item) => ({
      ...item,
      student: { ...item.student },
      concepts: item.concepts.map((concept) => ({ ...concept })),
    })),
  };
}

function normalizeLessonSubjectSummary(value: unknown): LessonSubjectSummary {
  const summary = (value ?? {}) as Partial<LessonSubjectSummary>;
  const baseGroup = normalizeLessonGroupSummary(summary);
  const groups = Array.isArray(summary.groups)
    ? summary.groups
        .map((item) => normalizeLessonGroupSummary(item))
        .filter((item) => hasLessonGroupData(item))
        .sort((left, right) => compareLessonGroupsForDisplay(left, right))
    : [];
  const primaryGroup = hasLessonGroupData(baseGroup)
    ? baseGroup
    : groups[0] ?? baseGroup;
  const normalizedGroups = groups.length > 0
    ? groups
    : hasLessonGroupData(primaryGroup)
      ? [cloneLessonGroupSummary(primaryGroup)]
      : [];

  return {
    ...cloneLessonGroupSummary(primaryGroup),
    groups: normalizedGroups.map((item) => cloneLessonGroupSummary(item)),
  };
}

function normalizeStarRule(value: unknown): StarRuleSettings {
  const rule = (value ?? {}) as Partial<StarRuleSettings> & Partial<{
    id: string;
    active: boolean;
  }>;
  const ruleId = typeof rule.ruleId === "string" && rule.ruleId.trim().length > 0
    ? rule.ruleId.trim()
    : typeof rule.id === "string" && rule.id.trim().length > 0
      ? rule.id.trim()
      : "";
  const fallback = DEFAULT_STAR_RULES.find((item) => item.ruleId === ruleId)
    ?? DEFAULT_STAR_RULES[0];

  return {
    ruleId: normalizeString(ruleId, fallback.ruleId),
    label: normalizeString(rule.label, fallback.label),
    category: rule.category ?? fallback.category,
    delta: normalizeNumber(rule.delta, fallback.delta),
    visibility: rule.visibility === "teacher" ? "teacher" : "student",
    description: normalizeOptionalStringWithFallback(
      rule.description,
      fallback.description,
    ),
    enabled: typeof rule.enabled === "boolean"
      ? rule.enabled
      : typeof rule.active === "boolean"
        ? rule.active
        : fallback.enabled,
    sources: normalizeStarRuleSources(rule.sources, fallback.sources),
    allowCustomDelta: typeof rule.allowCustomDelta === "boolean"
      ? rule.allowCustomDelta
      : fallback.allowCustomDelta,
    autoCriteria: normalizeStarAutoCriteria(
      (rule as Partial<{ autoCriteria: unknown }>).autoCriteria,
      fallback.autoCriteria,
    ),
  };
}

function normalizeStarEvent(value: unknown): StarEvent {
  const event = (value ?? {}) as Partial<StarEvent>;

  return {
    id: normalizeString(event.id, "star-event"),
    studentKey: normalizeString(event.studentKey, "student|unknown"),
    student: normalizeStudentReference(event.student),
    ruleId: normalizeString(event.ruleId, "teacher-adjustment"),
    category: event.category ?? "custom",
    delta: normalizeNumber(event.delta),
    visibility: event.visibility === "teacher" ? "teacher" : "student",
    source: normalizeStarEventSource(event.source),
    occurredAt: normalizeOptionalString(event.occurredAt),
    note: normalizeOptionalString(event.note),
    actor: normalizeOptionalString(event.actor),
    batchId: normalizeOptionalString(event.batchId),
  };
}

function normalizeStarStudentTotal(value: unknown): StarStudentTotal {
  const total = (value ?? {}) as Partial<StarStudentTotal>;

  return {
    studentKey: normalizeString(total.studentKey, "student|unknown"),
    student: normalizeStudentReference(total.student),
    total: normalizeNumber(total.total),
    visibleTotal: normalizeNumber(total.visibleTotal),
    hiddenAdjustmentTotal: normalizeNumber(total.hiddenAdjustmentTotal),
    eventCount: normalizeNumber(total.eventCount),
  };
}

function normalizeStarRuleSources(
  value: unknown,
  fallback: StarRuleSettings["sources"],
): StarRuleSettings["sources"] {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  const sources = value
    .map((item) => normalizeStarEventSource(item))
    .filter((item, index, array) => array.indexOf(item) === index);

  return sources.length > 0 ? sources : [...fallback];
}

function normalizeStarAutoCriteria(
  value: unknown,
  fallback: StarAutoCriteria | null,
): StarAutoCriteria | null {
  if (!value || typeof value !== "object") {
    return fallback ? { ...fallback, assignmentStatusIn: [...fallback.assignmentStatusIn] } : null;
  }

  const criteria = value as Partial<StarAutoCriteria>;
  const assignmentStatusIn = Array.isArray(criteria.assignmentStatusIn)
    ? criteria.assignmentStatusIn
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter((item) => item.length > 0)
    : fallback?.assignmentStatusIn
      ? [...fallback.assignmentStatusIn]
      : [];
  const minimumCorrectCount = Number.isFinite(criteria.minimumCorrectCount)
    ? Number(criteria.minimumCorrectCount)
    : fallback?.minimumCorrectCount ?? null;
  const maximumIncorrectCount = Number.isFinite(criteria.maximumIncorrectCount)
    ? Number(criteria.maximumIncorrectCount)
    : fallback?.maximumIncorrectCount ?? null;

  if (
    assignmentStatusIn.length === 0
    && minimumCorrectCount == null
    && maximumIncorrectCount == null
  ) {
    return null;
  }

  return {
    assignmentStatusIn,
    minimumCorrectCount,
    maximumIncorrectCount,
  };
}

function normalizeStarEventSource(value: unknown): StarEventSource {
  switch (value) {
    case "manual":
    case "class-form":
    case "lesson-form":
    case "system":
      return value;
    default:
      return "system";
  }
}

function normalizeStarEventSourceSummary(value: unknown): StarModeLedger["sourceSummary"] {
  const summary = (value ?? {}) as Partial<StarModeLedger["sourceSummary"]>;

  return {
    manual: normalizeNumber(summary.manual),
    "class-form": normalizeNumber(summary["class-form"]),
    "lesson-form": normalizeNumber(summary["lesson-form"]),
    system: normalizeNumber(summary.system),
  };
}

function normalizeStarRuleEventSummary(value: unknown): StarRuleEventSummary {
  const summary = (value ?? {}) as Partial<StarRuleEventSummary>;

  return {
    ruleId: normalizeString(summary.ruleId, "unknown-rule"),
    label: normalizeOptionalString(summary.label),
    category: summary.category ?? "custom",
    visibility: summary.visibility === "teacher" ? "teacher" : "student",
    eventCount: normalizeNumber(summary.eventCount),
    manualCount: normalizeNumber(summary.manualCount),
    automaticCount: normalizeNumber(summary.automaticCount),
    sourceSummary: normalizeStarEventSourceSummary(summary.sourceSummary),
  };
}

export function normalizeClassSummaryAggregate(value: unknown): ClassSummaryAggregate {
  const summary = (value ?? {}) as Partial<ClassSummaryAggregate>;

  return {
    type: "class-summary",
    generatedAt: normalizeOptionalString(summary.generatedAt),
    periodLabel: normalizeString(summary.periodLabel, "학급 집계"),
    classroom: normalizeOptionalString(summary.classroom),
    responseCount: normalizeNumber(summary.responseCount),
    excludedResponseCount: normalizeNumber(summary.excludedResponseCount),
    source: {
      ...DEFAULT_SOURCE_INFO,
      ...normalizeSourceInfo(summary.source),
    },
    emotionSummary: normalizeCountItems(summary.emotionSummary),
    goalSummary: normalizeCountItems(summary.goalSummary),
    supportStudents: Array.isArray(summary.supportStudents)
      ? summary.supportStudents.map((item) => normalizeClassSupportStudent(item))
      : [],
    praiseCandidates: Array.isArray(summary.praiseCandidates)
      ? summary.praiseCandidates.map((item) => normalizePraiseCandidate(item))
      : [],
    studentResponses: Array.isArray(summary.studentResponses)
      ? summary.studentResponses.map((item) => normalizeClassStudentResponse(item))
      : [],
  };
}

export function normalizeLessonSummaryAggregate(value: unknown): LessonSummaryAggregate {
  const summary = (value ?? {}) as Partial<LessonSummaryAggregate>;
  const topLevelGroup = normalizeLessonGroupSummary(summary);
  const subjectSummaries = Array.isArray(summary.subjectSummaries)
    ? summary.subjectSummaries.map((item) => normalizeLessonSubjectSummary(item))
    : [];
  const sortedSubjectSummaries = subjectSummaries
    .slice()
    .sort((left, right) => compareLessonGroupsForDisplay(left, right));

  return {
    type: "lesson-summary",
    generatedAt: normalizeOptionalString(summary.generatedAt),
    lessonKey: topLevelGroup.lessonKey,
    lessonDate: topLevelGroup.lessonDate,
    periodOrder: topLevelGroup.periodOrder,
    subjectKey: topLevelGroup.subjectKey,
    unitKey: topLevelGroup.unitKey,
    unitLabel: topLevelGroup.unitLabel,
    periodLabel: topLevelGroup.periodLabel,
    classroom: topLevelGroup.classroom,
    subject: topLevelGroup.subject,
    responseCount: topLevelGroup.responseCount,
    excludedResponseCount: topLevelGroup.excludedResponseCount,
    source: {
      ...DEFAULT_SOURCE_INFO,
      ...normalizeSourceInfo(summary.source),
    },
    overview: { ...topLevelGroup.overview },
    difficultConcepts: topLevelGroup.difficultConcepts.map((item) => ({ ...item })),
    assignmentSummary: topLevelGroup.assignmentSummary.map((item) => ({ ...item })),
    supportStudents: topLevelGroup.supportStudents.map((item) => ({
      ...item,
      student: { ...item.student },
    })),
    studentResults: topLevelGroup.studentResults.map((item) => ({
      ...item,
      student: { ...item.student },
    })),
    studentResponses: topLevelGroup.studentResponses.map((item) => ({
      ...item,
      student: { ...item.student },
      concepts: item.concepts.map((concept) => ({ ...concept })),
    })),
    subjectSummaries: sortedSubjectSummaries.length > 0
      ? sortedSubjectSummaries
      : buildLegacyLessonSubjectSummaries(
          topLevelGroup.subject,
          topLevelGroup.periodLabel,
          topLevelGroup.classroom,
          topLevelGroup.lessonDate,
          topLevelGroup.periodOrder,
          topLevelGroup.unitKey,
          topLevelGroup.subjectKey,
          topLevelGroup.unitLabel || topLevelGroup.lessonUnit,
          topLevelGroup.overview,
          topLevelGroup.difficultConcepts,
          topLevelGroup.assignmentSummary,
          topLevelGroup.supportStudents,
          topLevelGroup.studentResults,
          topLevelGroup.studentResponses,
        ),
  };
}

export function normalizeStarModeLedger(value: unknown): StarModeLedger {
  const ledger = (value ?? {}) as Partial<StarModeLedger>;
  const rules = Array.isArray(ledger.rules)
    ? ledger.rules.map((item) => normalizeStarRule(item))
    : [];

  return {
    type: "star-ledger",
    generatedAt: normalizeOptionalString(ledger.generatedAt),
    periodLabel: normalizeString(ledger.periodLabel, "전체 누적"),
    classroom: normalizeOptionalString(ledger.classroom),
    excludedResponseCount: normalizeNumber(ledger.excludedResponseCount),
    eventCount: normalizeNumber(ledger.eventCount),
    source: {
      ...DEFAULT_SOURCE_INFO,
      ...normalizeSourceInfo(ledger.source),
    },
    sourceSummary: normalizeStarEventSourceSummary(ledger.sourceSummary),
    rules: rules.length > 0
      ? rules
      : DEFAULT_STAR_RULES.map((rule) => ({ ...rule })),
    ruleSummary: Array.isArray(ledger.ruleSummary)
      ? ledger.ruleSummary.map((item) => normalizeStarRuleEventSummary(item))
      : [],
    totals: Array.isArray(ledger.totals)
      ? ledger.totals.map((item) => normalizeStarStudentTotal(item))
      : [],
    recentEvents: Array.isArray(ledger.recentEvents)
      ? ledger.recentEvents.map((item) => normalizeStarEvent(item))
      : [],
  };
}

function buildLegacyLessonSubjectSummaries(
  subject: string,
  periodLabel: string,
  classroom: string,
  lessonDate: string,
  periodOrder: number | null,
  unitKey: string,
  subjectKey: string,
  unitLabel: string,
  overview: LessonOverview,
  difficultConcepts: ConceptDifficulty[],
  assignmentSummary: AggregateCountItem[],
  supportStudents: LessonSupportStudent[],
  studentResults: StudentResult[],
  studentResponses: LessonStudentResponse[],
): LessonSubjectSummary[] {
  const hasData = [
    subject,
    periodLabel,
    classroom,
  ].some((value) => value.trim().length > 0)
    || studentResponses.length > 0
    || studentResults.length > 0
    || supportStudents.length > 0
    || difficultConcepts.length > 0
    || assignmentSummary.length > 0;

  if (!hasData) {
    return [];
  }

  const lessonUnit = studentResponses[0]?.lessonUnit || unitLabel;
  const normalizedUnitLabel = unitLabel || lessonUnit;
  const normalizedSubjectKey = subjectKey || buildLessonStructuredKeyPart(subject);
  const normalizedUnitKey = unitKey || buildLessonStructuredKeyPart(normalizedUnitLabel);
  const lessonKey = buildLessonMachineKey(
    lessonDate || extractLessonDateFromLabel(periodLabel),
    periodOrder ?? extractLessonPeriodOrder(periodLabel),
    normalizedSubjectKey,
    normalizedUnitKey,
  );
  const groupSummary: LessonGroupSummary = {
    groupKey: [subject, periodLabel, lessonUnit].filter(Boolean).join("|"),
    lessonKey,
    label: buildLessonGroupLabel(subject, periodLabel, normalizedUnitLabel || lessonUnit),
    lessonDate: lessonDate || extractLessonDateFromLabel(periodLabel),
    periodOrder: periodOrder ?? extractLessonPeriodOrder(periodLabel),
    subjectKey: normalizedSubjectKey,
    unitKey: normalizedUnitKey,
    unitLabel: normalizedUnitLabel,
    periodLabel,
    lessonUnit,
    classroom,
    subject,
    responseCount: studentResponses.length > 0 ? studentResponses.length : studentResults.length,
    excludedResponseCount: 0,
    overview: { ...overview },
    difficultConcepts: difficultConcepts.map((item) => ({ ...item })),
    assignmentSummary: assignmentSummary.map((item) => ({ ...item })),
    supportStudents: supportStudents.map((item) => ({ ...item, student: { ...item.student } })),
    studentResults: studentResults.map((item) => ({ ...item, student: { ...item.student } })),
    studentResponses: studentResponses.map((item) => ({
      ...item,
      student: { ...item.student },
      concepts: item.concepts.map((concept) => ({ ...concept })),
    })),
  };

  return [
    {
      ...cloneLessonGroupSummary(groupSummary),
      groups: [cloneLessonGroupSummary(groupSummary)],
    },
  ];
}
