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
    label: "\uACFC\uC81C \uC644\uB8CC",
    category: "participation",
    delta: 1,
    visibility: "student",
    description: "\uC218\uC5C5\uC6A9 \uD3FC\uC758 \uACFC\uC81C \uC218\uD589 \uC815\uB3C4\uAC00 \uC644\uB8CC\uB85C \uBD84\uB958\uB418\uBA74 \uC790\uB3D9 \uC801\uB9BD",
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
    description: "\uC218\uC5C5\uC6A9 \uD3FC\uC5D0\uC11C \uACFC\uC81C \uC644\uB8CC\uC774\uACE0 \uC624\uB2F5\uC774 \uC5C6\uC73C\uBA74 \uC790\uB3D9 \uC801\uB9BD",
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
    description: "\uAD50\uC0AC\uAC00 \uACF5\uAC1C \uAC00\uC810\uC744 \uC218\uB3D9\uC73C\uB85C \uBD80\uC5EC",
    enabled: true,
    sources: ["manual"],
    allowCustomDelta: true,
    autoCriteria: null
  },
  {
    ruleId: "teacher-adjustment",
    label: "\uAD50\uC0AC \uC804\uC6A9 \uC870\uC815",
    category: "adjustment",
    delta: -2,
    visibility: "teacher",
    description: "\uAD50\uC0AC \uB0B4\uBD80 \uC870\uC815\uC6A9 \uAE30\uBCF8 \uADDC\uCE59",
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
    title: "\uAD50\uC0AC\uC6A9 \uD398\uC774\uC9C0",
    description: "\uD559\uAE09, \uC218\uC5C5, \uBCC4\uC810 \uC0C1\uD0DC\uB97C \uBE60\uB974\uAC8C \uD655\uC778\uD569\uB2C8\uB2E4.",
    statusMessage: "\uC0C1\uD0DC \uCE74\uB4DC\uB85C \uD544\uC694\uD55C \uC601\uC5ED\uB9CC \uD655\uC778\uD569\uB2C8\uB2E4.",
    classSummaryTitle: "\uD559\uAE09\uC6A9 \uD3FC \uC9D1\uACC4",
    lessonSummaryTitle: "\uC218\uC5C5\uC6A9 \uD3FC \uC9D1\uACC4",
    starLedgerTitle: "\uBCC4\uC810\uBAA8\uB4DC",
    classSummaryEmptyMessage: "\uD559\uAE09\uC6A9 \uC9D1\uACC4 JSON\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. docs/START_HERE.md\uC758 \uC5F0\uACB0 \uC21C\uC11C\uC640 docs/BEGINNER_SETUP.md\uC758 \uC9D1\uACC4 \uC5F0\uACB0 \uB2E8\uACC4\uB97C \uD655\uC778\uD558\uC138\uC694.",
    lessonSummaryEmptyMessage: "\uC218\uC5C5\uC6A9 \uC9D1\uACC4 JSON\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. docs/START_HERE.md\uC758 \uC5F0\uACB0 \uC21C\uC11C\uC640 docs/BEGINNER_SETUP.md\uC758 \uC9D1\uACC4 \uC5F0\uACB0 \uB2E8\uACC4\uB97C \uD655\uC778\uD558\uC138\uC694.",
    starLedgerEmptyMessage: "\uBCC4\uC810\uBAA8\uB4DC JSON\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. docs/START_HERE.md\uC640 Apps Script\uC758 star-ledger.json \uC0DD\uC131, JSON \uACBD\uB85C \uC124\uC815\uC744 \uD568\uAED8 \uD655\uC778\uD558\uC138\uC694.",
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
  return {
    type: "lesson-summary",
    generatedAt: normalizeOptionalString(summary.generatedAt),
    periodLabel: normalizeString(summary.periodLabel, "\uC218\uC5C5 \uC9D1\uACC4"),
    classroom: normalizeOptionalString(summary.classroom),
    subject: normalizeOptionalString(summary.subject),
    responseCount: normalizeNumber(summary.responseCount),
    excludedResponseCount: normalizeNumber(summary.excludedResponseCount),
    source: {
      ...DEFAULT_SOURCE_INFO,
      ...normalizeSourceInfo(summary.source)
    },
    overview: {
      averageCorrectCount: normalizeNumber(summary.overview?.averageCorrectCount),
      averageIncorrectCount: normalizeNumber(summary.overview?.averageIncorrectCount),
      assignmentCompletionLabel: normalizeOptionalStringWithFallback(
        summary.overview?.assignmentCompletionLabel,
        "\uBBF8\uBD84\uB958"
      )
    },
    difficultConcepts: Array.isArray(summary.difficultConcepts) ? summary.difficultConcepts.map((item) => normalizeConceptDifficulty(item)).filter((item) => item.concept.length > 0) : [],
    assignmentSummary: normalizeCountItems(summary.assignmentSummary),
    supportStudents: Array.isArray(summary.supportStudents) ? summary.supportStudents.map((item) => normalizeLessonSupportStudent(item)) : [],
    studentResults: Array.isArray(summary.studentResults) ? summary.studentResults.map((item) => normalizeStudentResult(item)) : [],
    studentResponses: Array.isArray(summary.studentResponses) ? summary.studentResponses.map((item) => normalizeLessonStudentResponse(item)) : []
  };
}
function normalizeStarModeLedger(value) {
  const ledger = value ?? {};
  const rules = Array.isArray(ledger.rules) ? ledger.rules.map((item) => normalizeStarRule(item)) : [];
  return {
    type: "star-ledger",
    generatedAt: normalizeOptionalString(ledger.generatedAt),
    periodLabel: normalizeString(ledger.periodLabel, "\uC804\uCCB4 \uB204\uC801"),
    excludedResponseCount: normalizeNumber(ledger.excludedResponseCount),
    eventCount: normalizeNumber(ledger.eventCount),
    source: {
      ...DEFAULT_SOURCE_INFO,
      ...normalizeSourceInfo(ledger.source)
    },
    sourceSummary: normalizeStarEventSourceSummary(ledger.sourceSummary),
    rules: rules.length > 0 ? rules : DEFAULT_STAR_RULES.map((rule) => ({ ...rule })),
    totals: Array.isArray(ledger.totals) ? ledger.totals.map((item) => normalizeStarStudentTotal(item)) : [],
    recentEvents: Array.isArray(ledger.recentEvents) ? ledger.recentEvents.map((item) => normalizeStarEvent(item)) : []
  };
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
      message: "\uC9D1\uACC4 \uD30C\uC77C \uACBD\uB85C\uAC00 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4. Settings -> classpage\uC5D0\uC11C JSON \uACBD\uB85C\uB97C \uC785\uB825\uD558\uC138\uC694.",
      data: null
    };
  }
  const file = app.vault.getAbstractFileByPath(normalizedPath);
  if (!(file instanceof import_obsidian.TFile)) {
    return {
      kind,
      path: normalizedPath,
      status: "missing",
      message: "\uC124\uC815\uB41C \uACBD\uB85C\uC5D0 JSON \uD30C\uC77C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. docs/START_HERE.md\uC640 docs/BEGINNER_SETUP.md\uC758 16\uB2E8\uACC4\uB97C \uD655\uC778\uD558\uC138\uC694.",
      data: null
    };
  }
  try {
    const raw = await app.vault.cachedRead(file);
    const parsed = JSON.parse(raw);
    if (!hasExpectedAggregateType(parsed, expectedType)) {
      const actualType = getAggregateTypeLabel(parsed);
      throw new Error(
        `\uAE30\uB300\uD55C JSON \uD0C0\uC785\uC740 ${expectedType}\uC778\uB370 \uD604\uC7AC \uD30C\uC77C\uC740 ${actualType} \uC785\uB2C8\uB2E4.`
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
    this.renderModeButton(toggle, "teacher", "\uAD50\uC0AC\uC6A9 \uD398\uC774\uC9C0");
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
    this.renderTeacherStatusSection(parent, teacherData);
    if (this.shouldShowTeacherSection("class")) {
      const classSection = parent.createDiv({ cls: "classpage-section" });
      this.renderSectionHeader(
        classSection,
        settings.classSummaryTitle,
        this.buildClassSectionDescription(teacherData?.classSummary ?? null)
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
        this.buildLessonSectionDescription(teacherData?.lessonSummary ?? null)
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
        this.buildStarSectionDescription(teacherData?.starLedger ?? null)
      );
      this.renderStarLedgerCard(
        starSection,
        teacherData?.starLedger ?? null,
        settings.starLedgerEmptyMessage
      );
    }
    this.renderTeacherAdvancedSection(parent, teacherData);
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
  renderSectionHeader(parent, title, description) {
    const header = parent.createDiv({ cls: "classpage-section__header" });
    header.createEl("h2", {
      cls: "classpage-section__title",
      text: title
    });
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
      "\uCE74\uB4DC\uB97C \uB20C\uB7EC \uD544\uC694\uD55C \uC601\uC5ED\uB9CC \uBCF4\uACE0, \uB2E4\uC2DC \uB204\uB974\uBA74 \uC804\uCCB4\uB97C \uBD05\uB2C8\uB2E4."
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
    const button = parent.createEl("button", {
      cls: "classpage-card classpage-dashboard-card",
      attr: { type: "button" }
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
    button.addEventListener("click", () => {
      if (this.teacherFocusMode === mode) {
        this.teacherFocusMode = "overview";
        this.render();
        return;
      }
      this.teacherFocusMode = mode;
      this.render();
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
    const entries = items.length > 0 ? items : ["\uB4F1\uB85D\uB41C \uD56D\uBAA9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."];
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
    const responseMap = this.buildLessonResponseMap(summary.studentResponses);
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
      "\uD3C9\uADE0 \uC815\uB2F5",
      summary.overview.averageCorrectCount.toFixed(1),
      `${summary.subject || "\uC218\uC5C5"} \uAE30\uC900`
    );
    this.renderStatCard(
      stats,
      "\uD3C9\uADE0 \uC624\uB2F5",
      summary.overview.averageIncorrectCount.toFixed(1),
      "\uD559\uC0DD\uBCC4 \uC815\uC624\uB2F5 \uD3C9\uADE0"
    );
    this.renderStatCard(
      stats,
      "\uACFC\uC81C \uC218\uD589",
      summary.overview.assignmentCompletionLabel || "\uBBF8\uBD84\uB958",
      "\uC9D1\uACC4 \uB808\uC774\uC5B4 \uACB0\uACFC"
    );
    const grid = parent.createDiv({ cls: "classpage-summary-grid" });
    this.renderGroupedDrilldownCard(
      grid,
      "\uC5B4\uB824\uC6CC\uD55C \uAC1C\uB150",
      summary.difficultConcepts.map((item) => ({
        title: item.concept,
        meta: `${item.count}\uBA85`,
        description: [item.averageUnderstanding, item.note].filter(Boolean).join(" / "),
        tone: item.count > 0 ? "warning" : void 0,
        emptyMessage: hasStudentSnapshots ? "\uD574\uB2F9 \uAC1C\uB150\uC5D0\uC11C \uB0AE\uC740 \uC774\uD574 \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." : "\uD559\uC0DD\uBCC4 \uC751\uB2F5 \uC2A4\uB0C5\uC0F7\uC774 \uC5C6\uC5B4 drill-down\uC744 \uC5F4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
        items: summary.studentResponses.filter((student) => this.hasLowConcept(student, item.concept)).map((student) => this.buildLessonStudentDrilldownItem(student))
      })),
      "\uC5B4\uB824\uC6CC\uD55C \uAC1C\uB150 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderGroupedDrilldownCard(
      grid,
      "\uACFC\uC81C \uC218\uD589 \uBD84\uD3EC",
      summary.assignmentSummary.map((item) => ({
        title: item.label,
        meta: `${item.count}\uBA85`,
        description: item.note || "\uACFC\uC81C \uC218\uD589 \uC0C1\uD0DC",
        emptyMessage: hasStudentSnapshots ? "\uD574\uB2F9 \uACFC\uC81C \uC218\uD589 \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." : "\uD559\uC0DD\uBCC4 \uC751\uB2F5 \uC2A4\uB0C5\uC0F7\uC774 \uC5C6\uC5B4 drill-down\uC744 \uC5F4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
        items: summary.studentResponses.filter((student) => student.assignmentStatus === item.label).map((student) => this.buildLessonStudentDrilldownItem(student))
      })),
      "\uACFC\uC81C \uC218\uD589 \uC9D1\uACC4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderStudentDrilldownCard(
      grid,
      "\uBCF4\uCDA9 \uC9C0\uB3C4\uAC00 \uD544\uC694\uD55C \uD559\uC0DD",
      summary.supportStudents.map(
        (student) => this.buildLessonSupportDrilldownItem(
          student,
          this.findLessonResponseByStudent(responseMap, student.student)
        )
      ),
      "\uBCF4\uCDA9 \uC9C0\uB3C4\uAC00 \uD544\uC694\uD55C \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderStudentDrilldownCard(
      parent,
      "\uD559\uC0DD\uBCC4 \uC815\uC624\uB2F5 \uBC0F \uACFC\uC81C \uD604\uD669",
      summary.studentResults.map(
        (result) => this.buildStudentResultDrilldownItem(
          result,
          this.findLessonResponseByStudent(responseMap, result.student)
        )
      ),
      "\uD559\uC0DD\uBCC4 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
      true
    );
  }
  renderStarLedgerCard(parent, sourceState, emptyMessage) {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      this.renderEmptyAggregateCard(parent, emptyMessage, sourceState);
      return;
    }
    const ledger = sourceState.data;
    const enabledRules = getEnabledStarRules(ledger.rules);
    const visibleRules = enabledRules.filter((rule) => rule.visibility === "student");
    const teacherOnlyRules = enabledRules.filter((rule) => rule.visibility === "teacher");
    const autoRules = enabledRules.filter((rule) => hasAutomaticStarSource(rule.sources));
    const manualRules = enabledRules.filter((rule) => rule.sources.includes("manual"));
    const topStudents = sortStarTotals(ledger.totals).slice(0, 5);
    const automaticEventCount = getAutomaticStarEventCount(ledger.sourceSummary);
    const stats = parent.createDiv({ cls: "classpage-stat-grid" });
    this.renderStatCard(
      stats,
      "\uC0C1\uD0DC",
      "\uAE30\uBCF8 \uC5F0\uACB0",
      "\uC77D\uAE30 \uC804\uC6A9 \uC694\uC57D\uACFC \uCD5C\uADFC \uC774\uBCA4\uD2B8\uB97C \uD655\uC778\uD569\uB2C8\uB2E4."
    );
    this.renderStatCard(
      stats,
      "\uD65C\uC131 \uADDC\uCE59",
      `${enabledRules.length}`,
      `\uC790\uB3D9 ${autoRules.length}\uAC1C / \uC218\uB3D9 ${manualRules.length}\uAC1C`
    );
    this.renderStatCard(
      stats,
      "\uD559\uC0DD \uACF5\uAC1C",
      `${visibleRules.length}`,
      `${ledger.totals.length}\uBA85 \uAE30\uC900 \uACF5\uAC1C \uB204\uC801 \uACC4\uC0B0`
    );
    this.renderStatCard(
      stats,
      "\uAD50\uC0AC \uC804\uC6A9",
      `${teacherOnlyRules.length}`,
      "\uC218\uB3D9 \uC870\uC815\uACFC \uC228\uAE40 \uBC18\uC601\uC740 \uC870\uC815 \uC2DC\uD2B8 \uAE30\uC900"
    );
    this.renderStatCard(
      stats,
      "\uC804\uCCB4 \uC774\uBCA4\uD2B8",
      `${ledger.eventCount}`,
      `\uC790\uB3D9 ${automaticEventCount}\uAC74 / \uC218\uB3D9 ${ledger.sourceSummary.manual}\uAC74`
    );
    this.renderStatCard(
      stats,
      "\uC218\uB3D9/\uC77C\uAD04",
      ledger.sourceSummary.manual > 0 ? `${ledger.sourceSummary.manual}\uAC74` : "\uC5C6\uC74C",
      ledger.sourceSummary.manual > 0 ? "\uC218\uB3D9 \uC870\uC815 \uB610\uB294 \uC77C\uAD04 \uBD80\uC5EC\uAC00 ledger\uC5D0 \uBC18\uC601\uB428" : "\uC218\uB3D9 \uC870\uC815/\uC77C\uAD04 \uBD80\uC5EC \uC785\uB825 \uC5C6\uC74C"
    );
    const grid = parent.createDiv({ cls: "classpage-summary-grid" });
    this.renderDetailRowsCard(
      grid,
      "\uCD5C\uADFC \uBCC4\uC810 \uC774\uBCA4\uD2B8",
      ledger.recentEvents.map((event) => this.buildStarEventRow(event, ledger.rules)),
      "\uCD5C\uADFC \uC774\uBCA4\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderDetailRowsCard(
      grid,
      "\uC0C1\uC704 \uD559\uC0DD",
      topStudents.map((total) => this.buildStarTotalRow(total)),
      "\uD45C\uC2DC\uD560 \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderDetailRowsCard(
      parent,
      "\uD65C\uC131 \uADDC\uCE59",
      enabledRules.map((rule) => ({
        title: rule.label,
        meta: `${formatSignedPoints(rule.delta)} \xB7 ${getStarCategoryLabel(rule.category)}`,
        description: [
          rule.description,
          getStarAutoCriteriaSummary(rule.autoCriteria),
          getStarVisibilityLabel(rule.visibility),
          getStarRuleSourceSummary(rule.sources),
          rule.sources.includes("manual") ? rule.allowCustomDelta ? "\uC218\uB3D9 \uC810\uC218 \uC9C1\uC811 \uC785\uB825 \uD5C8\uC6A9" : "\uC218\uB3D9 \uC810\uC218\uB294 \uAE30\uBCF8\uAC12 \uC0AC\uC6A9" : "\uC790\uB3D9 \uC801\uB9BD \uADDC\uCE59"
        ].join(" / "),
        tone: rule.delta < 0 ? "warning" : "positive"
      })),
      "\uD65C\uC131 \uADDC\uCE59\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
      true
    );
  }
  renderEmptyAggregateCard(parent, emptyMessage, sourceState) {
    const card = parent.createDiv({ cls: "classpage-card classpage-empty-card" });
    card.createEl("h3", {
      cls: "classpage-card__title",
      text: "\uC9D1\uACC4 \uACB0\uACFC\uB97C \uD45C\uC2DC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4"
    });
    card.createEl("p", {
      cls: "classpage-empty-card__message",
      text: emptyMessage
    });
    if (sourceState?.path) {
      card.createEl("p", {
        cls: "classpage-source-card__path",
        text: `\uC124\uC815 \uACBD\uB85C: ${sourceState.path}`
      });
    }
    if (sourceState?.message) {
      card.createEl("p", {
        cls: "classpage-empty-card__detail",
        text: `\uC624\uB958/\uC0C1\uD0DC: ${sourceState.message}`
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
    return {
      title: formatStudentLabel(student.student),
      meta: `\uC815\uB2F5 ${student.correctCount} / \uC624\uB2F5 ${student.incorrectCount}`,
      summary: [
        student.assignmentStatus ? `\uACFC\uC81C: ${student.assignmentStatus}` : "",
        student.followUp ? `\uD6C4\uC18D: ${student.followUp}` : ""
      ].filter(Boolean).join(" / ") || "\uC218\uC5C5 \uC751\uB2F5 \uC0C1\uC138 \uBCF4\uAE30",
      fields: this.compactDrilldownFields([
        ["\uB2E8\uC6D0", student.lessonUnit],
        ["\uC815\uB2F5 \uC218", String(student.correctCount)],
        ["\uC624\uB2F5 \uC218", String(student.incorrectCount)],
        ["\uACFC\uC81C \uC218\uD589", student.assignmentStatus],
        ["\uD5F7\uAC08\uB9B0 \uBD80\uBD84", student.misconception],
        ["\uD6C4\uC18D \uC9C0\uB3C4", student.followUp],
        ["\uD2C0\uB9B0 \uC774\uC720", student.incorrectReason],
        ["\uC120\uC0DD\uB2D8\uAED8 \uD558\uACE0 \uC2F6\uC740 \uB9D0", student.teacherMessage],
        ["\uAC1C\uB150 \uC751\uB2F5", this.buildConceptSummary(student)],
        ["\uBD84\uC11D \uBA54\uBAA8", student.teacherNote]
      ])
    };
  }
  buildLessonSupportDrilldownItem(student, response) {
    return {
      title: formatStudentLabel(student.student),
      meta: `\uC815\uB2F5 ${student.correctCount} / \uC624\uB2F5 ${student.incorrectCount}`,
      summary: [
        student.assignmentStatus ? `\uACFC\uC81C: ${student.assignmentStatus}` : "",
        student.misconception ? `\uD5F7\uAC08\uB9B0 \uBD80\uBD84: ${student.misconception}` : ""
      ].filter(Boolean).join(" / ") || "\uBCF4\uCDA9 \uC9C0\uB3C4 \uADFC\uAC70 \uBCF4\uAE30",
      tone: "warning",
      fields: this.compactDrilldownFields([
        ["\uACFC\uC81C \uC218\uD589", student.assignmentStatus],
        ["\uD5F7\uAC08\uB9B0 \uBD80\uBD84", student.misconception],
        ["\uD2C0\uB9B0 \uC774\uC720", response?.incorrectReason || ""],
        ["\uC120\uC0DD\uB2D8\uAED8 \uD558\uACE0 \uC2F6\uC740 \uB9D0", response?.teacherMessage || ""],
        ["\uAC1C\uB150 \uC751\uB2F5", response ? this.buildConceptSummary(response) : ""],
        ["\uBD84\uC11D \uBA54\uBAA8", student.teacherNote || response?.teacherNote || ""]
      ])
    };
  }
  buildStudentResultDrilldownItem(result, response) {
    return {
      title: formatStudentLabel(result.student),
      meta: `\uC815\uB2F5 ${result.correctCount} / \uC624\uB2F5 ${result.incorrectCount}`,
      summary: [
        result.assignmentStatus ? `\uACFC\uC81C: ${result.assignmentStatus}` : "",
        result.followUp ? `\uD6C4\uC18D \uC9C0\uB3C4: ${result.followUp}` : ""
      ].filter(Boolean).join(" / ") || "\uD559\uC0DD\uBCC4 \uACB0\uACFC \uBCF4\uAE30",
      fields: this.compactDrilldownFields([
        ["\uACFC\uC81C \uC218\uD589", result.assignmentStatus],
        ["\uD6C4\uC18D \uC9C0\uB3C4", result.followUp],
        ["\uD2C0\uB9B0 \uC774\uC720", response?.incorrectReason || ""],
        ["\uC120\uC0DD\uB2D8\uAED8 \uD558\uACE0 \uC2F6\uC740 \uB9D0", response?.teacherMessage || ""],
        ["\uAC1C\uB150 \uC751\uB2F5", response ? this.buildConceptSummary(response) : ""],
        ["\uBD84\uC11D \uBA54\uBAA8", response?.teacherNote || ""]
      ])
    };
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
  getTeacherStatusPrimaryValue(mode, sourceState) {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return sourceState?.status === "invalid" ? "\uD615\uC2DD \uD655\uC778" : "\uD655\uC778 \uD544\uC694";
    }
    if (mode === "star" || sourceState.data.type === "star-ledger") {
      return "\uAE30\uBCF8 \uC5F0\uACB0";
    }
    return `${sourceState.data.responseCount}\uAC74`;
  }
  getTeacherStatusPrimaryMeta(mode, sourceState) {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return sourceState?.message || "\uC9D1\uACC4 \uD30C\uC77C \uC0C1\uD0DC\uB97C \uD655\uC778\uD558\uC138\uC694.";
    }
    if (mode === "star" && sourceState.data.type === "star-ledger") {
      const enabledRules = getEnabledStarRules(sourceState.data.rules);
      return [
        `\uADDC\uCE59 ${enabledRules.length}\uAC1C`,
        `\uD559\uC0DD ${sourceState.data.totals.length}\uBA85`
      ].join(" \xB7 ");
    }
    return sourceState.data.periodLabel || "\uBC94\uC704 \uBBF8\uD655\uC778";
  }
  getTeacherStatusHint(mode, sourceState) {
    const actionHint = this.teacherFocusMode === mode ? "\uB2E4\uC2DC \uB204\uB974\uBA74 \uC804\uCCB4 \uBCF4\uAE30" : "\uB204\uB974\uBA74 \uC774 \uC601\uC5ED\uB9CC \uBCF4\uAE30";
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return `${actionHint} \xB7 \uC5F0\uACB0\uACFC JSON \uACBD\uB85C\uB97C \uD655\uC778\uD558\uC138\uC694.`;
    }
    const suffix = sourceState.data.type === "star-ledger" ? [
      sourceState.data.eventCount > 0 ? `\uC774\uBCA4\uD2B8 ${sourceState.data.eventCount}\uAC74` : "\uC774\uBCA4\uD2B8 \uC5C6\uC74C",
      `\uC9D1\uACC4 ${formatDateLabel(sourceState.data.generatedAt, "\uC2DC\uAC01 \uBBF8\uD655\uC778")}`
    ].join(" \xB7 ") : [
      `\uC9D1\uACC4 ${formatDateLabel(sourceState.data.generatedAt, "\uC2DC\uAC01 \uBBF8\uD655\uC778")}`,
      sourceState.data.excludedResponseCount > 0 ? `\uC81C\uC678 ${sourceState.data.excludedResponseCount}\uAC74` : ""
    ].filter(Boolean).join(" \xB7 ");
    switch (mode) {
      case "class":
        return `${actionHint} \xB7 \uC815\uC11C\uC640 \uBAA9\uD45C \uC0C1\uD0DC \uD655\uC778 \xB7 ${suffix}`;
      case "lesson":
        return `${actionHint} \xB7 \uC218\uC5C5 \uC774\uD574\uC640 \uACFC\uC81C \uC0C1\uD0DC \uD655\uC778 \xB7 ${suffix}`;
      case "star":
        return `${actionHint} \xB7 \uC77D\uAE30 \uC804\uC6A9 \uBCC4\uC810 \uC694\uC57D \uD655\uC778 \xB7 ${suffix}`;
    }
  }
  getTeacherSourceDescription() {
    return "\uBB38\uC81C\uAC00 \uC0DD\uAE30\uBA74 \uC774 \uC139\uC158\uC5D0\uC11C JSON \uACBD\uB85C, \uC9D1\uACC4 \uC2DC\uAC01, \uC6D0\uBCF8 \uC2DC\uD2B8 \uC774\uB984\uC744 \uD655\uC778\uD569\uB2C8\uB2E4.";
  }
  shouldShowTeacherSection(section) {
    return this.teacherFocusMode === "overview" || this.teacherFocusMode === section;
  }
  buildClassSectionDescription(sourceState) {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return "\uC815\uC11C \uC0C1\uD0DC, \uBAA9\uD45C \uB2EC\uC131, \uB3C4\uC6C0 \uD544\uC694 \uD559\uC0DD, \uCE6D\uCC2C \uD6C4\uBCF4\uB97C \uD559\uAE09\uC6A9 \uC9D1\uACC4 JSON\uC5D0\uC11C \uC77D\uC2B5\uB2C8\uB2E4.";
    }
    return [
      sourceState.data.classroom,
      sourceState.data.periodLabel,
      `${sourceState.data.responseCount}\uAC74 \uBC18\uC601`,
      sourceState.data.excludedResponseCount > 0 ? `\uC81C\uC678 ${sourceState.data.excludedResponseCount}\uAC74` : ""
    ].filter(Boolean).join(" \xB7 ");
  }
  buildLessonSectionDescription(sourceState) {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return "\uC5B4\uB824\uC6CC\uD55C \uAC1C\uB150, \uC815\uC624\uB2F5, \uACFC\uC81C \uC218\uD589 \uC815\uB3C4\uB97C \uC218\uC5C5\uC6A9 \uC9D1\uACC4 JSON\uC5D0\uC11C \uC77D\uC2B5\uB2C8\uB2E4.";
    }
    return [
      sourceState.data.classroom,
      sourceState.data.subject,
      sourceState.data.periodLabel,
      `${sourceState.data.responseCount}\uAC74 \uBC18\uC601`,
      sourceState.data.excludedResponseCount > 0 ? `\uC81C\uC678 ${sourceState.data.excludedResponseCount}\uAC74` : ""
    ].filter(Boolean).join(" \xB7 ");
  }
  buildStarSectionDescription(sourceState) {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return "\uBCC4\uC810 ledger\uC758 \uC77D\uAE30 \uC804\uC6A9 \uC694\uC57D\uACFC \uCD5C\uADFC \uC774\uBCA4\uD2B8\uB97C \uD655\uC778\uD569\uB2C8\uB2E4.";
    }
    const enabledRules = getEnabledStarRules(sourceState.data.rules);
    return [
      "\uAE30\uBCF8 \uC5F0\uACB0",
      sourceState.data.periodLabel,
      `\uADDC\uCE59 ${enabledRules.length}\uAC1C`,
      `\uD559\uC0DD ${sourceState.data.totals.length}\uBA85`,
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
    const timeLabel = formatDateLabel(event.occurredAt, "\uC2DC\uAC01 \uBBF8\uD655\uC778");
    return {
      title: `${rule?.label ?? "\uADDC\uCE59 \uBBF8\uD655\uC778"} \xB7 ${formatStudentLabel(event.student)}`,
      meta: `${formatSignedPoints(event.delta)} \xB7 ${getStarVisibilityLabel(event.visibility)}`,
      description: [
        getStarCategoryLabel(event.category),
        sourceLabel,
        timeLabel,
        event.actor ? `\uAD50\uC0AC ${event.actor}` : "",
        event.batchId ? `batch ${event.batchId}` : "",
        event.note || rule?.description || "\uC124\uBA85 \uBBF8\uD655\uC778"
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
        `\uAD50\uC0AC \uC870\uC815 ${formatSignedPoints(total.hiddenAdjustmentTotal)}`,
        `\uC774\uBCA4\uD2B8 ${total.eventCount}\uAC74`
      ].join(" / "),
      tone: total.hiddenAdjustmentTotal < 0 ? "warning" : "positive"
    };
  }
  getSourceStatusLabel(status) {
    switch (status) {
      case "loaded":
        return "\uC5F0\uACB0\uB428";
      case "missing":
        return "\uC5C6\uC74C";
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
      text: "\uD559\uC0DD\uC6A9 \uD654\uBA74\uC740 \uC815\uC801 \uBB38\uAD6C\uC640 Google Form \uB9C1\uD06C\uB97C, \uAD50\uC0AC\uC6A9 \uD654\uBA74\uC740 \uC9D1\uACC4 JSON \uACBD\uB85C\uB97C \uC77D\uC2B5\uB2C8\uB2E4. \uD559\uC0DD \uC751\uB2F5 \uC6D0\uBCF8\uC774\uB098 \uC9D1\uACC4 \uB85C\uC9C1 \uC790\uCCB4\uB294 \uC774 \uD50C\uB7EC\uADF8\uC778\uC5D0\uC11C \uC218\uC815\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
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
      "\uAD50\uC0AC\uC6A9 \uD398\uC774\uC9C0",
      "\uAD50\uC0AC\uC6A9 \uD654\uBA74\uC740 \uC6D0\uBCF8 \uC751\uB2F5\uC774 \uC544\uB2C8\uB77C \uC9D1\uACC4 \uACB0\uACFC\uB97C \uC77D\uC2B5\uB2C8\uB2E4. \uC544\uB798 \uAC12\uC740 \uD45C\uC2DC \uB808\uC774\uC5B4 \uC124\uBA85\uACFC \uC9D1\uACC4 \uACBD\uB85C\uB9CC \uBC14\uAFC9\uB2C8\uB2E4."
    );
    this.addTextSetting(
      "\uC81C\uBAA9",
      "\uAD50\uC0AC\uC6A9 \uD398\uC774\uC9C0 \uC0C1\uB2E8 \uC81C\uBAA9\uC785\uB2C8\uB2E4.",
      settings.teacherPage.title,
      async (value) => {
        settings.teacherPage.title = value.trim() || DEFAULT_SETTINGS.teacherPage.title;
        await this.plugin.saveSettings();
      }
    );
    this.addTextSetting(
      "\uC124\uBA85",
      "\uAD50\uC0AC\uC6A9 \uD398\uC774\uC9C0\uC758 \uC5ED\uD560\uC744 \uC124\uBA85\uD558\uB294 \uBB38\uAD6C\uC785\uB2C8\uB2E4.",
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
      "\uAD50\uC0AC\uC6A9 \uBCC4\uC810\uBAA8\uB4DC \uC139\uC158 \uC81C\uBAA9\uC785\uB2C8\uB2E4.",
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
      "\uBCC4\uC810\uBAA8\uB4DC ledger JSON \uD30C\uC77C\uC758 \uBCFC\uD2B8 \uB0B4\uBD80 \uACBD\uB85C\uC785\uB2C8\uB2E4.",
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
function formatDateLabel(value, fallback = "\uC9D1\uACC4 \uC2DC\uAC01 \uBBF8\uD655\uC778") {
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
  const label = [student.classroom, student.number, student.name].filter(Boolean).join(" ");
  return label || "\uD559\uC0DD \uBBF8\uD655\uC778";
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
  return visibility === "teacher" ? "\uAD50\uC0AC \uC804\uC6A9" : "\uD559\uC0DD \uACF5\uAC1C";
}
function getStarSourceLabel(source) {
  switch (source) {
    case "class-form":
      return "\uD559\uAE09\uC6A9 \uD3FC";
    case "lesson-form":
      return "\uC218\uC5C5\uC6A9 \uD3FC";
    case "manual":
      return "\uC218\uB3D9/\uC77C\uAD04 \uC870\uC815";
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
    return "\uC785\uB825 \uACBD\uB85C \uBBF8\uD655\uC778";
  }
  return `\uC785\uB825 ${labels.join(", ")}`;
}
function getStarAutoCriteriaSummary(criteria) {
  if (!criteria) {
    return "";
  }
  const parts = [];
  if (criteria.assignmentStatusIn.length > 0) {
    parts.push(`\uACFC\uC81C ${criteria.assignmentStatusIn.join("/")}`);
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
