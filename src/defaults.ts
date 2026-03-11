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
  LessonSummaryAggregate,
  LessonSupportStudent,
  LessonStudentResponse,
  PraiseCandidate,
  StarAutoCriteria,
  StarEvent,
  StarEventSource,
  StarModeLedger,
  StarRuleSettings,
  StarStudentTotal,
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
  "https://docs.google.com/forms/d/e/1FAIpQLSdBmPO3TZyp6jxjVgnXfSgypR0AzSC2yjSc9mRg7kjByPaLYA/viewform?usp=header";
const DEFAULT_LESSON_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeeKvU6VCMpItqXMEPiGVHJ5RW27FFur6_LbmFcBSqpxg-ujw/viewform?usp=header";

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
    label: "과제 완료",
    category: "participation",
    delta: 1,
    visibility: "student",
    description: "수업용 폼의 과제 수행 정도가 완료로 분류되면 자동 적립",
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
    description: "수업용 폼에서 과제 완료이고 오답이 없으면 자동 적립",
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
    description: "교사가 공개 가점을 수동으로 부여",
    enabled: true,
    sources: ["manual"],
    allowCustomDelta: true,
    autoCriteria: null,
  },
  {
    ruleId: "teacher-adjustment",
    label: "교사 전용 조정",
    category: "adjustment",
    delta: -2,
    visibility: "teacher",
    description: "교사 내부 조정용 기본 규칙",
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
    title: "교사용 페이지",
    description: "학급, 수업, 별점 상태를 빠르게 확인합니다.",
    statusMessage: "상태 카드로 필요한 영역만 확인합니다.",
    classSummaryTitle: "학급용 폼 집계",
    lessonSummaryTitle: "수업용 폼 집계",
    starLedgerTitle: "별점모드",
    classSummaryEmptyMessage:
      "학급용 집계 JSON을 찾지 못했습니다. docs/START_HERE.md의 연결 순서와 docs/BEGINNER_SETUP.md의 집계 연결 단계를 확인하세요.",
    lessonSummaryEmptyMessage:
      "수업용 집계 JSON을 찾지 못했습니다. docs/START_HERE.md의 연결 순서와 docs/BEGINNER_SETUP.md의 집계 연결 단계를 확인하세요.",
    starLedgerEmptyMessage:
      "별점모드 JSON을 찾지 못했습니다. docs/START_HERE.md와 Apps Script의 star-ledger.json 생성, JSON 경로 설정을 함께 확인하세요.",
    sources: {
      classSummaryPath: "classpage-data/class-summary.json",
      lessonSummaryPath: "classpage-data/lesson-summary.json",
      starLedgerPath: "classpage-data/star-ledger.json",
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

  return {
    type: "lesson-summary",
    generatedAt: normalizeOptionalString(summary.generatedAt),
    periodLabel: normalizeString(summary.periodLabel, "수업 집계"),
    classroom: normalizeOptionalString(summary.classroom),
    subject: normalizeOptionalString(summary.subject),
    responseCount: normalizeNumber(summary.responseCount),
    excludedResponseCount: normalizeNumber(summary.excludedResponseCount),
    source: {
      ...DEFAULT_SOURCE_INFO,
      ...normalizeSourceInfo(summary.source),
    },
    overview: {
      averageCorrectCount: normalizeNumber(summary.overview?.averageCorrectCount),
      averageIncorrectCount: normalizeNumber(summary.overview?.averageIncorrectCount),
      assignmentCompletionLabel: normalizeOptionalStringWithFallback(
        summary.overview?.assignmentCompletionLabel,
        "미분류",
      ),
    },
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
    studentResponses: Array.isArray(summary.studentResponses)
      ? summary.studentResponses.map((item) => normalizeLessonStudentResponse(item))
      : [],
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
    totals: Array.isArray(ledger.totals)
      ? ledger.totals.map((item) => normalizeStarStudentTotal(item))
      : [],
    recentEvents: Array.isArray(ledger.recentEvents)
      ? ledger.recentEvents.map((item) => normalizeStarEvent(item))
      : [],
  };
}
