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
}

export interface TeacherPageSettings {
  title: string;
  description: string;
  statusMessage: string;
  classSummaryTitle: string;
  lessonSummaryTitle: string;
  classSummaryEmptyMessage: string;
  lessonSummaryEmptyMessage: string;
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

export interface ClassSummaryAggregate {
  type: "class-summary";
  generatedAt: string;
  periodLabel: string;
  classroom: string;
  responseCount: number;
  source: AggregateSourceInfo;
  emotionSummary: AggregateCountItem[];
  goalSummary: AggregateCountItem[];
  supportStudents: ClassSupportStudent[];
  praiseCandidates: PraiseCandidate[];
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

export interface LessonOverview {
  averageCorrectCount: number;
  averageIncorrectCount: number;
  assignmentCompletionLabel: string;
}

export interface LessonSummaryAggregate {
  type: "lesson-summary";
  generatedAt: string;
  periodLabel: string;
  classroom: string;
  subject: string;
  responseCount: number;
  source: AggregateSourceInfo;
  overview: LessonOverview;
  difficultConcepts: ConceptDifficulty[];
  assignmentSummary: AggregateCountItem[];
  supportStudents: LessonSupportStudent[];
  studentResults: StudentResult[];
}

export interface AggregateSourceState<T> {
  kind: "class" | "lesson";
  path: string;
  status: "loaded" | "missing" | "invalid" | "error";
  message: string;
  data: T | null;
}

export interface TeacherPageData {
  classSummary: AggregateSourceState<ClassSummaryAggregate>;
  lessonSummary: AggregateSourceState<LessonSummaryAggregate>;
}
