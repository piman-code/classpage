export interface ClassPageSectionSettings {
  title: string;
  items: string[];
}

export interface ClassPageFormSettings {
  title: string;
  description: string;
  buttonLabel: string;
  url: string;
  helperText: string;
}

export interface StudentPageSettings {
  title: string;
  description: string;
  statusMessage: string;
  today: ClassPageSectionSettings;
  notices: ClassPageSectionSettings;
  forms: {
    classForm: ClassPageFormSettings;
    lessonForm: ClassPageFormSettings;
  };
}

export interface TeacherAggregateSourceSettings {
  classSummaryPath: string;
  lessonSummaryPath: string;
  starLedgerPath: string;
}

export interface TeacherPageSettings {
  title: string;
  description: string;
  statusMessage: string;
  classSummaryTitle: string;
  lessonSummaryTitle: string;
  starLedgerTitle: string;
  classSummaryEmptyMessage: string;
  lessonSummaryEmptyMessage: string;
  starLedgerEmptyMessage: string;
  sources: TeacherAggregateSourceSettings;
}

export interface ClassPageSettings {
  studentPage: StudentPageSettings;
  teacherPage: TeacherPageSettings;
}

export interface AggregateSourceInfo {
  formName: string;
  formUrl: string;
  sheetName: string;
  aggregatorNote: string;
}

export interface AggregateCountItem {
  label: string;
  count: number;
  note: string;
}

export interface StudentReference {
  classroom: string;
  number: string;
  name: string;
}

export interface ClassSupportStudent {
  student: StudentReference;
  mood: string;
  reason: string;
  goal: string;
  yesterdayAchievement: string;
  teacherNote: string;
}

export interface PraiseCandidate {
  student: StudentReference;
  reason: string;
  mentionedPeer: string;
}

export interface ClassStudentResponse {
  student: StudentReference;
  mood: string;
  emotionLabel: string;
  moodReason: string;
  goal: string;
  yesterdayAchievement: string;
  goalLabel: string;
  teacherMessage: string;
  helpedFriend: string;
  helpedByFriend: string;
  teacherNote: string;
}

export interface ClassSummaryAggregate {
  type: "class-summary";
  generatedAt: string;
  periodLabel: string;
  classroom: string;
  responseCount: number;
  excludedResponseCount: number;
  source: AggregateSourceInfo;
  emotionSummary: AggregateCountItem[];
  goalSummary: AggregateCountItem[];
  supportStudents: ClassSupportStudent[];
  praiseCandidates: PraiseCandidate[];
  studentResponses: ClassStudentResponse[];
}

export interface ConceptDifficulty {
  concept: string;
  count: number;
  averageUnderstanding: string;
  note: string;
}

export interface LessonSupportStudent {
  student: StudentReference;
  correctCount: number;
  incorrectCount: number;
  misconception: string;
  assignmentStatus: string;
  teacherNote: string;
}

export interface StudentResult {
  student: StudentReference;
  correctCount: number;
  incorrectCount: number;
  assignmentStatus: string;
  followUp: string;
}

export interface LessonConceptResponse {
  concept: string;
  understanding: string;
  understandingLabel: string;
}

export interface LessonStudentResponse {
  student: StudentReference;
  lessonUnit: string;
  correctCount: number;
  incorrectCount: number;
  assignmentStatus: string;
  incorrectReason: string;
  teacherMessage: string;
  misconception: string;
  followUp: string;
  teacherNote: string;
  concepts: LessonConceptResponse[];
}

export interface LessonOverview {
  averageCorrectCount: number;
  averageIncorrectCount: number;
  assignmentCompletionLabel: string;
}

export interface LessonGroupSummary {
  groupKey: string;
  lessonKey: string;
  label: string;
  lessonDate: string;
  periodOrder: number | null;
  subjectKey: string;
  unitKey: string;
  unitLabel: string;
  periodLabel: string;
  lessonUnit: string;
  classroom: string;
  subject: string;
  responseCount: number;
  excludedResponseCount: number;
  overview: LessonOverview;
  difficultConcepts: ConceptDifficulty[];
  assignmentSummary: AggregateCountItem[];
  supportStudents: LessonSupportStudent[];
  studentResults: StudentResult[];
  studentResponses: LessonStudentResponse[];
}

export interface LessonSubjectSummary extends LessonGroupSummary {
  groups: LessonGroupSummary[];
}

export interface LessonSummaryAggregate {
  type: "lesson-summary";
  generatedAt: string;
  lessonKey: string;
  lessonDate: string;
  periodOrder: number | null;
  subjectKey: string;
  unitKey: string;
  unitLabel: string;
  periodLabel: string;
  classroom: string;
  subject: string;
  responseCount: number;
  excludedResponseCount: number;
  source: AggregateSourceInfo;
  overview: LessonOverview;
  difficultConcepts: ConceptDifficulty[];
  assignmentSummary: AggregateCountItem[];
  supportStudents: LessonSupportStudent[];
  studentResults: StudentResult[];
  studentResponses: LessonStudentResponse[];
  subjectSummaries: LessonSubjectSummary[];
}

export type StarRuleCategory =
  | "attendance"
  | "participation"
  | "service"
  | "adjustment"
  | "custom";

export type StarVisibility = "student" | "teacher";

export type StarEventSource = "manual" | "class-form" | "lesson-form" | "system";

export interface StarAutoCriteria {
  assignmentStatusIn: string[];
  minimumCorrectCount: number | null;
  maximumIncorrectCount: number | null;
}

export interface StarRuleSettings {
  ruleId: string;
  label: string;
  category: StarRuleCategory;
  delta: number;
  visibility: StarVisibility;
  description: string;
  enabled: boolean;
  sources: StarEventSource[];
  allowCustomDelta: boolean;
  autoCriteria: StarAutoCriteria | null;
}

export interface StarEvent {
  id: string;
  studentKey: string;
  student: StudentReference;
  ruleId: string;
  category: StarRuleCategory;
  delta: number;
  visibility: StarVisibility;
  source: StarEventSource;
  occurredAt: string;
  note: string;
  actor: string;
  batchId: string;
}

export interface StarStudentTotal {
  studentKey: string;
  student: StudentReference;
  total: number;
  visibleTotal: number;
  hiddenAdjustmentTotal: number;
  eventCount: number;
}

export interface StarEventSourceSummary {
  manual: number;
  "class-form": number;
  "lesson-form": number;
  system: number;
}

export interface StarRuleEventSummary {
  ruleId: string;
  label: string;
  category: StarRuleCategory;
  visibility: StarVisibility;
  eventCount: number;
  manualCount: number;
  automaticCount: number;
  sourceSummary: StarEventSourceSummary;
}

export interface StarModeLedger {
  type: "star-ledger";
  generatedAt: string;
  periodLabel: string;
  classroom?: string;
  excludedResponseCount: number;
  eventCount: number;
  source: AggregateSourceInfo;
  sourceSummary: StarEventSourceSummary;
  rules: StarRuleSettings[];
  ruleSummary: StarRuleEventSummary[];
  totals: StarStudentTotal[];
  recentEvents: StarEvent[];
}

export interface AggregateSourceState<T> {
  kind: "class" | "lesson" | "star";
  path: string;
  status: "loaded" | "missing" | "invalid" | "error";
  message: string;
  data: T | null;
}

export interface TeacherPageData {
  classSummary: AggregateSourceState<ClassSummaryAggregate>;
  lessonSummary: AggregateSourceState<LessonSummaryAggregate>;
  starLedger: AggregateSourceState<StarModeLedger>;
}
