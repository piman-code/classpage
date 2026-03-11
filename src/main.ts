import {
  App,
  ItemView,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  WorkspaceLeaf,
} from "obsidian";
import { DEFAULT_SETTINGS, normalizeSettings } from "./defaults";
import { loadTeacherPageData } from "./teacher-data";
import type {
  AggregateCountItem,
  AggregateSourceState,
  ClassPageFormSettings,
  ClassPageSettings,
  ClassStudentResponse,
  ClassSummaryAggregate,
  LessonSummaryAggregate,
  LessonStudentResponse,
  StarAutoCriteria,
  StarEvent,
  StarModeLedger,
  StarRuleSettings,
  StarStudentTotal,
  StudentReference,
  StudentPageSettings,
  TeacherPageData,
  TeacherPageSettings,
} from "./types";

const VIEW_TYPE_CLASSPAGE = "classpage-view";

type PageMode = "student" | "teacher";
type TeacherFocusMode = "overview" | "class" | "lesson" | "star";
type RowTone = "neutral" | "warning" | "positive";
type TeacherAggregateState =
  | AggregateSourceState<ClassSummaryAggregate>
  | AggregateSourceState<LessonSummaryAggregate>
  | AggregateSourceState<StarModeLedger>;

interface DetailRow {
  title: string;
  meta: string;
  description: string;
  tone?: RowTone;
}

interface DrilldownField {
  label: string;
  value: string;
}

interface DrilldownItem {
  title: string;
  meta: string;
  summary: string;
  tone?: RowTone;
  fields: DrilldownField[];
}

interface DrilldownGroup {
  title: string;
  meta: string;
  description: string;
  tone?: RowTone;
  emptyMessage: string;
  items: DrilldownItem[];
}

export default class ClassPagePlugin extends Plugin {
  settings: ClassPageSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.registerView(
      VIEW_TYPE_CLASSPAGE,
      (leaf) => new ClassPageView(leaf, this),
    );

    this.addRibbonIcon("layout-dashboard", "교실 페이지 열기", async () => {
      await this.activateView();
    });

    this.addCommand({
      id: "open-classpage",
      name: "교실 페이지 열기",
      callback: async () => {
        await this.activateView();
      },
    });

    this.addSettingTab(new ClassPageSettingTab(this.app, this));
  }

  onunload(): void {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_CLASSPAGE);
  }

  async loadSettings(): Promise<void> {
    this.settings = normalizeSettings(await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.refreshOpenViews();
  }

  async activateView(): Promise<void> {
    const existingLeaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_CLASSPAGE)[0];
    const leaf = existingLeaf ?? this.app.workspace.getLeaf(true);

    if (!leaf) {
      new Notice("classpage를 열 수 있는 패널을 찾지 못했습니다.");
      return;
    }

    await leaf.setViewState({
      type: VIEW_TYPE_CLASSPAGE,
      active: true,
    });

    this.app.workspace.revealLeaf(leaf);
  }

  refreshOpenViews(): void {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_CLASSPAGE)) {
      const view = leaf.view;
      if (view instanceof ClassPageView) {
        view.render();
      }
    }
  }
}

class ClassPageView extends ItemView {
  private pageMode: PageMode = "student";
  private teacherFocusMode: TeacherFocusMode = "overview";
  private renderToken = 0;

  constructor(
    leaf: WorkspaceLeaf,
    private readonly plugin: ClassPagePlugin,
  ) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_CLASSPAGE;
  }

  getDisplayText(): string {
    return "교실 페이지";
  }

  getIcon(): string {
    return "layout-dashboard";
  }

  async onOpen(): Promise<void> {
    await this.renderAsync();
  }

  async onClose(): Promise<void> {
    this.contentEl.empty();
  }

  render(): void {
    void this.renderAsync();
  }

  private async renderAsync(): Promise<void> {
    const token = ++this.renderToken;
    const { settings } = this.plugin;
    const teacherData = this.pageMode === "teacher"
      ? await loadTeacherPageData(this.app, settings.teacherPage)
      : null;

    if (token !== this.renderToken) {
      return;
    }

    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("classpage-view");

    const shell = contentEl.createDiv({ cls: "classpage-shell" });
    this.renderHeader(
      shell,
      this.pageMode === "student" ? settings.studentPage : settings.teacherPage,
    );

    if (this.pageMode === "student") {
      this.renderStudentPage(shell, settings.studentPage);
      return;
    }

    this.renderTeacherPage(
      shell,
      settings.teacherPage,
      teacherData,
    );
  }

  private renderHeader(
    parent: HTMLElement,
    page: Pick<StudentPageSettings | TeacherPageSettings, "title" | "description" | "statusMessage">,
  ): void {
    const header = parent.createDiv({ cls: "classpage-card classpage-header" });
    const headerTop = header.createDiv({ cls: "classpage-header__top" });

    if (page.statusMessage) {
      headerTop.createEl("span", {
        cls: "classpage-status",
        text: page.statusMessage,
      });
    }

    this.renderModeToggle(headerTop);

    header.createEl("h1", {
      cls: "classpage-title",
      text: page.title,
    });

    if (page.description) {
      header.createEl("p", {
        cls: "classpage-description",
        text: page.description,
      });
    }
  }

  private renderModeToggle(parent: HTMLElement): void {
    const toggle = parent.createDiv({ cls: "classpage-mode-toggle" });
    this.renderModeButton(toggle, "student", "학생용 페이지");
    this.renderModeButton(toggle, "teacher", "교사용 페이지");
  }

  private renderModeButton(
    parent: HTMLElement,
    mode: PageMode,
    label: string,
  ): void {
    const button = parent.createEl("button", {
      cls: "classpage-mode-toggle__button",
      text: label,
      attr: { type: "button" },
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

  private renderStudentPage(
    parent: HTMLElement,
    settings: StudentPageSettings,
  ): void {
    const boardSection = parent.createDiv({ cls: "classpage-section" });
    this.renderSectionHeader(
      boardSection,
      "오늘 확인할 내용",
      "공지와 오늘 할 일을 먼저 보고 필요한 준비를 마칩니다.",
    );

    const board = boardSection.createDiv({ cls: "classpage-board" });
    this.renderListCard(board, settings.today.title, settings.today.items);
    this.renderListCard(board, settings.notices.title, settings.notices.items);

    const formsSection = parent.createDiv({ cls: "classpage-section" });
    this.renderSectionHeader(
      formsSection,
      "제출 바로가기",
      "버튼을 누르면 Google Form 제출 화면이 바로 열립니다.",
    );

    const forms = formsSection.createDiv({ cls: "classpage-form-grid" });
    this.renderFormCard(forms, settings.forms.classForm);
    this.renderFormCard(forms, settings.forms.lessonForm);
  }

  private renderTeacherPage(
    parent: HTMLElement,
    settings: TeacherPageSettings,
    teacherData: TeacherPageData | null,
  ): void {
    this.renderTeacherStatusSection(parent, teacherData);

    if (this.shouldShowTeacherSection("class")) {
      const classSection = parent.createDiv({ cls: "classpage-section" });
      this.renderSectionHeader(
        classSection,
        settings.classSummaryTitle,
        this.buildClassSectionDescription(teacherData?.classSummary ?? null),
      );
      this.renderClassSummaryCard(
        classSection,
        teacherData?.classSummary ?? null,
        settings.classSummaryEmptyMessage,
      );
    }

    if (this.shouldShowTeacherSection("lesson")) {
      const lessonSection = parent.createDiv({ cls: "classpage-section" });
      this.renderSectionHeader(
        lessonSection,
        settings.lessonSummaryTitle,
        this.buildLessonSectionDescription(teacherData?.lessonSummary ?? null),
      );
      this.renderLessonSummaryCard(
        lessonSection,
        teacherData?.lessonSummary ?? null,
        settings.lessonSummaryEmptyMessage,
      );
    }

    if (this.shouldShowTeacherSection("star")) {
      const starSection = parent.createDiv({ cls: "classpage-section" });
      this.renderSectionHeader(
        starSection,
        settings.starLedgerTitle,
        this.buildStarSectionDescription(teacherData?.starLedger ?? null),
      );
      this.renderStarLedgerCard(
        starSection,
        teacherData?.starLedger ?? null,
        settings.starLedgerEmptyMessage,
      );
    }

    this.renderTeacherAdvancedSection(parent, teacherData);
  }

  private renderBoundaryCard(
    parent: HTMLElement,
    title: string,
    description: string,
    items: string[],
  ): void {
    const card = parent.createDiv({ cls: "classpage-card classpage-boundary-card" });
    card.createEl("h2", { cls: "classpage-card__title", text: title });
    card.createEl("p", {
      cls: "classpage-boundary-card__description",
      text: description,
    });

    const list = card.createEl("ul", { cls: "classpage-list" });
    for (const item of items) {
      const listItem = list.createEl("li", { cls: "classpage-list__item" });
      listItem.createDiv({ cls: "classpage-list__dot" });
      listItem.createEl("span", {
        cls: "classpage-list__text",
        text: item,
      });
    }
  }

  private renderSectionHeader(
    parent: HTMLElement,
    title: string,
    description: string,
  ): void {
    const header = parent.createDiv({ cls: "classpage-section__header" });
    header.createEl("h2", {
      cls: "classpage-section__title",
      text: title,
    });
    header.createEl("p", {
      cls: "classpage-section__description",
      text: description,
    });
  }

  private renderTeacherStatusSection(
    parent: HTMLElement,
    teacherData: TeacherPageData | null,
  ): void {
    const section = parent.createDiv({ cls: "classpage-section" });
    this.renderSectionHeader(
      section,
      "오늘 상태",
      "카드를 눌러 필요한 영역만 보고, 다시 누르면 전체를 봅니다.",
    );

    const grid = section.createDiv({ cls: "classpage-dashboard-grid" });
    this.renderTeacherStatusCard(
      grid,
      "class",
      "학급",
      teacherData?.classSummary ?? null,
    );
    this.renderTeacherStatusCard(
      grid,
      "lesson",
      "수업",
      teacherData?.lessonSummary ?? null,
    );
    this.renderTeacherStatusCard(
      grid,
      "star",
      "별점",
      teacherData?.starLedger ?? null,
    );
  }

  private renderTeacherStatusCard(
    parent: HTMLElement,
    mode: Exclude<TeacherFocusMode, "overview">,
    title: string,
    sourceState: TeacherAggregateState | null,
  ): void {
    const button = parent.createDiv({
      cls: "classpage-card classpage-dashboard-card",
      attr: {
        role: "button",
        tabindex: "0",
        "aria-pressed": this.teacherFocusMode === mode ? "true" : "false",
      },
    });

    if (this.teacherFocusMode === mode) {
      button.addClass("is-active");
    }

    const header = button.createDiv({ cls: "classpage-dashboard-card__header" });
    header.createEl("span", {
      cls: "classpage-dashboard-card__label",
      text: title,
    });
    header.createEl("span", {
      cls: `classpage-source-status classpage-source-status--${sourceState?.status ?? "missing"}`,
      text: sourceState ? this.getSourceStatusLabel(sourceState.status) : "대기",
    });

    button.createEl("strong", {
      cls: "classpage-dashboard-card__value",
      text: this.getTeacherStatusPrimaryValue(mode, sourceState),
    });
    button.createEl("p", {
      cls: "classpage-dashboard-card__meta",
      text: this.getTeacherStatusPrimaryMeta(mode, sourceState),
    });
    button.createEl("p", {
      cls: "classpage-dashboard-card__hint",
      text: this.getTeacherStatusHint(mode, sourceState),
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
    button.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      toggleMode();
    });
  }

  private renderTeacherAdvancedSection(
    parent: HTMLElement,
    teacherData: TeacherPageData | null,
  ): void {
    const details = parent.createEl("details", {
      cls: "classpage-card classpage-advanced",
    });
    details.createEl("summary", {
      cls: "classpage-advanced__summary",
      text: "구조/파일 보기",
    });

    const content = details.createDiv({ cls: "classpage-advanced__content" });
    this.renderBoundaryCard(
      content,
      "집계 구조",
      "필요할 때만 구조와 파일 위치를 확인합니다. 첫 화면에서는 상태와 업무 선택이 먼저 보이도록 뺐습니다.",
      [
        `수집: Google Form`,
        `저장: Google Sheets`,
        `집계: Apps Script 또는 외부 자동화`,
        `표시: classpage`,
      ],
    );

    const sourceSection = content.createDiv({ cls: "classpage-section" });
    this.renderSectionHeader(
      sourceSection,
      "파일 상태 상세",
      this.getTeacherSourceDescription(),
    );

    const sourceGrid = sourceSection.createDiv({ cls: "classpage-source-grid" });
    this.renderSourceCard(
      sourceGrid,
      "학급용 집계 파일",
      "학급용 Google Form -> Google Sheets -> Apps Script/집계 레이어 -> class-summary.json",
      teacherData?.classSummary ?? null,
    );
    this.renderSourceCard(
      sourceGrid,
      "수업용 집계 파일",
      "수업용 Google Form -> Google Sheets -> Apps Script/집계 레이어 -> lesson-summary.json",
      teacherData?.lessonSummary ?? null,
    );
    this.renderSourceCard(
      sourceGrid,
      "별점모드 집계 파일",
      "학급용/수업용 응답 -> Apps Script 별점 이벤트 집계 -> star-ledger.json",
      teacherData?.starLedger ?? null,
    );
  }

  private renderListCard(
    parent: HTMLElement,
    title: string,
    items: string[],
  ): void {
    const card = parent.createDiv({ cls: "classpage-card classpage-basic-card" });
    card.createEl("h2", { cls: "classpage-card__title", text: title });

    const list = card.createEl("ul", { cls: "classpage-list" });
    const entries = items.length > 0 ? items : ["등록된 항목이 없습니다."];

    for (const item of entries) {
      const listItem = list.createEl("li", { cls: "classpage-list__item" });
      listItem.createDiv({ cls: "classpage-list__dot" });
      listItem.createEl("span", {
        cls: "classpage-list__text",
        text: item,
      });
    }
  }

  private renderFormCard(parent: HTMLElement, form: ClassPageFormSettings): void {
    const card = parent.createDiv({ cls: "classpage-card classpage-form-card" });
    card.createEl("h2", { cls: "classpage-card__title", text: form.title });

    if (form.description) {
      card.createEl("p", {
        cls: "classpage-form-card__description",
        text: form.description,
      });
    }

    const actionArea = card.createDiv({ cls: "classpage-form-card__actions" });
    const helperText = form.helperText || (
      form.url ? "" : "설정에서 Google Form 링크를 입력하면 바로 사용할 수 있습니다."
    );

    if (helperText) {
      actionArea.createEl("p", {
        cls: "classpage-form-card__helper",
        text: helperText,
      });
    }

    const button = actionArea.createEl("a", {
      cls: "classpage-button",
      text: form.buttonLabel,
      href: form.url || "#",
    });

    if (form.url) {
      button.target = "_blank";
      button.rel = "noopener noreferrer";
    } else {
      button.addClass("is-disabled");
      button.setAttr("aria-disabled", "true");
      button.addEventListener("click", (event) => {
        event.preventDefault();
        new Notice("설정에서 Google Form 링크를 입력해주세요.");
      });
    }
  }

  private renderSourceCard(
    parent: HTMLElement,
    title: string,
    flowText: string,
    sourceState: AggregateSourceState<
      ClassSummaryAggregate | LessonSummaryAggregate | StarModeLedger
    > | null,
  ): void {
    const card = parent.createDiv({ cls: "classpage-card classpage-source-card" });
    const cardHeader = card.createDiv({ cls: "classpage-source-card__header" });

    cardHeader.createEl("h3", {
      cls: "classpage-card__title",
      text: title,
    });

    const statusLabel = sourceState
      ? this.getSourceStatusLabel(sourceState.status)
      : "대기";
    cardHeader.createEl("span", {
      cls: `classpage-source-status classpage-source-status--${sourceState?.status ?? "missing"}`,
      text: statusLabel,
    });

    card.createEl("p", {
      cls: "classpage-source-card__flow",
      text: flowText,
    });

    card.createEl("p", {
      cls: "classpage-source-card__path",
      text: `경로: ${sourceState?.path || "설정되지 않음"}`,
    });

    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      card.createEl("p", {
        cls: "classpage-source-card__message",
        text: sourceState?.message || "집계 데이터를 아직 불러오지 않았습니다.",
      });
      return;
    }

    const metaList = card.createEl("dl", { cls: "classpage-meta-list" });
    this.renderMetaRow(metaList, "집계 시각", formatDateLabel(sourceState.data.generatedAt));
    if (sourceState.data.type === "star-ledger") {
      this.renderMetaRow(metaList, "반영 이벤트", `${sourceState.data.eventCount}건`);
      if (sourceState.data.excludedResponseCount > 0) {
        this.renderMetaRow(
          metaList,
          "제외 응답",
          `${sourceState.data.excludedResponseCount}건`,
        );
      }
      this.renderMetaRow(metaList, "활성 규칙", `${getEnabledStarRules(sourceState.data.rules).length}개`);
      this.renderMetaRow(metaList, "자동 적립", `${getAutomaticStarEventCount(sourceState.data.sourceSummary)}건`);
      this.renderMetaRow(metaList, "수동/일괄", `${sourceState.data.sourceSummary.manual}건`);
      this.renderMetaRow(metaList, "범위", sourceState.data.periodLabel);
    } else {
      this.renderMetaRow(metaList, "반영 응답", `${sourceState.data.responseCount}건`);
      if (sourceState.data.excludedResponseCount > 0) {
        this.renderMetaRow(
          metaList,
          "제외 응답",
          `${sourceState.data.excludedResponseCount}건`,
        );
      }
      this.renderMetaRow(metaList, "범위", sourceState.data.periodLabel);
    }

    if (sourceState.data.source.formName) {
      this.renderMetaRow(metaList, "원본 폼", sourceState.data.source.formName);
    }
    if (sourceState.data.source.sheetName) {
      this.renderMetaRow(metaList, "원본 시트", sourceState.data.source.sheetName);
    }
    if (sourceState.data.source.aggregatorNote) {
      this.renderMetaRow(metaList, "집계 설명", sourceState.data.source.aggregatorNote);
    }
  }

  private renderClassSummaryCard(
    parent: HTMLElement,
    sourceState: AggregateSourceState<ClassSummaryAggregate> | null,
    emptyMessage: string,
  ): void {
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
      "응답 수",
      `${summary.responseCount}`,
      this.buildResponseCountDescription(summary),
    );
    this.renderStatCard(
      stats,
      "정서 주의 학생",
      `${summary.supportStudents.length}`,
      "정서/목표 확인 필요",
    );
    this.renderStatCard(
      stats,
      "목표 항목",
      `${summary.goalSummary.reduce((sum, item) => sum + item.count, 0)}`,
      "어제 할 일 달성도 기반",
    );
    this.renderStatCard(
      stats,
      "칭찬 후보",
      `${summary.praiseCandidates.length}`,
      "친구 도움/격려 후보",
    );

    const grid = parent.createDiv({ cls: "classpage-summary-grid" });
    this.renderGroupedDrilldownCard(
      grid,
      "정서 상태 분포",
      summary.emotionSummary.map((item) => ({
        title: item.label,
        meta: `${item.count}명`,
        description: item.note || "정서 상태 분포",
        emptyMessage: hasStudentSnapshots
          ? "해당 상태 학생이 없습니다."
          : "학생별 응답 스냅샷이 없어 drill-down을 열 수 없습니다.",
        items: summary.studentResponses
          .filter((student) => student.emotionLabel === item.label)
          .map((student) => this.buildClassResponseDrilldownItem(student)),
      })),
      "정서 분포 데이터가 없습니다.",
    );
    this.renderGroupedDrilldownCard(
      grid,
      "목표 달성 분포",
      summary.goalSummary.map((item) => ({
        title: item.label,
        meta: `${item.count}명`,
        description: item.note || "목표 달성 분포",
        emptyMessage: hasStudentSnapshots
          ? "해당 달성도 학생이 없습니다."
          : "학생별 응답 스냅샷이 없어 drill-down을 열 수 없습니다.",
        items: summary.studentResponses
          .filter((student) => student.goalLabel === item.label)
          .map((student) => this.buildClassResponseDrilldownItem(student)),
      })),
      "목표 분포 데이터가 없습니다.",
    );
    this.renderStudentDrilldownCard(
      grid,
      "도움이 필요한 학생",
      summary.supportStudents.map((student) =>
        this.buildClassSupportDrilldownItem(
          student,
          this.findClassResponseByStudent(responseMap, student.student),
        )
      ),
      "현재 표시할 학생이 없습니다.",
    );
    this.renderStudentDrilldownCard(
      grid,
      "칭찬/격려 후보",
      summary.praiseCandidates.map((student) =>
        this.buildPraiseCandidateDrilldownItem(
          student,
          this.findClassResponseByStudent(responseMap, student.student),
        )
      ),
      "현재 표시할 학생이 없습니다.",
    );
  }

  private renderLessonSummaryCard(
    parent: HTMLElement,
    sourceState: AggregateSourceState<LessonSummaryAggregate> | null,
    emptyMessage: string,
  ): void {
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
      "응답 수",
      `${summary.responseCount}`,
      this.buildResponseCountDescription(summary),
    );
    this.renderStatCard(
      stats,
      "평균 정답",
      summary.overview.averageCorrectCount.toFixed(1),
      `${summary.subject || "수업"} 기준`,
    );
    this.renderStatCard(
      stats,
      "평균 오답",
      summary.overview.averageIncorrectCount.toFixed(1),
      "학생별 정오답 평균",
    );
    this.renderStatCard(
      stats,
      "과제 수행",
      summary.overview.assignmentCompletionLabel || "미분류",
      "집계 레이어 결과",
    );

    const grid = parent.createDiv({ cls: "classpage-summary-grid" });
    this.renderGroupedDrilldownCard(
      grid,
      "어려워한 개념",
      summary.difficultConcepts.map((item) => ({
        title: item.concept,
        meta: `${item.count}명`,
        description: [item.averageUnderstanding, item.note]
          .filter(Boolean)
          .join(" / "),
        tone: item.count > 0 ? "warning" : undefined,
        emptyMessage: hasStudentSnapshots
          ? "해당 개념에서 낮은 이해 학생이 없습니다."
          : "학생별 응답 스냅샷이 없어 drill-down을 열 수 없습니다.",
        items: summary.studentResponses
          .filter((student) => this.hasLowConcept(student, item.concept))
          .map((student) => this.buildLessonStudentDrilldownItem(student)),
      })),
      "어려워한 개념 데이터가 없습니다.",
    );
    this.renderGroupedDrilldownCard(
      grid,
      "과제 수행 분포",
      summary.assignmentSummary.map((item) => ({
        title: item.label,
        meta: `${item.count}명`,
        description: item.note || "과제 수행 상태",
        emptyMessage: hasStudentSnapshots
          ? "해당 과제 수행 학생이 없습니다."
          : "학생별 응답 스냅샷이 없어 drill-down을 열 수 없습니다.",
        items: summary.studentResponses
          .filter((student) => student.assignmentStatus === item.label)
          .map((student) => this.buildLessonStudentDrilldownItem(student)),
      })),
      "과제 수행 집계가 없습니다.",
    );
    this.renderStudentDrilldownCard(
      grid,
      "보충 지도가 필요한 학생",
      summary.supportStudents.map((student) =>
        this.buildLessonSupportDrilldownItem(
          student,
          this.findLessonResponseByStudent(responseMap, student.student),
        )
      ),
      "보충 지도가 필요한 학생이 없습니다.",
    );

    this.renderStudentDrilldownCard(
      parent,
      "학생별 정오답 및 과제 현황",
      summary.studentResults.map((result) =>
        this.buildStudentResultDrilldownItem(
          result,
          this.findLessonResponseByStudent(responseMap, result.student),
        )
      ),
      "학생별 결과가 없습니다.",
      true,
    );
  }

  private renderStarLedgerCard(
    parent: HTMLElement,
    sourceState: AggregateSourceState<StarModeLedger> | null,
    emptyMessage: string,
  ): void {
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
      "상태",
      "기본 연결",
      "읽기 전용 요약과 최근 이벤트를 확인합니다.",
    );
    this.renderStatCard(
      stats,
      "활성 규칙",
      `${enabledRules.length}`,
      `자동 ${autoRules.length}개 / 수동 ${manualRules.length}개`,
    );
    this.renderStatCard(
      stats,
      "학생 공개",
      `${visibleRules.length}`,
      `${ledger.totals.length}명 기준 공개 누적 계산`,
    );
    this.renderStatCard(
      stats,
      "교사 전용",
      `${teacherOnlyRules.length}`,
      "수동 조정과 숨김 반영은 조정 시트 기준",
    );
    this.renderStatCard(
      stats,
      "전체 이벤트",
      `${ledger.eventCount}`,
      `자동 ${automaticEventCount}건 / 수동 ${ledger.sourceSummary.manual}건`,
    );
    this.renderStatCard(
      stats,
      "수동/일괄",
      ledger.sourceSummary.manual > 0 ? `${ledger.sourceSummary.manual}건` : "없음",
      ledger.sourceSummary.manual > 0
        ? "수동 조정 또는 일괄 부여가 ledger에 반영됨"
        : "수동 조정/일괄 부여 입력 없음",
    );

    const grid = parent.createDiv({ cls: "classpage-summary-grid" });
    this.renderDetailRowsCard(
      grid,
      "최근 별점 이벤트",
      ledger.recentEvents.map((event) => this.buildStarEventRow(event, ledger.rules)),
      "최근 이벤트가 없습니다.",
    );
    this.renderDetailRowsCard(
      grid,
      "상위 학생",
      topStudents.map((total) => this.buildStarTotalRow(total)),
      "표시할 학생이 없습니다.",
    );

    this.renderDetailRowsCard(
      parent,
      "활성 규칙",
      enabledRules.map((rule) => ({
        title: rule.label,
        meta: `${formatSignedPoints(rule.delta)} · ${getStarCategoryLabel(rule.category)}`,
        description: [
          rule.description,
          getStarAutoCriteriaSummary(rule.autoCriteria),
          getStarVisibilityLabel(rule.visibility),
          getStarRuleSourceSummary(rule.sources),
          rule.sources.includes("manual")
            ? rule.allowCustomDelta
              ? "수동 점수 직접 입력 허용"
              : "수동 점수는 기본값 사용"
            : "자동 적립 규칙",
        ].join(" / "),
        tone: rule.delta < 0 ? "warning" : "positive",
      })),
      "활성 규칙이 없습니다.",
      true,
    );
  }

  private renderEmptyAggregateCard(
    parent: HTMLElement,
    emptyMessage: string,
    sourceState: AggregateSourceState<
      ClassSummaryAggregate | LessonSummaryAggregate | StarModeLedger
    > | null,
  ): void {
    const card = parent.createDiv({ cls: "classpage-card classpage-empty-card" });
    card.createEl("h3", {
      cls: "classpage-card__title",
      text: "집계 결과를 표시할 수 없습니다",
    });
    card.createEl("p", {
      cls: "classpage-empty-card__message",
      text: emptyMessage,
    });

    if (sourceState?.path) {
      card.createEl("p", {
        cls: "classpage-source-card__path",
        text: `설정 경로: ${sourceState.path}`,
      });
    }

    if (sourceState?.message) {
      card.createEl("p", {
        cls: "classpage-empty-card__detail",
        text: `오류/상태: ${sourceState.message}`,
      });
    }
  }

  private renderStatCard(
    parent: HTMLElement,
    label: string,
    value: string,
    description: string,
  ): void {
    const card = parent.createDiv({ cls: "classpage-card classpage-stat-card" });
    card.createEl("span", {
      cls: "classpage-stat-card__label",
      text: label,
    });
    card.createEl("strong", {
      cls: "classpage-stat-card__value",
      text: value,
    });
    card.createEl("p", {
      cls: "classpage-stat-card__description",
      text: description,
    });
  }

  private renderGroupedDrilldownCard(
    parent: HTMLElement,
    title: string,
    groups: DrilldownGroup[],
    emptyMessage: string,
    isWide = false,
  ): void {
    const classes = ["classpage-card", "classpage-detail-card"];
    if (isWide) {
      classes.push("classpage-detail-card--wide");
    }

    const card = parent.createDiv({ cls: classes.join(" ") });
    card.createEl("h3", {
      cls: "classpage-card__title",
      text: title,
    });

    if (groups.length === 0) {
      card.createEl("p", {
        cls: "classpage-empty-card__message",
        text: emptyMessage,
      });
      return;
    }

    const list = card.createDiv({ cls: "classpage-accordion-list" });
    for (const group of groups) {
      const details = list.createEl("details", {
        cls: `classpage-accordion${group.tone ? ` is-${group.tone}` : ""}`,
      });
      const summary = details.createEl("summary", {
        cls: "classpage-accordion__summary",
      });
      this.renderDrilldownSummary(
        summary,
        group.title,
        group.meta,
        group.description,
        "classpage-accordion__summary-text",
      );

      if (group.items.length === 0) {
        details.createEl("p", {
          cls: "classpage-drilldown-empty",
          text: group.emptyMessage,
        });
        continue;
      }

      const studentList = details.createDiv({ cls: "classpage-drilldown-list" });
      for (const item of group.items) {
        this.renderStudentDrilldownItem(studentList, item);
      }
    }
  }

  private renderStudentDrilldownCard(
    parent: HTMLElement,
    title: string,
    items: DrilldownItem[],
    emptyMessage: string,
    isWide = false,
  ): void {
    const classes = ["classpage-card", "classpage-detail-card"];
    if (isWide) {
      classes.push("classpage-detail-card--wide");
    }

    const card = parent.createDiv({ cls: classes.join(" ") });
    card.createEl("h3", {
      cls: "classpage-card__title",
      text: title,
    });

    if (items.length === 0) {
      card.createEl("p", {
        cls: "classpage-empty-card__message",
        text: emptyMessage,
      });
      return;
    }

    const list = card.createDiv({ cls: "classpage-drilldown-list" });
    for (const item of items) {
      this.renderStudentDrilldownItem(list, item);
    }
  }

  private renderStudentDrilldownItem(parent: HTMLElement, item: DrilldownItem): void {
    const details = parent.createEl("details", {
      cls: `classpage-student-drilldown${item.tone ? ` is-${item.tone}` : ""}`,
    });
    const summary = details.createEl("summary", {
      cls: "classpage-student-drilldown__summary",
    });
    this.renderDrilldownSummary(
      summary,
      item.title,
      item.meta,
      item.summary,
      "classpage-student-drilldown__summary-text",
    );

    if (item.fields.length === 0) {
      details.createEl("p", {
        cls: "classpage-drilldown-empty",
        text: "표시할 상세 내용이 없습니다.",
      });
      return;
    }

    const fieldList = details.createEl("dl", { cls: "classpage-drilldown-fields" });
    for (const field of item.fields) {
      this.renderMetaRow(fieldList, field.label, field.value);
    }
  }

  private renderDrilldownSummary(
    parent: HTMLElement,
    title: string,
    meta: string,
    description: string,
    textClass: string,
  ): void {
    const text = parent.createDiv({ cls: textClass });
    const header = text.createDiv({ cls: "classpage-detail-list__header" });
    header.createEl("strong", {
      cls: "classpage-detail-list__title",
      text: title,
    });

    if (meta) {
      header.createEl("span", {
        cls: "classpage-detail-list__meta",
        text: meta,
      });
    }

    if (description) {
      text.createEl("p", {
        cls: "classpage-detail-list__description",
        text: description,
      });
    }
  }

  private renderDetailRowsCard(
    parent: HTMLElement,
    title: string,
    rows: DetailRow[],
    emptyMessage: string,
    isWide = false,
  ): void {
    const classes = ["classpage-card", "classpage-detail-card"];
    if (isWide) {
      classes.push("classpage-detail-card--wide");
    }

    const card = parent.createDiv({ cls: classes.join(" ") });
    card.createEl("h3", {
      cls: "classpage-card__title",
      text: title,
    });

    if (rows.length === 0) {
      card.createEl("p", {
        cls: "classpage-empty-card__message",
        text: emptyMessage,
      });
      return;
    }

    const list = card.createDiv({ cls: "classpage-detail-list" });
    for (const row of rows) {
      const item = list.createDiv({
        cls: `classpage-detail-list__item${row.tone ? ` is-${row.tone}` : ""}`,
      });

      const itemHeader = item.createDiv({ cls: "classpage-detail-list__header" });
      itemHeader.createEl("strong", {
        cls: "classpage-detail-list__title",
        text: row.title,
      });

      if (row.meta) {
        itemHeader.createEl("span", {
          cls: "classpage-detail-list__meta",
          text: row.meta,
        });
      }

      if (row.description) {
        item.createEl("p", {
          cls: "classpage-detail-list__description",
          text: row.description,
        });
      }
    }
  }

  private renderMetaRow(parent: HTMLElement, label: string, value: string): void {
    parent.createEl("dt", {
      cls: "classpage-meta-list__label",
      text: label,
    });
    parent.createEl("dd", {
      cls: "classpage-meta-list__value",
      text: value,
    });
  }

  private buildCountRow(item: AggregateCountItem): DetailRow {
    return {
      title: item.label,
      meta: `${item.count}명`,
      description: item.note,
    };
  }

  private buildStudentResponseMap(
    responses: ClassStudentResponse[],
  ): Map<string, ClassStudentResponse> {
    return new Map(
      responses
        .map((item) => [this.getStudentLookupKey(item.student), item] as const)
        .filter((entry): entry is readonly [string, ClassStudentResponse] => entry[0] !== null),
    );
  }

  private buildLessonResponseMap(
    responses: LessonStudentResponse[],
  ): Map<string, LessonStudentResponse> {
    return new Map(
      responses
        .map((item) => [this.getStudentLookupKey(item.student), item] as const)
        .filter((entry): entry is readonly [string, LessonStudentResponse] => entry[0] !== null),
    );
  }

  private getStudentLookupKey(student: StudentReference): string | null {
    if (!this.hasStudentLookupIdentity(student)) {
      return null;
    }

    return [
      student.classroom.trim().toLowerCase(),
      student.number.trim().toLowerCase(),
      student.name.trim().toLowerCase(),
    ].join("|");
  }

  private hasStudentLookupIdentity(student: StudentReference): boolean {
    return [
      student.classroom,
      student.number,
      student.name,
    ].some((value) => value.trim().length > 0);
  }

  private findClassResponseByStudent(
    responses: Map<string, ClassStudentResponse>,
    student: StudentReference,
  ): ClassStudentResponse | null {
    const key = this.getStudentLookupKey(student);
    return key ? responses.get(key) ?? null : null;
  }

  private findLessonResponseByStudent(
    responses: Map<string, LessonStudentResponse>,
    student: StudentReference,
  ): LessonStudentResponse | null {
    const key = this.getStudentLookupKey(student);
    return key ? responses.get(key) ?? null : null;
  }

  private buildClassResponseDrilldownItem(student: ClassStudentResponse): DrilldownItem {
    return {
      title: formatStudentLabel(student.student),
      meta: student.mood || student.emotionLabel || "상태 확인 필요",
      summary: [
        student.goal ? `오늘 목표: ${student.goal}` : "",
        student.yesterdayAchievement ? `어제 달성도: ${student.yesterdayAchievement}` : "",
      ].filter(Boolean).join(" / ") || "제출 응답 상세 보기",
      fields: this.compactDrilldownFields([
        ["정서 분류", student.emotionLabel],
        ["오늘 기분", student.mood],
        ["기분 이유", student.moodReason],
        ["오늘 목표", student.goal],
        ["어제 할 일 달성도", student.yesterdayAchievement],
        ["선생님께 하고 싶은 말", student.teacherMessage],
        ["도움을 준 친구 기록", student.helpedFriend],
        ["도움을 받은 친구 기록", student.helpedByFriend],
        ["분석 메모", student.teacherNote],
      ]),
    };
  }

  private buildClassSupportDrilldownItem(
    student: ClassSummaryAggregate["supportStudents"][number],
    response: ClassStudentResponse | null,
  ): DrilldownItem {
    return {
      title: formatStudentLabel(student.student),
      meta: student.mood || "상태 확인 필요",
      summary: student.reason || "도움이 필요한 근거 보기",
      tone: "warning",
      fields: this.compactDrilldownFields([
        ["도움 필요 근거", student.reason],
        ["오늘 목표", student.goal],
        ["어제 할 일 달성도", student.yesterdayAchievement],
        ["기분 이유", response?.moodReason || ""],
        ["선생님께 하고 싶은 말", response?.teacherMessage || ""],
        ["도움을 받은 친구 기록", response?.helpedByFriend || ""],
        ["도움을 준 친구 기록", response?.helpedFriend || ""],
        ["분석 메모", student.teacherNote || response?.teacherNote || ""],
      ]),
    };
  }

  private buildPraiseCandidateDrilldownItem(
    student: ClassSummaryAggregate["praiseCandidates"][number],
    response: ClassStudentResponse | null,
  ): DrilldownItem {
    return {
      title: formatStudentLabel(student.student),
      meta: student.mentionedPeer ? `언급 친구: ${student.mentionedPeer}` : "칭찬 후보",
      summary: student.reason || "칭찬 사유 보기",
      tone: "positive",
      fields: this.compactDrilldownFields([
        ["칭찬 사유", student.reason],
        ["언급 친구", student.mentionedPeer],
        ["도움을 준 친구 기록", response?.helpedFriend || ""],
        ["기분 이유", response?.moodReason || ""],
        ["오늘 목표", response?.goal || ""],
      ]),
    };
  }

  private buildLessonStudentDrilldownItem(student: LessonStudentResponse): DrilldownItem {
    return {
      title: formatStudentLabel(student.student),
      meta: `정답 ${student.correctCount} / 오답 ${student.incorrectCount}`,
      summary: [
        student.assignmentStatus ? `과제: ${student.assignmentStatus}` : "",
        student.followUp ? `후속: ${student.followUp}` : "",
      ].filter(Boolean).join(" / ") || "수업 응답 상세 보기",
      fields: this.compactDrilldownFields([
        ["단원", student.lessonUnit],
        ["정답 수", String(student.correctCount)],
        ["오답 수", String(student.incorrectCount)],
        ["과제 수행", student.assignmentStatus],
        ["헷갈린 부분", student.misconception],
        ["후속 지도", student.followUp],
        ["틀린 이유", student.incorrectReason],
        ["선생님께 하고 싶은 말", student.teacherMessage],
        ["개념 응답", this.buildConceptSummary(student)],
        ["분석 메모", student.teacherNote],
      ]),
    };
  }

  private buildLessonSupportDrilldownItem(
    student: LessonSummaryAggregate["supportStudents"][number],
    response: LessonStudentResponse | null,
  ): DrilldownItem {
    return {
      title: formatStudentLabel(student.student),
      meta: `정답 ${student.correctCount} / 오답 ${student.incorrectCount}`,
      summary: [
        student.assignmentStatus ? `과제: ${student.assignmentStatus}` : "",
        student.misconception ? `헷갈린 부분: ${student.misconception}` : "",
      ].filter(Boolean).join(" / ") || "보충 지도 근거 보기",
      tone: "warning",
      fields: this.compactDrilldownFields([
        ["과제 수행", student.assignmentStatus],
        ["헷갈린 부분", student.misconception],
        ["틀린 이유", response?.incorrectReason || ""],
        ["선생님께 하고 싶은 말", response?.teacherMessage || ""],
        ["개념 응답", response ? this.buildConceptSummary(response) : ""],
        ["분석 메모", student.teacherNote || response?.teacherNote || ""],
      ]),
    };
  }

  private buildStudentResultDrilldownItem(
    result: LessonSummaryAggregate["studentResults"][number],
    response: LessonStudentResponse | null,
  ): DrilldownItem {
    return {
      title: formatStudentLabel(result.student),
      meta: `정답 ${result.correctCount} / 오답 ${result.incorrectCount}`,
      summary: [
        result.assignmentStatus ? `과제: ${result.assignmentStatus}` : "",
        result.followUp ? `후속 지도: ${result.followUp}` : "",
      ].filter(Boolean).join(" / ") || "학생별 결과 보기",
      fields: this.compactDrilldownFields([
        ["과제 수행", result.assignmentStatus],
        ["후속 지도", result.followUp],
        ["틀린 이유", response?.incorrectReason || ""],
        ["선생님께 하고 싶은 말", response?.teacherMessage || ""],
        ["개념 응답", response ? this.buildConceptSummary(response) : ""],
        ["분석 메모", response?.teacherNote || ""],
      ]),
    };
  }

  private buildConceptSummary(student: LessonStudentResponse): string {
    return student.concepts
      .map((item) => {
        const parts = [item.concept, item.understandingLabel || item.understanding]
          .filter(Boolean);
        return parts.join(": ");
      })
      .filter(Boolean)
      .join(" / ");
  }

  private hasLowConcept(student: LessonStudentResponse, concept: string): boolean {
    return student.concepts.some((item) =>
      item.concept === concept && item.understandingLabel === "낮음"
    );
  }

  private compactDrilldownFields(
    fields: Array<readonly [label: string, value: string]>,
  ): DrilldownField[] {
    return fields
      .map(([label, value]) => ({
        label,
        value: value.trim(),
      }))
      .filter((item) => item.value.length > 0);
  }

  private getTeacherStatusPrimaryValue(
    mode: Exclude<TeacherFocusMode, "overview">,
    sourceState: TeacherAggregateState | null,
  ): string {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return sourceState?.status === "invalid" ? "형식 확인" : "확인 필요";
    }

    if (mode === "star" || sourceState.data.type === "star-ledger") {
      return "기본 연결";
    }

    return `${sourceState.data.responseCount}건`;
  }

  private getTeacherStatusPrimaryMeta(
    mode: Exclude<TeacherFocusMode, "overview">,
    sourceState: TeacherAggregateState | null,
  ): string {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return sourceState?.message || "집계 파일 상태를 확인하세요.";
    }

    if (mode === "star" && sourceState.data.type === "star-ledger") {
      const enabledRules = getEnabledStarRules(sourceState.data.rules);
      return [
        `규칙 ${enabledRules.length}개`,
        `학생 ${sourceState.data.totals.length}명`,
      ].join(" · ");
    }

    return sourceState.data.periodLabel || "범위 미확인";
  }

  private getTeacherStatusHint(
    mode: Exclude<TeacherFocusMode, "overview">,
    sourceState: TeacherAggregateState | null,
  ): string {
    const actionHint = this.teacherFocusMode === mode
      ? "다시 누르면 전체 보기"
      : "누르면 이 영역만 보기";

    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return `${actionHint} · 연결과 JSON 경로를 확인하세요.`;
    }

    const suffix = sourceState.data.type === "star-ledger"
      ? [
          sourceState.data.eventCount > 0
            ? `이벤트 ${sourceState.data.eventCount}건`
            : "이벤트 없음",
          `집계 ${formatDateLabel(sourceState.data.generatedAt, "시각 미확인")}`,
        ].join(" · ")
      : [
          `집계 ${formatDateLabel(sourceState.data.generatedAt, "시각 미확인")}`,
          sourceState.data.excludedResponseCount > 0
            ? `제외 ${sourceState.data.excludedResponseCount}건`
            : "",
        ].filter(Boolean).join(" · ");

    switch (mode) {
      case "class":
        return `${actionHint} · 정서와 목표 상태 확인 · ${suffix}`;
      case "lesson":
        return `${actionHint} · 수업 이해와 과제 상태 확인 · ${suffix}`;
      case "star":
        return `${actionHint} · 읽기 전용 별점 요약 확인 · ${suffix}`;
    }
  }

  private getTeacherSourceDescription(): string {
    return "문제가 생기면 이 섹션에서 JSON 경로, 집계 시각, 원본 시트 이름을 확인합니다.";
  }

  private shouldShowTeacherSection(
    section: Exclude<TeacherFocusMode, "overview">,
  ): boolean {
    return this.teacherFocusMode === "overview" || this.teacherFocusMode === section;
  }

  private buildClassSectionDescription(
    sourceState: AggregateSourceState<ClassSummaryAggregate> | null,
  ): string {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return "정서 상태, 목표 달성, 도움 필요 학생, 칭찬 후보를 학급용 집계 JSON에서 읽습니다.";
    }

    return [
      sourceState.data.classroom,
      sourceState.data.periodLabel,
      `${sourceState.data.responseCount}건 반영`,
      sourceState.data.excludedResponseCount > 0
        ? `제외 ${sourceState.data.excludedResponseCount}건`
        : "",
    ].filter(Boolean).join(" · ");
  }

  private buildLessonSectionDescription(
    sourceState: AggregateSourceState<LessonSummaryAggregate> | null,
  ): string {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return "어려워한 개념, 정오답, 과제 수행 정도를 수업용 집계 JSON에서 읽습니다.";
    }

    return [
      sourceState.data.classroom,
      sourceState.data.subject,
      sourceState.data.periodLabel,
      `${sourceState.data.responseCount}건 반영`,
      sourceState.data.excludedResponseCount > 0
        ? `제외 ${sourceState.data.excludedResponseCount}건`
        : "",
    ].filter(Boolean).join(" · ");
  }

  private buildStarSectionDescription(
    sourceState: AggregateSourceState<StarModeLedger> | null,
  ): string {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return "별점 ledger의 읽기 전용 요약과 최근 이벤트를 확인합니다.";
    }

    const enabledRules = getEnabledStarRules(sourceState.data.rules);

    return [
      "기본 연결",
      sourceState.data.periodLabel,
      `규칙 ${enabledRules.length}개`,
      `학생 ${sourceState.data.totals.length}명`,
      `자동 ${getAutomaticStarEventCount(sourceState.data.sourceSummary)}건`,
      sourceState.data.sourceSummary.manual > 0
        ? `수동/일괄 ${sourceState.data.sourceSummary.manual}건`
        : "",
    ].filter(Boolean).join(" · ");
  }

  private buildResponseCountDescription(
    summary: Pick<ClassSummaryAggregate | LessonSummaryAggregate, "periodLabel" | "excludedResponseCount">,
  ): string {
    if (summary.excludedResponseCount > 0) {
      return `${summary.periodLabel} / 제외 ${summary.excludedResponseCount}건`;
    }

    return `${summary.periodLabel} / 반영 응답 기준`;
  }

  private buildStarEventRow(
    event: StarEvent,
    rules: StarRuleSettings[],
  ): DetailRow {
    const rule = rules.find((item) => item.ruleId === event.ruleId);
    const sourceLabel = getStarEventSourceLabel(event);
    const timeLabel = formatDateLabel(event.occurredAt, "시각 미확인");

    return {
      title: `${rule?.label ?? "규칙 미확인"} · ${formatStudentLabel(event.student)}`,
      meta: `${formatSignedPoints(event.delta)} · ${getStarVisibilityLabel(event.visibility)}`,
      description: [
        getStarCategoryLabel(event.category),
        sourceLabel,
        timeLabel,
        event.actor ? `교사 ${event.actor}` : "",
        event.batchId ? `batch ${event.batchId}` : "",
        event.note || rule?.description || "설명 미확인",
      ].filter(Boolean).join(" / "),
      tone: event.delta < 0 ? "warning" : "positive",
    };
  }

  private buildStarTotalRow(total: StarStudentTotal): DetailRow {
    return {
      title: formatStudentLabel(total.student),
      meta: `총 ${formatSignedPoints(total.total)}`,
      description: [
        `학생 공개 ${formatSignedPoints(total.visibleTotal)}`,
        `교사 조정 ${formatSignedPoints(total.hiddenAdjustmentTotal)}`,
        `이벤트 ${total.eventCount}건`,
      ].join(" / "),
      tone: total.hiddenAdjustmentTotal < 0 ? "warning" : "positive",
    };
  }

  private getSourceStatusLabel(
    status: AggregateSourceState<unknown>["status"],
  ): string {
    switch (status) {
      case "loaded":
        return "연결됨";
      case "missing":
        return "없음";
      case "invalid":
        return "형식 확인";
      default:
        return "오류";
    }
  }
}

class ClassPageSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private readonly plugin: ClassPagePlugin,
  ) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    const { settings } = this.plugin;

    containerEl.empty();
    containerEl.createEl("h2", { text: "classpage 설정" });
    containerEl.createEl("p", {
      text: "학생용 화면은 정적 문구와 Google Form 링크를, 교사용 화면은 집계 JSON 경로를 읽습니다. 학생 응답 원본이나 집계 로직 자체는 이 플러그인에서 수정하지 않습니다.",
    });

    new Setting(containerEl)
      .setName("바로 열기")
      .setDesc("현재 설정으로 교실 페이지를 바로 열어 확인합니다.")
      .addButton((button) => {
        button.setButtonText("교실 페이지 열기");
        button.setCta();
        button.onClick(async () => {
          await this.plugin.activateView();
        });
      });

    this.addSettingsSection(
      "학생용 페이지",
      "학생용 페이지는 classpage 내부 설정값만 사용합니다. 아래를 바꾸면 학생이 보는 문구와 링크가 바뀝니다.",
    );

    this.addTextSetting(
      "제목",
      "학생용 페이지 상단 제목입니다.",
      settings.studentPage.title,
      async (value) => {
        settings.studentPage.title = value.trim() || DEFAULT_SETTINGS.studentPage.title;
        await this.plugin.saveSettings();
      },
      "예: 3학년 2반 교실 페이지",
    );

    this.addTextSetting(
      "설명",
      "학생용 페이지 소개 문구입니다.",
      settings.studentPage.description,
      async (value) => {
        settings.studentPage.description = value.trim();
        await this.plugin.saveSettings();
      },
    );

    this.addTextSetting(
      "상태 문구",
      "학생용 화면의 구조를 설명하는 짧은 문구입니다.",
      settings.studentPage.statusMessage,
      async (value) => {
        settings.studentPage.statusMessage = value.trim();
        await this.plugin.saveSettings();
      },
    );

    this.addSettingsSection(
      "오늘의 할 일",
      "학생용 페이지의 정적 할 일 목록입니다. 한 줄이 한 항목입니다.",
    );

    this.addTextSetting(
      "제목",
      "학생용 할 일 카드 제목입니다.",
      settings.studentPage.today.title,
      async (value) => {
        settings.studentPage.today.title = value.trim() || DEFAULT_SETTINGS.studentPage.today.title;
        await this.plugin.saveSettings();
      },
    );

    this.addTextareaSetting(
      "내용",
      "한 줄에 한 항목씩 입력합니다.",
      settings.studentPage.today.items,
      async (items) => {
        settings.studentPage.today.items = items;
        await this.plugin.saveSettings();
      },
      "예: 등교 후 학급용 폼 제출",
    );

    this.addSettingsSection(
      "공지사항",
      "학생용 페이지의 정적 공지 목록입니다. 실시간 집계가 아니라 운영자가 입력하는 값입니다.",
    );

    this.addTextSetting(
      "제목",
      "학생용 공지 카드 제목입니다.",
      settings.studentPage.notices.title,
      async (value) => {
        settings.studentPage.notices.title = value.trim() || DEFAULT_SETTINGS.studentPage.notices.title;
        await this.plugin.saveSettings();
      },
    );

    this.addTextareaSetting(
      "내용",
      "한 줄에 한 항목씩 입력합니다.",
      settings.studentPage.notices.items,
      async (items) => {
        settings.studentPage.notices.items = items;
        await this.plugin.saveSettings();
      },
      "예: 오늘 5교시 후 청소 점검",
    );

    this.addSettingsSection(
      "학급용 폼",
      "학생이 눌러 이동하는 실제 Google Form 링크와 버튼 문구입니다.",
    );
    this.buildFormSettings(
      settings.studentPage.forms.classForm,
      DEFAULT_SETTINGS.studentPage.forms.classForm,
      async () => {
        await this.plugin.saveSettings();
      },
    );

    this.addSettingsSection(
      "수업용 폼",
      "학생이 수업 후 제출하는 Google Form 링크와 버튼 문구입니다.",
    );
    this.buildFormSettings(
      settings.studentPage.forms.lessonForm,
      DEFAULT_SETTINGS.studentPage.forms.lessonForm,
      async () => {
        await this.plugin.saveSettings();
      },
    );

    this.addSettingsSection(
      "교사용 페이지",
      "교사용 화면은 원본 응답이 아니라 집계 결과를 읽습니다. 아래 값은 표시 레이어 설명과 집계 경로만 바꿉니다.",
    );

    this.addTextSetting(
      "제목",
      "교사용 페이지 상단 제목입니다.",
      settings.teacherPage.title,
      async (value) => {
        settings.teacherPage.title = value.trim() || DEFAULT_SETTINGS.teacherPage.title;
        await this.plugin.saveSettings();
      },
    );

    this.addTextSetting(
      "설명",
      "교사용 페이지의 역할을 설명하는 문구입니다.",
      settings.teacherPage.description,
      async (value) => {
        settings.teacherPage.description = value.trim();
        await this.plugin.saveSettings();
      },
    );

    this.addTextSetting(
      "상태 문구",
      "상단 배지에 짧게 표시할 안내 문구입니다.",
      settings.teacherPage.statusMessage,
      async (value) => {
        settings.teacherPage.statusMessage = value.trim();
        await this.plugin.saveSettings();
      },
    );

    this.addTextSetting(
      "학급 집계 제목",
      "학급용 폼 집계 섹션 제목입니다.",
      settings.teacherPage.classSummaryTitle,
      async (value) => {
        settings.teacherPage.classSummaryTitle = value.trim() || DEFAULT_SETTINGS.teacherPage.classSummaryTitle;
        await this.plugin.saveSettings();
      },
    );

    this.addTextSetting(
      "수업 집계 제목",
      "수업용 폼 집계 섹션 제목입니다.",
      settings.teacherPage.lessonSummaryTitle,
      async (value) => {
        settings.teacherPage.lessonSummaryTitle = value.trim() || DEFAULT_SETTINGS.teacherPage.lessonSummaryTitle;
        await this.plugin.saveSettings();
      },
    );

    this.addTextSetting(
      "별점 섹션 제목",
      "교사용 별점모드 섹션 제목입니다.",
      settings.teacherPage.starLedgerTitle,
      async (value) => {
        settings.teacherPage.starLedgerTitle = value.trim() || DEFAULT_SETTINGS.teacherPage.starLedgerTitle;
        await this.plugin.saveSettings();
      },
    );

    this.addSettingsSection(
      "집계 JSON 경로",
      "여기서는 집계 결과 파일 경로만 설정합니다. Google Sheets나 Apps Script의 계산 로직은 classpage 밖에서 관리합니다.",
    );

    this.addTextSetting(
      "학급 집계 JSON 경로",
      "학급용 폼 집계 결과 JSON 파일의 볼트 내부 경로입니다.",
      settings.teacherPage.sources.classSummaryPath,
      async (value) => {
        settings.teacherPage.sources.classSummaryPath =
          value.trim() || DEFAULT_SETTINGS.teacherPage.sources.classSummaryPath;
        await this.plugin.saveSettings();
      },
      "classpage-data/class-summary.json",
    );

    this.addTextSetting(
      "수업 집계 JSON 경로",
      "수업용 폼 집계 결과 JSON 파일의 볼트 내부 경로입니다.",
      settings.teacherPage.sources.lessonSummaryPath,
      async (value) => {
        settings.teacherPage.sources.lessonSummaryPath =
          value.trim() || DEFAULT_SETTINGS.teacherPage.sources.lessonSummaryPath;
        await this.plugin.saveSettings();
      },
      "classpage-data/lesson-summary.json",
    );

    this.addTextSetting(
      "별점 JSON 경로",
      "별점모드 ledger JSON 파일의 볼트 내부 경로입니다.",
      settings.teacherPage.sources.starLedgerPath,
      async (value) => {
        settings.teacherPage.sources.starLedgerPath =
          value.trim() || DEFAULT_SETTINGS.teacherPage.sources.starLedgerPath;
        await this.plugin.saveSettings();
      },
      "classpage-data/star-ledger.json",
    );
  }

  private buildFormSettings(
    target: ClassPageFormSettings,
    defaults: ClassPageFormSettings,
    onSave: () => Promise<void>,
  ): void {
    this.addTextSetting(
      "Google Form 링크",
      "학생이 이동할 실제 URL입니다.",
      target.url,
      async (value) => {
        target.url = value.trim();
        await onSave();
      },
      defaults.url,
    );

    this.addTextSetting("제목", "버튼 카드의 제목입니다.", target.title, async (value) => {
      target.title = value.trim() || defaults.title;
      await onSave();
    });

    this.addTextSetting(
      "설명",
      "학생에게 보여줄 간단한 설명입니다.",
      target.description,
      async (value) => {
        target.description = value.trim();
        await onSave();
      },
    );

    this.addTextSetting(
      "버튼 문구",
      "버튼에 표시할 문구입니다.",
      target.buttonLabel,
      async (value) => {
        target.buttonLabel = value.trim() || defaults.buttonLabel;
        await onSave();
      },
    );

    this.addTextSetting(
      "안내 문구",
      "제출 시점이나 간단한 상태 문구입니다.",
      target.helperText,
      async (value) => {
        target.helperText = value.trim();
        await onSave();
      },
    );
  }

  private addSettingsSection(title: string, description: string): void {
    this.containerEl.createEl("h3", { text: title });
    this.containerEl.createEl("p", { text: description });
  }

  private addTextSetting(
    name: string,
    desc: string,
    value: string,
    onChange: (value: string) => Promise<void>,
    placeholder = "",
  ): void {
    new Setting(this.containerEl)
      .setName(name)
      .setDesc(desc)
      .addText((text) => {
        text.setValue(value);
        if (placeholder) {
          text.setPlaceholder(placeholder);
        }
        text.onChange(onChange);
      });
  }

  private addTextareaSetting(
    name: string,
    desc: string,
    items: string[],
    onChange: (items: string[]) => Promise<void>,
    placeholder = "",
  ): void {
    new Setting(this.containerEl)
      .setName(name)
      .setDesc(desc)
      .addTextArea((text) => {
        text.setValue(items.join("\n"));
        if (placeholder) {
          text.setPlaceholder(placeholder);
        }
        text.inputEl.rows = 5;
        text.inputEl.cols = 40;
        text.onChange(async (value) => {
          const lines = value
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

          await onChange(lines);
        });
      });
  }
}

function formatDateLabel(
  value: string,
  fallback = "집계 시각 미확인",
): string {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || isPlaceholderDate(date)) {
    return fallback;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatStudentLabel(student: { classroom: string; number: string; name: string }): string {
  const label = [student.classroom, student.number, student.name]
    .filter(Boolean)
    .join(" ");
  return label || "학생 미확인";
}

function isPlaceholderDate(date: Date): boolean {
  return date.getTime() <= 0;
}

function formatSignedPoints(points: number): string {
  const prefix = points > 0 ? "+" : "";
  return `${prefix}${points}점`;
}

function getStarCategoryLabel(category: StarRuleSettings["category"]): string {
  switch (category) {
    case "attendance":
      return "출결";
    case "participation":
      return "참여";
    case "service":
      return "역할";
    case "adjustment":
      return "조정";
    default:
      return "맞춤";
  }
}

function getStarVisibilityLabel(visibility: StarRuleSettings["visibility"]): string {
  return visibility === "teacher" ? "교사 전용" : "학생 공개";
}

function getStarSourceLabel(source: StarEvent["source"]): string {
  switch (source) {
    case "class-form":
      return "학급용 폼";
    case "lesson-form":
      return "수업용 폼";
    case "manual":
      return "수동/일괄 조정";
    default:
      return "시스템";
  }
}

function getStarEventSourceLabel(event: StarEvent): string {
  if (event.source === "manual") {
    return event.batchId ? "일괄 부여" : "수동 조정";
  }

  return getStarSourceLabel(event.source);
}

function getEnabledStarRules(rules: StarRuleSettings[]): StarRuleSettings[] {
  return rules.filter((rule) => rule.enabled);
}

function hasAutomaticStarSource(sources: StarRuleSettings["sources"]): boolean {
  return sources.some((source) =>
    source === "class-form" || source === "lesson-form" || source === "system"
  );
}

function getStarRuleSourceSummary(sources: StarRuleSettings["sources"]): string {
  const labels = sources
    .map((source) => getStarSourceLabel(source))
    .filter((label, index, array) => array.indexOf(label) === index);

  if (labels.length === 0) {
    return "입력 경로 미확인";
  }

  return `입력 ${labels.join(", ")}`;
}

function getStarAutoCriteriaSummary(criteria: StarAutoCriteria | null): string {
  if (!criteria) {
    return "";
  }

  const parts: string[] = [];
  if (criteria.assignmentStatusIn.length > 0) {
    parts.push(`과제 ${criteria.assignmentStatusIn.join("/")}`);
  }
  if (criteria.minimumCorrectCount !== null) {
    parts.push(`정답 ${criteria.minimumCorrectCount}개 이상`);
  }
  if (criteria.maximumIncorrectCount !== null) {
    parts.push(`오답 ${criteria.maximumIncorrectCount}개 이하`);
  }

  return parts.length > 0 ? `조건 ${parts.join(" / ")}` : "";
}

function getAutomaticStarEventCount(summary: StarModeLedger["sourceSummary"]): number {
  return summary["class-form"] + summary["lesson-form"] + summary.system;
}

function sortStarTotals(totals: StarStudentTotal[]): StarStudentTotal[] {
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
