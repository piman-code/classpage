/* Bundled by esbuild for the classpage Obsidian plugin. */
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ClassPagePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// src/defaults.ts
var DEFAULT_CLASS_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdBmPO3TZyp6jxjVgnXfSgypR0AzSC2yjSc9mRg7kjByPaLYA/viewform?usp=header";
var DEFAULT_LESSON_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeeKvU6VCMpItqXMEPiGVHJ5RW27FFur6_LbmFcBSqpxg-ujw/viewform?usp=header";
var DEFAULT_STAR_RULES = [
  {
    ruleId: "arrival",
    label: "\uB4F1\uAD50",
    category: "attendance",
    delta: 5,
    visibility: "student",
    description: "\uD559\uAE09\uC6A9 \uD3FC \uC81C\uCD9C \uC2DC \uC790\uB3D9 \uC801\uB9BD",
    enabled: true,
    sources: ["class-form"],
    allowCustomDelta: false,
    autoCriteria: null
  },
  {
    ruleId: "attendance-check",
    label: "\uCD9C\uC11D\uCCB4\uD06C",
    category: "attendance",
    delta: 1,
    visibility: "student",
    description: "\uD559\uAE09\uC6A9 \uD3FC \uC81C\uCD9C \uC644\uB8CC",
    enabled: true,
    sources: ["class-form"],
    allowCustomDelta: false,
    autoCriteria: null
  },
  {
    ruleId: "lesson-submit",
    label: "\uC218\uC5C5 \uC81C\uCD9C",
    category: "participation",
    delta: 1,
    visibility: "student",
    description: "\uC218\uC5C5\uC6A9 \uD3FC \uC81C\uCD9C \uC644\uB8CC",
    enabled: true,
    sources: ["lesson-form"],
    allowCustomDelta: false,
    autoCriteria: null
  },
  {
    ruleId: "assignment-complete",
    label: "\uBCF5\uC2B5/\uC218\uD589 \uC644\uB8CC",
    category: "participation",
    delta: 1,
    visibility: "student",
    description: "\uC218\uC5C5\uC6A9 \uD3FC\uC758 \uBCF5\uC2B5/\uC218\uD589 \uC0C1\uD0DC\uAC00 \uC644\uB8CC\uB85C \uBD84\uB958\uB418\uBA74 \uC790\uB3D9 \uC801\uB9BD",
    enabled: true,
    sources: ["lesson-form"],
    allowCustomDelta: false,
    autoCriteria: {
      assignmentStatusIn: ["\uC644\uB8CC"],
      minimumCorrectCount: null,
      maximumIncorrectCount: null
    }
  },
  {
    ruleId: "no-incorrect",
    label: "\uC624\uB2F5 \uC5C6\uC74C",
    category: "participation",
    delta: 1,
    visibility: "student",
    description: "\uC218\uC5C5\uC6A9 \uD3FC\uC5D0\uC11C \uBCF5\uC2B5/\uC218\uD589 \uC0C1\uD0DC\uAC00 \uC644\uB8CC\uC774\uACE0 \uC624\uB2F5\uC774 \uC5C6\uC73C\uBA74 \uC790\uB3D9 \uC801\uB9BD",
    enabled: true,
    sources: ["lesson-form"],
    allowCustomDelta: false,
    autoCriteria: {
      assignmentStatusIn: ["\uC644\uB8CC"],
      minimumCorrectCount: 1,
      maximumIncorrectCount: 0
    }
  },
  {
    ruleId: "manual-praise",
    label: "\uC218\uB3D9 \uCE6D\uCC2C",
    category: "service",
    delta: 2,
    visibility: "student",
    description: "\uC120\uC0DD\uB2D8\uC774 \uACF5\uAC1C \uAC00\uC810\uC744 \uC218\uB3D9\uC73C\uB85C \uBD80\uC5EC",
    enabled: true,
    sources: ["manual"],
    allowCustomDelta: true,
    autoCriteria: null
  },
  {
    ruleId: "teacher-adjustment",
    label: "\uC120\uC0DD\uB2D8 \uC804\uC6A9 \uC870\uC815",
    category: "adjustment",
    delta: -2,
    visibility: "teacher",
    description: "\uC120\uC0DD\uB2D8 \uB0B4\uBD80 \uC870\uC815\uC6A9 \uAE30\uBCF8 \uADDC\uCE59",
    enabled: true,
    sources: ["manual"],
    allowCustomDelta: true,
    autoCriteria: null
  }
];
var DEFAULT_SETTINGS = {
  studentPage: {
    title: "\uC6B0\uB9AC \uBC18 \uAD50\uC2E4 \uD398\uC774\uC9C0",
    description: "\uC624\uB298 \uD574\uC57C \uD560 \uC77C\uACFC \uACF5\uC9C0, \uC81C\uCD9C \uD3FC\uB9CC \uBE60\uB974\uAC8C \uD655\uC778\uD569\uB2C8\uB2E4.",
    statusMessage: "\uC624\uB298 \uD560 \uC77C\uC744 \uD655\uC778\uD55C \uB4A4 \uD559\uAE09\uC6A9/\uC218\uC5C5\uC6A9 \uD3FC\uC744 \uC81C\uCD9C\uD569\uB2C8\uB2E4.",
    today: {
      title: "\uC624\uB298\uC758 \uD560 \uC77C",
      items: [
        "\uB4F1\uAD50 \uD6C4 \uD559\uAE09\uC6A9 \uD3FC\uC744 \uC81C\uCD9C\uD569\uB2C8\uB2E4.",
        "1\uAD50\uC2DC \uC804 \uC900\uBE44\uBB3C\uACFC \uC624\uB298 \uC77C\uC815\uC744 \uD655\uC778\uD569\uB2C8\uB2E4.",
        "\uC218\uC5C5\uC744 \uB9C8\uCE5C \uB4A4 \uC218\uC5C5\uC6A9 \uD3FC\uC73C\uB85C \uC774\uD574 \uC0C1\uD0DC\uB97C \uB0A8\uAE41\uB2C8\uB2E4."
      ]
    },
    notices: {
      title: "\uACF5\uC9C0\uC0AC\uD56D",
      items: [
        "\uC624\uB298 5\uAD50\uC2DC \uD6C4 \uCCAD\uC18C \uAD6C\uC5ED \uC810\uAC80\uC774 \uC788\uC2B5\uB2C8\uB2E4.",
        "\uAC00\uC815\uD1B5\uC2E0\uBB38 \uC81C\uCD9C\uC774 \uD544\uC694\uD55C \uD559\uC0DD\uC740 \uC885\uB840 \uC804\uAE4C\uC9C0 \uC81C\uCD9C\uD569\uB2C8\uB2E4."
      ]
    },
    forms: {
      classForm: {
        title: "\uD559\uAE09\uC6A9 \uD3FC",
        description: "\uC544\uCE68 \uC77C\uC9C0\uC640 \uC624\uB298 \uC0C1\uD0DC\uB97C \uC81C\uCD9C\uD558\uB294 \uD3FC\uC785\uB2C8\uB2E4.",
        buttonLabel: "\uD559\uAE09\uC6A9 \uD3FC \uBC14\uB85C\uAC00\uAE30",
        url: DEFAULT_CLASS_FORM_URL,
        helperText: "\uB4F1\uAD50 \uC9C1\uD6C4 \uC81C\uCD9C"
      },
      lessonForm: {
        title: "\uC218\uC5C5\uC6A9 \uD3FC",
        description: "\uC218\uC5C5 \uD6C4 \uC774\uD574 \uC815\uB3C4\uC640 \uB290\uB080 \uC810\uC744 \uB0A8\uAE30\uB294 \uD3FC\uC785\uB2C8\uB2E4.",
        buttonLabel: "\uC218\uC5C5\uC6A9 \uD3FC \uBC14\uB85C\uAC00\uAE30",
        url: DEFAULT_LESSON_FORM_URL,
        helperText: "\uC218\uC5C5 \uC9C1\uD6C4 \uC81C\uCD9C"
      }
    }
  },
  teacherPage: {
    title: "\uC120\uC0DD\uB2D8 \uD398\uC774\uC9C0",
    description: "\uD559\uAE09, \uC218\uC5C5, \uBCC4\uC810 \uC0C1\uD0DC\uB97C \uBE60\uB974\uAC8C \uD655\uC778\uD558\uB294 \uC120\uC0DD\uB2D8\uC6A9 \uD654\uBA74\uC785\uB2C8\uB2E4.",
    statusMessage: "\uC0C1\uD0DC \uCE74\uB4DC\uB85C \uD544\uC694\uD55C \uC601\uC5ED\uB9CC \uD655\uC778\uD569\uB2C8\uB2E4.",
    classSummaryTitle: "\uD559\uAE09\uC6A9 \uD3FC \uC9D1\uACC4",
    lessonSummaryTitle: "\uC218\uC5C5\uC6A9 \uD3FC \uC9D1\uACC4",
    starLedgerTitle: "\uBCC4\uC810\uBAA8\uB4DC",
    classSummaryEmptyMessage: "\uD559\uAE09 \uC9D1\uACC4 \uD30C\uC77C\uC774 \uC544\uC9C1 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uCC98\uC74C \uC5F0\uACB0 \uC911\uC774\uB77C\uBA74 \uC815\uC0C1\uC785\uB2C8\uB2E4. \uD559\uAE09 \uC9D1\uACC4\uB97C \uD55C \uBC88 \uC0DD\uC131\uD55C \uB4A4 class-summary.json \uACBD\uB85C\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
    lessonSummaryEmptyMessage: "\uC218\uC5C5 \uC9D1\uACC4 \uD30C\uC77C\uC774 \uC544\uC9C1 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uCC98\uC74C \uC5F0\uACB0 \uC911\uC774\uB77C\uBA74 \uC815\uC0C1\uC785\uB2C8\uB2E4. \uC218\uC5C5 \uC9D1\uACC4\uB97C \uD55C \uBC88 \uC0DD\uC131\uD55C \uB4A4 lesson-summary.json \uACBD\uB85C\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
    starLedgerEmptyMessage: "\uBCC4\uC810 \uC9D1\uACC4 \uD30C\uC77C\uC774 \uC544\uC9C1 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uCC98\uC74C \uC5F0\uACB0 \uC911\uC774\uB77C\uBA74 \uC815\uC0C1\uC785\uB2C8\uB2E4. star-ledger.json \uC0DD\uC131\uACFC \uACBD\uB85C \uC124\uC815\uC744 \uD568\uAED8 \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
    sources: {
      classSummaryPath: "classpage-data/class-summary.json",
      lessonSummaryPath: "classpage-data/lesson-summary.json",
      starLedgerPath: "classpage-data/star-ledger.json"
    }
  }
};
var DEFAULT_SOURCE_INFO = {
  formName: "",
  formUrl: "",
  sheetName: "",
  aggregatorNote: ""
};
function normalizeString(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}
function normalizeOptionalString(value) {
  return typeof value === "string" ? value.trim() : "";
}
function normalizeOptionalStringWithFallback(value, fallback) {
  return typeof value === "string" ? value.trim() : fallback;
}
function normalizeItems(value, fallback) {
  if (!Array.isArray(value)) {
    return [...fallback];
  }
  return value.map((item) => typeof item === "string" ? item.trim() : "").filter((item) => item.length > 0);
}
function normalizeNumber(value, fallback = 0) {
  return Number.isFinite(value) ? Number(value) : fallback;
}
function normalizeOptionalNumber(value) {
  return Number.isFinite(value) ? Number(value) : null;
}
function buildLessonStructuredKeyPart(value) {
  return value.trim().toLowerCase().replace(/\s+/g, "-").replace(/[|/\\]+/g, "-");
}
function extractLessonDateFromLabel(value) {
  const match = value.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
}
function extractLessonPeriodOrder(value) {
  const periodMatch = value.match(/(\d+)\s*교시/);
  if (periodMatch) {
    return Number(periodMatch[1]);
  }
  const numericMatch = value.match(/(\d+)/);
  return numericMatch ? Number(numericMatch[1]) : null;
}
function buildLessonMachineKey(lessonDate, periodOrder, subjectKey, unitKey) {
  return [
    lessonDate || "date-missing",
    periodOrder != null ? `p${periodOrder}` : "p0",
    subjectKey || "subject-missing",
    unitKey || "unit-missing"
  ].join("|");
}
function normalizeSection(value, fallback) {
  const section = value ?? {};
  return {
    title: normalizeString(section.title, fallback.title),
    items: normalizeItems(section.items, fallback.items)
  };
}
function normalizeForm(value, fallback) {
  const form = value ?? {};
  return {
    title: normalizeString(form.title, fallback.title),
    description: normalizeOptionalStringWithFallback(
      form.description,
      fallback.description
    ),
    buttonLabel: normalizeString(form.buttonLabel, fallback.buttonLabel),
    url: normalizeOptionalStringWithFallback(form.url, fallback.url),
    helperText: normalizeOptionalStringWithFallback(
      form.helperText,
      fallback.helperText
    )
  };
}
function normalizeStudentPage(value, fallback) {
  const studentPage = value ?? {};
  return {
    title: normalizeString(studentPage.title, fallback.title),
    description: normalizeOptionalStringWithFallback(
      studentPage.description,
      fallback.description
    ),
    statusMessage: normalizeOptionalStringWithFallback(
      studentPage.statusMessage,
      fallback.statusMessage
    ),
    today: normalizeSection(studentPage.today, fallback.today),
    notices: normalizeSection(studentPage.notices, fallback.notices),
    forms: {
      classForm: normalizeForm(
        studentPage.forms?.classForm,
        fallback.forms.classForm
      ),
      lessonForm: normalizeForm(
        studentPage.forms?.lessonForm,
        fallback.forms.lessonForm
      )
    }
  };
}
function normalizeTeacherPage(value, fallback) {
  const teacherPage = value ?? {};
  return {
    title: normalizeString(teacherPage.title, fallback.title),
    description: normalizeOptionalStringWithFallback(
      teacherPage.description,
      fallback.description
    ),
    statusMessage: normalizeOptionalStringWithFallback(
      teacherPage.statusMessage,
      fallback.statusMessage
    ),
    classSummaryTitle: normalizeString(
      teacherPage.classSummaryTitle,
      fallback.classSummaryTitle
    ),
    lessonSummaryTitle: normalizeString(
      teacherPage.lessonSummaryTitle,
      fallback.lessonSummaryTitle
    ),
    starLedgerTitle: normalizeString(
      teacherPage.starLedgerTitle,
      fallback.starLedgerTitle
    ),
    classSummaryEmptyMessage: normalizeOptionalStringWithFallback(
      teacherPage.classSummaryEmptyMessage,
      fallback.classSummaryEmptyMessage
    ),
    lessonSummaryEmptyMessage: normalizeOptionalStringWithFallback(
      teacherPage.lessonSummaryEmptyMessage,
      fallback.lessonSummaryEmptyMessage
    ),
    starLedgerEmptyMessage: normalizeOptionalStringWithFallback(
      teacherPage.starLedgerEmptyMessage,
      fallback.starLedgerEmptyMessage
    ),
    sources: {
      classSummaryPath: normalizeString(
        teacherPage.sources?.classSummaryPath,
        fallback.sources.classSummaryPath
      ),
      lessonSummaryPath: normalizeString(
        teacherPage.sources?.lessonSummaryPath,
        fallback.sources.lessonSummaryPath
      ),
      starLedgerPath: normalizeString(
        teacherPage.sources?.starLedgerPath,
        fallback.sources.starLedgerPath
      )
    }
  };
}
function normalizeSettings(value) {
  const settings = value ?? {};
  const legacyStudentPage = {
    title: settings.pageTitle,
    description: settings.pageDescription,
    statusMessage: settings.statusMessage,
    today: settings.today,
    notices: settings.notices,
    forms: settings.forms
  };
  return {
    studentPage: normalizeStudentPage(
      settings.studentPage ?? legacyStudentPage,
      DEFAULT_SETTINGS.studentPage
    ),
    teacherPage: normalizeTeacherPage(
      settings.teacherPage,
      DEFAULT_SETTINGS.teacherPage
    )
  };
}
function normalizeSourceInfo(value) {
  const info = value ?? {};
  return {
    formName: normalizeOptionalString(info.formName),
    formUrl: normalizeOptionalString(info.formUrl),
    sheetName: normalizeOptionalString(info.sheetName),
    aggregatorNote: normalizeOptionalString(info.aggregatorNote)
  };
}
function normalizeCountItem(value) {
  const item = value ?? {};
  return {
    label: normalizeOptionalString(item.label),
    count: normalizeNumber(item.count),
    note: normalizeOptionalString(item.note)
  };
}
function normalizeCountItems(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => normalizeCountItem(item)).filter((item) => item.label.length > 0);
}
function normalizeStudentReference(value) {
  const student = value ?? {};
  return {
    classroom: normalizeOptionalString(student.classroom),
    number: normalizeOptionalString(student.number),
    name: normalizeOptionalString(student.name)
  };
}
function normalizeClassSupportStudent(value) {
  const student = value ?? {};
  return {
    student: normalizeStudentReference(student.student),
    mood: normalizeOptionalString(student.mood),
    reason: normalizeOptionalString(student.reason),
    goal: normalizeOptionalString(student.goal),
    yesterdayAchievement: normalizeOptionalString(student.yesterdayAchievement),
    teacherNote: normalizeOptionalString(student.teacherNote)
  };
}
function normalizePraiseCandidate(value) {
  const candidate = value ?? {};
  return {
    student: normalizeStudentReference(candidate.student),
    reason: normalizeOptionalString(candidate.reason),
    mentionedPeer: normalizeOptionalString(candidate.mentionedPeer)
  };
}
function normalizeClassStudentResponse(value) {
  const response = value ?? {};
  return {
    student: normalizeStudentReference(response.student),
    mood: normalizeOptionalString(response.mood),
    emotionLabel: normalizeOptionalStringWithFallback(
      response.emotionLabel,
      "\uBBF8\uBD84\uB958"
    ),
    moodReason: normalizeOptionalString(response.moodReason),
    goal: normalizeOptionalString(response.goal),
    yesterdayAchievement: normalizeOptionalString(response.yesterdayAchievement),
    goalLabel: normalizeOptionalStringWithFallback(response.goalLabel, "\uBBF8\uBD84\uB958"),
    teacherMessage: normalizeOptionalString(response.teacherMessage),
    helpedFriend: normalizeOptionalString(response.helpedFriend),
    helpedByFriend: normalizeOptionalString(response.helpedByFriend),
    teacherNote: normalizeOptionalString(response.teacherNote)
  };
}
function normalizeConceptDifficulty(value) {
  const item = value ?? {};
  return {
    concept: normalizeOptionalString(item.concept),
    count: normalizeNumber(item.count),
    averageUnderstanding: normalizeOptionalStringWithFallback(
      item.averageUnderstanding,
      "\uBBF8\uBD84\uB958"
    ),
    note: normalizeOptionalString(item.note)
  };
}
function normalizeLessonSupportStudent(value) {
  const student = value ?? {};
  return {
    student: normalizeStudentReference(student.student),
    correctCount: normalizeNumber(student.correctCount),
    incorrectCount: normalizeNumber(student.incorrectCount),
    misconception: normalizeOptionalStringWithFallback(
      student.misconception,
      "\uBBF8\uBD84\uB958"
    ),
    assignmentStatus: normalizeOptionalStringWithFallback(
      student.assignmentStatus,
      "\uBBF8\uBD84\uB958"
    ),
    teacherNote: normalizeOptionalString(student.teacherNote)
  };
}
function normalizeStudentResult(value) {
  const result = value ?? {};
  return {
    student: normalizeStudentReference(result.student),
    correctCount: normalizeNumber(result.correctCount),
    incorrectCount: normalizeNumber(result.incorrectCount),
    assignmentStatus: normalizeOptionalStringWithFallback(
      result.assignmentStatus,
      "\uBBF8\uBD84\uB958"
    ),
    followUp: normalizeOptionalStringWithFallback(result.followUp, "\uBBF8\uD655\uC778")
  };
}
function normalizeLessonConceptResponse(value) {
  const concept = value ?? {};
  return {
    concept: normalizeOptionalString(concept.concept),
    understanding: normalizeOptionalString(concept.understanding),
    understandingLabel: normalizeOptionalStringWithFallback(
      concept.understandingLabel,
      "\uBBF8\uBD84\uB958"
    )
  };
}
function normalizeLessonStudentResponse(value) {
  const response = value ?? {};
  return {
    student: normalizeStudentReference(response.student),
    lessonUnit: normalizeOptionalString(response.lessonUnit),
    correctCount: normalizeNumber(response.correctCount),
    incorrectCount: normalizeNumber(response.incorrectCount),
    assignmentStatus: normalizeOptionalStringWithFallback(
      response.assignmentStatus,
      "\uBBF8\uBD84\uB958"
    ),
    incorrectReason: normalizeOptionalString(response.incorrectReason),
    teacherMessage: normalizeOptionalString(response.teacherMessage),
    misconception: normalizeOptionalStringWithFallback(
      response.misconception,
      "\uBBF8\uBD84\uB958"
    ),
    followUp: normalizeOptionalStringWithFallback(response.followUp, "\uBBF8\uD655\uC778"),
    teacherNote: normalizeOptionalString(response.teacherNote),
    concepts: Array.isArray(response.concepts) ? response.concepts.map((item) => normalizeLessonConceptResponse(item)).filter((item) => item.concept.length > 0 || item.understanding.length > 0) : []
  };
}
function normalizeLessonOverview(value) {
  const overview = value ?? {};
  return {
    averageCorrectCount: normalizeNumber(overview.averageCorrectCount),
    averageIncorrectCount: normalizeNumber(overview.averageIncorrectCount),
    assignmentCompletionLabel: normalizeOptionalStringWithFallback(
      overview.assignmentCompletionLabel,
      "\uBBF8\uBD84\uB958"
    )
  };
}
function buildLessonGroupLabel(subject, periodLabel, unitLabel) {
  const parts = [subject, periodLabel];
  if (unitLabel && !periodLabel.includes(unitLabel)) {
    parts.push(unitLabel);
  }
  return parts.filter(Boolean).join(" \xB7 ") || "\uC218\uC5C5 \uADF8\uB8F9";
}
function normalizeLessonGroupSummary(value) {
  const summary = value ?? {};
  const studentResponses = Array.isArray(summary.studentResponses) ? summary.studentResponses.map((item) => normalizeLessonStudentResponse(item)) : [];
  const periodLabel = normalizeString(summary.periodLabel, "\uC751\uB2F5 \uC5C6\uC74C");
  const subject = normalizeOptionalString(summary.subject);
  const lessonUnit = normalizeOptionalString(summary.lessonUnit) || studentResponses[0]?.lessonUnit || "";
  const unitLabel = normalizeOptionalString(summary.unitLabel) || lessonUnit;
  const lessonDate = normalizeOptionalString(summary.lessonDate) || extractLessonDateFromLabel(periodLabel);
  const periodOrder = normalizeOptionalNumber(summary.periodOrder) ?? extractLessonPeriodOrder(periodLabel);
  const subjectKey = normalizeOptionalString(summary.subjectKey) || buildLessonStructuredKeyPart(subject);
  const unitKey = normalizeOptionalString(summary.unitKey) || buildLessonStructuredKeyPart(unitLabel);
  const lessonKey = normalizeOptionalString(summary.lessonKey) || buildLessonMachineKey(lessonDate, periodOrder, subjectKey, unitKey);
  return {
    groupKey: normalizeOptionalString(summary.groupKey) || [subject, periodLabel, lessonUnit].filter(Boolean).join("|"),
    lessonKey,
    label: normalizeOptionalString(summary.label) || buildLessonGroupLabel(subject, periodLabel, unitLabel || lessonUnit),
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
    difficultConcepts: Array.isArray(summary.difficultConcepts) ? summary.difficultConcepts.map((item) => normalizeConceptDifficulty(item)).filter((item) => item.concept.length > 0) : [],
    assignmentSummary: normalizeCountItems(summary.assignmentSummary),
    supportStudents: Array.isArray(summary.supportStudents) ? summary.supportStudents.map((item) => normalizeLessonSupportStudent(item)) : [],
    studentResults: Array.isArray(summary.studentResults) ? summary.studentResults.map((item) => normalizeStudentResult(item)) : [],
    studentResponses
  };
}
function compareLessonGroupsForDisplay(left, right) {
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
function hasLessonGroupData(summary) {
  const meaningfulGroupKey = summary.groupKey.trim() !== "" && summary.groupKey.trim() !== "\uC751\uB2F5 \uC5C6\uC74C";
  const meaningfulLabel = summary.label.trim() !== "" && summary.label.trim() !== "\uC218\uC5C5 \uADF8\uB8F9" && summary.label.trim() !== "\uC751\uB2F5 \uC5C6\uC74C";
  const meaningfulPeriodLabel = summary.periodLabel.trim() !== "" && summary.periodLabel.trim() !== "\uC751\uB2F5 \uC5C6\uC74C";
  return [
    meaningfulGroupKey ? summary.groupKey : "",
    meaningfulLabel ? summary.label : "",
    meaningfulPeriodLabel ? summary.periodLabel : "",
    summary.lessonUnit,
    summary.classroom,
    summary.subject
  ].some((value) => value.trim().length > 0) || summary.responseCount > 0 || summary.excludedResponseCount > 0 || summary.difficultConcepts.length > 0 || summary.assignmentSummary.length > 0 || summary.supportStudents.length > 0 || summary.studentResults.length > 0 || summary.studentResponses.length > 0;
}
function cloneLessonGroupSummary(summary) {
  return {
    ...summary,
    overview: { ...summary.overview },
    difficultConcepts: summary.difficultConcepts.map((item) => ({ ...item })),
    assignmentSummary: summary.assignmentSummary.map((item) => ({ ...item })),
    supportStudents: summary.supportStudents.map((item) => ({
      ...item,
      student: { ...item.student }
    })),
    studentResults: summary.studentResults.map((item) => ({
      ...item,
      student: { ...item.student }
    })),
    studentResponses: summary.studentResponses.map((item) => ({
      ...item,
      student: { ...item.student },
      concepts: item.concepts.map((concept) => ({ ...concept }))
    }))
  };
}
function normalizeLessonSubjectSummary(value) {
  const summary = value ?? {};
  const baseGroup = normalizeLessonGroupSummary(summary);
  const groups = Array.isArray(summary.groups) ? summary.groups.map((item) => normalizeLessonGroupSummary(item)).filter((item) => hasLessonGroupData(item)).sort((left, right) => compareLessonGroupsForDisplay(left, right)) : [];
  const primaryGroup = hasLessonGroupData(baseGroup) ? baseGroup : groups[0] ?? baseGroup;
  const normalizedGroups = groups.length > 0 ? groups : hasLessonGroupData(primaryGroup) ? [cloneLessonGroupSummary(primaryGroup)] : [];
  return {
    ...cloneLessonGroupSummary(primaryGroup),
    groups: normalizedGroups.map((item) => cloneLessonGroupSummary(item))
  };
}
function normalizeStarRule(value) {
  const rule = value ?? {};
  const ruleId = typeof rule.ruleId === "string" && rule.ruleId.trim().length > 0 ? rule.ruleId.trim() : typeof rule.id === "string" && rule.id.trim().length > 0 ? rule.id.trim() : "";
  const fallback = DEFAULT_STAR_RULES.find((item) => item.ruleId === ruleId) ?? DEFAULT_STAR_RULES[0];
  return {
    ruleId: normalizeString(ruleId, fallback.ruleId),
    label: normalizeString(rule.label, fallback.label),
    category: rule.category ?? fallback.category,
    delta: normalizeNumber(rule.delta, fallback.delta),
    visibility: rule.visibility === "teacher" ? "teacher" : "student",
    description: normalizeOptionalStringWithFallback(
      rule.description,
      fallback.description
    ),
    enabled: typeof rule.enabled === "boolean" ? rule.enabled : typeof rule.active === "boolean" ? rule.active : fallback.enabled,
    sources: normalizeStarRuleSources(rule.sources, fallback.sources),
    allowCustomDelta: typeof rule.allowCustomDelta === "boolean" ? rule.allowCustomDelta : fallback.allowCustomDelta,
    autoCriteria: normalizeStarAutoCriteria(
      rule.autoCriteria,
      fallback.autoCriteria
    )
  };
}
function normalizeStarEvent(value) {
  const event = value ?? {};
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
    batchId: normalizeOptionalString(event.batchId)
  };
}
function normalizeStarStudentTotal(value) {
  const total = value ?? {};
  return {
    studentKey: normalizeString(total.studentKey, "student|unknown"),
    student: normalizeStudentReference(total.student),
    total: normalizeNumber(total.total),
    visibleTotal: normalizeNumber(total.visibleTotal),
    hiddenAdjustmentTotal: normalizeNumber(total.hiddenAdjustmentTotal),
    eventCount: normalizeNumber(total.eventCount)
  };
}
function normalizeStarRuleSources(value, fallback) {
  if (!Array.isArray(value)) {
    return [...fallback];
  }
  const sources = value.map((item) => normalizeStarEventSource(item)).filter((item, index, array) => array.indexOf(item) === index);
  return sources.length > 0 ? sources : [...fallback];
}
function normalizeStarAutoCriteria(value, fallback) {
  if (!value || typeof value !== "object") {
    return fallback ? { ...fallback, assignmentStatusIn: [...fallback.assignmentStatusIn] } : null;
  }
  const criteria = value;
  const assignmentStatusIn = Array.isArray(criteria.assignmentStatusIn) ? criteria.assignmentStatusIn.map((item) => typeof item === "string" ? item.trim() : "").filter((item) => item.length > 0) : fallback?.assignmentStatusIn ? [...fallback.assignmentStatusIn] : [];
  const minimumCorrectCount = Number.isFinite(criteria.minimumCorrectCount) ? Number(criteria.minimumCorrectCount) : fallback?.minimumCorrectCount ?? null;
  const maximumIncorrectCount = Number.isFinite(criteria.maximumIncorrectCount) ? Number(criteria.maximumIncorrectCount) : fallback?.maximumIncorrectCount ?? null;
  if (assignmentStatusIn.length === 0 && minimumCorrectCount == null && maximumIncorrectCount == null) {
    return null;
  }
  return {
    assignmentStatusIn,
    minimumCorrectCount,
    maximumIncorrectCount
  };
}
function normalizeStarEventSource(value) {
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
function normalizeStarEventSourceSummary(value) {
  const summary = value ?? {};
  return {
    manual: normalizeNumber(summary.manual),
    "class-form": normalizeNumber(summary["class-form"]),
    "lesson-form": normalizeNumber(summary["lesson-form"]),
    system: normalizeNumber(summary.system)
  };
}
function normalizeStarRuleEventSummary(value) {
  const summary = value ?? {};
  return {
    ruleId: normalizeString(summary.ruleId, "unknown-rule"),
    label: normalizeOptionalString(summary.label),
    category: summary.category ?? "custom",
    visibility: summary.visibility === "teacher" ? "teacher" : "student",
    eventCount: normalizeNumber(summary.eventCount),
    manualCount: normalizeNumber(summary.manualCount),
    automaticCount: normalizeNumber(summary.automaticCount),
    sourceSummary: normalizeStarEventSourceSummary(summary.sourceSummary)
  };
}
function normalizeClassSummaryAggregate(value) {
  const summary = value ?? {};
  return {
    type: "class-summary",
    generatedAt: normalizeOptionalString(summary.generatedAt),
    periodLabel: normalizeString(summary.periodLabel, "\uD559\uAE09 \uC9D1\uACC4"),
    classroom: normalizeOptionalString(summary.classroom),
    responseCount: normalizeNumber(summary.responseCount),
    excludedResponseCount: normalizeNumber(summary.excludedResponseCount),
    source: {
      ...DEFAULT_SOURCE_INFO,
      ...normalizeSourceInfo(summary.source)
    },
    emotionSummary: normalizeCountItems(summary.emotionSummary),
    goalSummary: normalizeCountItems(summary.goalSummary),
    supportStudents: Array.isArray(summary.supportStudents) ? summary.supportStudents.map((item) => normalizeClassSupportStudent(item)) : [],
    praiseCandidates: Array.isArray(summary.praiseCandidates) ? summary.praiseCandidates.map((item) => normalizePraiseCandidate(item)) : [],
    studentResponses: Array.isArray(summary.studentResponses) ? summary.studentResponses.map((item) => normalizeClassStudentResponse(item)) : []
  };
}
function normalizeLessonSummaryAggregate(value) {
  const summary = value ?? {};
  const topLevelGroup = normalizeLessonGroupSummary(summary);
  const subjectSummaries = Array.isArray(summary.subjectSummaries) ? summary.subjectSummaries.map((item) => normalizeLessonSubjectSummary(item)) : [];
  const sortedSubjectSummaries = subjectSummaries.slice().sort((left, right) => compareLessonGroupsForDisplay(left, right));
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
      ...normalizeSourceInfo(summary.source)
    },
    overview: { ...topLevelGroup.overview },
    difficultConcepts: topLevelGroup.difficultConcepts.map((item) => ({ ...item })),
    assignmentSummary: topLevelGroup.assignmentSummary.map((item) => ({ ...item })),
    supportStudents: topLevelGroup.supportStudents.map((item) => ({
      ...item,
      student: { ...item.student }
    })),
    studentResults: topLevelGroup.studentResults.map((item) => ({
      ...item,
      student: { ...item.student }
    })),
    studentResponses: topLevelGroup.studentResponses.map((item) => ({
      ...item,
      student: { ...item.student },
      concepts: item.concepts.map((concept) => ({ ...concept }))
    })),
    subjectSummaries: sortedSubjectSummaries.length > 0 ? sortedSubjectSummaries : buildLegacyLessonSubjectSummaries(
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
      topLevelGroup.studentResponses
    )
  };
}
function normalizeStarModeLedger(value) {
  const ledger = value ?? {};
  const rules = Array.isArray(ledger.rules) ? ledger.rules.map((item) => normalizeStarRule(item)) : [];
  return {
    type: "star-ledger",
    generatedAt: normalizeOptionalString(ledger.generatedAt),
    periodLabel: normalizeString(ledger.periodLabel, "\uC804\uCCB4 \uB204\uC801"),
    classroom: normalizeOptionalString(ledger.classroom),
    excludedResponseCount: normalizeNumber(ledger.excludedResponseCount),
    eventCount: normalizeNumber(ledger.eventCount),
    source: {
      ...DEFAULT_SOURCE_INFO,
      ...normalizeSourceInfo(ledger.source)
    },
    sourceSummary: normalizeStarEventSourceSummary(ledger.sourceSummary),
    rules: rules.length > 0 ? rules : DEFAULT_STAR_RULES.map((rule) => ({ ...rule })),
    ruleSummary: Array.isArray(ledger.ruleSummary) ? ledger.ruleSummary.map((item) => normalizeStarRuleEventSummary(item)) : [],
    totals: Array.isArray(ledger.totals) ? ledger.totals.map((item) => normalizeStarStudentTotal(item)) : [],
    recentEvents: Array.isArray(ledger.recentEvents) ? ledger.recentEvents.map((item) => normalizeStarEvent(item)) : []
  };
}
function buildLegacyLessonSubjectSummaries(subject, periodLabel, classroom, lessonDate, periodOrder, unitKey, subjectKey, unitLabel, overview, difficultConcepts, assignmentSummary, supportStudents, studentResults, studentResponses) {
  const hasData = [
    subject,
    periodLabel,
    classroom
  ].some((value) => value.trim().length > 0) || studentResponses.length > 0 || studentResults.length > 0 || supportStudents.length > 0 || difficultConcepts.length > 0 || assignmentSummary.length > 0;
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
    normalizedUnitKey
  );
  const groupSummary = {
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
      concepts: item.concepts.map((concept) => ({ ...concept }))
    }))
  };
  return [
    {
      ...cloneLessonGroupSummary(groupSummary),
      groups: [cloneLessonGroupSummary(groupSummary)]
    }
  ];
}

// src/teacher-data.ts
var import_obsidian = require("obsidian");
async function loadTeacherPageData(app, settings) {
  const [classSummary, lessonSummary, starLedger] = await Promise.all([
    loadAggregateFile(
      app,
      "class",
      settings.sources.classSummaryPath,
      "class-summary",
      normalizeClassSummaryAggregate
    ),
    loadAggregateFile(
      app,
      "lesson",
      settings.sources.lessonSummaryPath,
      "lesson-summary",
      normalizeLessonSummaryAggregate
    ),
    loadAggregateFile(
      app,
      "star",
      settings.sources.starLedgerPath,
      "star-ledger",
      normalizeStarModeLedger
    )
  ]);
  return {
    classSummary,
    lessonSummary,
    starLedger
  };
}
async function loadAggregateFile(app, kind, path, expectedType, parser) {
  const normalizedPath = (0, import_obsidian.normalizePath)(path.trim());
  if (!normalizedPath) {
    return {
      kind,
      path: "",
      status: "missing",
      message: "\uC9D1\uACC4 \uD30C\uC77C \uACBD\uB85C\uAC00 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4. Settings -> classpage\uC5D0\uC11C \uC9D1\uACC4 \uD30C\uC77C \uACBD\uB85C\uB97C \uBA3C\uC800 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
      data: null
    };
  }
  const file = app.vault.getAbstractFileByPath(normalizedPath);
  if (!(file instanceof import_obsidian.TFile)) {
    return {
      kind,
      path: normalizedPath,
      status: "missing",
      message: "\uC124\uC815\uB41C \uACBD\uB85C\uC5D0 \uC9D1\uACC4 \uD30C\uC77C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uCC98\uC74C \uC5F0\uACB0 \uC911\uC774\uB77C\uBA74 \uC815\uC0C1\uC785\uB2C8\uB2E4. \uD30C\uC77C \uC0DD\uC131\uACFC \uACBD\uB85C\uB97C \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
      data: null
    };
  }
  try {
    const raw = await app.vault.cachedRead(file);
    const parsed = JSON.parse(raw);
    if (!hasExpectedAggregateType(parsed, expectedType)) {
      const actualType = getAggregateTypeLabel(parsed);
      throw new Error(
        `\uAE30\uB300\uD55C \uC9D1\uACC4 \uD615\uC2DD\uC740 ${expectedType}\uC778\uB370 \uD604\uC7AC \uD30C\uC77C\uC740 ${actualType} \uC785\uB2C8\uB2E4.`
      );
    }
    return {
      kind,
      path: normalizedPath,
      status: "loaded",
      message: "\uC9D1\uACC4 \uACB0\uACFC\uB97C \uC815\uC0C1\uC801\uC73C\uB85C \uC77D\uC5C8\uC2B5\uB2C8\uB2E4.",
      data: parser(parsed)
    };
  } catch (error) {
    const message = error instanceof SyntaxError ? `JSON \uD615\uC2DD \uC624\uB958: ${error.message}` : error instanceof Error ? error.message : "\uC54C \uC218 \uC5C6\uB294 \uC624\uB958";
    const status = error instanceof SyntaxError || error instanceof Error ? "invalid" : "error";
    return {
      kind,
      path: normalizedPath,
      status,
      message,
      data: null
    };
  }
}
function hasExpectedAggregateType(value, expectedType) {
  if (!value || typeof value !== "object") {
    return false;
  }
  return value.type === expectedType;
}
function getAggregateTypeLabel(value) {
  if (!value || typeof value !== "object") {
    return "\uC54C \uC218 \uC5C6\uB294 \uD615\uC2DD";
  }
  const type = value.type;
  return typeof type === "string" && type.trim().length > 0 ? type : "type \uC5C6\uC74C";
}

// src/main.ts
var VIEW_TYPE_CLASSPAGE = "classpage-view";
var LESSON_FILTER_MISSING_UNIT = "__lesson-unit-missing__";
var LESSON_FILTER_MISSING_DATE = "__lesson-date-missing__";
var ClassPagePlugin = class extends import_obsidian2.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
  }
  async onload() {
    await this.loadSettings();
    this.registerView(
      VIEW_TYPE_CLASSPAGE,
      (leaf) => new ClassPageView(leaf, this)
    );
    this.addRibbonIcon("layout-dashboard", "\uAD50\uC2E4 \uD398\uC774\uC9C0 \uC5F4\uAE30", async () => {
      await this.activateView();
    });
    this.addCommand({
      id: "open-classpage",
      name: "\uAD50\uC2E4 \uD398\uC774\uC9C0 \uC5F4\uAE30",
      callback: async () => {
        await this.activateView();
      }
    });
    this.addSettingTab(new ClassPageSettingTab(this.app, this));
  }
  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_CLASSPAGE);
  }
  async loadSettings() {
    this.settings = normalizeSettings(await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
    this.refreshOpenViews();
  }
  async activateView() {
    const existingLeaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_CLASSPAGE)[0];
    const leaf = existingLeaf ?? this.app.workspace.getLeaf(true);
    if (!leaf) {
      new import_obsidian2.Notice("classpage\uB97C \uC5F4 \uC218 \uC788\uB294 \uD328\uB110\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
      return;
    }
    await leaf.setViewState({
      type: VIEW_TYPE_CLASSPAGE,
      active: true
    });
    this.app.workspace.revealLeaf(leaf);
  }
  refreshOpenViews() {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_CLASSPAGE)) {
      const view = leaf.view;
      if (view instanceof ClassPageView) {
        view.render();
      }
    }
  }
};
var ClassPageView = class extends import_obsidian2.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.pageMode = "student";
    this.teacherFocusMode = "overview";
    this.lessonSubjectSelection = "";
    this.lessonUnitFilter = "";
    this.lessonDatePreset = "all";
    this.lessonDateFilter = "";
    this.lessonGroupSelection = "";
    this.starStudentQuery = "";
    this.starStudentFilterMode = "all";
    this.renderToken = 0;
  }
  getViewType() {
    return VIEW_TYPE_CLASSPAGE;
  }
  getDisplayText() {
    return "\uAD50\uC2E4 \uD398\uC774\uC9C0";
  }
  getIcon() {
    return "layout-dashboard";
  }
  async onOpen() {
    await this.renderAsync();
  }
  async onClose() {
    this.contentEl.empty();
  }
  render() {
    void this.renderAsync();
  }
  async renderAsync() {
    const token = ++this.renderToken;
    const { settings } = this.plugin;
    const teacherData = this.pageMode === "teacher" ? await loadTeacherPageData(this.app, settings.teacherPage) : null;
    if (token !== this.renderToken) {
      return;
    }
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("classpage-view");
    const shell = contentEl.createDiv({ cls: "classpage-shell" });
    this.renderHeader(
      shell,
      this.pageMode === "student" ? settings.studentPage : settings.teacherPage
    );
    if (this.pageMode === "student") {
      this.renderStudentPage(shell, settings.studentPage);
      return;
    }
    this.renderTeacherPage(
      shell,
      settings.teacherPage,
      teacherData
    );
  }
  renderHeader(parent, page) {
    const header = parent.createDiv({ cls: "classpage-card classpage-header" });
    const headerTop = header.createDiv({ cls: "classpage-header__top" });
    if (page.statusMessage) {
      headerTop.createEl("span", {
        cls: "classpage-status",
        text: page.statusMessage
      });
    }
    this.renderModeToggle(headerTop);
    header.createEl("h1", {
      cls: "classpage-title",
      text: page.title
    });
    if (page.description) {
      header.createEl("p", {
        cls: "classpage-description",
        text: page.description
      });
    }
  }
  renderModeToggle(parent) {
    const toggle = parent.createDiv({ cls: "classpage-mode-toggle" });
    this.renderModeButton(toggle, "student", "\uD559\uC0DD\uC6A9 \uD398\uC774\uC9C0");
    this.renderModeButton(toggle, "teacher", "\uC120\uC0DD\uB2D8 \uD398\uC774\uC9C0");
  }
  renderModeButton(parent, mode, label) {
    const button = parent.createEl("button", {
      cls: "classpage-mode-toggle__button",
      text: label,
      attr: { type: "button" }
    });
    if (this.pageMode === mode) {
      button.addClass("is-active");
    }
    button.addEventListener("click", () => {
      if (this.pageMode === mode) {
        return;
      }
      this.pageMode = mode;
      this.render();
    });
  }
  renderStudentPage(parent, settings) {
    const boardSection = parent.createDiv({ cls: "classpage-section" });
    this.renderSectionHeader(
      boardSection,
      "\uC624\uB298 \uD655\uC778\uD560 \uB0B4\uC6A9",
      "\uACF5\uC9C0\uC640 \uC624\uB298 \uD560 \uC77C\uC744 \uBA3C\uC800 \uBCF4\uACE0 \uD544\uC694\uD55C \uC900\uBE44\uB97C \uB9C8\uCE69\uB2C8\uB2E4."
    );
    const board = boardSection.createDiv({ cls: "classpage-board" });
    this.renderListCard(board, settings.today.title, settings.today.items);
    this.renderListCard(board, settings.notices.title, settings.notices.items);
    const formsSection = parent.createDiv({ cls: "classpage-section" });
    this.renderSectionHeader(
      formsSection,
      "\uC81C\uCD9C \uBC14\uB85C\uAC00\uAE30",
      "\uBC84\uD2BC\uC744 \uB204\uB974\uBA74 Google Form \uC81C\uCD9C \uD654\uBA74\uC774 \uBC14\uB85C \uC5F4\uB9BD\uB2C8\uB2E4."
    );
    const forms = formsSection.createDiv({ cls: "classpage-form-grid" });
    this.renderFormCard(forms, settings.forms.classForm);
    this.renderFormCard(forms, settings.forms.lessonForm);
  }
  renderTeacherPage(parent, settings, teacherData) {
    this.renderTeacherContextCard(parent, teacherData);
    this.renderTeacherStatusSection(parent, teacherData);
    if (this.shouldShowTeacherSection("class")) {
      const classSection = parent.createDiv({ cls: "classpage-section" });
      this.renderSectionHeader(
        classSection,
        settings.classSummaryTitle,
        this.buildClassSectionDescription(teacherData?.classSummary ?? null),
        {
          badgeText: this.getSourceClassroomBadge(teacherData?.classSummary ?? null)
        }
      );
      this.renderClassSummaryCard(
        classSection,
        teacherData?.classSummary ?? null,
        settings.classSummaryEmptyMessage
      );
    }
    if (this.shouldShowTeacherSection("lesson")) {
      const lessonSection = parent.createDiv({ cls: "classpage-section" });
      this.renderSectionHeader(
        lessonSection,
        settings.lessonSummaryTitle,
        this.buildLessonSectionDescription(teacherData?.lessonSummary ?? null),
        {
          badgeText: this.getSourceClassroomBadge(teacherData?.lessonSummary ?? null)
        }
      );
      this.renderLessonSummaryCard(
        lessonSection,
        teacherData?.lessonSummary ?? null,
        settings.lessonSummaryEmptyMessage
      );
    }
    if (this.shouldShowTeacherSection("star")) {
      const starSection = parent.createDiv({ cls: "classpage-section" });
      this.renderSectionHeader(
        starSection,
        settings.starLedgerTitle,
        this.buildStarSectionDescription(teacherData?.starLedger ?? null),
        {
          badgeText: this.getSourceClassroomBadge(teacherData?.starLedger ?? null)
        }
      );
      this.renderStarLedgerCard(
        starSection,
        teacherData?.starLedger ?? null,
        settings.starLedgerEmptyMessage
      );
    }
    this.renderTeacherAdvancedSection(parent, teacherData);
  }
  renderTeacherContextCard(parent, teacherData) {
    const context = this.buildTeacherContextSummary(teacherData);
    const card = parent.createDiv({ cls: "classpage-card classpage-context-card" });
    const top = card.createDiv({ cls: "classpage-context-card__top" });
    top.createEl("span", {
      cls: "classpage-context-card__eyebrow",
      text: "\uD604\uC7AC \uD655\uC778 \uB300\uC0C1 \uD559\uAE09"
    });
    top.createEl("span", {
      cls: "classpage-context-badge",
      text: `\uD654\uBA74: ${context.focusLabel}`
    });
    card.createEl("strong", {
      cls: "classpage-context-card__value",
      text: context.classroomLabel
    });
    if (context.meta) {
      card.createEl("p", {
        cls: "classpage-context-card__meta",
        text: context.meta
      });
    }
    card.createEl("p", {
      cls: "classpage-context-card__description",
      text: context.description
    });
  }
  renderBoundaryCard(parent, title, description, items) {
    const card = parent.createDiv({ cls: "classpage-card classpage-boundary-card" });
    card.createEl("h2", { cls: "classpage-card__title", text: title });
    card.createEl("p", {
      cls: "classpage-boundary-card__description",
      text: description
    });
    const list = card.createEl("ul", { cls: "classpage-list" });
    for (const item of items) {
      const listItem = list.createEl("li", { cls: "classpage-list__item" });
      listItem.createDiv({ cls: "classpage-list__dot" });
      listItem.createEl("span", {
        cls: "classpage-list__text",
        text: item
      });
    }
  }
  renderSectionHeader(parent, title, description, options = {}) {
    const header = parent.createDiv({ cls: "classpage-section__header" });
    const headingRow = header.createDiv({ cls: "classpage-section__heading-row" });
    headingRow.createEl("h2", {
      cls: "classpage-section__title",
      text: title
    });
    if (options.badgeText) {
      headingRow.createEl("span", {
        cls: "classpage-context-badge",
        text: options.badgeText
      });
    }
    header.createEl("p", {
      cls: "classpage-section__description",
      text: description
    });
  }
  renderTeacherStatusSection(parent, teacherData) {
    const section = parent.createDiv({ cls: "classpage-section" });
    this.renderSectionHeader(
      section,
      "\uC624\uB298 \uC0C1\uD0DC",
      "\uCE74\uB4DC\uB97C \uB20C\uB7EC \uD544\uC694\uD55C \uC601\uC5ED\uB9CC \uBCF4\uACE0, \uB2E4\uC2DC \uB204\uB974\uBA74 \uC804\uCCB4\uB97C \uBD05\uB2C8\uB2E4.",
      {
        badgeText: this.buildTeacherContextSummary(teacherData).badgeText
      }
    );
    const grid = section.createDiv({ cls: "classpage-dashboard-grid" });
    this.renderTeacherStatusCard(
      grid,
      "class",
      "\uD559\uAE09",
      teacherData?.classSummary ?? null
    );
    this.renderTeacherStatusCard(
      grid,
      "lesson",
      "\uC218\uC5C5",
      teacherData?.lessonSummary ?? null
    );
    this.renderTeacherStatusCard(
      grid,
      "star",
      "\uBCC4\uC810",
      teacherData?.starLedger ?? null
    );
  }
  renderTeacherStatusCard(parent, mode, title, sourceState) {
    const button = parent.createDiv({
      cls: "classpage-card classpage-dashboard-card",
      attr: {
        role: "button",
        tabindex: "0",
        "aria-pressed": this.teacherFocusMode === mode ? "true" : "false"
      }
    });
    if (this.teacherFocusMode === mode) {
      button.addClass("is-active");
    }
    const header = button.createDiv({ cls: "classpage-dashboard-card__header" });
    header.createEl("span", {
      cls: "classpage-dashboard-card__label",
      text: title
    });
    header.createEl("span", {
      cls: `classpage-source-status classpage-source-status--${sourceState?.status ?? "missing"}`,
      text: sourceState ? this.getSourceStatusLabel(sourceState.status) : "\uB300\uAE30"
    });
    button.createEl("strong", {
      cls: "classpage-dashboard-card__value",
      text: this.getTeacherStatusPrimaryValue(mode, sourceState)
    });
    button.createEl("p", {
      cls: "classpage-dashboard-card__meta",
      text: this.getTeacherStatusPrimaryMeta(mode, sourceState)
    });
    button.createEl("p", {
      cls: "classpage-dashboard-card__hint",
      text: this.getTeacherStatusHint(mode, sourceState)
    });
    const toggleMode = () => {
      if (this.teacherFocusMode === mode) {
        this.teacherFocusMode = "overview";
        this.render();
      } else {
        this.teacherFocusMode = mode;
        this.render();
      }
    };
    button.addEventListener("click", toggleMode);
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      toggleMode();
    });
  }
  renderTeacherAdvancedSection(parent, teacherData) {
    const details = parent.createEl("details", {
      cls: "classpage-card classpage-advanced"
    });
    details.createEl("summary", {
      cls: "classpage-advanced__summary",
      text: "\uAD6C\uC870/\uD30C\uC77C \uBCF4\uAE30"
    });
    const content = details.createDiv({ cls: "classpage-advanced__content" });
    this.renderBoundaryCard(
      content,
      "\uC9D1\uACC4 \uAD6C\uC870",
      "\uD544\uC694\uD560 \uB54C\uB9CC \uAD6C\uC870\uC640 \uD30C\uC77C \uC704\uCE58\uB97C \uD655\uC778\uD569\uB2C8\uB2E4. \uCCAB \uD654\uBA74\uC5D0\uC11C\uB294 \uC0C1\uD0DC\uC640 \uC5C5\uBB34 \uC120\uD0DD\uC774 \uBA3C\uC800 \uBCF4\uC774\uB3C4\uB85D \uBE90\uC2B5\uB2C8\uB2E4.",
      [
        `\uC218\uC9D1: Google Form`,
        `\uC800\uC7A5: Google Sheets`,
        `\uC9D1\uACC4: Apps Script \uB610\uB294 \uC678\uBD80 \uC790\uB3D9\uD654`,
        `\uD45C\uC2DC: classpage`
      ]
    );
    const sourceSection = content.createDiv({ cls: "classpage-section" });
    this.renderSectionHeader(
      sourceSection,
      "\uD30C\uC77C \uC0C1\uD0DC \uC0C1\uC138",
      this.getTeacherSourceDescription()
    );
    const sourceGrid = sourceSection.createDiv({ cls: "classpage-source-grid" });
    this.renderSourceCard(
      sourceGrid,
      "\uD559\uAE09\uC6A9 \uC9D1\uACC4 \uD30C\uC77C",
      "\uD559\uAE09\uC6A9 Google Form -> Google Sheets -> Apps Script/\uC9D1\uACC4 \uB808\uC774\uC5B4 -> class-summary.json",
      teacherData?.classSummary ?? null
    );
    this.renderSourceCard(
      sourceGrid,
      "\uC218\uC5C5\uC6A9 \uC9D1\uACC4 \uD30C\uC77C",
      "\uC218\uC5C5\uC6A9 Google Form -> Google Sheets -> Apps Script/\uC9D1\uACC4 \uB808\uC774\uC5B4 -> lesson-summary.json",
      teacherData?.lessonSummary ?? null
    );
    this.renderSourceCard(
      sourceGrid,
      "\uBCC4\uC810\uBAA8\uB4DC \uC9D1\uACC4 \uD30C\uC77C",
      "\uD559\uAE09\uC6A9/\uC218\uC5C5\uC6A9 \uC751\uB2F5 -> Apps Script \uBCC4\uC810 \uC774\uBCA4\uD2B8 \uC9D1\uACC4 -> star-ledger.json",
      teacherData?.starLedger ?? null
    );
  }
  renderListCard(parent, title, items) {
    const card = parent.createDiv({ cls: "classpage-card classpage-basic-card" });
    card.createEl("h2", { cls: "classpage-card__title", text: title });
    const list = card.createEl("ul", { cls: "classpage-list" });
    const entries = items.length > 0 ? items : ["\uC544\uC9C1 \uB123\uC5B4 \uB454 \uD56D\uBAA9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."];
    for (const item of entries) {
      const listItem = list.createEl("li", { cls: "classpage-list__item" });
      listItem.createDiv({ cls: "classpage-list__dot" });
      listItem.createEl("span", {
        cls: "classpage-list__text",
        text: item
      });
    }
  }
  renderFormCard(parent, form) {
    const card = parent.createDiv({ cls: "classpage-card classpage-form-card" });
    card.createEl("h2", { cls: "classpage-card__title", text: form.title });
    if (form.description) {
      card.createEl("p", {
        cls: "classpage-form-card__description",
        text: form.description
      });
    }
    const actionArea = card.createDiv({ cls: "classpage-form-card__actions" });
    const helperText = form.helperText || (form.url ? "" : "\uC124\uC815\uC5D0\uC11C Google Form \uB9C1\uD06C\uB97C \uC785\uB825\uD558\uBA74 \uBC14\uB85C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");
    if (helperText) {
      actionArea.createEl("p", {
        cls: "classpage-form-card__helper",
        text: helperText
      });
    }
    const button = actionArea.createEl("a", {
      cls: "classpage-button",
      text: form.buttonLabel,
      href: form.url || "#"
    });
    if (form.url) {
      button.target = "_blank";
      button.rel = "noopener noreferrer";
    } else {
      button.addClass("is-disabled");
      button.setAttr("aria-disabled", "true");
      button.addEventListener("click", (event) => {
        event.preventDefault();
        new import_obsidian2.Notice("\uC124\uC815\uC5D0\uC11C Google Form \uB9C1\uD06C\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.");
      });
    }
  }
  renderSourceCard(parent, title, flowText, sourceState) {
    const card = parent.createDiv({ cls: "classpage-card classpage-source-card" });
    const cardHeader = card.createDiv({ cls: "classpage-source-card__header" });
    cardHeader.createEl("h3", {
      cls: "classpage-card__title",
      text: title
    });
    const statusLabel = sourceState ? this.getSourceStatusLabel(sourceState.status) : "\uB300\uAE30";
    cardHeader.createEl("span", {
      cls: `classpage-source-status classpage-source-status--${sourceState?.status ?? "missing"}`,
      text: statusLabel
    });
    card.createEl("p", {
      cls: "classpage-source-card__flow",
      text: flowText
    });
    card.createEl("p", {
      cls: "classpage-source-card__path",
      text: `\uACBD\uB85C: ${sourceState?.path || "\uC124\uC815\uB418\uC9C0 \uC54A\uC74C"}`
    });
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      card.createEl("p", {
        cls: "classpage-source-card__message",
        text: sourceState?.message || "\uC9D1\uACC4 \uB370\uC774\uD130\uB97C \uC544\uC9C1 \uBD88\uB7EC\uC624\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."
      });
      return;
    }
    const metaList = card.createEl("dl", { cls: "classpage-meta-list" });
    this.renderMetaRow(metaList, "\uC9D1\uACC4 \uC2DC\uAC01", formatDateLabel(sourceState.data.generatedAt));
    const classroomLabel = getAggregateDisplayClassroom(sourceState.data);
    if (classroomLabel) {
      this.renderMetaRow(metaList, "\uB300\uC0C1 \uD559\uAE09", classroomLabel);
    }
    if (sourceState.data.type === "star-ledger") {
      this.renderMetaRow(metaList, "\uBC18\uC601 \uC774\uBCA4\uD2B8", `${sourceState.data.eventCount}\uAC74`);
      if (sourceState.data.excludedResponseCount > 0) {
        this.renderMetaRow(
          metaList,
          "\uC81C\uC678 \uC751\uB2F5",
          `${sourceState.data.excludedResponseCount}\uAC74`
        );
      }
      this.renderMetaRow(metaList, "\uD65C\uC131 \uADDC\uCE59", `${getEnabledStarRules(sourceState.data.rules).length}\uAC1C`);
      this.renderMetaRow(metaList, "\uC790\uB3D9 \uC801\uB9BD", `${getAutomaticStarEventCount(sourceState.data.sourceSummary)}\uAC74`);
      this.renderMetaRow(metaList, "\uC218\uB3D9/\uC77C\uAD04", `${sourceState.data.sourceSummary.manual}\uAC74`);
      this.renderMetaRow(metaList, "\uBC94\uC704", sourceState.data.periodLabel);
    } else {
      this.renderMetaRow(metaList, "\uBC18\uC601 \uC751\uB2F5", `${sourceState.data.responseCount}\uAC74`);
      if (sourceState.data.excludedResponseCount > 0) {
        this.renderMetaRow(
          metaList,
          "\uC81C\uC678 \uC751\uB2F5",
          `${sourceState.data.excludedResponseCount}\uAC74`
        );
      }
      if (sourceState.data.type === "lesson-summary") {
        const subjectCount = sourceState.data.subjectSummaries.length;
        const groupCount = sourceState.data.subjectSummaries.reduce(
          (count, subject) => count + (subject.groups.length > 0 ? subject.groups.length : 1),
          0
        );
        if (subjectCount > 0 || groupCount > 0) {
          this.renderMetaRow(
            metaList,
            "\uD0D0\uC0C9 \uBC94\uC704",
            [
              subjectCount > 0 ? `\uACFC\uBAA9 ${subjectCount}\uAC1C` : "",
              groupCount > 0 ? `\uCD5C\uADFC \uC218\uC5C5 \uADF8\uB8F9 ${groupCount}\uAC1C` : ""
            ].filter(Boolean).join(" / ")
          );
        }
      }
      this.renderMetaRow(metaList, "\uBC94\uC704", sourceState.data.periodLabel);
    }
    if (sourceState.data.source.formName) {
      this.renderMetaRow(metaList, "\uC6D0\uBCF8 \uD3FC", sourceState.data.source.formName);
    }
    if (sourceState.data.source.sheetName) {
      this.renderMetaRow(metaList, "\uC6D0\uBCF8 \uC2DC\uD2B8", sourceState.data.source.sheetName);
    }
    if (sourceState.data.source.aggregatorNote) {
      this.renderMetaRow(metaList, "\uC9D1\uACC4 \uC124\uBA85", sourceState.data.source.aggregatorNote);
    }
  }
  renderClassSummaryCard(parent, sourceState, emptyMessage) {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      this.renderEmptyAggregateCard(parent, emptyMessage, sourceState);
      return;
    }
    const summary = sourceState.data;
    const responseMap = this.buildStudentResponseMap(summary.studentResponses);
    const hasStudentSnapshots = summary.studentResponses.length > 0;
    const stats = parent.createDiv({ cls: "classpage-stat-grid" });
    this.renderStatCard(
      stats,
      "\uC751\uB2F5 \uC218",
      `${summary.responseCount}`,
      this.buildResponseCountDescription(summary)
    );
    this.renderStatCard(
      stats,
      "\uC815\uC11C \uC8FC\uC758 \uD559\uC0DD",
      `${summary.supportStudents.length}`,
      "\uC815\uC11C/\uBAA9\uD45C \uD655\uC778 \uD544\uC694"
    );
    this.renderStatCard(
      stats,
      "\uBAA9\uD45C \uD56D\uBAA9",
      `${summary.goalSummary.reduce((sum, item) => sum + item.count, 0)}`,
      "\uC5B4\uC81C \uD560 \uC77C \uB2EC\uC131\uB3C4 \uAE30\uBC18"
    );
    this.renderStatCard(
      stats,
      "\uCE6D\uCC2C \uD6C4\uBCF4",
      `${summary.praiseCandidates.length}`,
      "\uCE5C\uAD6C \uB3C4\uC6C0/\uACA9\uB824 \uD6C4\uBCF4"
    );
    const grid = parent.createDiv({ cls: "classpage-summary-grid" });
    this.renderGroupedDrilldownCard(
      grid,
      "\uC815\uC11C \uC0C1\uD0DC \uBD84\uD3EC",
      summary.emotionSummary.map((item) => ({
        title: item.label,
        meta: `${item.count}\uBA85`,
        description: item.note || "\uC815\uC11C \uC0C1\uD0DC \uBD84\uD3EC",
        emptyMessage: hasStudentSnapshots ? "\uD574\uB2F9 \uC0C1\uD0DC \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." : "\uD559\uC0DD\uBCC4 \uC751\uB2F5 \uC2A4\uB0C5\uC0F7\uC774 \uC5C6\uC5B4 drill-down\uC744 \uC5F4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
        items: summary.studentResponses.filter((student) => student.emotionLabel === item.label).map((student) => this.buildClassResponseDrilldownItem(student))
      })),
      "\uC815\uC11C \uBD84\uD3EC \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderGroupedDrilldownCard(
      grid,
      "\uBAA9\uD45C \uB2EC\uC131 \uBD84\uD3EC",
      summary.goalSummary.map((item) => ({
        title: item.label,
        meta: `${item.count}\uBA85`,
        description: item.note || "\uBAA9\uD45C \uB2EC\uC131 \uBD84\uD3EC",
        emptyMessage: hasStudentSnapshots ? "\uD574\uB2F9 \uB2EC\uC131\uB3C4 \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." : "\uD559\uC0DD\uBCC4 \uC751\uB2F5 \uC2A4\uB0C5\uC0F7\uC774 \uC5C6\uC5B4 drill-down\uC744 \uC5F4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
        items: summary.studentResponses.filter((student) => student.goalLabel === item.label).map((student) => this.buildClassResponseDrilldownItem(student))
      })),
      "\uBAA9\uD45C \uBD84\uD3EC \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderStudentDrilldownCard(
      grid,
      "\uB3C4\uC6C0\uC774 \uD544\uC694\uD55C \uD559\uC0DD",
      summary.supportStudents.map(
        (student) => this.buildClassSupportDrilldownItem(
          student,
          this.findClassResponseByStudent(responseMap, student.student)
        )
      ),
      "\uD604\uC7AC \uD45C\uC2DC\uD560 \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderStudentDrilldownCard(
      grid,
      "\uCE6D\uCC2C/\uACA9\uB824 \uD6C4\uBCF4",
      summary.praiseCandidates.map(
        (student) => this.buildPraiseCandidateDrilldownItem(
          student,
          this.findClassResponseByStudent(responseMap, student.student)
        )
      ),
      "\uD604\uC7AC \uD45C\uC2DC\uD560 \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
  }
  renderLessonSummaryCard(parent, sourceState, emptyMessage) {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      this.renderEmptyAggregateCard(parent, emptyMessage, sourceState);
      return;
    }
    const summary = sourceState.data;
    const explorer = this.getLessonExplorerState(summary);
    const {
      availableSubjects,
      selectedSubject,
      allGroups,
      filteredGroups,
      selectedGroup,
      unitOptions,
      dateOptions
    } = explorer;
    if (availableSubjects.length > 1 || allGroups.length > 1 || unitOptions.length > 1 || dateOptions.length > 1 || this.lessonDatePreset !== "all" || this.lessonUnitFilter.length > 0 || this.lessonDateFilter.length > 0) {
      this.renderLessonSubjectSelectorCard(
        parent,
        availableSubjects,
        selectedSubject,
        selectedGroup?.groupKey ?? ""
      );
    }
    if (!selectedGroup) {
      this.renderLessonEmptySelectionCard(parent, selectedSubject, unitOptions, dateOptions);
      return;
    }
    const responseMap = this.buildLessonResponseMap(selectedGroup.studentResponses);
    const hasStudentSnapshots = selectedGroup.studentResponses.length > 0;
    const urgentFollowUpItems = this.buildLessonFollowUpDrilldownItems(selectedGroup, responseMap);
    const lessonScopeDescription = this.buildLessonScopeDescription(explorer, {
      includeSubjectCount: false,
      includeCurrentGroup: false
    });
    const stats = parent.createDiv({ cls: "classpage-stat-grid" });
    this.renderStatCard(
      stats,
      "\uD604\uC7AC \uC218\uC5C5 \uADF8\uB8F9",
      selectedGroup.label || selectedGroup.periodLabel || "\uC218\uC5C5 \uC815\uBCF4 \uC5C6\uC74C",
      [
        getAggregateDisplayClassroom(selectedGroup) || "",
        lessonScopeDescription
      ].filter(Boolean).join(" \xB7 ")
    );
    this.renderStatCard(
      stats,
      "\uC751\uB2F5 \uC218",
      `${selectedGroup.responseCount}`,
      this.buildResponseCountDescription(selectedGroup)
    );
    this.renderStatCard(
      stats,
      "\uB2E4\uC74C \uD53C\uB4DC\uBC31 \uB300\uC0C1",
      urgentFollowUpItems.length > 0 ? `${urgentFollowUpItems.length}\uBA85` : "\uC5C6\uC74C",
      urgentFollowUpItems.length > 0 ? `${urgentFollowUpItems[0].title}\uBD80\uD130 \uD655\uC778` : "\uC9C0\uAE08 \uBC14\uB85C \uD655\uC778\uD560 \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderStatCard(
      stats,
      "\uD3C9\uADE0 \uC815\uB2F5",
      selectedGroup.overview.averageCorrectCount.toFixed(1),
      `${selectedSubject.subject || selectedGroup.subject || "\uC218\uC5C5"} \uAE30\uC900`
    );
    this.renderStatCard(
      stats,
      "\uD3C9\uADE0 \uC624\uB2F5",
      selectedGroup.overview.averageIncorrectCount.toFixed(1),
      "\uD559\uC0DD\uBCC4 \uC815\uC624\uB2F5 \uD3C9\uADE0"
    );
    this.renderStatCard(
      stats,
      "\uBCF5\uC2B5/\uC218\uD589",
      selectedGroup.overview.assignmentCompletionLabel || "\uBBF8\uBD84\uB958",
      "\uAC00\uC7A5 \uB9CE\uC774 \uD655\uC778\uB41C \uC0C1\uD0DC"
    );
    this.renderStudentDrilldownCard(
      parent,
      "\uB2E4\uC74C \uD53C\uB4DC\uBC31 \uB300\uC0C1",
      urgentFollowUpItems,
      "\uD604\uC7AC \uBC14\uB85C \uD655\uC778\uD560 \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
      true
    );
    const grid = parent.createDiv({ cls: "classpage-summary-grid" });
    this.renderDetailRowsCard(
      grid,
      "\uC9C0\uAE08 \uBA3C\uC800 \uBCFC \uD559\uC0DD\uACFC \uAC1C\uB150",
      this.buildLessonPriorityRows(selectedGroup),
      "\uC9C0\uAE08 \uBC14\uB85C \uBCFC \uD56D\uBAA9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderGroupedDrilldownCard(
      grid,
      "\uC7AC\uC124\uBA85 \uD544\uC694\uD55C \uAC1C\uB150",
      selectedGroup.difficultConcepts.map((item) => ({
        title: item.concept,
        meta: `${item.count}\uBA85`,
        description: [item.averageUnderstanding, item.note].filter(Boolean).join(" / "),
        tone: item.count > 0 ? "warning" : void 0,
        emptyMessage: hasStudentSnapshots ? "\uD574\uB2F9 \uAC1C\uB150\uC5D0\uC11C \uB0AE\uC740 \uC774\uD574 \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." : "\uD559\uC0DD\uBCC4 \uC751\uB2F5 \uC2A4\uB0C5\uC0F7\uC774 \uC5C6\uC5B4 drill-down\uC744 \uC5F4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
        items: selectedGroup.studentResponses.filter((student) => this.hasLowConcept(student, item.concept)).map((student) => this.buildLessonStudentDrilldownItem(student))
      })),
      "\uC5B4\uB824\uC6CC\uD55C \uAC1C\uB150 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderGroupedDrilldownCard(
      grid,
      "\uBCF5\uC2B5/\uC218\uD589 \uBD84\uD3EC",
      selectedGroup.assignmentSummary.map((item) => ({
        title: item.label,
        meta: `${item.count}\uBA85`,
        description: item.note || "\uBCF5\uC2B5/\uC218\uD589 \uC0C1\uD0DC",
        emptyMessage: hasStudentSnapshots ? "\uD574\uB2F9 \uBCF5\uC2B5/\uC218\uD589 \uC0C1\uD0DC \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." : "\uD559\uC0DD\uBCC4 \uC751\uB2F5 \uC2A4\uB0C5\uC0F7\uC774 \uC5C6\uC5B4 drill-down\uC744 \uC5F4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
        items: selectedGroup.studentResponses.filter((student) => student.assignmentStatus === item.label).map((student) => this.buildLessonStudentDrilldownItem(student))
      })),
      "\uBCF5\uC2B5/\uC218\uD589 \uC9D1\uACC4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderStudentDrilldownCard(
      parent,
      "\uD559\uC0DD\uBCC4 \uACB0\uACFC\uC640 \uD6C4\uC18D \uC9C0\uB3C4",
      this.getSortedLessonStudentResults(selectedGroup).map(
        (result) => this.buildStudentResultDrilldownItem(
          result,
          this.findLessonResponseByStudent(responseMap, result.student)
        )
      ),
      "\uD45C\uC2DC\uD560 \uD559\uC0DD \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
      true
    );
  }
  renderStarLedgerCard(parent, sourceState, emptyMessage) {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      this.renderEmptyAggregateCard(parent, emptyMessage, sourceState);
      return;
    }
    const ledger = sourceState.data;
    const enabledRules = sortStarRulesForDisplay(getEnabledStarRules(ledger.rules));
    const visibleRules = enabledRules.filter((rule) => rule.visibility === "student");
    const teacherOnlyRules = enabledRules.filter((rule) => rule.visibility === "teacher");
    const autoRules = enabledRules.filter((rule) => hasAutomaticStarSource(rule.sources));
    const manualRules = enabledRules.filter((rule) => rule.sources.includes("manual"));
    const topStudents = sortStarTotals(ledger.totals).slice(0, 5);
    const adjustedStudents = sortStarTotalsByHiddenAdjustment(ledger.totals).filter((total) => total.hiddenAdjustmentTotal !== 0).slice(0, 8);
    const ruleSummaryRows = this.buildStarRuleSummaryRows(ledger, enabledRules);
    const automaticEventCount = getAutomaticStarEventCount(ledger.sourceSummary);
    const classroomLabel = getAggregateDisplayClassroom(ledger) || "\uD559\uAE09 \uC815\uBCF4 \uD655\uC778 \uD544\uC694";
    const customDeltaRules = manualRules.filter((rule) => rule.allowCustomDelta);
    const eventMap = this.buildStarRecentEventMap(ledger.recentEvents);
    const flowRows = this.buildStarStudentFlowRows(ledger, eventMap);
    const stats = parent.createDiv({ cls: "classpage-stat-grid" });
    this.renderStatCard(
      stats,
      "\uB300\uC0C1 \uD559\uAE09",
      classroomLabel,
      ledger.classroom ? `${ledger.periodLabel} \uAE30\uC900` : "\uD559\uAE09 \uC815\uBCF4\uAC00 \uBE44\uC5B4 \uC788\uC73C\uBA74 \uD559\uC0DD \uBAA9\uB85D\uC758 \uACF5\uD1B5 \uD559\uAE09\uC73C\uB85C \uBCF4\uC644 \uD45C\uC2DC"
    );
    this.renderStatCard(
      stats,
      "\uD65C\uC131 \uADDC\uCE59",
      `${enabledRules.length}`,
      `\uC790\uB3D9 ${autoRules.length}\uAC1C / \uC218\uB3D9 ${manualRules.length}\uAC1C`
    );
    this.renderStatCard(
      stats,
      "\uD559\uC0DD \uACF5\uAC1C \uADDC\uCE59",
      `${visibleRules.length}`,
      `${ledger.totals.length}\uBA85 \uAE30\uC900 \uACF5\uAC1C \uB204\uC801 \uACC4\uC0B0`
    );
    this.renderStatCard(
      stats,
      "\uC120\uC0DD\uB2D8 \uD655\uC778 \uADDC\uCE59",
      `${teacherOnlyRules.length}`,
      "\uC228\uAE40 \uC870\uC815\uACFC \uBE44\uACF5\uAC1C \uADDC\uCE59\uC740 \uBCC4\uB3C4 \uD569\uACC4\uB85C \uD45C\uC2DC"
    );
    this.renderStatCard(
      stats,
      "\uBC18\uC601 \uC774\uBCA4\uD2B8",
      `${ledger.eventCount}`,
      `\uC790\uB3D9 ${automaticEventCount}\uAC74 / \uC218\uB3D9\xB7\uC77C\uAD04 ${ledger.sourceSummary.manual}\uAC74`
    );
    this.renderStatCard(
      stats,
      "\uC218\uB3D9 \uC870\uC815 \uAC00\uB2A5",
      `${manualRules.length}`,
      customDeltaRules.length > 0 ? `\uD589\uBCC4 \uC810\uC218 \uC9C1\uC811 \uC785\uB825 \uD5C8\uC6A9 ${customDeltaRules.length}\uAC1C` : "\uC218\uB3D9 \uADDC\uCE59\uC740 \uAE30\uBCF8 \uC810\uC218\uB9CC \uC0AC\uC6A9"
    );
    this.renderStatCard(
      stats,
      "\uC228\uAE40 \uC870\uC815 \uBC18\uC601 \uD559\uC0DD",
      adjustedStudents.length > 0 ? `${adjustedStudents.length}\uBA85` : "\uC5C6\uC74C",
      adjustedStudents.length > 0 ? "\uC120\uC0DD\uB2D8 \uD655\uC778 \uC804\uC6A9 \uC870\uC815\uC774 \uACF5\uAC1C \uC810\uC218\uC640 \uBD84\uB9AC \uBC18\uC601\uB428" : "\uD604\uC7AC \uC228\uAE40 \uC870\uC815 \uBC18\uC601 \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderStatCard(
      stats,
      "\uBC1C\uC0DD \uADDC\uCE59",
      `${ruleSummaryRows.filter((row) => row.meta !== "0\uAC74").length}`,
      "\uADDC\uCE59\uBCC4 \uBC1C\uC0DD \uC9D1\uACC4 \uAE30\uC900"
    );
    const grid = parent.createDiv({ cls: "classpage-summary-grid" });
    this.renderDetailRowsCard(
      grid,
      "\uBCC4\uC810 \uC6B4\uC601 \uC0C1\uD0DC",
      this.buildStarOperationRows(ledger, visibleRules, teacherOnlyRules, manualRules),
      "\uC6B4\uC601 \uC0C1\uD0DC\uB97C \uD45C\uC2DC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderDetailRowsCard(
      grid,
      "\uADDC\uCE59\uBCC4 \uBC1C\uC0DD \uD604\uD669",
      ruleSummaryRows,
      "\uADDC\uCE59\uBCC4 \uBC1C\uC0DD \uD604\uD669\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderDetailRowsCard(
      grid,
      "\uCD5C\uADFC \uBCC4\uC810 \uC774\uBCA4\uD2B8",
      ledger.recentEvents.map((event) => this.buildStarEventRow(event, ledger.rules)),
      ledger.eventCount > 0 ? "\uB204\uC801\uC5D0\uB294 \uBC18\uC601\uB418\uC5C8\uC9C0\uB9CC \uCD5C\uADFC \uD45C\uC2DC \uC774\uBCA4\uD2B8\uC5D0\uB294 \uC544\uC9C1 \uB4E4\uC5B4\uC624\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uCD5C\uADFC \uC9D1\uACC4 \uC2DC\uAC01\uC744 \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694." : "\uC544\uC9C1 \uCD5C\uADFC\uC5D0 \uD45C\uC2DC\uD560 \uBCC4\uC810 \uC774\uBCA4\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uD3FC \uC81C\uCD9C\uC774\uB098 \uC218\uB3D9 \uC870\uC815\uC774 \uBC18\uC601\uB418\uBA74 \uC5EC\uAE30\uC5D0 \uBCF4\uC785\uB2C8\uB2E4."
    );
    this.renderDetailRowsCard(
      grid,
      "\uD559\uC0DD \uD750\uB984 \uBE60\uB978 \uBCF4\uAE30",
      flowRows,
      "\uD559\uC0DD \uD750\uB984 \uC694\uC57D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderDetailRowsCard(
      grid,
      "\uD559\uC0DD\uBCC4 \uB204\uC801 \uC0C1\uC704 5\uBA85",
      topStudents.map((total) => this.buildStarTotalRow(total)),
      "\uD45C\uC2DC\uD560 \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderDetailRowsCard(
      grid,
      "\uC228\uAE40 \uC870\uC815\uC774 \uBC18\uC601\uB41C \uD559\uC0DD",
      adjustedStudents.map((total) => this.buildStarAdjustmentTotalRow(total)),
      "\uD604\uC7AC \uC228\uAE40 \uC870\uC815\uC774 \uBC18\uC601\uB41C \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderStarStudentFilterCard(parent, ledger, eventMap);
    this.renderDetailRowsCard(
      parent,
      "\uD559\uC0DD \uACF5\uAC1C \uADDC\uCE59",
      visibleRules.map((rule) => this.buildStarRuleRow(rule, this.findStarRuleSummary(ledger, rule.ruleId))),
      "\uD559\uC0DD \uACF5\uAC1C \uADDC\uCE59\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
      true
    );
    this.renderDetailRowsCard(
      parent,
      "\uC120\uC0DD\uB2D8 \uD655\uC778 \uC804\uC6A9 \uADDC\uCE59",
      teacherOnlyRules.map((rule) => this.buildStarRuleRow(rule, this.findStarRuleSummary(ledger, rule.ruleId))),
      "\uC120\uC0DD\uB2D8 \uD655\uC778 \uC804\uC6A9 \uADDC\uCE59\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
      true
    );
  }
  renderEmptyAggregateCard(parent, emptyMessage, sourceState) {
    const card = parent.createDiv({ cls: "classpage-card classpage-empty-card" });
    card.createEl("h3", {
      cls: "classpage-card__title",
      text: this.getAggregateEmptyStateTitle(sourceState)
    });
    card.createEl("p", {
      cls: "classpage-empty-card__message",
      text: this.getAggregateEmptyStateMessage(emptyMessage, sourceState)
    });
    const tips = this.getAggregateEmptyStateTips(sourceState);
    if (tips.length > 0) {
      const tipList = card.createEl("ul", { cls: "classpage-empty-card__tips" });
      for (const tip of tips) {
        tipList.createEl("li", {
          cls: "classpage-empty-card__tip",
          text: tip
        });
      }
    }
    if (sourceState?.path) {
      card.createEl("p", {
        cls: "classpage-source-card__path",
        text: `\uC124\uC815 \uACBD\uB85C: ${sourceState.path}`
      });
    }
    if (sourceState?.message) {
      card.createEl("p", {
        cls: "classpage-empty-card__detail",
        text: `\uD604\uC7AC \uC0C1\uD0DC: ${sourceState.message}`
      });
    }
  }
  renderStatCard(parent, label, value, description) {
    const card = parent.createDiv({ cls: "classpage-card classpage-stat-card" });
    card.createEl("span", {
      cls: "classpage-stat-card__label",
      text: label
    });
    card.createEl("strong", {
      cls: "classpage-stat-card__value",
      text: value
    });
    card.createEl("p", {
      cls: "classpage-stat-card__description",
      text: description
    });
  }
  renderGroupedDrilldownCard(parent, title, groups, emptyMessage, isWide = false) {
    const classes = ["classpage-card", "classpage-detail-card"];
    if (isWide) {
      classes.push("classpage-detail-card--wide");
    }
    const card = parent.createDiv({ cls: classes.join(" ") });
    card.createEl("h3", {
      cls: "classpage-card__title",
      text: title
    });
    if (groups.length === 0) {
      card.createEl("p", {
        cls: "classpage-empty-card__message",
        text: emptyMessage
      });
      return;
    }
    const list = card.createDiv({ cls: "classpage-accordion-list" });
    for (const group of groups) {
      const details = list.createEl("details", {
        cls: `classpage-accordion${group.tone ? ` is-${group.tone}` : ""}`
      });
      const summary = details.createEl("summary", {
        cls: "classpage-accordion__summary"
      });
      this.renderDrilldownSummary(
        summary,
        group.title,
        group.meta,
        group.description,
        "classpage-accordion__summary-text"
      );
      if (group.items.length === 0) {
        details.createEl("p", {
          cls: "classpage-drilldown-empty",
          text: group.emptyMessage
        });
        continue;
      }
      const studentList = details.createDiv({ cls: "classpage-drilldown-list" });
      for (const item of group.items) {
        this.renderStudentDrilldownItem(studentList, item);
      }
    }
  }
  renderStudentDrilldownCard(parent, title, items, emptyMessage, isWide = false) {
    const classes = ["classpage-card", "classpage-detail-card"];
    if (isWide) {
      classes.push("classpage-detail-card--wide");
    }
    const card = parent.createDiv({ cls: classes.join(" ") });
    card.createEl("h3", {
      cls: "classpage-card__title",
      text: title
    });
    if (items.length === 0) {
      card.createEl("p", {
        cls: "classpage-empty-card__message",
        text: emptyMessage
      });
      return;
    }
    const list = card.createDiv({ cls: "classpage-drilldown-list" });
    for (const item of items) {
      this.renderStudentDrilldownItem(list, item);
    }
  }
  renderLessonSubjectSelectorCard(parent, subjects, selectedSubject, selectedGroupKey) {
    const sortedSubjects = this.getLessonAvailableSummariesFromSubjects(subjects);
    const explorer = this.getLessonExplorerStateFromSubject(selectedSubject, sortedSubjects);
    const {
      allGroups,
      unitFilteredGroups,
      filteredGroups,
      unitOptions,
      dateOptions
    } = explorer;
    const showUnitFilter = unitOptions.length > 1 || this.lessonUnitFilter.length > 0;
    const showDatePreset = unitFilteredGroups.length > 1 || this.lessonDatePreset !== "all";
    const showDateFilter = this.lessonDatePreset === "specific" && (dateOptions.length > 1 || this.lessonDateFilter.length > 0);
    const card = parent.createDiv({ cls: "classpage-card classpage-filter-card" });
    card.createEl("h3", {
      cls: "classpage-card__title",
      text: "\uC218\uC5C5 \uBE60\uB974\uAC8C \uCC3E\uAE30"
    });
    card.createEl("p", {
      cls: "classpage-filter-card__description",
      text: "\uACFC\uBAA9\uC744 \uACE0\uB978 \uB4A4 \uB2E8\uC6D0\uACFC \uCD5C\uADFC \uC218\uC5C5 \uBC94\uC704\uB97C \uC881\uD788\uACE0, \uB9C8\uC9C0\uB9C9\uC5D0 \uC218\uC5C5 \uADF8\uB8F9\uC744 \uC120\uD0DD\uD558\uBA74 \uB2E4\uC74C \uD53C\uB4DC\uBC31 \uB300\uC0C1\uACFC \uC218\uC5C5 \uC0C1\uD0DC\uAC00 \uD568\uAED8 \uBC14\uB01D\uB2C8\uB2E4."
    });
    const toolbar = card.createDiv({
      cls: "classpage-filter-toolbar classpage-filter-toolbar--lesson"
    });
    const subjectLabel = toolbar.createEl("label", {
      cls: "classpage-filter-toolbar__label",
      text: "\uD655\uC778\uD560 \uACFC\uBAA9"
    });
    const subjectSelect = subjectLabel.createEl("select", {
      cls: "classpage-filter-select"
    });
    for (const subject of sortedSubjects) {
      const option = subjectSelect.createEl("option", {
        value: this.getLessonSubjectSelectionValue(subject),
        text: subject.subject || "\uACFC\uBAA9 \uC815\uBCF4 \uC5C6\uC74C"
      });
      if (this.getLessonSubjectSelectionValue(subject) === this.getLessonSubjectSelectionValue(selectedSubject)) {
        option.selected = true;
      }
    }
    let unitSelect = null;
    if (showUnitFilter) {
      const unitLabel = toolbar.createEl("label", {
        cls: "classpage-filter-toolbar__label",
        text: "\uB2E8\uC6D0 \uD544\uD130"
      });
      unitSelect = unitLabel.createEl("select", {
        cls: "classpage-filter-select"
      });
      unitSelect.createEl("option", {
        value: "",
        text: "\uC804\uCCB4 \uB2E8\uC6D0"
      });
      for (const option of unitOptions) {
        const item = unitSelect.createEl("option", {
          value: option.value,
          text: option.label
        });
        if (option.value === this.lessonUnitFilter) {
          item.selected = true;
        }
      }
    }
    let datePresetSelect = null;
    if (showDatePreset) {
      const datePresetLabel = toolbar.createEl("label", {
        cls: "classpage-filter-toolbar__label",
        text: "\uCD5C\uADFC \uC218\uC5C5 \uBC94\uC704"
      });
      datePresetSelect = datePresetLabel.createEl("select", {
        cls: "classpage-filter-select"
      });
      for (const option of this.getLessonDatePresetOptions()) {
        const item = datePresetSelect.createEl("option", {
          value: option.value,
          text: option.label
        });
        if (option.value === this.lessonDatePreset) {
          item.selected = true;
        }
      }
    }
    let dateSelect = null;
    if (showDateFilter) {
      const dateLabel = toolbar.createEl("label", {
        cls: "classpage-filter-toolbar__label",
        text: "\uD2B9\uC815 \uB0A0\uC9DC"
      });
      dateSelect = dateLabel.createEl("select", {
        cls: "classpage-filter-select"
      });
      for (const option of dateOptions) {
        const item = dateSelect.createEl("option", {
          value: option.value,
          text: option.label
        });
        if (option.value === this.lessonDateFilter) {
          item.selected = true;
        }
      }
    }
    const groupLabel = toolbar.createEl("label", {
      cls: "classpage-filter-toolbar__label classpage-filter-toolbar__label--wide",
      text: "\uD655\uC778\uD560 \uC218\uC5C5 \uADF8\uB8F9"
    });
    const groupSelect = groupLabel.createEl("select", {
      cls: "classpage-filter-select"
    });
    if (filteredGroups.length === 0) {
      groupSelect.disabled = true;
      groupSelect.createEl("option", {
        value: "",
        text: "\uC870\uAC74\uC5D0 \uB9DE\uB294 \uC218\uC5C5 \uADF8\uB8F9 \uC5C6\uC74C"
      });
    } else {
      for (const group of filteredGroups) {
        const option = groupSelect.createEl("option", {
          value: group.groupKey,
          text: this.buildLessonGroupOptionLabel(group)
        });
        if (group.groupKey === selectedGroupKey) {
          option.selected = true;
        }
      }
    }
    const currentGroup = filteredGroups.find((group) => group.groupKey === selectedGroupKey) ?? filteredGroups[0] ?? null;
    toolbar.createEl("p", {
      cls: "classpage-filter-toolbar__meta",
      text: [
        `\uACFC\uBAA9 ${selectedSubject.subject || "\uACFC\uBAA9 \uC815\uBCF4 \uC5C6\uC74C"}`,
        sortedSubjects.length > 1 ? `\uC804\uCCB4 \uACFC\uBAA9 ${sortedSubjects.length}\uAC1C` : "",
        this.buildLessonScopeDescription(explorer, {
          includeSubject: false,
          includeSubjectCount: false,
          includeCurrentGroup: false
        }),
        filteredGroups.length > 0 ? `\uD45C\uC2DC ${filteredGroups.length}\uAC1C \uADF8\uB8F9 / \uACFC\uBAA9 \uC804\uCCB4 ${allGroups.length}\uAC1C` : "\uC870\uAC74\uC5D0 \uB9DE\uB294 \uC218\uC5C5 \uADF8\uB8F9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
        currentGroup ? `\uD655\uC778 \uC911: ${this.buildLessonGroupOptionLabel(currentGroup)}` : ""
      ].filter(Boolean).join(" \xB7 ")
    });
    const qualityMessage = this.buildLessonStructuredFieldNotice(allGroups);
    if (qualityMessage) {
      card.createEl("p", {
        cls: "classpage-filter-toolbar__meta",
        text: qualityMessage
      });
    }
    subjectSelect.addEventListener("change", () => {
      const nextSubject = sortedSubjects.find(
        (subject) => this.getLessonSubjectSelectionValue(subject) === subjectSelect.value
      );
      this.lessonSubjectSelection = subjectSelect.value;
      this.lessonUnitFilter = "";
      this.lessonDatePreset = "all";
      this.lessonDateFilter = "";
      this.lessonGroupSelection = this.getFilteredLessonGroups(nextSubject ?? selectedSubject)[0]?.groupKey || nextSubject?.groupKey || "";
      this.render();
    });
    unitSelect?.addEventListener("change", () => {
      this.lessonSubjectSelection = subjectSelect.value;
      this.lessonUnitFilter = unitSelect?.value ?? "";
      const nextSubject = sortedSubjects.find(
        (subject) => this.getLessonSubjectSelectionValue(subject) === subjectSelect.value
      ) ?? selectedSubject;
      if (this.lessonDatePreset === "specific" && this.lessonDateFilter.length === 0) {
        this.lessonDateFilter = this.getLessonDateOptions(nextSubject)[0]?.value ?? "";
      }
      this.lessonGroupSelection = this.getPreferredLessonGroupSelection(nextSubject);
      this.render();
    });
    datePresetSelect?.addEventListener("change", () => {
      this.lessonSubjectSelection = subjectSelect.value;
      this.lessonDatePreset = datePresetSelect?.value ?? "all";
      const nextSubject = sortedSubjects.find(
        (subject) => this.getLessonSubjectSelectionValue(subject) === subjectSelect.value
      ) ?? selectedSubject;
      if (this.lessonDatePreset === "specific") {
        this.lessonDateFilter = this.lessonDateFilter || this.getLessonDateOptions(nextSubject)[0]?.value || "";
      } else {
        this.lessonDateFilter = "";
      }
      this.lessonGroupSelection = this.getPreferredLessonGroupSelection(nextSubject);
      this.render();
    });
    dateSelect?.addEventListener("change", () => {
      this.lessonSubjectSelection = subjectSelect.value;
      this.lessonDateFilter = dateSelect?.value ?? "";
      const nextSubject = sortedSubjects.find(
        (subject) => this.getLessonSubjectSelectionValue(subject) === subjectSelect.value
      ) ?? selectedSubject;
      this.lessonGroupSelection = this.getPreferredLessonGroupSelection(nextSubject);
      this.render();
    });
    groupSelect.addEventListener("change", () => {
      this.lessonSubjectSelection = subjectSelect.value;
      this.lessonGroupSelection = groupSelect.value;
      this.render();
    });
  }
  renderStarStudentFilterCard(parent, ledger, eventMap) {
    const filteredTotals = this.getFilteredStarTotals(ledger, eventMap);
    const filterCard = parent.createDiv({ cls: "classpage-card classpage-filter-card" });
    filterCard.createEl("h3", {
      cls: "classpage-card__title",
      text: "\uD559\uC0DD\uBCC4 \uBCC4\uC810 \uD750\uB984 \uD655\uC778"
    });
    filterCard.createEl("p", {
      cls: "classpage-filter-card__description",
      text: "\uD559\uC0DD \uC774\uB984\uC774\uB098 \uBC88\uD638\uB85C \uBE60\uB974\uAC8C \uCC3E\uACE0, \uC228\uAE40 \uC870\uC815 \uBC18\uC601 \uD559\uC0DD\uC774\uB098 \uCD5C\uADFC \uBCC0\uB3D9 \uD559\uC0DD\uB9CC \uC881\uD600 \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC0C1\uC138 \uD3BC\uCE68\uC740 \uD559\uC0DD \uB204\uC801 \uC810\uC218\uC640 \uCD5C\uADFC \uD45C\uC2DC \uC774\uBCA4\uD2B8 \uAE30\uC900\uC758 \uC77D\uAE30 \uC804\uC6A9 \uBBF8\uB9AC\uBCF4\uAE30\uC785\uB2C8\uB2E4."
    });
    const toolbar = filterCard.createDiv({ cls: "classpage-filter-toolbar" });
    const inputWrap = toolbar.createDiv({ cls: "classpage-filter-input-wrap" });
    const input = inputWrap.createEl("input", {
      cls: "classpage-filter-input",
      attr: {
        type: "search",
        placeholder: "\uC774\uB984, \uBC88\uD638, \uBC18 \uAC80\uC0C9"
      }
    });
    input.value = this.starStudentQuery;
    const actionGroup = toolbar.createDiv({ cls: "classpage-filter-pill-group" });
    const applyButton = actionGroup.createEl("button", {
      cls: "classpage-filter-pill is-primary",
      text: "\uC801\uC6A9",
      attr: { type: "button" }
    });
    const clearButton = actionGroup.createEl("button", {
      cls: "classpage-filter-pill",
      text: "\uCD08\uAE30\uD654",
      attr: { type: "button" }
    });
    const modeGroup = filterCard.createDiv({ cls: "classpage-filter-pill-group" });
    this.renderFilterPill(
      modeGroup,
      "\uC804\uCCB4 \uBCF4\uAE30",
      this.starStudentFilterMode === "all",
      () => {
        this.starStudentFilterMode = "all";
        this.render();
      }
    );
    this.renderFilterPill(
      modeGroup,
      "\uC228\uAE40 \uC870\uC815 \uBC18\uC601\uB9CC",
      this.starStudentFilterMode === "adjusted",
      () => {
        this.starStudentFilterMode = "adjusted";
        this.render();
      }
    );
    this.renderFilterPill(
      modeGroup,
      "\uCD5C\uADFC \uBCC0\uB3D9 \uD559\uC0DD",
      this.starStudentFilterMode === "recent",
      () => {
        this.starStudentFilterMode = "recent";
        this.render();
      }
    );
    this.renderFilterPill(
      modeGroup,
      "\uCD5C\uADFC \uC218\uB3D9 \uC870\uC815",
      this.starStudentFilterMode === "manual",
      () => {
        this.starStudentFilterMode = "manual";
        this.render();
      }
    );
    filterCard.createEl("p", {
      cls: "classpage-filter-toolbar__meta",
      text: [
        `\uD604\uC7AC ${filteredTotals.length}\uBA85 \uD45C\uC2DC`,
        `\uBAA8\uB4DC ${this.getStarStudentFilterModeLabel()}`,
        this.starStudentFilterMode === "recent" || this.starStudentFilterMode === "manual" ? "\uCD5C\uADFC \uD45C\uC2DC \uC774\uBCA4\uD2B8 \uAE30\uC900" : "\uD559\uC0DD \uB204\uC801 \uAE30\uC900"
      ].join(" \xB7 ")
    });
    const applyFilter = () => {
      this.starStudentQuery = input.value.trim();
      this.render();
    };
    applyButton.addEventListener("click", applyFilter);
    clearButton.addEventListener("click", () => {
      this.starStudentQuery = "";
      this.starStudentFilterMode = "all";
      this.render();
    });
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }
      event.preventDefault();
      applyFilter();
    });
    this.renderStudentDrilldownCard(
      parent,
      "\uD559\uC0DD\uBCC4 \uBCC4\uC810 \uD750\uB984 \uC0C1\uC138",
      filteredTotals.map(
        (total) => this.buildStarStudentDrilldownItem(
          total,
          eventMap.get(total.studentKey) ?? [],
          ledger.rules
        )
      ),
      "\uC774\uB984, \uBC88\uD638, \uBCF4\uAE30 \uBAA8\uB4DC\uB97C \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
      true
    );
  }
  renderFilterPill(parent, label, isActive, onClick) {
    const button = parent.createEl("button", {
      cls: `classpage-filter-pill${isActive ? " is-active" : ""}`,
      text: label,
      attr: { type: "button" }
    });
    button.addEventListener("click", onClick);
  }
  renderStudentDrilldownItem(parent, item) {
    const details = parent.createEl("details", {
      cls: `classpage-student-drilldown${item.tone ? ` is-${item.tone}` : ""}`
    });
    const summary = details.createEl("summary", {
      cls: "classpage-student-drilldown__summary"
    });
    this.renderDrilldownSummary(
      summary,
      item.title,
      item.meta,
      item.summary,
      "classpage-student-drilldown__summary-text"
    );
    if (item.fields.length === 0) {
      details.createEl("p", {
        cls: "classpage-drilldown-empty",
        text: "\uD45C\uC2DC\uD560 \uC0C1\uC138 \uB0B4\uC6A9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
      });
      return;
    }
    const fieldList = details.createEl("dl", { cls: "classpage-drilldown-fields" });
    for (const field of item.fields) {
      this.renderMetaRow(fieldList, field.label, field.value);
    }
  }
  renderDrilldownSummary(parent, title, meta, description, textClass) {
    const text = parent.createDiv({ cls: textClass });
    const header = text.createDiv({ cls: "classpage-detail-list__header" });
    header.createEl("strong", {
      cls: "classpage-detail-list__title",
      text: title
    });
    if (meta) {
      header.createEl("span", {
        cls: "classpage-detail-list__meta",
        text: meta
      });
    }
    if (description) {
      text.createEl("p", {
        cls: "classpage-detail-list__description",
        text: description
      });
    }
  }
  renderDetailRowsCard(parent, title, rows, emptyMessage, isWide = false) {
    const classes = ["classpage-card", "classpage-detail-card"];
    if (isWide) {
      classes.push("classpage-detail-card--wide");
    }
    const card = parent.createDiv({ cls: classes.join(" ") });
    card.createEl("h3", {
      cls: "classpage-card__title",
      text: title
    });
    if (rows.length === 0) {
      card.createEl("p", {
        cls: "classpage-empty-card__message",
        text: emptyMessage
      });
      return;
    }
    const list = card.createDiv({ cls: "classpage-detail-list" });
    for (const row of rows) {
      const item = list.createDiv({
        cls: `classpage-detail-list__item${row.tone ? ` is-${row.tone}` : ""}`
      });
      const itemHeader = item.createDiv({ cls: "classpage-detail-list__header" });
      itemHeader.createEl("strong", {
        cls: "classpage-detail-list__title",
        text: row.title
      });
      if (row.meta) {
        itemHeader.createEl("span", {
          cls: "classpage-detail-list__meta",
          text: row.meta
        });
      }
      if (row.description) {
        item.createEl("p", {
          cls: "classpage-detail-list__description",
          text: row.description
        });
      }
    }
  }
  renderMetaRow(parent, label, value) {
    parent.createEl("dt", {
      cls: "classpage-meta-list__label",
      text: label
    });
    parent.createEl("dd", {
      cls: "classpage-meta-list__value",
      text: value
    });
  }
  buildCountRow(item) {
    return {
      title: item.label,
      meta: `${item.count}\uBA85`,
      description: item.note
    };
  }
  buildStudentResponseMap(responses) {
    return new Map(
      responses.map((item) => [this.getStudentLookupKey(item.student), item]).filter((entry) => entry[0] !== null)
    );
  }
  buildLessonResponseMap(responses) {
    return new Map(
      responses.map((item) => [this.getStudentLookupKey(item.student), item]).filter((entry) => entry[0] !== null)
    );
  }
  getStudentLookupKey(student) {
    if (!this.hasStudentLookupIdentity(student)) {
      return null;
    }
    return [
      student.classroom.trim().toLowerCase(),
      student.number.trim().toLowerCase(),
      student.name.trim().toLowerCase()
    ].join("|");
  }
  hasStudentLookupIdentity(student) {
    return [
      student.classroom,
      student.number,
      student.name
    ].some((value) => value.trim().length > 0);
  }
  findClassResponseByStudent(responses, student) {
    const key = this.getStudentLookupKey(student);
    return key ? responses.get(key) ?? null : null;
  }
  findLessonResponseByStudent(responses, student) {
    const key = this.getStudentLookupKey(student);
    return key ? responses.get(key) ?? null : null;
  }
  buildClassResponseDrilldownItem(student) {
    return {
      title: formatStudentLabel(student.student),
      meta: student.mood || student.emotionLabel || "\uC0C1\uD0DC \uD655\uC778 \uD544\uC694",
      summary: [
        student.goal ? `\uC624\uB298 \uBAA9\uD45C: ${student.goal}` : "",
        student.yesterdayAchievement ? `\uC5B4\uC81C \uB2EC\uC131\uB3C4: ${student.yesterdayAchievement}` : ""
      ].filter(Boolean).join(" / ") || "\uC81C\uCD9C \uC751\uB2F5 \uC0C1\uC138 \uBCF4\uAE30",
      fields: this.compactDrilldownFields([
        ["\uC815\uC11C \uBD84\uB958", student.emotionLabel],
        ["\uC624\uB298 \uAE30\uBD84", student.mood],
        ["\uAE30\uBD84 \uC774\uC720", student.moodReason],
        ["\uC624\uB298 \uBAA9\uD45C", student.goal],
        ["\uC5B4\uC81C \uD560 \uC77C \uB2EC\uC131\uB3C4", student.yesterdayAchievement],
        ["\uC120\uC0DD\uB2D8\uAED8 \uD558\uACE0 \uC2F6\uC740 \uB9D0", student.teacherMessage],
        ["\uB3C4\uC6C0\uC744 \uC900 \uCE5C\uAD6C \uAE30\uB85D", student.helpedFriend],
        ["\uB3C4\uC6C0\uC744 \uBC1B\uC740 \uCE5C\uAD6C \uAE30\uB85D", student.helpedByFriend],
        ["\uBD84\uC11D \uBA54\uBAA8", student.teacherNote]
      ])
    };
  }
  buildClassSupportDrilldownItem(student, response) {
    return {
      title: formatStudentLabel(student.student),
      meta: student.mood || "\uC0C1\uD0DC \uD655\uC778 \uD544\uC694",
      summary: student.reason || "\uB3C4\uC6C0\uC774 \uD544\uC694\uD55C \uADFC\uAC70 \uBCF4\uAE30",
      tone: "warning",
      fields: this.compactDrilldownFields([
        ["\uB3C4\uC6C0 \uD544\uC694 \uADFC\uAC70", student.reason],
        ["\uC624\uB298 \uBAA9\uD45C", student.goal],
        ["\uC5B4\uC81C \uD560 \uC77C \uB2EC\uC131\uB3C4", student.yesterdayAchievement],
        ["\uAE30\uBD84 \uC774\uC720", response?.moodReason || ""],
        ["\uC120\uC0DD\uB2D8\uAED8 \uD558\uACE0 \uC2F6\uC740 \uB9D0", response?.teacherMessage || ""],
        ["\uB3C4\uC6C0\uC744 \uBC1B\uC740 \uCE5C\uAD6C \uAE30\uB85D", response?.helpedByFriend || ""],
        ["\uB3C4\uC6C0\uC744 \uC900 \uCE5C\uAD6C \uAE30\uB85D", response?.helpedFriend || ""],
        ["\uBD84\uC11D \uBA54\uBAA8", student.teacherNote || response?.teacherNote || ""]
      ])
    };
  }
  buildPraiseCandidateDrilldownItem(student, response) {
    return {
      title: formatStudentLabel(student.student),
      meta: student.mentionedPeer ? `\uC5B8\uAE09 \uCE5C\uAD6C: ${student.mentionedPeer}` : "\uCE6D\uCC2C \uD6C4\uBCF4",
      summary: student.reason || "\uCE6D\uCC2C \uC0AC\uC720 \uBCF4\uAE30",
      tone: "positive",
      fields: this.compactDrilldownFields([
        ["\uCE6D\uCC2C \uC0AC\uC720", student.reason],
        ["\uC5B8\uAE09 \uCE5C\uAD6C", student.mentionedPeer],
        ["\uB3C4\uC6C0\uC744 \uC900 \uCE5C\uAD6C \uAE30\uB85D", response?.helpedFriend || ""],
        ["\uAE30\uBD84 \uC774\uC720", response?.moodReason || ""],
        ["\uC624\uB298 \uBAA9\uD45C", response?.goal || ""]
      ])
    };
  }
  buildLessonStudentDrilldownItem(student) {
    const followUp = this.normalizeLessonFollowUpValue(student.followUp);
    return {
      title: formatStudentLabel(student.student),
      meta: `\uC815\uB2F5 ${student.correctCount} / \uC624\uB2F5 ${student.incorrectCount}`,
      summary: [
        student.assignmentStatus ? `\uBCF5\uC2B5/\uC218\uD589: ${student.assignmentStatus}` : "",
        followUp ? `\uD6C4\uC18D: ${followUp}` : ""
      ].filter(Boolean).join(" / ") || "\uC218\uC5C5 \uC751\uB2F5 \uC0C1\uC138 \uBCF4\uAE30",
      fields: this.compactDrilldownFields([
        ["\uB2E8\uC6D0", student.lessonUnit],
        ["\uC815\uB2F5 \uC218", String(student.correctCount)],
        ["\uC624\uB2F5 \uC218", String(student.incorrectCount)],
        ["\uBCF5\uC2B5/\uC218\uD589 \uC0C1\uD0DC", student.assignmentStatus],
        ["\uD5F7\uAC08\uB9B0 \uBD80\uBD84", student.misconception],
        ["\uD6C4\uC18D \uC9C0\uB3C4", followUp],
        ["\uD2C0\uB9B0 \uC774\uC720", student.incorrectReason],
        ["\uC120\uC0DD\uB2D8\uAED8 \uD558\uACE0 \uC2F6\uC740 \uB9D0", student.teacherMessage],
        ["\uAC1C\uB150 \uC751\uB2F5", this.buildConceptSummary(student)],
        ["\uBD84\uC11D \uBA54\uBAA8", student.teacherNote]
      ])
    };
  }
  buildLessonSupportDrilldownItem(student, response) {
    const followUp = this.normalizeLessonFollowUpValue(response?.followUp || "") || "\uBCF4\uCDA9 \uC124\uBA85 \uD544\uC694";
    return {
      title: formatStudentLabel(student.student),
      meta: [
        this.getLessonFollowUpBadge(followUp),
        `\uC815\uB2F5 ${student.correctCount} / \uC624\uB2F5 ${student.incorrectCount}`
      ].filter(Boolean).join(" \xB7 "),
      summary: [
        student.assignmentStatus ? `\uBCF5\uC2B5/\uC218\uD589: ${student.assignmentStatus}` : "",
        student.misconception ? `\uD5F7\uAC08\uB9B0 \uBD80\uBD84: ${student.misconception}` : ""
      ].filter(Boolean).join(" / ") || "\uBCF4\uCDA9 \uC9C0\uB3C4 \uADFC\uAC70 \uBCF4\uAE30",
      tone: this.getLessonFollowUpTone(followUp) ?? "warning",
      fields: this.compactDrilldownFields([
        ["\uBCF5\uC2B5/\uC218\uD589 \uC0C1\uD0DC", student.assignmentStatus],
        ["\uD6C4\uC18D \uC9C0\uB3C4", followUp],
        ["\uD5F7\uAC08\uB9B0 \uBD80\uBD84", student.misconception],
        ["\uD2C0\uB9B0 \uC774\uC720", response?.incorrectReason || ""],
        ["\uC120\uC0DD\uB2D8\uAED8 \uD558\uACE0 \uC2F6\uC740 \uB9D0", response?.teacherMessage || ""],
        ["\uAC1C\uB150 \uC751\uB2F5", response ? this.buildConceptSummary(response) : ""],
        ["\uBD84\uC11D \uBA54\uBAA8", student.teacherNote || response?.teacherNote || ""]
      ])
    };
  }
  buildStudentResultDrilldownItem(result, response) {
    const followUp = this.normalizeLessonFollowUpValue(result.followUp);
    return {
      title: formatStudentLabel(result.student),
      meta: [
        this.getLessonFollowUpBadge(followUp),
        `\uC815\uB2F5 ${result.correctCount} / \uC624\uB2F5 ${result.incorrectCount}`
      ].filter(Boolean).join(" \xB7 "),
      summary: [
        result.assignmentStatus ? `\uBCF5\uC2B5/\uC218\uD589: ${result.assignmentStatus}` : "",
        followUp ? `\uD6C4\uC18D \uC9C0\uB3C4: ${followUp}` : ""
      ].filter(Boolean).join(" / ") || "\uD559\uC0DD\uBCC4 \uACB0\uACFC \uBCF4\uAE30",
      tone: this.getLessonFollowUpTone(followUp),
      fields: this.compactDrilldownFields([
        ["\uBCF5\uC2B5/\uC218\uD589 \uC0C1\uD0DC", result.assignmentStatus],
        ["\uD6C4\uC18D \uC9C0\uB3C4", followUp],
        ["\uD2C0\uB9B0 \uC774\uC720", response?.incorrectReason || ""],
        ["\uC120\uC0DD\uB2D8\uAED8 \uD558\uACE0 \uC2F6\uC740 \uB9D0", response?.teacherMessage || ""],
        ["\uAC1C\uB150 \uC751\uB2F5", response ? this.buildConceptSummary(response) : ""],
        ["\uBD84\uC11D \uBA54\uBAA8", response?.teacherNote || ""]
      ])
    };
  }
  buildLessonFollowUpDrilldownItems(summary, responseMap) {
    const supportKeys = new Set(
      summary.supportStudents.map((student) => this.getStudentLookupKey(student.student)).filter((key) => key !== null)
    );
    const supportItems = summary.supportStudents.slice().sort((left, right) => {
      if (right.incorrectCount !== left.incorrectCount) {
        return right.incorrectCount - left.incorrectCount;
      }
      return left.student.name.localeCompare(right.student.name, "ko-KR");
    }).map(
      (student) => this.buildLessonSupportDrilldownItem(
        student,
        this.findLessonResponseByStudent(responseMap, student.student)
      )
    );
    const extraItems = this.getSortedLessonStudentResults(summary).filter((result) => {
      const key = this.getStudentLookupKey(result.student);
      if (key && supportKeys.has(key)) {
        return false;
      }
      return this.isUrgentLessonFollowUp(result.followUp);
    }).map(
      (result) => this.buildStudentResultDrilldownItem(
        result,
        this.findLessonResponseByStudent(responseMap, result.student)
      )
    );
    return [...supportItems, ...extraItems].slice(0, 8);
  }
  getSortedLessonStudentResults(summary) {
    return summary.studentResults.slice().sort((left, right) => {
      const priorityDiff = this.getLessonFollowUpPriority(left.followUp) - this.getLessonFollowUpPriority(right.followUp);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      if (right.incorrectCount !== left.incorrectCount) {
        return right.incorrectCount - left.incorrectCount;
      }
      if (left.assignmentStatus !== right.assignmentStatus) {
        return left.assignmentStatus.localeCompare(right.assignmentStatus, "ko-KR");
      }
      return left.student.name.localeCompare(right.student.name, "ko-KR");
    });
  }
  getLessonFollowUpBadge(followUp) {
    const normalized = this.normalizeLessonFollowUpValue(followUp);
    if (!normalized) {
      return "";
    }
    return normalized;
  }
  getLessonFollowUpTone(followUp) {
    const normalized = this.normalizeLessonFollowUpValue(followUp);
    if (!normalized) {
      return void 0;
    }
    if (normalized.includes("\uC2EC\uD654")) {
      return "positive";
    }
    if (normalized.includes("\uBCF4\uCDA9") || normalized.includes("\uD655\uC778") || normalized.includes("\uC7AC")) {
      return "warning";
    }
    return void 0;
  }
  getLessonFollowUpPriority(followUp) {
    const normalized = this.normalizeLessonFollowUpValue(followUp);
    if (!normalized) {
      return 2;
    }
    if (normalized.includes("\uBCF4\uCDA9")) {
      return 0;
    }
    if (normalized.includes("\uD655\uC778") || normalized.includes("\uC7AC")) {
      return 1;
    }
    if (normalized.includes("\uC2EC\uD654")) {
      return 3;
    }
    return 2;
  }
  isUrgentLessonFollowUp(followUp) {
    return this.getLessonFollowUpPriority(followUp) <= 1;
  }
  normalizeLessonFollowUpValue(followUp) {
    const normalized = followUp.trim();
    if (!normalized || normalized === "\uBBF8\uD655\uC778" || normalized === "\uC815\uBCF4 \uC5C6\uC74C") {
      return "";
    }
    return normalized;
  }
  buildConceptSummary(student) {
    return student.concepts.map((item) => {
      const parts = [item.concept, item.understandingLabel || item.understanding].filter(Boolean);
      return parts.join(": ");
    }).filter(Boolean).join(" / ");
  }
  hasLowConcept(student, concept) {
    return student.concepts.some(
      (item) => item.concept === concept && item.understandingLabel === "\uB0AE\uC74C"
    );
  }
  compactDrilldownFields(fields) {
    return fields.map(([label, value]) => ({
      label,
      value: value.trim()
    })).filter((item) => item.value.length > 0);
  }
  getLessonAvailableSummaries(summary) {
    const subjects = summary.subjectSummaries.length > 0 ? summary.subjectSummaries : [this.buildFallbackLessonSubjectSummary(summary)];
    return this.getLessonAvailableSummariesFromSubjects(subjects);
  }
  getLessonAvailableSummariesFromSubjects(subjects) {
    return subjects.slice().sort((left, right) => this.compareLessonGroupsForDisplay(left, right));
  }
  getLessonSubjectSelectionValue(summary) {
    return summary.subjectKey.trim() || summary.subject.trim() || summary.groupKey;
  }
  getSelectedLessonSubjectSummary(summary) {
    const availableSummaries = this.getLessonAvailableSummaries(summary);
    return availableSummaries.find(
      (item) => this.getLessonSubjectSelectionValue(item) === this.lessonSubjectSelection
    ) ?? availableSummaries.find(
      (item) => item.groups.some((group) => group.groupKey === this.lessonGroupSelection) || item.groupKey === this.lessonGroupSelection
    ) ?? availableSummaries.find((item) => item.subject === summary.subject) ?? availableSummaries[0];
  }
  getLessonExplorerState(summary) {
    const availableSubjects = this.getLessonAvailableSummaries(summary);
    const selectedSubject = this.getSelectedLessonSubjectSummary(summary);
    return this.getLessonExplorerStateFromSubject(selectedSubject, availableSubjects);
  }
  getLessonExplorerStateFromSubject(selectedSubject, availableSubjects) {
    const allGroups = this.getSortedLessonGroups(selectedSubject);
    const unitFilteredGroups = this.getUnitFilteredLessonGroups(selectedSubject);
    const unitOptions = this.getLessonUnitOptions(selectedSubject);
    const dateOptions = this.getLessonDateOptions(selectedSubject);
    const filteredGroups = this.getFilteredLessonGroups(selectedSubject);
    const selectedGroup = filteredGroups.find((item) => item.groupKey === this.lessonGroupSelection) ?? filteredGroups.find((item) => item.groupKey === selectedSubject.groupKey) ?? filteredGroups[0] ?? null;
    return {
      availableSubjects,
      selectedSubject,
      allGroups,
      unitFilteredGroups,
      filteredGroups,
      selectedGroup,
      unitOptions,
      dateOptions
    };
  }
  getSelectedLessonSummary(summary) {
    const explorer = this.getLessonExplorerState(summary);
    return explorer.selectedGroup ?? explorer.allGroups[0] ?? this.buildFallbackLessonGroupSummary(explorer.selectedSubject);
  }
  buildFallbackLessonSubjectSummary(summary) {
    const group = this.buildFallbackLessonGroupSummary(summary);
    return {
      ...group,
      groups: [this.cloneLessonGroupSummary(group)]
    };
  }
  buildFallbackLessonGroupSummary(summary) {
    const lessonUnit = summary.studentResponses[0]?.lessonUnit || "";
    const unitLabel = "unitLabel" in summary && typeof summary.unitLabel === "string" ? summary.unitLabel : lessonUnit;
    const lessonDate = "lessonDate" in summary && typeof summary.lessonDate === "string" ? summary.lessonDate : this.extractLessonDate(summary.periodLabel);
    const periodOrder = "periodOrder" in summary && typeof summary.periodOrder === "number" ? summary.periodOrder : this.extractLessonPeriodOrder(summary.periodLabel);
    const subjectKey = "subjectKey" in summary && typeof summary.subjectKey === "string" ? summary.subjectKey : this.buildLessonStructuredKey(summary.subject);
    const unitKey = "unitKey" in summary && typeof summary.unitKey === "string" ? summary.unitKey : this.buildLessonStructuredKey(unitLabel);
    const lessonKey = "lessonKey" in summary && typeof summary.lessonKey === "string" ? summary.lessonKey : this.buildLessonMachineKey(lessonDate, periodOrder, subjectKey, unitKey);
    return {
      groupKey: [summary.subject, summary.periodLabel, lessonUnit].filter(Boolean).join("|"),
      lessonKey,
      label: this.buildLessonGroupLabel(summary.subject, summary.periodLabel, unitLabel),
      lessonDate,
      periodOrder,
      subjectKey,
      unitKey,
      unitLabel,
      periodLabel: summary.periodLabel,
      lessonUnit,
      classroom: summary.classroom,
      subject: summary.subject,
      responseCount: summary.responseCount,
      excludedResponseCount: summary.excludedResponseCount,
      overview: { ...summary.overview },
      difficultConcepts: summary.difficultConcepts.map((item) => ({ ...item })),
      assignmentSummary: summary.assignmentSummary.map((item) => ({ ...item })),
      supportStudents: summary.supportStudents.map((item) => ({
        ...item,
        student: { ...item.student }
      })),
      studentResults: summary.studentResults.map((item) => ({
        ...item,
        student: { ...item.student }
      })),
      studentResponses: summary.studentResponses.map((item) => ({
        ...item,
        student: { ...item.student },
        concepts: item.concepts.map((concept) => ({ ...concept }))
      }))
    };
  }
  getSortedLessonGroups(subject) {
    const groups = subject.groups.length > 0 ? subject.groups : [this.buildFallbackLessonGroupSummary(subject)];
    return groups.slice().sort((left, right) => this.compareLessonGroupsForDisplay(left, right));
  }
  getUnitFilteredLessonGroups(subject) {
    return this.getSortedLessonGroups(subject).filter((group) => {
      if (this.lessonUnitFilter.length > 0 && this.getLessonGroupUnitFilterValue(group) !== this.lessonUnitFilter) {
        return false;
      }
      return true;
    });
  }
  getFilteredLessonGroups(subject) {
    const groups = this.getUnitFilteredLessonGroups(subject);
    switch (this.lessonDatePreset) {
      case "recent-3":
        return groups.slice(0, 3);
      case "recent-5":
        return groups.slice(0, 5);
      case "specific":
        return groups.filter(
          (group) => this.lessonDateFilter.length === 0 || this.getLessonGroupDateFilterValue(group) === this.lessonDateFilter
        );
      default:
        return groups;
    }
  }
  getLessonUnitOptions(subject) {
    const seen = /* @__PURE__ */ new Set();
    const options = [];
    for (const group of this.getSortedLessonGroups(subject)) {
      const value = this.getLessonGroupUnitFilterValue(group);
      if (seen.has(value)) {
        continue;
      }
      seen.add(value);
      options.push({
        value,
        label: this.getLessonGroupUnitLabel(group)
      });
    }
    return options;
  }
  getLessonDateOptions(subject) {
    const seen = /* @__PURE__ */ new Set();
    const options = [];
    for (const group of this.getUnitFilteredLessonGroups(subject)) {
      const value = this.getLessonGroupDateFilterValue(group);
      if (seen.has(value)) {
        continue;
      }
      seen.add(value);
      options.push({
        value,
        label: this.getLessonGroupDateLabel(group)
      });
    }
    return options;
  }
  getPreferredLessonGroupSelection(subject) {
    const filteredGroups = this.getFilteredLessonGroups(subject);
    return filteredGroups.find((group) => group.groupKey === this.lessonGroupSelection)?.groupKey ?? filteredGroups.find((group) => group.groupKey === subject.groupKey)?.groupKey ?? filteredGroups[0]?.groupKey ?? "";
  }
  getLessonDatePresetOptions() {
    return [
      { value: "all", label: "\uC804\uCCB4 \uC218\uC5C5" },
      { value: "recent-3", label: "\uCD5C\uADFC 3\uAC1C \uC218\uC5C5" },
      { value: "recent-5", label: "\uCD5C\uADFC 5\uAC1C \uC218\uC5C5" },
      { value: "specific", label: "\uD2B9\uC815 \uB0A0\uC9DC" }
    ];
  }
  getLessonDatePresetLabel() {
    switch (this.lessonDatePreset) {
      case "recent-3":
        return "\uCD5C\uADFC 3\uAC1C \uC218\uC5C5";
      case "recent-5":
        return "\uCD5C\uADFC 5\uAC1C \uC218\uC5C5";
      case "specific":
        return this.lessonDateFilter.length > 0 ? "\uD2B9\uC815 \uB0A0\uC9DC" : "\uB0A0\uC9DC \uC120\uD0DD \uD544\uC694";
      default:
        return "\uC804\uCCB4 \uC218\uC5C5";
    }
  }
  buildLessonScopeDescription(explorer, options) {
    const parts = [
      options?.includeSubject ? `\uACFC\uBAA9 ${explorer.selectedSubject.subject || "\uACFC\uBAA9 \uC815\uBCF4 \uC5C6\uC74C"}` : "",
      options?.includeSubjectCount === false ? "" : explorer.availableSubjects.length > 1 ? `\uACFC\uBAA9 ${explorer.availableSubjects.length}\uAC1C` : "",
      `\uB2E8\uC6D0 ${this.getLessonFilterOptionLabel(this.lessonUnitFilter, explorer.unitOptions, "\uC804\uCCB4 \uB2E8\uC6D0")}`,
      `\uBC94\uC704 ${this.getLessonDateScopeLabel(explorer.dateOptions)}`,
      explorer.filteredGroups.length !== explorer.unitFilteredGroups.length ? `\uD45C\uC2DC ${explorer.filteredGroups.length}\uAC1C \uADF8\uB8F9` : explorer.unitFilteredGroups.length !== explorer.allGroups.length ? `\uB2E8\uC6D0 \uC548 ${explorer.unitFilteredGroups.length}\uAC1C \uADF8\uB8F9` : explorer.allGroups.length > 1 ? `\uACFC\uBAA9 \uC804\uCCB4 ${explorer.allGroups.length}\uAC1C \uADF8\uB8F9` : "",
      options?.includeCurrentGroup === false ? "" : explorer.selectedGroup ? `\uC120\uD0DD ${this.buildLessonGroupOptionLabel(explorer.selectedGroup)}` : "\uC870\uAC74\uC5D0 \uB9DE\uB294 \uC218\uC5C5 \uADF8\uB8F9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
    ];
    return parts.filter(Boolean).join(" \xB7 ");
  }
  getLessonDateScopeLabel(dateOptions) {
    if (this.lessonDatePreset === "specific") {
      return this.getLessonFilterOptionLabel(this.lessonDateFilter, dateOptions, "\uB0A0\uC9DC \uC120\uD0DD \uD544\uC694");
    }
    return this.getLessonDatePresetLabel();
  }
  getLessonFilterOptionLabel(value, options, allLabel) {
    if (!value) {
      return allLabel;
    }
    return options.find((option) => option.value === value)?.label ?? allLabel;
  }
  getLessonGroupUnitFilterValue(summary) {
    return summary.unitKey.trim() || this.buildLessonStructuredKey(summary.unitLabel || summary.lessonUnit || "") || LESSON_FILTER_MISSING_UNIT;
  }
  getLessonGroupUnitLabel(summary) {
    return summary.unitLabel.trim() || summary.lessonUnit.trim() || "\uB2E8\uC6D0 \uC815\uBCF4 \uC5C6\uC74C";
  }
  getLessonGroupDateFilterValue(summary) {
    return summary.lessonDate.trim() || this.extractLessonDate(summary.periodLabel) || LESSON_FILTER_MISSING_DATE;
  }
  getLessonGroupDateLabel(summary) {
    return summary.lessonDate.trim() || this.extractLessonDate(summary.periodLabel) || "\uB0A0\uC9DC \uC815\uBCF4 \uC5C6\uC74C";
  }
  buildLessonStructuredFieldNotice(groups) {
    const missingUnitCount = groups.filter(
      (group) => !group.unitLabel.trim() && !group.lessonUnit.trim()
    ).length;
    const missingDateCount = groups.filter(
      (group) => !group.lessonDate.trim() && !this.extractLessonDate(group.periodLabel)
    ).length;
    const parts = [
      missingUnitCount > 0 ? `\uB2E8\uC6D0 \uC815\uBCF4 \uC5C6\uC74C ${missingUnitCount}\uAC1C` : "",
      missingDateCount > 0 ? `\uB0A0\uC9DC \uC815\uBCF4 \uC5C6\uC74C ${missingDateCount}\uAC1C` : ""
    ].filter(Boolean);
    if (parts.length === 0) {
      return "";
    }
    return `\uC77C\uBD80 \uC218\uC5C5\uC740 ${parts.join(" / ")}\uB77C\uC11C \uD544\uD130\uC5D0\uC11C '\uC815\uBCF4 \uC5C6\uC74C'\uC73C\uB85C \uBB36\uC5EC \uBCF4\uC77C \uC218 \uC788\uC2B5\uB2C8\uB2E4.`;
  }
  cloneLessonGroupSummary(summary) {
    return {
      ...summary,
      overview: { ...summary.overview },
      difficultConcepts: summary.difficultConcepts.map((item) => ({ ...item })),
      assignmentSummary: summary.assignmentSummary.map((item) => ({ ...item })),
      supportStudents: summary.supportStudents.map((item) => ({
        ...item,
        student: { ...item.student }
      })),
      studentResults: summary.studentResults.map((item) => ({
        ...item,
        student: { ...item.student }
      })),
      studentResponses: summary.studentResponses.map((item) => ({
        ...item,
        student: { ...item.student },
        concepts: item.concepts.map((concept) => ({ ...concept }))
      }))
    };
  }
  buildLessonGroupLabel(subject, periodLabel, lessonUnit) {
    const parts = [subject, periodLabel];
    if (lessonUnit && !periodLabel.includes(lessonUnit)) {
      parts.push(lessonUnit);
    }
    return parts.filter(Boolean).join(" \xB7 ") || "\uC218\uC5C5 \uADF8\uB8F9";
  }
  buildLessonGroupOptionLabel(summary) {
    const parts = [
      this.getLessonGroupDateLabel(summary),
      summary.periodOrder != null ? `${summary.periodOrder}\uAD50\uC2DC` : "",
      this.getLessonGroupUnitLabel(summary)
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" \xB7 ") : summary.label || summary.periodLabel || summary.groupKey;
  }
  renderLessonEmptySelectionCard(parent, selectedSubject, unitOptions, dateOptions) {
    const card = parent.createDiv({ cls: "classpage-card classpage-empty-card" });
    card.createEl("h3", {
      cls: "classpage-card__title",
      text: "\uC870\uAC74\uC5D0 \uB9DE\uB294 \uC218\uC5C5 \uADF8\uB8F9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4"
    });
    card.createEl("p", {
      cls: "classpage-empty-card__message",
      text: "\uC120\uD0DD\uD55C \uACFC\uBAA9 \uC548\uC5D0\uC11C \uC9C0\uAE08 \uC870\uAC74\uC5D0 \uB9DE\uB294 \uC218\uC5C5 \uADF8\uB8F9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uCD5C\uADFC \uC218\uC5C5 \uBC94\uC704\uB97C \uB113\uD788\uAC70\uB098 \uB2E8\uC6D0, \uB0A0\uC9DC \uC120\uD0DD\uC744 \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694."
    });
    card.createEl("p", {
      cls: "classpage-empty-card__detail",
      text: [
        `\uACFC\uBAA9 ${selectedSubject.subject || "\uACFC\uBAA9 \uC815\uBCF4 \uC5C6\uC74C"}`,
        `\uB2E8\uC6D0 ${this.getLessonFilterOptionLabel(this.lessonUnitFilter, unitOptions, "\uC804\uCCB4 \uB2E8\uC6D0")}`,
        `\uBC94\uC704 ${this.getLessonDateScopeLabel(dateOptions)}`
      ].join(" \xB7 ")
    });
    card.createEl("p", {
      cls: "classpage-empty-card__detail",
      text: this.lessonDatePreset === "specific" ? "\uD2B9\uC815 \uB0A0\uC9DC \uB300\uC2E0 \uCD5C\uADFC 3\uAC1C \uC218\uC5C5\uC774\uB098 \uC804\uCCB4 \uC218\uC5C5\uC73C\uB85C \uB113\uD600 \uBCF4\uBA74 \uB354 \uBE68\uB9AC \uCC3E\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4." : "\uC870\uAC74\uC744 \uC870\uAE08 \uB113\uD600 \uBCF4\uBA74 \uCD5C\uADFC \uC218\uC5C5 \uD750\uB984\uC744 \uB354 \uBE60\uB974\uAC8C \uB2E4\uC2DC \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."
    });
  }
  compareLessonGroupsForDisplay(left, right) {
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
  buildLessonStructuredKey(value) {
    return value.trim().toLowerCase().replace(/\s+/g, "-").replace(/[|/\\]+/g, "-");
  }
  buildLessonMachineKey(lessonDate, periodOrder, subjectKey, unitKey) {
    return [
      lessonDate || "date-missing",
      periodOrder != null ? `p${periodOrder}` : "p0",
      subjectKey || "subject-missing",
      unitKey || "unit-missing"
    ].join("|");
  }
  extractLessonDate(value) {
    const match = value.match(/\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : "";
  }
  extractLessonPeriodOrder(value) {
    const periodMatch = value.match(/(\d+)\s*교시/);
    if (periodMatch) {
      return Number(periodMatch[1]);
    }
    const numericMatch = value.match(/(\d+)/);
    return numericMatch ? Number(numericMatch[1]) : null;
  }
  buildStarRecentEventMap(events) {
    const map = /* @__PURE__ */ new Map();
    for (const event of events) {
      const list = map.get(event.studentKey) ?? [];
      list.push(event);
      map.set(event.studentKey, list);
    }
    return map;
  }
  getFilteredStarTotals(ledger, eventMap) {
    const query = normalizeLookupText(this.starStudentQuery);
    const baseTotals = this.getStarTotalsForFilterMode(ledger, eventMap);
    return baseTotals.filter((total) => {
      if (!query) {
        return true;
      }
      const haystack = normalizeLookupText([
        total.student.classroom,
        total.student.number,
        total.student.name
      ].join(" "));
      return haystack.includes(query);
    });
  }
  getStarTotalsForFilterMode(ledger, eventMap) {
    switch (this.starStudentFilterMode) {
      case "adjusted":
        return sortStarTotalsByHiddenAdjustment(ledger.totals).filter((total) => total.hiddenAdjustmentTotal !== 0);
      case "recent":
        return this.sortStarTotalsByRecentPreview(ledger.totals, eventMap).filter((total) => (eventMap.get(total.studentKey) ?? []).length > 0);
      case "manual":
        return this.sortStarTotalsByRecentPreview(ledger.totals, eventMap, (event) => event.source === "manual").filter(
          (total) => (eventMap.get(total.studentKey) ?? []).some((event) => event.source === "manual")
        );
      default:
        return sortStarTotals(ledger.totals);
    }
  }
  sortStarTotalsByRecentPreview(totals, eventMap, predicate) {
    return totals.slice().sort((left, right) => {
      const leftEvents = (eventMap.get(left.studentKey) ?? []).filter(
        (event) => predicate ? predicate(event) : true
      );
      const rightEvents = (eventMap.get(right.studentKey) ?? []).filter(
        (event) => predicate ? predicate(event) : true
      );
      const leftTime = leftEvents[0]?.occurredAt ?? "";
      const rightTime = rightEvents[0]?.occurredAt ?? "";
      if (leftTime !== rightTime) {
        return rightTime.localeCompare(leftTime);
      }
      if (rightEvents.length !== leftEvents.length) {
        return rightEvents.length - leftEvents.length;
      }
      return right.total - left.total;
    });
  }
  getStarStudentFilterModeLabel() {
    switch (this.starStudentFilterMode) {
      case "adjusted":
        return "\uC228\uAE40 \uC870\uC815 \uBC18\uC601 \uD559\uC0DD";
      case "recent":
        return "\uCD5C\uADFC \uBCC0\uB3D9 \uD559\uC0DD";
      case "manual":
        return "\uCD5C\uADFC \uC218\uB3D9 \uC870\uC815";
      default:
        return "\uC804\uCCB4 \uD559\uC0DD";
    }
  }
  findStarRuleSummary(ledger, ruleId) {
    return ledger.ruleSummary.find((item) => item.ruleId === ruleId) ?? null;
  }
  buildStarRuleSummaryRows(ledger, rules) {
    const knownRuleIds = new Set(rules.map((rule) => rule.ruleId));
    const rows = rules.map((rule) => this.buildStarRuleSummaryRow(rule, this.findStarRuleSummary(ledger, rule.ruleId)));
    const fallbackRows = ledger.ruleSummary.filter((item) => !knownRuleIds.has(item.ruleId)).map((item) => this.buildFallbackStarRuleSummaryRow(item));
    return [...rows, ...fallbackRows].sort((left, right) => {
      const leftCount = parseLeadingNumber(left.meta);
      const rightCount = parseLeadingNumber(right.meta);
      if (rightCount !== leftCount) {
        return rightCount - leftCount;
      }
      return left.title.localeCompare(right.title, "ko-KR");
    });
  }
  buildStarRuleSummaryRow(rule, summary) {
    const automaticCount = summary?.automaticCount ?? 0;
    const manualCount = summary?.manualCount ?? 0;
    const eventCount = summary?.eventCount ?? 0;
    return {
      title: rule.label,
      meta: `${eventCount}\uAC74`,
      description: [
        `${getStarVisibilityLabel(rule.visibility)} \xB7 ${getStarCategoryLabel(rule.category)}`,
        automaticCount > 0 ? `\uC790\uB3D9 ${automaticCount}\uAC74` : "",
        manualCount > 0 ? `\uC218\uB3D9 ${manualCount}\uAC74` : "",
        getStarRuleSourceSummary(rule.sources)
      ].filter(Boolean).join(" / "),
      tone: rule.visibility === "teacher" || rule.delta < 0 ? "warning" : eventCount > 0 ? "positive" : void 0
    };
  }
  buildFallbackStarRuleSummaryRow(summary) {
    return {
      title: summary.label || summary.ruleId,
      meta: `${summary.eventCount}\uAC74`,
      description: [
        `${getStarVisibilityLabel(summary.visibility)} \xB7 ${getStarCategoryLabel(summary.category)}`,
        summary.automaticCount > 0 ? `\uC790\uB3D9 ${summary.automaticCount}\uAC74` : "",
        summary.manualCount > 0 ? `\uC218\uB3D9 ${summary.manualCount}\uAC74` : "",
        `ruleId ${summary.ruleId}`
      ].filter(Boolean).join(" / "),
      tone: summary.visibility === "teacher" ? "warning" : summary.eventCount > 0 ? "positive" : void 0
    };
  }
  buildStarStudentFlowRows(ledger, eventMap) {
    const recentStudents = this.sortStarTotalsByRecentPreview(ledger.totals, eventMap).filter((total) => (eventMap.get(total.studentKey) ?? []).length > 0).slice(0, 4);
    const recentManualStudents = this.sortStarTotalsByRecentPreview(
      ledger.totals,
      eventMap,
      (event) => event.source === "manual"
    ).filter(
      (total) => (eventMap.get(total.studentKey) ?? []).some((event) => event.source === "manual")
    ).slice(0, 4);
    const adjustedStudents = sortStarTotalsByHiddenAdjustment(ledger.totals).filter((total) => total.hiddenAdjustmentTotal !== 0).slice(0, 4);
    return [
      {
        title: "\uCD5C\uADFC \uBCC0\uB3D9\uC774 \uBCF4\uC774\uB294 \uD559\uC0DD",
        meta: recentStudents.length > 0 ? `${recentStudents.length}\uBA85` : "\uC5C6\uC74C",
        description: recentStudents.length > 0 ? recentStudents.map(
          (total) => `${formatStudentLabel(total.student)} (${this.buildStarRecentEventSummary(
            eventMap.get(total.studentKey) ?? [],
            ledger.rules
          )})`
        ).join(" / ") : "\uCD5C\uADFC \uD45C\uC2DC \uC774\uBCA4\uD2B8\uC5D0 \uC7A1\uD78C \uD559\uC0DD\uC774 \uC544\uC9C1 \uC5C6\uC2B5\uB2C8\uB2E4."
      },
      {
        title: "\uCD5C\uADFC \uC218\uB3D9 \uC870\uC815\uC774 \uBCF4\uC774\uB294 \uD559\uC0DD",
        meta: recentManualStudents.length > 0 ? `${recentManualStudents.length}\uBA85` : "\uC5C6\uC74C",
        description: recentManualStudents.length > 0 ? `${recentManualStudents.map(
          (total) => `${formatStudentLabel(total.student)} (${this.buildStarRecentEventSummary(
            (eventMap.get(total.studentKey) ?? []).filter((event) => event.source === "manual"),
            ledger.rules
          )})`
        ).join(" / ")} / \uCD5C\uADFC \uD45C\uC2DC \uC774\uBCA4\uD2B8 \uC548\uC5D0\uC11C\uB9CC \uBCF4\uC785\uB2C8\uB2E4.` : "\uCD5C\uADFC \uD45C\uC2DC \uC774\uBCA4\uD2B8 \uC548\uC5D0\uC11C \uC218\uB3D9 \uC870\uC815\uC774 \uBCF4\uC774\uB294 \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
      },
      {
        title: "\uC228\uAE40 \uC870\uC815\uC774 \uBC18\uC601\uB41C \uD559\uC0DD",
        meta: adjustedStudents.length > 0 ? `${adjustedStudents.length}\uBA85` : "\uC5C6\uC74C",
        description: adjustedStudents.length > 0 ? adjustedStudents.map((total) => {
          const latestEvent = (eventMap.get(total.studentKey) ?? [])[0];
          const previewLabel = latestEvent ? this.buildCompactStarEventPreview(latestEvent, ledger.rules) : `\uCD5C\uADFC \uBBF8\uB9AC\uBCF4\uAE30 \uC5C6\uC74C / \uCD1D ${formatSignedPoints(total.total)}`;
          return `${formatStudentLabel(total.student)} (\uC120\uC0DD\uB2D8 \uC870\uC815 ${formatSignedPoints(total.hiddenAdjustmentTotal)} / ${previewLabel})`;
        }).join(" / ") : "\uD604\uC7AC \uC228\uAE40 \uC870\uC815\uC774 \uBC18\uC601\uB41C \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
        tone: adjustedStudents.some((total) => total.hiddenAdjustmentTotal < 0) ? "warning" : void 0
      }
    ];
  }
  buildStarStudentDrilldownItem(total, previewEvents, rules) {
    const manualPreviewCount = previewEvents.filter((event) => event.source === "manual").length;
    return {
      title: formatStudentLabel(total.student),
      meta: [
        `\uCD1D ${formatSignedPoints(total.total)}`,
        previewEvents.length > 0 ? `\uCD5C\uADFC ${previewEvents.length}\uAC74` : ""
      ].filter(Boolean).join(" \xB7 "),
      summary: [
        `\uD559\uC0DD \uACF5\uAC1C ${formatSignedPoints(total.visibleTotal)}`,
        `\uC120\uC0DD\uB2D8 \uC870\uC815 ${formatSignedPoints(total.hiddenAdjustmentTotal)}`,
        manualPreviewCount > 0 ? `\uCD5C\uADFC \uC218\uB3D9 \uC870\uC815 ${manualPreviewCount}\uAC74` : "",
        previewEvents.length > 0 ? `\uCD5C\uADFC \uD750\uB984: ${this.buildStarRecentEventSummary(previewEvents, rules)}` : "\uCD5C\uADFC \uD45C\uC2DC \uC774\uBCA4\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."
      ].filter(Boolean).join(" / "),
      tone: total.hiddenAdjustmentTotal < 0 ? "warning" : total.hiddenAdjustmentTotal > 0 ? "positive" : void 0,
      fields: this.compactDrilldownFields([
        ["\uD559\uC0DD \uACF5\uAC1C \uB204\uC801", formatSignedPoints(total.visibleTotal)],
        ["\uC120\uC0DD\uB2D8 \uC870\uC815 \uD569\uACC4", formatSignedPoints(total.hiddenAdjustmentTotal)],
        ["\uC804\uCCB4 \uC774\uBCA4\uD2B8 \uC218", `${total.eventCount}\uAC74`],
        ...previewEvents.slice(0, 4).map((event, index) => [
          `\uCD5C\uADFC \uC774\uBCA4\uD2B8 ${index + 1}`,
          this.buildCompactStarEventPreview(event, rules)
        ])
      ])
    };
  }
  buildStarRecentEventSummary(previewEvents, rules) {
    if (previewEvents.length === 0) {
      return "\uCD5C\uADFC \uC774\uBCA4\uD2B8 \uC5C6\uC74C";
    }
    return previewEvents.slice(0, 2).map((event) => {
      const rule = rules.find((item) => item.ruleId === event.ruleId);
      return [
        formatDateLabel(event.occurredAt, "\uC2DC\uAC01 \uC815\uBCF4 \uC5C6\uC74C"),
        `${rule?.label ?? event.ruleId} ${formatSignedPoints(event.delta)}`
      ].join(" ");
    }).join(" / ");
  }
  buildCompactStarEventPreview(event, rules) {
    const rule = rules.find((item) => item.ruleId === event.ruleId);
    return [
      formatDateLabel(event.occurredAt, "\uC2DC\uAC01 \uC815\uBCF4 \uC5C6\uC74C"),
      `${rule?.label ?? event.ruleId} ${formatSignedPoints(event.delta)}`,
      getStarEventSourceLabel(event),
      event.visibility === "teacher" ? "\uC120\uC0DD\uB2D8 \uD655\uC778 \uC804\uC6A9" : "",
      event.note
    ].filter(Boolean).join(" / ");
  }
  buildTeacherContextSummary(teacherData) {
    const focusLabel = this.getTeacherFocusLabel(this.teacherFocusMode);
    const candidates = [
      this.teacherFocusMode === "class" ? teacherData?.classSummary ?? null : null,
      this.teacherFocusMode === "lesson" ? teacherData?.lessonSummary ?? null : null,
      this.teacherFocusMode === "star" ? teacherData?.starLedger ?? null : null,
      teacherData?.classSummary ?? null,
      teacherData?.lessonSummary ?? null,
      teacherData?.starLedger ?? null
    ];
    const sourceState = candidates.find(
      (item) => item?.status === "loaded" && item.data
    ) ?? null;
    if (!sourceState || !sourceState.data) {
      return {
        badgeText: "\uD559\uAE09 \uC815\uBCF4 \uC5C6\uC74C",
        focusLabel,
        classroomLabel: "\uD559\uAE09 \uC815\uBCF4 \uD655\uC778 \uD544\uC694",
        meta: `\uD604\uC7AC \uD654\uBA74: ${focusLabel}`,
        description: "\uD559\uAE09, \uC218\uC5C5, \uBCC4\uC810 \uC9D1\uACC4 \uC911 \uD558\uB098\uC5D0 \uD559\uAE09 \uC815\uBCF4\uAC00 \uB4E4\uC5B4\uC624\uBA74 \uC5EC\uAE30\uC640 \uAC01 \uC139\uC158 \uD5E4\uB354\uC5D0 \uD568\uAED8 \uD45C\uC2DC\uB429\uB2C8\uB2E4."
      };
    }
    const lessonExplorer = sourceState.data.type === "lesson-summary" ? this.getLessonExplorerState(sourceState.data) : null;
    const lessonDisplayTarget = lessonExplorer?.selectedGroup ?? lessonExplorer?.selectedSubject ?? null;
    const classroomLabel = getAggregateDisplayClassroom(
      sourceState.data.type === "lesson-summary" ? lessonDisplayTarget ?? sourceState.data : sourceState.data
    ) || "\uD559\uAE09 \uC815\uBCF4 \uD655\uC778 \uD544\uC694";
    const selectedLessonSubject = lessonExplorer ? lessonExplorer.selectedSubject : null;
    const selectedLessonGroup = lessonExplorer ? lessonExplorer.selectedGroup : null;
    const lessonMetaLabel = selectedLessonGroup?.label ?? (lessonExplorer ? [
      selectedLessonSubject?.subject || (sourceState.data.type === "lesson-summary" ? sourceState.data.subject : ""),
      this.buildLessonScopeDescription(lessonExplorer, {
        includeSubject: false,
        includeSubjectCount: false,
        includeCurrentGroup: false
      }),
      "\uC870\uAC74\uC5D0 \uB9DE\uB294 \uC218\uC5C5 \uADF8\uB8F9 \uC5C6\uC74C"
    ].filter(Boolean).join(" \xB7 ") : sourceState.data.type === "lesson-summary" ? sourceState.data.subject : "");
    const meta = [
      `\uD604\uC7AC \uD654\uBA74: ${focusLabel}`,
      `\uAE30\uC900: ${this.getTeacherAggregateLabel(sourceState.kind)}`,
      lessonMetaLabel,
      sourceState.data.type === "lesson-summary" ? "" : sourceState.data.periodLabel
    ].filter(Boolean).join(" \xB7 ");
    const description = sourceState.data.type === "star-ledger" ? sourceState.data.classroom ? "\uBCC4\uC810\uC740 \uACF5\uAC1C \uC810\uC218\uC640 \uC120\uC0DD\uB2D8 \uD655\uC778 \uC804\uC6A9 \uC870\uC815\uC744 \uBD84\uB9AC\uD574 \uC77D\uB294 \uD655\uC778 \uD654\uBA74\uC785\uB2C8\uB2E4." : "\uBCC4\uC810 \uC9D1\uACC4\uC5D0 \uD559\uAE09 \uC815\uBCF4\uAC00 \uBE44\uC5B4 \uC788\uC73C\uBA74 \uD559\uC0DD \uBAA9\uB85D\uC758 \uACF5\uD1B5 \uD559\uAE09\uC744 \uCC3E\uC544 \uD654\uBA74\uC5D0 \uBCF4\uC644 \uD45C\uC2DC\uD569\uB2C8\uB2E4." : sourceState.data.type === "lesson-summary" ? "\uC218\uC5C5 \uCE74\uB4DC\uC640 drill-down\uC740 \uC120\uD0DD\uD55C \uACFC\uBAA9 \uC548\uC758 \uC218\uC5C5 \uADF8\uB8F9 \uAE30\uC900\uC73C\uB85C \uC774\uD574\uB3C4, \uBCF5\uC2B5/\uC218\uD589, \uD6C4\uC18D \uC9C0\uB3C4\uB97C \uBA3C\uC800 \uBCF4\uB3C4\uB85D \uC815\uB9AC\uD569\uB2C8\uB2E4." : "\uD559\uAE09 \uCE74\uB4DC\uC640 drill-down\uC740 \uC774 \uD559\uAE09\uC758 \uC815\uC11C \uC0C1\uD0DC, \uBAA9\uD45C \uB2EC\uC131, \uB3C4\uC6C0\uC774 \uD544\uC694\uD55C \uD559\uC0DD\uC744 \uBA3C\uC800 \uBCF4\uC5EC\uC90D\uB2C8\uB2E4.";
    return {
      badgeText: classroomLabel,
      focusLabel,
      classroomLabel,
      meta,
      description
    };
  }
  getTeacherFocusLabel(mode) {
    switch (mode) {
      case "class":
        return "\uD559\uAE09";
      case "lesson":
        return "\uC218\uC5C5";
      case "star":
        return "\uBCC4\uC810";
      default:
        return "\uC804\uCCB4 \uBCF4\uAE30";
    }
  }
  getTeacherAggregateLabel(kind) {
    switch (kind) {
      case "class":
        return "\uD559\uAE09 \uC9D1\uACC4";
      case "lesson":
        return "\uC218\uC5C5 \uC9D1\uACC4";
      case "star":
        return "\uBCC4\uC810 \uC9D1\uACC4";
    }
  }
  getSourceClassroomBadge(sourceState) {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return void 0;
    }
    const lessonExplorer = sourceState.data.type === "lesson-summary" ? this.getLessonExplorerState(sourceState.data) : null;
    return getAggregateDisplayClassroom(
      sourceState.data.type === "lesson-summary" ? lessonExplorer?.selectedGroup ?? lessonExplorer?.selectedSubject ?? sourceState.data : sourceState.data
    ) || void 0;
  }
  buildLessonPriorityRows(summary) {
    const partialCount = this.getAggregateCountByLabel(summary.assignmentSummary, "\uBD80\uBD84 \uC644\uB8CC");
    const incompleteCount = this.getAggregateCountByLabel(summary.assignmentSummary, "\uBBF8\uC644\uB8CC");
    const needsFollowUpCount = partialCount + incompleteCount;
    const supportPreview = summary.supportStudents.slice(0, 3).map((student) => formatStudentLabel(student.student)).join(", ");
    const topConcept = summary.difficultConcepts[0];
    return [
      {
        title: "\uBCF4\uCDA9 \uC124\uBA85\uC774 \uD544\uC694\uD55C \uD559\uC0DD",
        meta: summary.supportStudents.length > 0 ? `${summary.supportStudents.length}\uBA85` : "\uC5C6\uC74C",
        description: summary.supportStudents.length > 0 ? [
          supportPreview ? `\uBA3C\uC800 \uBCFC \uD559\uC0DD: ${supportPreview}` : "",
          summary.supportStudents[0]?.misconception ? `\uD575\uC2EC \uC624\uAC1C\uB150: ${summary.supportStudents[0].misconception}` : ""
        ].filter(Boolean).join(" / ") : "\uD604\uC7AC\uB294 \uBCF4\uCDA9 \uC124\uBA85 \uC6B0\uC120 \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
        tone: summary.supportStudents.length > 0 ? "warning" : "positive"
      },
      {
        title: "\uBCF5\uC2B5/\uC218\uD589 \uBBF8\uC644\uB8CC \uD655\uC778",
        meta: needsFollowUpCount > 0 ? `${needsFollowUpCount}\uBA85` : "\uC5C6\uC74C",
        description: needsFollowUpCount > 0 ? [
          incompleteCount > 0 ? `\uBBF8\uC644\uB8CC ${incompleteCount}\uBA85` : "",
          partialCount > 0 ? `\uBD80\uBD84 \uC644\uB8CC ${partialCount}\uBA85` : "",
          summary.overview.assignmentCompletionLabel ? `\uC804\uCCB4 \uD750\uB984: ${summary.overview.assignmentCompletionLabel}` : ""
        ].filter(Boolean).join(" / ") : `\uC804\uCCB4 \uD750\uB984: ${summary.overview.assignmentCompletionLabel || "\uBBF8\uBD84\uB958"}`,
        tone: needsFollowUpCount > 0 ? "warning" : void 0
      },
      {
        title: "\uC7AC\uC124\uBA85 \uD544\uC694\uD55C \uAC1C\uB150",
        meta: topConcept ? `${topConcept.count}\uBA85` : "\uC5C6\uC74C",
        description: topConcept ? [
          topConcept.concept,
          topConcept.averageUnderstanding,
          topConcept.note
        ].filter(Boolean).join(" / ") : "\uD604\uC7AC \uB2E4\uC2DC \uC124\uBA85\uC774 \uD544\uC694\uD55C \uB300\uD45C \uAC1C\uB150\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
        tone: topConcept ? "warning" : void 0
      }
    ];
  }
  getAggregateCountByLabel(items, label) {
    return items.find((item) => item.label === label)?.count ?? 0;
  }
  buildStarOperationRows(ledger, visibleRules, teacherOnlyRules, manualRules) {
    const customDeltaRules = manualRules.filter((rule) => rule.allowCustomDelta);
    return [
      {
        title: "\uC9C0\uAE08 \uD655\uC778 \uAC00\uB2A5\uD55C \uB0B4\uC6A9",
        meta: "\uC77D\uAE30 \uC804\uC6A9",
        description: "\uD65C\uC131 \uADDC\uCE59, \uACF5\uAC1C/\uBE44\uACF5\uAC1C \uAD6C\uBD84, \uCD5C\uADFC \uC774\uBCA4\uD2B8, \uD559\uC0DD\uBCC4 \uB204\uC801 \uC810\uC218, \uC228\uAE40 \uC870\uC815 \uD569\uACC4\uB97C \uC774 \uD654\uBA74\uC5D0\uC11C \uD655\uC778\uD569\uB2C8\uB2E4."
      },
      {
        title: "\uACF5\uAC1C/\uBE44\uACF5\uAC1C \uAE30\uC900",
        meta: `\uD559\uC0DD \uACF5\uAC1C ${visibleRules.length}\uAC1C / \uC120\uC0DD\uB2D8 \uD655\uC778 ${teacherOnlyRules.length}\uAC1C`,
        description: "\uD559\uC0DD \uACF5\uAC1C \uC810\uC218\uC640 \uC120\uC0DD\uB2D8 \uD655\uC778 \uC804\uC6A9 \uC870\uC815\uC740 \uBD84\uB9AC\uD574 \uC77D\uC2B5\uB2C8\uB2E4. \uC228\uAE40 \uC870\uC815\uC740 \uD559\uC0DD \uACF5\uAC1C \uD569\uACC4\uC5D0 \uC11E\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
      },
      {
        title: "\uC218\uB3D9 \uC870\uC815 \uAE30\uC900",
        meta: `\uC218\uB3D9 \uADDC\uCE59 ${manualRules.length}\uAC1C`,
        description: [
          "\uC6B4\uC601 \uADDC\uCE59: \uC790\uB3D9\uD654 \uC124\uC815\uC5D0\uC11C \uAD00\uB9AC",
          "\uC785\uB825 \uC704\uCE58: \uBCC4\uC810 \uC218\uB3D9 \uC870\uC815 \uC2DC\uD2B8",
          customDeltaRules.length > 0 ? `\uD589\uBCC4 \uC810\uC218 \uB36E\uC5B4\uC4F0\uAE30 \uD5C8\uC6A9 ${customDeltaRules.length}\uAC1C` : "\uD589\uBCC4 \uC810\uC218 \uB36E\uC5B4\uC4F0\uAE30 \uD5C8\uC6A9 \uC5C6\uC74C"
        ].join(" / ")
      },
      {
        title: "\uC77C\uAD04 \uBD80\uC5EC \uD750\uB984",
        meta: ledger.sourceSummary.manual > 0 ? `\uD604\uC7AC \uBC18\uC601 ${ledger.sourceSummary.manual}\uAC74` : "\uC785\uB825 \uC5C6\uC74C",
        description: "\uBCC4\uC810 \uC77C\uAD04 \uBD80\uC5EC \uC2DC\uD2B8\uC5D0\uC11C \uC900\uBE44\uD55C \uD589\uC774 Apps Script\uB97C \uAC70\uCCD0 \uBCC4\uC810 \uC218\uB3D9 \uC870\uC815 \uC774\uBCA4\uD2B8\uB85C \uBC18\uC601\uB418\uBA74 \uC774 \uD654\uBA74\uC5D0 \uB098\uD0C0\uB0A9\uB2C8\uB2E4."
      },
      {
        title: "\uD559\uAE09 \uD45C\uC2DC \uAE30\uC900",
        meta: ledger.classroom ? "\uC9D1\uACC4 \uC81C\uACF5" : "\uD45C\uC2DC \uBCF4\uC644",
        description: ledger.classroom ? "\uBCC4\uC810 \uC9D1\uACC4 \uD30C\uC77C\uC758 \uD559\uAE09 \uAC12\uC744 \uC6B0\uC120 \uD45C\uC2DC\uD569\uB2C8\uB2E4." : "\uBCC4\uC810 \uC9D1\uACC4 \uD30C\uC77C\uC5D0 \uD559\uAE09 \uAC12\uC774 \uC5C6\uC73C\uBA74 \uD559\uC0DD \uBAA9\uB85D\uC758 \uACF5\uD1B5 \uD559\uAE09\uC744 \uCC3E\uC544 \uBCF4\uC644 \uD45C\uC2DC\uD569\uB2C8\uB2E4."
      },
      {
        title: "\uADDC\uCE59\uBCC4 \uBC1C\uC0DD \uC9D1\uACC4",
        meta: ledger.ruleSummary.length > 0 ? "\uC815\uD655 \uC9D1\uACC4" : "\uBD80\uBD84 \uD45C\uC2DC",
        description: ledger.ruleSummary.length > 0 ? "\uCD5C\uC2E0 \uC9D1\uACC4 \uD30C\uC77C\uC774\uBA74 \uADDC\uCE59\uBCC4 \uCD1D \uBC1C\uC0DD \uC218\uC640 \uC790\uB3D9/\uC218\uB3D9 \uBD84\uB9AC\uB97C \uC815\uD655\uD788 \uBCF4\uC5EC\uC90D\uB2C8\uB2E4." : "\uC624\uB798\uB41C \uC9D1\uACC4 \uD30C\uC77C\uC774\uBA74 \uC77C\uBD80 \uADDC\uCE59\uC740 \uCD5C\uADFC \uD45C\uC2DC \uC774\uBCA4\uD2B8 \uC911\uC2EC\uC758 \uBBF8\uB9AC\uBCF4\uAE30\uB9CC \uBCF4\uC77C \uC218 \uC788\uC2B5\uB2C8\uB2E4."
      },
      {
        title: "\uC544\uC9C1 \uC774 \uD654\uBA74\uC5D0\uC11C \uD558\uC9C0 \uC54A\uB294 \uAC83",
        meta: "\uBCA0\uD0C0 \uBC94\uC704 \uBC16",
        description: "Google Sheets \uC9C1\uC811 \uC4F0\uAE30, \uADDC\uCE59 \uD3B8\uC9D1, \uC804\uCCB4 \uAE30\uAC04 \uD544\uD130\uC640 \uB2E4\uC911 \uCC28\uC2DC drill-down\uC740 \uC544\uC9C1 \uB123\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
        tone: "warning"
      }
    ];
  }
  buildStarRuleRow(rule, summary) {
    return {
      title: rule.label,
      meta: [
        formatSignedPoints(rule.delta),
        getStarVisibilityLabel(rule.visibility),
        summary ? `${summary.eventCount}\uAC74` : ""
      ].filter(Boolean).join(" \xB7 "),
      description: [
        getStarCategoryLabel(rule.category),
        summary && summary.automaticCount > 0 ? `\uC790\uB3D9 ${summary.automaticCount}\uAC74` : "",
        summary && summary.manualCount > 0 ? `\uC218\uB3D9 ${summary.manualCount}\uAC74` : "",
        getStarRuleSourceSummary(rule.sources),
        getStarAutoCriteriaSummary(rule.autoCriteria),
        rule.sources.includes("manual") ? rule.allowCustomDelta ? "\uD589\uBCC4 \uC810\uC218 \uB36E\uC5B4\uC4F0\uAE30 \uD5C8\uC6A9" : "\uD589\uBCC4 \uC810\uC218\uB294 \uAE30\uBCF8\uAC12 \uACE0\uC815" : "\uC790\uB3D9 \uC801\uB9BD \uC804\uC6A9",
        rule.description
      ].filter(Boolean).join(" / "),
      tone: rule.delta < 0 ? "warning" : "positive"
    };
  }
  buildStarAdjustmentTotalRow(total) {
    return {
      title: formatStudentLabel(total.student),
      meta: `\uC120\uC0DD\uB2D8 \uC870\uC815 ${formatSignedPoints(total.hiddenAdjustmentTotal)}`,
      description: [
        `\uCD1D ${formatSignedPoints(total.total)}`,
        `\uD559\uC0DD \uACF5\uAC1C ${formatSignedPoints(total.visibleTotal)}`,
        `\uC774\uBCA4\uD2B8 ${total.eventCount}\uAC74`
      ].join(" / "),
      tone: total.hiddenAdjustmentTotal < 0 ? "warning" : "positive"
    };
  }
  getTeacherStatusPrimaryValue(mode, sourceState) {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return sourceState?.status === "invalid" ? "\uD615\uC2DD \uD655\uC778" : "\uD655\uC778 \uD544\uC694";
    }
    const classroomLabel = getAggregateDisplayClassroom(sourceState.data);
    if (classroomLabel) {
      return classroomLabel;
    }
    if (mode === "lesson" && sourceState.data.type === "lesson-summary" && sourceState.data.subject) {
      return sourceState.data.subject;
    }
    if (mode === "star" || sourceState.data.type === "star-ledger") {
      return "\uC77D\uAE30 \uC804\uC6A9";
    }
    return `${sourceState.data.responseCount}\uAC74`;
  }
  getTeacherStatusPrimaryMeta(mode, sourceState) {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return sourceState?.message || "\uC9D1\uACC4 \uD30C\uC77C \uC0C1\uD0DC\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.";
    }
    if (mode === "class" && sourceState.data.type === "class-summary") {
      return [
        `\uC751\uB2F5 ${sourceState.data.responseCount}\uAC74`,
        sourceState.data.periodLabel
      ].filter(Boolean).join(" \xB7 ");
    }
    if (mode === "lesson" && sourceState.data.type === "lesson-summary") {
      const explorer = this.getLessonExplorerState(sourceState.data);
      if (!explorer.selectedGroup) {
        return [
          explorer.selectedSubject.subject || "\uC218\uC5C5",
          "\uC870\uAC74\uC5D0 \uB9DE\uB294 \uC218\uC5C5 \uADF8\uB8F9 \uC5C6\uC74C"
        ].filter(Boolean).join(" \xB7 ");
      }
      const selectedSummary = explorer.selectedGroup;
      return [
        selectedSummary.label,
        `\uC751\uB2F5 ${selectedSummary.responseCount}\uAC74`,
        selectedSummary.supportStudents.length > 0 ? `\uBCF4\uCDA9 \uC9C0\uB3C4 ${selectedSummary.supportStudents.length}\uBA85` : ""
      ].filter(Boolean).join(" \xB7 ");
    }
    if (mode === "star" && sourceState.data.type === "star-ledger") {
      const enabledRules = getEnabledStarRules(sourceState.data.rules);
      return [
        sourceState.data.periodLabel,
        `\uADDC\uCE59 ${enabledRules.length}\uAC1C`,
        `\uD559\uC0DD ${sourceState.data.totals.length}\uBA85`
      ].join(" \xB7 ");
    }
    return sourceState.data.periodLabel || "\uBC94\uC704 \uC815\uBCF4 \uC5C6\uC74C";
  }
  getTeacherStatusHint(mode, sourceState) {
    const actionHint = this.teacherFocusMode === mode ? "\uB2E4\uC2DC \uB204\uB974\uBA74 \uC804\uCCB4 \uBCF4\uAE30" : "\uB204\uB974\uBA74 \uC774 \uC601\uC5ED\uB9CC \uBCF4\uAE30";
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return `${actionHint} \xB7 \uCC98\uC74C \uC5F0\uACB0 \uC911\uC774\uB77C\uBA74 \uC815\uC0C1\uC785\uB2C8\uB2E4. \uC9D1\uACC4 \uD30C\uC77C \uC0DD\uC131\uACFC \uACBD\uB85C\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.`;
    }
    const suffix = sourceState.data.type === "star-ledger" ? [
      sourceState.data.eventCount > 0 ? `\uC774\uBCA4\uD2B8 ${sourceState.data.eventCount}\uAC74` : "\uC774\uBCA4\uD2B8 \uC5C6\uC74C",
      `\uC9D1\uACC4 ${formatDateLabel(sourceState.data.generatedAt, "\uC2DC\uAC01 \uC815\uBCF4 \uC5C6\uC74C")}`
    ].join(" \xB7 ") : [
      `\uC9D1\uACC4 ${formatDateLabel(sourceState.data.generatedAt, "\uC2DC\uAC01 \uC815\uBCF4 \uC5C6\uC74C")}`,
      sourceState.data.excludedResponseCount > 0 ? `\uC81C\uC678 ${sourceState.data.excludedResponseCount}\uAC74` : ""
    ].filter(Boolean).join(" \xB7 ");
    switch (mode) {
      case "class":
        return `${actionHint} \xB7 \uC815\uC11C\uC640 \uBAA9\uD45C \uC0C1\uD0DC \uD655\uC778 \xB7 ${suffix}`;
      case "lesson":
        return `${actionHint} \xB7 \uBCF4\uCDA9 \uC9C0\uB3C4\uC640 \uBCF5\uC2B5/\uC218\uD589 \uC0C1\uD0DC\uB97C \uBA3C\uC800 \uD655\uC778 \xB7 ${suffix}`;
      case "star":
        return `${actionHint} \xB7 \uACF5\uAC1C \uC810\uC218\uC640 \uC228\uAE40 \uC870\uC815 \uC0C1\uD0DC\uB97C \uC77D\uAE30 \uC804\uC6A9\uC73C\uB85C \uD655\uC778 \xB7 ${suffix}`;
    }
  }
  getTeacherSourceDescription() {
    return "\uBB38\uC81C\uAC00 \uC0DD\uAE30\uBA74 \uC774 \uC139\uC158\uC5D0\uC11C \uC9D1\uACC4 \uD30C\uC77C \uACBD\uB85C, \uC9D1\uACC4 \uC2DC\uAC01, \uC6D0\uBCF8 \uC2DC\uD2B8 \uC774\uB984\uC744 \uD655\uC778\uD569\uB2C8\uB2E4.";
  }
  shouldShowTeacherSection(section) {
    return this.teacherFocusMode === "overview" || this.teacherFocusMode === section;
  }
  buildClassSectionDescription(sourceState) {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return "\uD559\uAE09 \uC9D1\uACC4\uAC00 \uC5F0\uACB0\uB418\uBA74 \uC815\uC11C \uC0C1\uD0DC, \uBAA9\uD45C \uB2EC\uC131, \uB3C4\uC6C0 \uD544\uC694 \uD559\uC0DD, \uCE6D\uCC2C \uD6C4\uBCF4\uB97C \uC5EC\uAE30\uC11C \uD655\uC778\uD569\uB2C8\uB2E4.";
    }
    return [
      sourceState.data.periodLabel,
      `\uC751\uB2F5 ${sourceState.data.responseCount}\uAC74`,
      sourceState.data.supportStudents.length > 0 ? `\uC8FC\uC758 ${sourceState.data.supportStudents.length}\uBA85` : "\uC8FC\uC758 \uD559\uC0DD \uC5C6\uC74C",
      sourceState.data.praiseCandidates.length > 0 ? `\uCE6D\uCC2C \uD6C4\uBCF4 ${sourceState.data.praiseCandidates.length}\uBA85` : "",
      sourceState.data.excludedResponseCount > 0 ? `\uC81C\uC678 ${sourceState.data.excludedResponseCount}\uAC74` : ""
    ].filter(Boolean).join(" \xB7 ");
  }
  buildLessonSectionDescription(sourceState) {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return "\uC218\uC5C5 \uC9D1\uACC4\uAC00 \uC5F0\uACB0\uB418\uBA74 \uC7AC\uC124\uBA85 \uD544\uC694\uD55C \uAC1C\uB150, \uC815\uC624\uB2F5, \uBCF5\uC2B5/\uC218\uD589 \uC0C1\uD0DC\uB97C \uC5EC\uAE30\uC11C \uD655\uC778\uD569\uB2C8\uB2E4.";
    }
    const explorer = this.getLessonExplorerState(sourceState.data);
    const { selectedSubject, selectedGroup } = explorer;
    if (!selectedGroup) {
      return [
        selectedSubject.subject || sourceState.data.subject,
        this.buildLessonScopeDescription(explorer, {
          includeSubject: false,
          includeSubjectCount: false,
          includeCurrentGroup: false
        }),
        "\uC870\uAC74\uC5D0 \uB9DE\uB294 \uC218\uC5C5 \uADF8\uB8F9 \uC5C6\uC74C"
      ].filter(Boolean).join(" \xB7 ");
    }
    const followUpCount = this.getAggregateCountByLabel(selectedGroup.assignmentSummary, "\uBD80\uBD84 \uC644\uB8CC") + this.getAggregateCountByLabel(selectedGroup.assignmentSummary, "\uBBF8\uC644\uB8CC");
    return [
      selectedGroup.label,
      this.buildLessonScopeDescription(explorer, {
        includeSubject: false,
        includeCurrentGroup: false
      }),
      `\uC751\uB2F5 ${selectedGroup.responseCount}\uAC74`,
      selectedGroup.supportStudents.length > 0 ? `\uBCF4\uCDA9 \uC9C0\uB3C4 ${selectedGroup.supportStudents.length}\uBA85` : "\uBCF4\uCDA9 \uC9C0\uB3C4 \uB300\uC0C1 \uC5C6\uC74C",
      followUpCount > 0 ? `\uD6C4\uC18D \uD655\uC778 ${followUpCount}\uBA85` : "",
      selectedGroup.excludedResponseCount > 0 ? `\uC81C\uC678 ${selectedGroup.excludedResponseCount}\uAC74` : ""
    ].filter(Boolean).join(" \xB7 ");
  }
  buildStarSectionDescription(sourceState) {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return "\uBCC4\uC810 \uC9D1\uACC4\uAC00 \uC5F0\uACB0\uB418\uBA74 \uC77D\uAE30 \uC804\uC6A9 \uC694\uC57D, \uCD5C\uADFC \uC774\uBCA4\uD2B8, \uACF5\uAC1C/\uBE44\uACF5\uAC1C \uAD6C\uBD84\uC744 \uC5EC\uAE30\uC11C \uD655\uC778\uD569\uB2C8\uB2E4.";
    }
    const enabledRules = getEnabledStarRules(sourceState.data.rules);
    const teacherOnlyRules = enabledRules.filter((rule) => rule.visibility === "teacher");
    const activeRuleSummaryCount = sourceState.data.ruleSummary.filter((item) => item.eventCount > 0).length;
    return [
      sourceState.data.periodLabel,
      `\uADDC\uCE59 ${enabledRules.length}\uAC1C`,
      activeRuleSummaryCount > 0 ? `\uBC1C\uC0DD \uADDC\uCE59 ${activeRuleSummaryCount}\uAC1C` : "",
      `\uD559\uC0DD ${sourceState.data.totals.length}\uBA85`,
      teacherOnlyRules.length > 0 ? `\uC120\uC0DD\uB2D8 \uD655\uC778 ${teacherOnlyRules.length}\uAC1C` : "",
      `\uC790\uB3D9 ${getAutomaticStarEventCount(sourceState.data.sourceSummary)}\uAC74`,
      sourceState.data.sourceSummary.manual > 0 ? `\uC218\uB3D9/\uC77C\uAD04 ${sourceState.data.sourceSummary.manual}\uAC74` : ""
    ].filter(Boolean).join(" \xB7 ");
  }
  buildResponseCountDescription(summary) {
    if (summary.excludedResponseCount > 0) {
      return `${summary.periodLabel} / \uC81C\uC678 ${summary.excludedResponseCount}\uAC74`;
    }
    return `${summary.periodLabel} / \uBC18\uC601 \uC751\uB2F5 \uAE30\uC900`;
  }
  buildStarEventRow(event, rules) {
    const rule = rules.find((item) => item.ruleId === event.ruleId);
    const sourceLabel = getStarEventSourceLabel(event);
    const timeLabel = formatDateLabel(event.occurredAt, "\uC2DC\uAC01 \uC815\uBCF4 \uC5C6\uC74C");
    return {
      title: `${rule?.label ?? "\uADDC\uCE59 \uC815\uBCF4 \uC5C6\uC74C"} \xB7 ${formatStudentLabel(event.student)}`,
      meta: [
        formatSignedPoints(event.delta),
        getStarVisibilityLabel(event.visibility),
        sourceLabel
      ].join(" \xB7 "),
      description: [
        getStarCategoryLabel(event.category),
        timeLabel,
        event.actor ? `\uC120\uC0DD\uB2D8 ${event.actor}` : "",
        event.batchId ? `batch ${event.batchId}` : "",
        event.note || rule?.description || "\uC124\uBA85 \uC5C6\uC74C"
      ].filter(Boolean).join(" / "),
      tone: event.delta < 0 ? "warning" : "positive"
    };
  }
  buildStarTotalRow(total) {
    return {
      title: formatStudentLabel(total.student),
      meta: `\uCD1D ${formatSignedPoints(total.total)}`,
      description: [
        `\uD559\uC0DD \uACF5\uAC1C ${formatSignedPoints(total.visibleTotal)}`,
        `\uC120\uC0DD\uB2D8 \uC870\uC815 ${formatSignedPoints(total.hiddenAdjustmentTotal)}`,
        `\uC774\uBCA4\uD2B8 ${total.eventCount}\uAC74`
      ].join(" / "),
      tone: total.hiddenAdjustmentTotal < 0 ? "warning" : "positive"
    };
  }
  getAggregateEmptyStateTitle(sourceState) {
    if (!sourceState) {
      return "\uC9D1\uACC4 \uC5F0\uACB0\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694";
    }
    const label = this.getTeacherAggregateLabel(sourceState.kind);
    switch (sourceState.status) {
      case "missing":
        return `${label}\uC774 \uC544\uC9C1 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4`;
      case "invalid":
        return `${label} \uD615\uC2DD\uC744 \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694`;
      case "error":
        return `${label}\uC744 \uC77D\uB294 \uC911 \uBB38\uC81C\uAC00 \uC0DD\uACBC\uC2B5\uB2C8\uB2E4`;
      default:
        return `${label}\uC744 \uD45C\uC2DC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4`;
    }
  }
  getAggregateEmptyStateMessage(emptyMessage, sourceState) {
    if (!sourceState) {
      return emptyMessage;
    }
    if (sourceState.status === "invalid") {
      return "\uD30C\uC77C\uC740 \uCC3E\uC558\uC9C0\uB9CC classpage\uAC00 \uC77D\uB294 \uD615\uC2DD\uACFC \uB9DE\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC9D1\uACC4 \uD30C\uC77C\uC744 \uB2E4\uC2DC \uC0DD\uC131\uD558\uAC70\uB098 \uC800\uC7A5 \uB0B4\uC6A9\uC744 \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694.";
    }
    if (sourceState.status === "error") {
      return "\uC9D1\uACC4 \uD30C\uC77C\uC744 \uC77D\uB294 \uB3D9\uC548 \uBB38\uC81C\uAC00 \uC0DD\uACBC\uC2B5\uB2C8\uB2E4. \uCD5C\uADFC \uB3D9\uAE30\uD654\uC640 \uD30C\uC77C \uB0B4\uC6A9\uC744 \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694.";
    }
    return emptyMessage;
  }
  getAggregateEmptyStateTips(sourceState) {
    if (!sourceState) {
      return [];
    }
    const generationTip = sourceState.kind === "class" ? "\uD559\uAE09 \uC9D1\uACC4\uB97C \uD55C \uBC88 \uC0DD\uC131\uD55C \uB4A4 class-summary.json \uACBD\uB85C\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694." : sourceState.kind === "lesson" ? "\uC218\uC5C5 \uC9D1\uACC4\uB97C \uD55C \uBC88 \uC0DD\uC131\uD55C \uB4A4 lesson-summary.json \uACBD\uB85C\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694." : "\uBCC4\uC810 \uC9D1\uACC4\uB97C \uD55C \uBC88 \uC0DD\uC131\uD55C \uB4A4 star-ledger.json \uACBD\uB85C\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.";
    if (sourceState.status === "missing") {
      return [
        "\uCC98\uC74C \uC5F0\uACB0 \uC911\uC774\uB77C\uBA74 \uBE48 \uD654\uBA74\uC774 \uC815\uC0C1\uC785\uB2C8\uB2E4.",
        generationTip
      ];
    }
    if (sourceState.status === "invalid") {
      return [
        "\uC9D1\uACC4 \uD30C\uC77C \uC804\uCCB4\uB97C \uADF8\uB300\uB85C \uC800\uC7A5\uD588\uB294\uC9C0 \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
        "\uC608\uC804 \uD615\uC2DD \uD30C\uC77C\uC774\uB77C\uBA74 \uCD5C\uC2E0 \uC9D1\uACC4 \uACB0\uACFC\uB85C \uB2E4\uC2DC \uBC14\uAFD4 \uC8FC\uC138\uC694."
      ];
    }
    if (sourceState.status === "error") {
      return [
        "\uBCFC\uD2B8 \uC548 \uD30C\uC77C \uACBD\uB85C\uC640 \uB3D9\uAE30\uD654 \uC0C1\uD0DC\uB97C \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
        "\uD30C\uC77C\uC744 \uB2E4\uC2DC \uC800\uC7A5\uD558\uAC70\uB098 \uC9D1\uACC4\uB97C \uB2E4\uC2DC \uC0DD\uC131\uD558\uBA74 \uD574\uACB0\uB418\uB294 \uACBD\uC6B0\uAC00 \uB9CE\uC2B5\uB2C8\uB2E4."
      ];
    }
    return [];
  }
  getSourceStatusLabel(status) {
    switch (status) {
      case "loaded":
        return "\uC5F0\uACB0\uB428";
      case "missing":
        return "\uC5F0\uACB0 \uD544\uC694";
      case "invalid":
        return "\uD615\uC2DD \uD655\uC778";
      default:
        return "\uC624\uB958";
    }
  }
};
var ClassPageSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    const { settings } = this.plugin;
    containerEl.empty();
    containerEl.createEl("h2", { text: "classpage \uC124\uC815" });
    containerEl.createEl("p", {
      text: "\uD559\uC0DD\uC6A9 \uD654\uBA74\uC740 \uC815\uC801 \uBB38\uAD6C\uC640 Google Form \uB9C1\uD06C\uB97C, \uC120\uC0DD\uB2D8 \uD654\uBA74\uC740 \uC9D1\uACC4 JSON \uACBD\uB85C\uB97C \uC77D\uC2B5\uB2C8\uB2E4. \uD559\uC0DD \uC751\uB2F5 \uC6D0\uBCF8\uC774\uB098 \uC9D1\uACC4 \uB85C\uC9C1 \uC790\uCCB4\uB294 \uC774 \uD50C\uB7EC\uADF8\uC778\uC5D0\uC11C \uC218\uC815\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
    });
    new import_obsidian2.Setting(containerEl).setName("\uBC14\uB85C \uC5F4\uAE30").setDesc("\uD604\uC7AC \uC124\uC815\uC73C\uB85C \uAD50\uC2E4 \uD398\uC774\uC9C0\uB97C \uBC14\uB85C \uC5F4\uC5B4 \uD655\uC778\uD569\uB2C8\uB2E4.").addButton((button) => {
      button.setButtonText("\uAD50\uC2E4 \uD398\uC774\uC9C0 \uC5F4\uAE30");
      button.setCta();
      button.onClick(async () => {
        await this.plugin.activateView();
      });
    });
    this.addSettingsSection(
      "\uD559\uC0DD\uC6A9 \uD398\uC774\uC9C0",
      "\uD559\uC0DD\uC6A9 \uD398\uC774\uC9C0\uB294 classpage \uB0B4\uBD80 \uC124\uC815\uAC12\uB9CC \uC0AC\uC6A9\uD569\uB2C8\uB2E4. \uC544\uB798\uB97C \uBC14\uAFB8\uBA74 \uD559\uC0DD\uC774 \uBCF4\uB294 \uBB38\uAD6C\uC640 \uB9C1\uD06C\uAC00 \uBC14\uB01D\uB2C8\uB2E4."
    );
    this.addTextSetting(
      "\uC81C\uBAA9",
      "\uD559\uC0DD\uC6A9 \uD398\uC774\uC9C0 \uC0C1\uB2E8 \uC81C\uBAA9\uC785\uB2C8\uB2E4.",
      settings.studentPage.title,
      async (value) => {
        settings.studentPage.title = value.trim() || DEFAULT_SETTINGS.studentPage.title;
        await this.plugin.saveSettings();
      },
      "\uC608: 3\uD559\uB144 2\uBC18 \uAD50\uC2E4 \uD398\uC774\uC9C0"
    );
    this.addTextSetting(
      "\uC124\uBA85",
      "\uD559\uC0DD\uC6A9 \uD398\uC774\uC9C0 \uC18C\uAC1C \uBB38\uAD6C\uC785\uB2C8\uB2E4.",
      settings.studentPage.description,
      async (value) => {
        settings.studentPage.description = value.trim();
        await this.plugin.saveSettings();
      }
    );
    this.addTextSetting(
      "\uC0C1\uD0DC \uBB38\uAD6C",
      "\uD559\uC0DD\uC6A9 \uD654\uBA74\uC758 \uAD6C\uC870\uB97C \uC124\uBA85\uD558\uB294 \uC9E7\uC740 \uBB38\uAD6C\uC785\uB2C8\uB2E4.",
      settings.studentPage.statusMessage,
      async (value) => {
        settings.studentPage.statusMessage = value.trim();
        await this.plugin.saveSettings();
      }
    );
    this.addSettingsSection(
      "\uC624\uB298\uC758 \uD560 \uC77C",
      "\uD559\uC0DD\uC6A9 \uD398\uC774\uC9C0\uC758 \uC815\uC801 \uD560 \uC77C \uBAA9\uB85D\uC785\uB2C8\uB2E4. \uD55C \uC904\uC774 \uD55C \uD56D\uBAA9\uC785\uB2C8\uB2E4."
    );
    this.addTextSetting(
      "\uC81C\uBAA9",
      "\uD559\uC0DD\uC6A9 \uD560 \uC77C \uCE74\uB4DC \uC81C\uBAA9\uC785\uB2C8\uB2E4.",
      settings.studentPage.today.title,
      async (value) => {
        settings.studentPage.today.title = value.trim() || DEFAULT_SETTINGS.studentPage.today.title;
        await this.plugin.saveSettings();
      }
    );
    this.addTextareaSetting(
      "\uB0B4\uC6A9",
      "\uD55C \uC904\uC5D0 \uD55C \uD56D\uBAA9\uC529 \uC785\uB825\uD569\uB2C8\uB2E4.",
      settings.studentPage.today.items,
      async (items) => {
        settings.studentPage.today.items = items;
        await this.plugin.saveSettings();
      },
      "\uC608: \uB4F1\uAD50 \uD6C4 \uD559\uAE09\uC6A9 \uD3FC \uC81C\uCD9C"
    );
    this.addSettingsSection(
      "\uACF5\uC9C0\uC0AC\uD56D",
      "\uD559\uC0DD\uC6A9 \uD398\uC774\uC9C0\uC758 \uC815\uC801 \uACF5\uC9C0 \uBAA9\uB85D\uC785\uB2C8\uB2E4. \uC2E4\uC2DC\uAC04 \uC9D1\uACC4\uAC00 \uC544\uB2C8\uB77C \uC6B4\uC601\uC790\uAC00 \uC785\uB825\uD558\uB294 \uAC12\uC785\uB2C8\uB2E4."
    );
    this.addTextSetting(
      "\uC81C\uBAA9",
      "\uD559\uC0DD\uC6A9 \uACF5\uC9C0 \uCE74\uB4DC \uC81C\uBAA9\uC785\uB2C8\uB2E4.",
      settings.studentPage.notices.title,
      async (value) => {
        settings.studentPage.notices.title = value.trim() || DEFAULT_SETTINGS.studentPage.notices.title;
        await this.plugin.saveSettings();
      }
    );
    this.addTextareaSetting(
      "\uB0B4\uC6A9",
      "\uD55C \uC904\uC5D0 \uD55C \uD56D\uBAA9\uC529 \uC785\uB825\uD569\uB2C8\uB2E4.",
      settings.studentPage.notices.items,
      async (items) => {
        settings.studentPage.notices.items = items;
        await this.plugin.saveSettings();
      },
      "\uC608: \uC624\uB298 5\uAD50\uC2DC \uD6C4 \uCCAD\uC18C \uC810\uAC80"
    );
    this.addSettingsSection(
      "\uD559\uAE09\uC6A9 \uD3FC",
      "\uD559\uC0DD\uC774 \uB20C\uB7EC \uC774\uB3D9\uD558\uB294 \uC2E4\uC81C Google Form \uB9C1\uD06C\uC640 \uBC84\uD2BC \uBB38\uAD6C\uC785\uB2C8\uB2E4."
    );
    this.buildFormSettings(
      settings.studentPage.forms.classForm,
      DEFAULT_SETTINGS.studentPage.forms.classForm,
      async () => {
        await this.plugin.saveSettings();
      }
    );
    this.addSettingsSection(
      "\uC218\uC5C5\uC6A9 \uD3FC",
      "\uD559\uC0DD\uC774 \uC218\uC5C5 \uD6C4 \uC81C\uCD9C\uD558\uB294 Google Form \uB9C1\uD06C\uC640 \uBC84\uD2BC \uBB38\uAD6C\uC785\uB2C8\uB2E4."
    );
    this.buildFormSettings(
      settings.studentPage.forms.lessonForm,
      DEFAULT_SETTINGS.studentPage.forms.lessonForm,
      async () => {
        await this.plugin.saveSettings();
      }
    );
    this.addSettingsSection(
      "\uC120\uC0DD\uB2D8 \uD398\uC774\uC9C0",
      "\uC120\uC0DD\uB2D8 \uD654\uBA74\uC740 \uC6D0\uBCF8 \uC751\uB2F5\uC774 \uC544\uB2C8\uB77C \uC9D1\uACC4 \uACB0\uACFC\uB97C \uC77D\uC2B5\uB2C8\uB2E4. \uC544\uB798 \uAC12\uC740 \uD45C\uC2DC \uB808\uC774\uC5B4 \uC124\uBA85\uACFC \uC9D1\uACC4 \uACBD\uB85C\uB9CC \uBC14\uAFC9\uB2C8\uB2E4."
    );
    this.addTextSetting(
      "\uC81C\uBAA9",
      "\uC120\uC0DD\uB2D8 \uD398\uC774\uC9C0 \uC0C1\uB2E8 \uC81C\uBAA9\uC785\uB2C8\uB2E4.",
      settings.teacherPage.title,
      async (value) => {
        settings.teacherPage.title = value.trim() || DEFAULT_SETTINGS.teacherPage.title;
        await this.plugin.saveSettings();
      }
    );
    this.addTextSetting(
      "\uC124\uBA85",
      "\uC120\uC0DD\uB2D8 \uD398\uC774\uC9C0\uC758 \uC5ED\uD560\uC744 \uC124\uBA85\uD558\uB294 \uBB38\uAD6C\uC785\uB2C8\uB2E4.",
      settings.teacherPage.description,
      async (value) => {
        settings.teacherPage.description = value.trim();
        await this.plugin.saveSettings();
      }
    );
    this.addTextSetting(
      "\uC0C1\uD0DC \uBB38\uAD6C",
      "\uC0C1\uB2E8 \uBC30\uC9C0\uC5D0 \uC9E7\uAC8C \uD45C\uC2DC\uD560 \uC548\uB0B4 \uBB38\uAD6C\uC785\uB2C8\uB2E4.",
      settings.teacherPage.statusMessage,
      async (value) => {
        settings.teacherPage.statusMessage = value.trim();
        await this.plugin.saveSettings();
      }
    );
    this.addTextSetting(
      "\uD559\uAE09 \uC9D1\uACC4 \uC81C\uBAA9",
      "\uD559\uAE09\uC6A9 \uD3FC \uC9D1\uACC4 \uC139\uC158 \uC81C\uBAA9\uC785\uB2C8\uB2E4.",
      settings.teacherPage.classSummaryTitle,
      async (value) => {
        settings.teacherPage.classSummaryTitle = value.trim() || DEFAULT_SETTINGS.teacherPage.classSummaryTitle;
        await this.plugin.saveSettings();
      }
    );
    this.addTextSetting(
      "\uC218\uC5C5 \uC9D1\uACC4 \uC81C\uBAA9",
      "\uC218\uC5C5\uC6A9 \uD3FC \uC9D1\uACC4 \uC139\uC158 \uC81C\uBAA9\uC785\uB2C8\uB2E4.",
      settings.teacherPage.lessonSummaryTitle,
      async (value) => {
        settings.teacherPage.lessonSummaryTitle = value.trim() || DEFAULT_SETTINGS.teacherPage.lessonSummaryTitle;
        await this.plugin.saveSettings();
      }
    );
    this.addTextSetting(
      "\uBCC4\uC810 \uC139\uC158 \uC81C\uBAA9",
      "\uC120\uC0DD\uB2D8\uC6A9 \uBCC4\uC810\uBAA8\uB4DC \uC139\uC158 \uC81C\uBAA9\uC785\uB2C8\uB2E4.",
      settings.teacherPage.starLedgerTitle,
      async (value) => {
        settings.teacherPage.starLedgerTitle = value.trim() || DEFAULT_SETTINGS.teacherPage.starLedgerTitle;
        await this.plugin.saveSettings();
      }
    );
    this.addSettingsSection(
      "\uC9D1\uACC4 JSON \uACBD\uB85C",
      "\uC5EC\uAE30\uC11C\uB294 \uC9D1\uACC4 \uACB0\uACFC \uD30C\uC77C \uACBD\uB85C\uB9CC \uC124\uC815\uD569\uB2C8\uB2E4. Google Sheets\uB098 Apps Script\uC758 \uACC4\uC0B0 \uB85C\uC9C1\uC740 classpage \uBC16\uC5D0\uC11C \uAD00\uB9AC\uD569\uB2C8\uB2E4."
    );
    this.addTextSetting(
      "\uD559\uAE09 \uC9D1\uACC4 JSON \uACBD\uB85C",
      "\uD559\uAE09\uC6A9 \uD3FC \uC9D1\uACC4 \uACB0\uACFC JSON \uD30C\uC77C\uC758 \uBCFC\uD2B8 \uB0B4\uBD80 \uACBD\uB85C\uC785\uB2C8\uB2E4.",
      settings.teacherPage.sources.classSummaryPath,
      async (value) => {
        settings.teacherPage.sources.classSummaryPath = value.trim() || DEFAULT_SETTINGS.teacherPage.sources.classSummaryPath;
        await this.plugin.saveSettings();
      },
      "classpage-data/class-summary.json"
    );
    this.addTextSetting(
      "\uC218\uC5C5 \uC9D1\uACC4 JSON \uACBD\uB85C",
      "\uC218\uC5C5\uC6A9 \uD3FC \uC9D1\uACC4 \uACB0\uACFC JSON \uD30C\uC77C\uC758 \uBCFC\uD2B8 \uB0B4\uBD80 \uACBD\uB85C\uC785\uB2C8\uB2E4.",
      settings.teacherPage.sources.lessonSummaryPath,
      async (value) => {
        settings.teacherPage.sources.lessonSummaryPath = value.trim() || DEFAULT_SETTINGS.teacherPage.sources.lessonSummaryPath;
        await this.plugin.saveSettings();
      },
      "classpage-data/lesson-summary.json"
    );
    this.addTextSetting(
      "\uBCC4\uC810 JSON \uACBD\uB85C",
      "\uBCC4\uC810 \uC9D1\uACC4 JSON \uD30C\uC77C\uC758 \uBCFC\uD2B8 \uB0B4\uBD80 \uACBD\uB85C\uC785\uB2C8\uB2E4.",
      settings.teacherPage.sources.starLedgerPath,
      async (value) => {
        settings.teacherPage.sources.starLedgerPath = value.trim() || DEFAULT_SETTINGS.teacherPage.sources.starLedgerPath;
        await this.plugin.saveSettings();
      },
      "classpage-data/star-ledger.json"
    );
  }
  buildFormSettings(target, defaults, onSave) {
    this.addTextSetting(
      "Google Form \uB9C1\uD06C",
      "\uD559\uC0DD\uC774 \uC774\uB3D9\uD560 \uC2E4\uC81C URL\uC785\uB2C8\uB2E4.",
      target.url,
      async (value) => {
        target.url = value.trim();
        await onSave();
      },
      defaults.url
    );
    this.addTextSetting("\uC81C\uBAA9", "\uBC84\uD2BC \uCE74\uB4DC\uC758 \uC81C\uBAA9\uC785\uB2C8\uB2E4.", target.title, async (value) => {
      target.title = value.trim() || defaults.title;
      await onSave();
    });
    this.addTextSetting(
      "\uC124\uBA85",
      "\uD559\uC0DD\uC5D0\uAC8C \uBCF4\uC5EC\uC904 \uAC04\uB2E8\uD55C \uC124\uBA85\uC785\uB2C8\uB2E4.",
      target.description,
      async (value) => {
        target.description = value.trim();
        await onSave();
      }
    );
    this.addTextSetting(
      "\uBC84\uD2BC \uBB38\uAD6C",
      "\uBC84\uD2BC\uC5D0 \uD45C\uC2DC\uD560 \uBB38\uAD6C\uC785\uB2C8\uB2E4.",
      target.buttonLabel,
      async (value) => {
        target.buttonLabel = value.trim() || defaults.buttonLabel;
        await onSave();
      }
    );
    this.addTextSetting(
      "\uC548\uB0B4 \uBB38\uAD6C",
      "\uC81C\uCD9C \uC2DC\uC810\uC774\uB098 \uAC04\uB2E8\uD55C \uC0C1\uD0DC \uBB38\uAD6C\uC785\uB2C8\uB2E4.",
      target.helperText,
      async (value) => {
        target.helperText = value.trim();
        await onSave();
      }
    );
  }
  addSettingsSection(title, description) {
    this.containerEl.createEl("h3", { text: title });
    this.containerEl.createEl("p", { text: description });
  }
  addTextSetting(name, desc, value, onChange, placeholder = "") {
    new import_obsidian2.Setting(this.containerEl).setName(name).setDesc(desc).addText((text) => {
      text.setValue(value);
      if (placeholder) {
        text.setPlaceholder(placeholder);
      }
      text.onChange(onChange);
    });
  }
  addTextareaSetting(name, desc, items, onChange, placeholder = "") {
    new import_obsidian2.Setting(this.containerEl).setName(name).setDesc(desc).addTextArea((text) => {
      text.setValue(items.join("\n"));
      if (placeholder) {
        text.setPlaceholder(placeholder);
      }
      text.inputEl.rows = 5;
      text.inputEl.cols = 40;
      text.onChange(async (value) => {
        const lines = value.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
        await onChange(lines);
      });
    });
  }
};
function formatDateLabel(value, fallback = "\uC9D1\uACC4 \uC2DC\uAC01 \uC815\uBCF4 \uC5C6\uC74C") {
  if (!value) {
    return fallback;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || isPlaceholderDate(date)) {
    return fallback;
  }
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}
function formatStudentLabel(student) {
  const label = [
    formatClassroomLabel(student.classroom),
    formatStudentNumberLabel(student.number),
    student.name.trim()
  ].filter(Boolean).join(" \xB7 ");
  return label || "\uD559\uC0DD \uC815\uBCF4 \uC5C6\uC74C";
}
function formatClassroomLabel(classroom) {
  const trimmed = classroom.trim();
  if (!trimmed) {
    return "";
  }
  const normalized = trimmed.replace(/\s+/g, " ");
  const dashMatch = normalized.match(/^(\d+)\s*[-/]\s*(\d+)$/);
  if (dashMatch) {
    return `${dashMatch[1]}\uD559\uB144 ${dashMatch[2]}\uBC18`;
  }
  const gradeClassMatch = normalized.match(/^(\d+)\s*학년\s*(\d+)\s*반$/);
  if (gradeClassMatch) {
    return `${gradeClassMatch[1]}\uD559\uB144 ${gradeClassMatch[2]}\uBC18`;
  }
  return normalized;
}
function formatStudentNumberLabel(number) {
  const trimmed = number.trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.endsWith("\uBC88") ? trimmed : `${trimmed}\uBC88`;
}
function isPlaceholderDate(date) {
  return date.getTime() <= 0;
}
function formatSignedPoints(points) {
  const prefix = points > 0 ? "+" : "";
  return `${prefix}${points}\uC810`;
}
function getStarCategoryLabel(category) {
  switch (category) {
    case "attendance":
      return "\uCD9C\uACB0";
    case "participation":
      return "\uCC38\uC5EC";
    case "service":
      return "\uC5ED\uD560";
    case "adjustment":
      return "\uC870\uC815";
    default:
      return "\uB9DE\uCDA4";
  }
}
function getStarVisibilityLabel(visibility) {
  return visibility === "teacher" ? "\uC120\uC0DD\uB2D8 \uD655\uC778 \uC804\uC6A9" : "\uD559\uC0DD \uACF5\uAC1C";
}
function getStarSourceLabel(source) {
  switch (source) {
    case "class-form":
      return "\uD559\uAE09\uC6A9 \uD3FC";
    case "lesson-form":
      return "\uC218\uC5C5\uC6A9 \uD3FC";
    case "manual":
      return "\uC218\uB3D9 \uC870\uC815/\uC77C\uAD04 \uBD80\uC5EC";
    default:
      return "\uC2DC\uC2A4\uD15C";
  }
}
function getStarEventSourceLabel(event) {
  if (event.source === "manual") {
    return event.batchId ? "\uC77C\uAD04 \uBD80\uC5EC" : "\uC218\uB3D9 \uC870\uC815";
  }
  return getStarSourceLabel(event.source);
}
function getEnabledStarRules(rules) {
  return rules.filter((rule) => rule.enabled);
}
function hasAutomaticStarSource(sources) {
  return sources.some(
    (source) => source === "class-form" || source === "lesson-form" || source === "system"
  );
}
function getStarRuleSourceSummary(sources) {
  const labels = sources.map((source) => getStarSourceLabel(source)).filter((label, index, array) => array.indexOf(label) === index);
  if (labels.length === 0) {
    return "\uC785\uB825 \uACBD\uB85C \uC5C6\uC74C";
  }
  return `\uC785\uB825 ${labels.join(", ")}`;
}
function getStarAutoCriteriaSummary(criteria) {
  if (!criteria) {
    return "";
  }
  const parts = [];
  if (criteria.assignmentStatusIn.length > 0) {
    parts.push(`\uBCF5\uC2B5/\uC218\uD589 ${criteria.assignmentStatusIn.join("/")}`);
  }
  if (criteria.minimumCorrectCount !== null) {
    parts.push(`\uC815\uB2F5 ${criteria.minimumCorrectCount}\uAC1C \uC774\uC0C1`);
  }
  if (criteria.maximumIncorrectCount !== null) {
    parts.push(`\uC624\uB2F5 ${criteria.maximumIncorrectCount}\uAC1C \uC774\uD558`);
  }
  return parts.length > 0 ? `\uC870\uAC74 ${parts.join(" / ")}` : "";
}
function getAutomaticStarEventCount(summary) {
  return summary["class-form"] + summary["lesson-form"] + summary.system;
}
function getAggregateDisplayClassroom(data) {
  if ("type" in data && data.type === "star-ledger") {
    return formatClassroomLabel(getStarLedgerClassroom(data));
  }
  return formatClassroomLabel(data.classroom);
}
function getStarLedgerClassroom(ledger) {
  if (ledger.classroom?.trim()) {
    return ledger.classroom.trim();
  }
  const classrooms = [
    ...ledger.totals.map((total) => total.student.classroom.trim()),
    ...ledger.recentEvents.map((event) => event.student.classroom.trim())
  ].filter(Boolean);
  if (classrooms.length === 0) {
    return "";
  }
  const uniqueClassrooms = classrooms.filter((value, index, array) => array.indexOf(value) === index);
  return uniqueClassrooms.length === 1 ? uniqueClassrooms[0] : "\uC5EC\uB7EC \uD559\uAE09";
}
function sortStarRulesForDisplay(rules) {
  return rules.slice().sort((left, right) => {
    const manualDiff = Number(right.sources.includes("manual")) - Number(left.sources.includes("manual"));
    if (manualDiff !== 0) {
      return manualDiff;
    }
    const visibilityDiff = Number(left.visibility === "teacher") - Number(right.visibility === "teacher");
    if (visibilityDiff !== 0) {
      return visibilityDiff;
    }
    if (right.delta !== left.delta) {
      return right.delta - left.delta;
    }
    return left.label.localeCompare(right.label, "ko-KR");
  });
}
function sortStarTotals(totals) {
  return totals.slice().sort((left, right) => {
    if (right.visibleTotal !== left.visibleTotal) {
      return right.visibleTotal - left.visibleTotal;
    }
    if (right.total !== left.total) {
      return right.total - left.total;
    }
    return right.eventCount - left.eventCount;
  });
}
function sortStarTotalsByHiddenAdjustment(totals) {
  return totals.slice().sort((left, right) => {
    const hiddenDiff = Math.abs(right.hiddenAdjustmentTotal) - Math.abs(left.hiddenAdjustmentTotal);
    if (hiddenDiff !== 0) {
      return hiddenDiff;
    }
    if (right.total !== left.total) {
      return right.total - left.total;
    }
    return right.eventCount - left.eventCount;
  });
}
function normalizeLookupText(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
function parseLeadingNumber(value) {
  const match = value.match(/^\d+/);
  return match ? Number(match[0]) : 0;
}
