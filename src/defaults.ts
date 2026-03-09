import type {
  AggregateCountItem,
  AggregateSourceInfo,
  ClassPageFormSettings,
  ClassPageSectionSettings,
  ClassPageSettings,
  ClassSupportStudent,
  ClassSummaryAggregate,
  ConceptDifficulty,
  LessonSummaryAggregate,
  LessonSupportStudent,
  PraiseCandidate,
  StudentPageSettings,
  StudentReference,
  StudentResult,
  TeacherPageSettings,
} from "./types";

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
  "https://docs.google.com/forms/d/e/1FAIpQLSeBR_cBQFf_CXo6ytCabIMfvStXn_QPSYadonYLKNR6WAT2bg/viewform?usp=header";
const DEFAULT_LESSON_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSefjZ3vyJs6T5PkkrUQDo2JY1wNh8cHPdeieRWRFVsMzu-_NA/viewform?usp=header";

export const DEFAULT_SETTINGS: ClassPageSettings = {
  studentPage: {
    title: "우리 반 교실 페이지",
    description: "오늘 해야 할 일과 공지, 제출 폼만 빠르게 확인합니다.",
    statusMessage: "학생용 화면은 정적 설정과 Google Form 링크만 보여줍니다.",
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
    title: "교사용 요약 페이지",
    description: "교사용 화면은 원본 응답이 아니라 집계 JSON 결과만 읽어 빠르게 판단할 수 있게 구성합니다.",
    statusMessage: "Google Form -> Google Sheets -> Apps Script/집계 레이어 -> JSON -> classpage",
    classSummaryTitle: "학급용 폼 집계",
    lessonSummaryTitle: "수업용 폼 집계",
    classSummaryEmptyMessage:
      "학급용 집계 JSON을 찾지 못했습니다. Settings -> classpage의 경로와 docs/BEGINNER_SETUP.md의 16단계를 확인하세요.",
    lessonSummaryEmptyMessage:
      "수업용 집계 JSON을 찾지 못했습니다. Settings -> classpage의 경로와 docs/BEGINNER_SETUP.md의 16단계를 확인하세요.",
    sources: {
      classSummaryPath: "classpage-data/class-summary.json",
      lessonSummaryPath: "classpage-data/lesson-summary.json",
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

function normalizeTeacherPage(
  value: unknown,
  fallback: TeacherPageSettings,
): TeacherPageSettings {
  const teacherPage = (value ?? {}) as Partial<TeacherPageSettings>;

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
    classSummaryEmptyMessage: normalizeOptionalStringWithFallback(
      teacherPage.classSummaryEmptyMessage,
      fallback.classSummaryEmptyMessage,
    ),
    lessonSummaryEmptyMessage: normalizeOptionalStringWithFallback(
      teacherPage.lessonSummaryEmptyMessage,
      fallback.lessonSummaryEmptyMessage,
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
    count: Number.isFinite(item.count) ? Number(item.count) : 0,
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

function normalizeConceptDifficulty(value: unknown): ConceptDifficulty {
  const item = (value ?? {}) as Partial<ConceptDifficulty>;

  return {
    concept: normalizeOptionalString(item.concept),
    count: Number.isFinite(item.count) ? Number(item.count) : 0,
    averageUnderstanding: normalizeOptionalString(item.averageUnderstanding),
    note: normalizeOptionalString(item.note),
  };
}

function normalizeLessonSupportStudent(value: unknown): LessonSupportStudent {
  const student = (value ?? {}) as Partial<LessonSupportStudent>;

  return {
    student: normalizeStudentReference(student.student),
    correctCount: Number.isFinite(student.correctCount)
      ? Number(student.correctCount)
      : 0,
    incorrectCount: Number.isFinite(student.incorrectCount)
      ? Number(student.incorrectCount)
      : 0,
    misconception: normalizeOptionalString(student.misconception),
    assignmentStatus: normalizeOptionalString(student.assignmentStatus),
    teacherNote: normalizeOptionalString(student.teacherNote),
  };
}

function normalizeStudentResult(value: unknown): StudentResult {
  const result = (value ?? {}) as Partial<StudentResult>;

  return {
    student: normalizeStudentReference(result.student),
    correctCount: Number.isFinite(result.correctCount)
      ? Number(result.correctCount)
      : 0,
    incorrectCount: Number.isFinite(result.incorrectCount)
      ? Number(result.incorrectCount)
      : 0,
    assignmentStatus: normalizeOptionalString(result.assignmentStatus),
    followUp: normalizeOptionalString(result.followUp),
  };
}

export function normalizeClassSummaryAggregate(value: unknown): ClassSummaryAggregate {
  const summary = (value ?? {}) as Partial<ClassSummaryAggregate>;
  const emotionSummary = normalizeCountItems(summary.emotionSummary);
  const goalSummary = normalizeCountItems(summary.goalSummary);

  return {
    type: "class-summary",
    generatedAt: normalizeString(summary.generatedAt, ""),
    periodLabel: normalizeString(summary.periodLabel, "학급 집계"),
    classroom: normalizeString(summary.classroom, ""),
    responseCount: Number.isFinite(summary.responseCount)
      ? Number(summary.responseCount)
      : 0,
    excludedResponseCount: Number.isFinite(summary.excludedResponseCount)
      ? Number(summary.excludedResponseCount)
      : 0,
    source: {
      ...DEFAULT_SOURCE_INFO,
      ...normalizeSourceInfo(summary.source),
    },
    emotionSummary,
    goalSummary,
    supportStudents: Array.isArray(summary.supportStudents)
      ? summary.supportStudents.map((item) => normalizeClassSupportStudent(item))
      : [],
    praiseCandidates: Array.isArray(summary.praiseCandidates)
      ? summary.praiseCandidates.map((item) => normalizePraiseCandidate(item))
      : [],
  };
}

export function normalizeLessonSummaryAggregate(value: unknown): LessonSummaryAggregate {
  const summary = (value ?? {}) as Partial<LessonSummaryAggregate>;
  const difficultConcepts = Array.isArray(summary.difficultConcepts)
    ? summary.difficultConcepts
        .map((item) => normalizeConceptDifficulty(item))
        .filter((item) => item.concept.length > 0)
    : [];
  const assignmentSummary = normalizeCountItems(summary.assignmentSummary);
  const studentResults = Array.isArray(summary.studentResults)
    ? summary.studentResults
        .map((item) => normalizeStudentResult(item))
        .filter((item) => item.student.name.length > 0)
    : [];

  return {
    type: "lesson-summary",
    generatedAt: normalizeString(summary.generatedAt, ""),
    periodLabel: normalizeString(summary.periodLabel, "수업 집계"),
    classroom: normalizeString(summary.classroom, ""),
    subject: normalizeString(summary.subject, ""),
    responseCount: Number.isFinite(summary.responseCount)
      ? Number(summary.responseCount)
      : 0,
    excludedResponseCount: Number.isFinite(summary.excludedResponseCount)
      ? Number(summary.excludedResponseCount)
      : 0,
    source: {
      ...DEFAULT_SOURCE_INFO,
      ...normalizeSourceInfo(summary.source),
    },
    overview: {
      averageCorrectCount: Number.isFinite(summary.overview?.averageCorrectCount)
        ? Number(summary.overview?.averageCorrectCount)
        : 0,
      averageIncorrectCount: Number.isFinite(summary.overview?.averageIncorrectCount)
        ? Number(summary.overview?.averageIncorrectCount)
        : 0,
      assignmentCompletionLabel: normalizeOptionalStringWithFallback(
        summary.overview?.assignmentCompletionLabel,
        "",
      ),
    },
    difficultConcepts,
    assignmentSummary,
    supportStudents: Array.isArray(summary.supportStudents)
      ? summary.supportStudents.map((item) => normalizeLessonSupportStudent(item))
      : [],
    studentResults,
  };
}
