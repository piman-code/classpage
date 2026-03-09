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
var DEFAULT_CLASS_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeBR_cBQFf_CXo6ytCabIMfvStXn_QPSYadonYLKNR6WAT2bg/viewform?usp=header";
var DEFAULT_LESSON_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSefjZ3vyJs6T5PkkrUQDo2JY1wNh8cHPdeieRWRFVsMzu-_NA/viewform?usp=header";
var DEFAULT_SETTINGS = {
  studentPage: {
    title: "\uC6B0\uB9AC \uBC18 \uAD50\uC2E4 \uD398\uC774\uC9C0",
    description: "\uC624\uB298 \uD574\uC57C \uD560 \uC77C\uACFC \uACF5\uC9C0, \uC81C\uCD9C \uD3FC\uB9CC \uBE60\uB974\uAC8C \uD655\uC778\uD569\uB2C8\uB2E4.",
    statusMessage: "\uD559\uC0DD\uC6A9 \uD654\uBA74\uC740 \uC815\uC801 \uC124\uC815\uACFC Google Form \uB9C1\uD06C\uB9CC \uBCF4\uC5EC\uC90D\uB2C8\uB2E4.",
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
    title: "\uAD50\uC0AC\uC6A9 \uC694\uC57D \uD398\uC774\uC9C0",
    description: "\uAD50\uC0AC\uC6A9 \uD654\uBA74\uC740 \uC6D0\uBCF8 \uC751\uB2F5\uC774 \uC544\uB2C8\uB77C \uC9D1\uACC4 JSON \uACB0\uACFC\uB9CC \uC77D\uC5B4 \uBE60\uB974\uAC8C \uD310\uB2E8\uD560 \uC218 \uC788\uAC8C \uAD6C\uC131\uD569\uB2C8\uB2E4.",
    statusMessage: "Google Form -> Google Sheets -> Apps Script/\uC9D1\uACC4 \uB808\uC774\uC5B4 -> JSON -> classpage",
    classSummaryTitle: "\uD559\uAE09\uC6A9 \uD3FC \uC9D1\uACC4",
    lessonSummaryTitle: "\uC218\uC5C5\uC6A9 \uD3FC \uC9D1\uACC4",
    classSummaryEmptyMessage: "\uD559\uAE09\uC6A9 \uC9D1\uACC4 JSON\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. Settings -> classpage\uC758 \uACBD\uB85C\uC640 docs/BEGINNER_SETUP.md\uC758 16\uB2E8\uACC4\uB97C \uD655\uC778\uD558\uC138\uC694.",
    lessonSummaryEmptyMessage: "\uC218\uC5C5\uC6A9 \uC9D1\uACC4 JSON\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. Settings -> classpage\uC758 \uACBD\uB85C\uC640 docs/BEGINNER_SETUP.md\uC758 16\uB2E8\uACC4\uB97C \uD655\uC778\uD558\uC138\uC694.",
    sources: {
      classSummaryPath: "classpage-data/class-summary.json",
      lessonSummaryPath: "classpage-data/lesson-summary.json"
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
    classSummaryEmptyMessage: normalizeOptionalStringWithFallback(
      teacherPage.classSummaryEmptyMessage,
      fallback.classSummaryEmptyMessage
    ),
    lessonSummaryEmptyMessage: normalizeOptionalStringWithFallback(
      teacherPage.lessonSummaryEmptyMessage,
      fallback.lessonSummaryEmptyMessage
    ),
    sources: {
      classSummaryPath: normalizeString(
        teacherPage.sources?.classSummaryPath,
        fallback.sources.classSummaryPath
      ),
      lessonSummaryPath: normalizeString(
        teacherPage.sources?.lessonSummaryPath,
        fallback.sources.lessonSummaryPath
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
    count: Number.isFinite(item.count) ? Number(item.count) : 0,
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
function normalizeConceptDifficulty(value) {
  const item = value ?? {};
  return {
    concept: normalizeOptionalString(item.concept),
    count: Number.isFinite(item.count) ? Number(item.count) : 0,
    averageUnderstanding: normalizeOptionalString(item.averageUnderstanding),
    note: normalizeOptionalString(item.note)
  };
}
function normalizeLessonSupportStudent(value) {
  const student = value ?? {};
  return {
    student: normalizeStudentReference(student.student),
    correctCount: Number.isFinite(student.correctCount) ? Number(student.correctCount) : 0,
    incorrectCount: Number.isFinite(student.incorrectCount) ? Number(student.incorrectCount) : 0,
    misconception: normalizeOptionalString(student.misconception),
    assignmentStatus: normalizeOptionalString(student.assignmentStatus),
    teacherNote: normalizeOptionalString(student.teacherNote)
  };
}
function normalizeStudentResult(value) {
  const result = value ?? {};
  return {
    student: normalizeStudentReference(result.student),
    correctCount: Number.isFinite(result.correctCount) ? Number(result.correctCount) : 0,
    incorrectCount: Number.isFinite(result.incorrectCount) ? Number(result.incorrectCount) : 0,
    assignmentStatus: normalizeOptionalString(result.assignmentStatus),
    followUp: normalizeOptionalString(result.followUp)
  };
}
function normalizeClassSummaryAggregate(value) {
  const summary = value ?? {};
  const emotionSummary = normalizeCountItems(summary.emotionSummary);
  const goalSummary = normalizeCountItems(summary.goalSummary);
  return {
    type: "class-summary",
    generatedAt: normalizeString(summary.generatedAt, ""),
    periodLabel: normalizeString(summary.periodLabel, "\uD559\uAE09 \uC9D1\uACC4"),
    classroom: normalizeString(summary.classroom, ""),
    responseCount: Number.isFinite(summary.responseCount) ? Number(summary.responseCount) : 0,
    excludedResponseCount: Number.isFinite(summary.excludedResponseCount) ? Number(summary.excludedResponseCount) : 0,
    source: {
      ...DEFAULT_SOURCE_INFO,
      ...normalizeSourceInfo(summary.source)
    },
    emotionSummary,
    goalSummary,
    supportStudents: Array.isArray(summary.supportStudents) ? summary.supportStudents.map((item) => normalizeClassSupportStudent(item)) : [],
    praiseCandidates: Array.isArray(summary.praiseCandidates) ? summary.praiseCandidates.map((item) => normalizePraiseCandidate(item)) : []
  };
}
function normalizeLessonSummaryAggregate(value) {
  const summary = value ?? {};
  const difficultConcepts = Array.isArray(summary.difficultConcepts) ? summary.difficultConcepts.map((item) => normalizeConceptDifficulty(item)).filter((item) => item.concept.length > 0) : [];
  const assignmentSummary = normalizeCountItems(summary.assignmentSummary);
  const studentResults = Array.isArray(summary.studentResults) ? summary.studentResults.map((item) => normalizeStudentResult(item)).filter((item) => item.student.name.length > 0) : [];
  return {
    type: "lesson-summary",
    generatedAt: normalizeString(summary.generatedAt, ""),
    periodLabel: normalizeString(summary.periodLabel, "\uC218\uC5C5 \uC9D1\uACC4"),
    classroom: normalizeString(summary.classroom, ""),
    subject: normalizeString(summary.subject, ""),
    responseCount: Number.isFinite(summary.responseCount) ? Number(summary.responseCount) : 0,
    excludedResponseCount: Number.isFinite(summary.excludedResponseCount) ? Number(summary.excludedResponseCount) : 0,
    source: {
      ...DEFAULT_SOURCE_INFO,
      ...normalizeSourceInfo(summary.source)
    },
    overview: {
      averageCorrectCount: Number.isFinite(summary.overview?.averageCorrectCount) ? Number(summary.overview?.averageCorrectCount) : 0,
      averageIncorrectCount: Number.isFinite(summary.overview?.averageIncorrectCount) ? Number(summary.overview?.averageIncorrectCount) : 0,
      assignmentCompletionLabel: normalizeOptionalStringWithFallback(
        summary.overview?.assignmentCompletionLabel,
        ""
      )
    },
    difficultConcepts,
    assignmentSummary,
    supportStudents: Array.isArray(summary.supportStudents) ? summary.supportStudents.map((item) => normalizeLessonSupportStudent(item)) : [],
    studentResults
  };
}

// src/teacher-data.ts
var import_obsidian = require("obsidian");
async function loadTeacherPageData(app, settings) {
  const [classSummary, lessonSummary] = await Promise.all([
    loadAggregateFile(
      app,
      "class",
      settings.sources.classSummaryPath,
      normalizeClassSummaryAggregate
    ),
    loadAggregateFile(
      app,
      "lesson",
      settings.sources.lessonSummaryPath,
      normalizeLessonSummaryAggregate
    )
  ]);
  return {
    classSummary,
    lessonSummary
  };
}
async function loadAggregateFile(app, kind, path, parser) {
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
      message: "\uC124\uC815\uB41C \uACBD\uB85C\uC5D0 JSON \uD30C\uC77C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. docs/BEGINNER_SETUP.md\uC758 16\uB2E8\uACC4\uB97C \uD655\uC778\uD558\uC138\uC694.",
      data: null
    };
  }
  try {
    const raw = await app.vault.cachedRead(file);
    const parsed = JSON.parse(raw);
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
    this.renderTeacherPage(shell, settings.teacherPage, teacherData);
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
    this.renderBoundaryCard(
      parent,
      "\uD559\uC0DD\uC6A9 \uD398\uC774\uC9C0 \uAD6C\uC870",
      "\uC774 \uD654\uBA74\uC740 classpage \uC124\uC815\uAC12\uACFC Google Form \uB9C1\uD06C\uB9CC \uC0AC\uC6A9\uD569\uB2C8\uB2E4. \uD559\uC0DD \uC751\uB2F5 \uC6D0\uBCF8\uC774\uB098 \uC9D1\uACC4 \uACB0\uACFC\uB294 \uC5EC\uAE30\uC11C \uC9C1\uC811 \uACC4\uC0B0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
      [
        `\uC815\uC801 \uC124\uC815: \uC624\uB298\uC758 \uD560 \uC77C, \uACF5\uC9C0\uC0AC\uD56D, \uBC84\uD2BC \uBB38\uAD6C`,
        `\uC678\uBD80 \uC785\uB825: \uD559\uAE09\uC6A9/\uC218\uC5C5\uC6A9 Google Form \uC81C\uCD9C`,
        `\uC218\uC815 \uC704\uCE58: Settings -> classpage`
      ]
    );
    const boardSection = parent.createDiv({ cls: "classpage-section" });
    this.renderSectionHeader(
      boardSection,
      "\uC624\uB298 \uD655\uC778\uD560 \uB0B4\uC6A9",
      "\uD559\uC0DD\uC6A9 \uD654\uBA74\uC740 \uC6B4\uC601\uC790\uAC00 \uC124\uC815\uD55C \uC815\uC801 \uBB38\uAD6C\uB97C \uADF8\uB300\uB85C \uBCF4\uC5EC\uC90D\uB2C8\uB2E4."
    );
    const board = boardSection.createDiv({ cls: "classpage-board" });
    this.renderListCard(board, settings.today.title, settings.today.items);
    this.renderListCard(board, settings.notices.title, settings.notices.items);
    const formsSection = parent.createDiv({ cls: "classpage-section" });
    this.renderSectionHeader(
      formsSection,
      "\uC81C\uCD9C \uBC14\uB85C\uAC00\uAE30",
      "\uBC84\uD2BC\uC740 Google Form \uC6D0\uBCF8 \uB9C1\uD06C\uB85C \uC774\uB3D9\uB9CC \uD558\uACE0, classpage \uC548\uC5D0\uC11C \uC751\uB2F5\uC744 \uC800\uC7A5\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
    );
    const forms = formsSection.createDiv({ cls: "classpage-form-grid" });
    this.renderFormCard(forms, settings.forms.classForm);
    this.renderFormCard(forms, settings.forms.lessonForm);
  }
  renderTeacherPage(parent, settings, teacherData) {
    this.renderBoundaryCard(
      parent,
      "\uAD50\uC0AC\uC6A9 \uD398\uC774\uC9C0 \uAD6C\uC870",
      "\uAD50\uC0AC\uC6A9 \uD654\uBA74\uC740 Google Form \uC6D0\uBCF8 \uC751\uB2F5\uC744 \uC9C1\uC811 \uC77D\uC9C0 \uC54A\uACE0, Google Sheets \uB610\uB294 Apps Script\uAC00 \uB9CC\uB4E0 \uC9D1\uACC4 JSON\uB9CC \uC77D\uC2B5\uB2C8\uB2E4. \uC774 \uAD6C\uC870\uB85C \uC218\uC9D1, \uC9D1\uACC4, \uD45C\uC2DC \uC5ED\uD560\uC744 \uBD84\uB9AC\uD569\uB2C8\uB2E4.",
      [
        `\uC6D0\uBCF8 \uC785\uB825: Google Form / Google Sheets`,
        `\uC9D1\uACC4 \uB808\uC774\uC5B4: Apps Script \uB610\uB294 \uC678\uBD80 \uC790\uB3D9\uD654\uAC00 JSON \uC0DD\uC131`,
        `\uD45C\uC2DC \uB808\uC774\uC5B4: classpage\uAC00 JSON\uC744 \uC77D\uC5B4 \uC694\uC57D \uCE74\uB4DC\uC640 \uBAA9\uB85D \uD45C\uC2DC`
      ]
    );
    const sourceSection = parent.createDiv({ cls: "classpage-section" });
    this.renderSectionHeader(
      sourceSection,
      "\uC9D1\uACC4 \uC5F0\uACB0 \uC0C1\uD0DC",
      "\uAD50\uC0AC\uC6A9 \uD654\uBA74\uC5D0\uC11C \uBCF4\uC774\uB294 \uAC12\uC740 \uC544\uB798 JSON \uACBD\uB85C\uC5D0 \uC788\uB294 \uC9D1\uACC4 \uACB0\uACFC\uC785\uB2C8\uB2E4. \uACBD\uB85C\uB9CC \uBC14\uAFB8\uBA74 \uD45C\uC2DC \uB370\uC774\uD130\uAC00 \uD568\uAED8 \uBC14\uB01D\uB2C8\uB2E4."
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
    this.renderMetaRow(metaList, "\uBC18\uC601 \uC751\uB2F5", `${sourceState.data.responseCount}\uAC74`);
    if (sourceState.data.excludedResponseCount > 0) {
      this.renderMetaRow(
        metaList,
        "\uC81C\uC678 \uC751\uB2F5",
        `${sourceState.data.excludedResponseCount}\uAC74`
      );
    }
    this.renderMetaRow(metaList, "\uBC94\uC704", sourceState.data.periodLabel);
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
    this.renderDetailRowsCard(
      grid,
      "\uC815\uC11C \uC0C1\uD0DC \uBD84\uD3EC",
      summary.emotionSummary.map((item) => this.buildCountRow(item)),
      "\uC815\uC11C \uBD84\uD3EC \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderDetailRowsCard(
      grid,
      "\uBAA9\uD45C \uB2EC\uC131 \uBD84\uD3EC",
      summary.goalSummary.map((item) => this.buildCountRow(item)),
      "\uBAA9\uD45C \uBD84\uD3EC \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderDetailRowsCard(
      grid,
      "\uB3C4\uC6C0\uC774 \uD544\uC694\uD55C \uD559\uC0DD",
      summary.supportStudents.map((student) => ({
        title: formatStudentLabel(student.student),
        meta: student.mood || "\uC0C1\uD0DC \uD655\uC778 \uD544\uC694",
        description: [
          student.reason ? `\uC774\uC720: ${student.reason}` : "",
          student.goal ? `\uC624\uB298 \uBAA9\uD45C: ${student.goal}` : "",
          student.yesterdayAchievement ? `\uC5B4\uC81C \uB2EC\uC131\uB3C4: ${student.yesterdayAchievement}` : "",
          student.teacherNote ? `\uBA54\uBAA8: ${student.teacherNote}` : ""
        ].filter(Boolean).join(" / "),
        tone: "warning"
      })),
      "\uD604\uC7AC \uD45C\uC2DC\uD560 \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderDetailRowsCard(
      grid,
      "\uCE6D\uCC2C/\uACA9\uB824 \uD6C4\uBCF4",
      summary.praiseCandidates.map((student) => ({
        title: formatStudentLabel(student.student),
        meta: student.mentionedPeer ? `\uC5B8\uAE09 \uCE5C\uAD6C: ${student.mentionedPeer}` : "\uAD00\uACC4 \uAE30\uB85D",
        description: student.reason || "\uCE6D\uCC2C \uC0AC\uC720 \uC5C6\uC74C",
        tone: "positive"
      })),
      "\uD604\uC7AC \uD45C\uC2DC\uD560 \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
  }
  renderLessonSummaryCard(parent, sourceState, emptyMessage) {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      this.renderEmptyAggregateCard(parent, emptyMessage, sourceState);
      return;
    }
    const summary = sourceState.data;
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
      summary.overview.assignmentCompletionLabel || "-",
      "\uC9D1\uACC4 \uB808\uC774\uC5B4 \uACB0\uACFC"
    );
    const grid = parent.createDiv({ cls: "classpage-summary-grid" });
    this.renderDetailRowsCard(
      grid,
      "\uC5B4\uB824\uC6CC\uD55C \uAC1C\uB150",
      summary.difficultConcepts.map((item) => ({
        title: item.concept,
        meta: `${item.count}\uBA85`,
        description: [item.averageUnderstanding, item.note].filter(Boolean).join(" / "),
        tone: "warning"
      })),
      "\uC5B4\uB824\uC6CC\uD55C \uAC1C\uB150 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderDetailRowsCard(
      grid,
      "\uACFC\uC81C \uC218\uD589 \uBD84\uD3EC",
      summary.assignmentSummary.map((item) => this.buildCountRow(item)),
      "\uACFC\uC81C \uC218\uD589 \uC9D1\uACC4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderDetailRowsCard(
      grid,
      "\uBCF4\uCDA9 \uC9C0\uB3C4\uAC00 \uD544\uC694\uD55C \uD559\uC0DD",
      summary.supportStudents.map((student) => ({
        title: formatStudentLabel(student.student),
        meta: `\uC815\uB2F5 ${student.correctCount} / \uC624\uB2F5 ${student.incorrectCount}`,
        description: [
          student.misconception ? `\uD5F7\uAC08\uB9B0 \uBD80\uBD84: ${student.misconception}` : "",
          student.assignmentStatus ? `\uACFC\uC81C: ${student.assignmentStatus}` : "",
          student.teacherNote ? `\uBA54\uBAA8: ${student.teacherNote}` : ""
        ].filter(Boolean).join(" / "),
        tone: "warning"
      })),
      "\uBCF4\uCDA9 \uC9C0\uB3C4\uAC00 \uD544\uC694\uD55C \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
    );
    this.renderDetailRowsCard(
      parent,
      "\uD559\uC0DD\uBCC4 \uC815\uC624\uB2F5 \uBC0F \uACFC\uC81C \uD604\uD669",
      summary.studentResults.map((result) => ({
        title: formatStudentLabel(result.student),
        meta: `\uC815\uB2F5 ${result.correctCount} / \uC624\uB2F5 ${result.incorrectCount}`,
        description: [
          result.assignmentStatus ? `\uACFC\uC81C: ${result.assignmentStatus}` : "",
          result.followUp ? `\uD6C4\uC18D \uC9C0\uB3C4: ${result.followUp}` : ""
        ].filter(Boolean).join(" / ")
      })),
      "\uD559\uC0DD\uBCC4 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
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
  buildResponseCountDescription(summary) {
    if (summary.excludedResponseCount > 0) {
      return `${summary.periodLabel} / \uC81C\uC678 ${summary.excludedResponseCount}\uAC74`;
    }
    return `${summary.periodLabel} / \uD5C8\uAC00 \uD559\uC0DD \uAE30\uC900`;
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
      "\uB370\uC774\uD130 \uD750\uB984\uC744 \uC0C1\uB2E8\uC5D0 \uC9E7\uAC8C \uD45C\uC2DC\uD569\uB2C8\uB2E4.",
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
function formatDateLabel(value) {
  if (!value) {
    return "\uC9D1\uACC4 \uC2DC\uAC01 \uC5C6\uC74C";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}
function formatStudentLabel(student) {
  return [student.classroom, student.number, student.name].filter(Boolean).join(" ");
}
