import {
  App,
  ItemView,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  WorkspaceLeaf,
  normalizePath,
} from "obsidian";
import {
  DEFAULT_SETTINGS,
  getTeacherDashboardPresetDefaults,
  normalizeSettings,
} from "./defaults";
import {
  importStudentRosterFromDelimitedText,
  type StudentRosterImportResult,
} from "./roster-import";
import {
  getStudentLookupKey as buildStudentLookupKey,
  getStudentNumberNameKey,
  normalizeStudentClassroomValue,
} from "./student-identity";
import { loadTeacherPageData } from "./teacher-data";
import type {
  AggregateCountItem,
  AggregateSourceState,
  ClassPageFormSettings,
  ClassPageSettings,
  ClassStudentResponse,
  ClassSummaryAggregate,
  LessonGroupSummary,
  LessonSubjectSummary,
  LessonSummaryAggregate,
  LessonStudentResponse,
  StarAutoCriteria,
  StarEvent,
  StarModeLedger,
  StarRuleEventSummary,
  StarRuleSettings,
  StarStudentTotal,
  TeacherDashboardPreferences,
  TeacherDashboardPreset,
  TeacherDashboardStudentSort,
  StudentReference,
  StudentPageSettings,
  StudentRoster,
  StudentRosterEntry,
  TeacherPageData,
  TeacherPageSettings,
  TeacherStudentPhotoSourceState,
  TeacherStudentRosterSourceState,
} from "./types";

const VIEW_TYPE_CLASSPAGE = "classpage-view";

type PageMode = "student" | "teacher";
type TeacherFocusMode = "overview" | "class" | "lesson" | "star";
type RowTone = "neutral" | "warning" | "positive";
type LessonDatePreset = "all" | "recent-3" | "recent-5" | "specific";
type StarStudentFilterMode = "all" | "adjusted" | "recent" | "manual";
type TeacherAggregateState =
  | AggregateSourceState<ClassSummaryAggregate>
  | AggregateSourceState<LessonSummaryAggregate>
  | AggregateSourceState<StarModeLedger>;

interface DetailRow {
  title: string;
  meta: string;
  description: string;
  detailLines?: string[];
  tone?: RowTone;
  student?: StudentReference;
}

interface DrilldownField {
  label: string;
  value: string;
}

interface DrilldownItem {
  title: string;
  meta: string;
  summary: string;
  summaryLines?: string[];
  tone?: RowTone;
  fields: DrilldownField[];
  student?: StudentReference;
}

interface DrilldownGroup {
  title: string;
  meta: string;
  description: string;
  tone?: RowTone;
  emptyMessage: string;
  items: DrilldownItem[];
}

interface TeacherPriorityCardData {
  id: "missing-submissions" | "attention" | "praise" | "lesson-follow-up" | "star-movement";
  title: string;
  sourceLabel: string;
  value: string;
  meta: string;
  hint: string;
  rows: DetailRow[];
  emptyMessage: string;
  tone?: RowTone;
}

interface SectionHeaderOptions {
  badgeText?: string;
}

interface MissingSubmissionSnapshot {
  rosterStatus: TeacherStudentRosterSourceState["status"];
  scopeLabel: string;
  classroomLabel: string;
  rosterCount: number;
  submittedCount: number;
  missingStudents: StudentRosterEntry[];
  message: string;
}

interface LessonFilterOption {
  value: string;
  label: string;
}

interface LessonExplorerState {
  availableSubjects: LessonSubjectSummary[];
  selectedSubject: LessonSubjectSummary;
  allGroups: LessonGroupSummary[];
  unitFilteredGroups: LessonGroupSummary[];
  filteredGroups: LessonGroupSummary[];
  selectedGroup: LessonGroupSummary | null;
  unitOptions: LessonFilterOption[];
  dateOptions: LessonFilterOption[];
}

interface ResolvedStudentPhoto {
  src: string;
  path: string;
}

const LESSON_FILTER_MISSING_UNIT = "__lesson-unit-missing__";
const LESSON_FILTER_MISSING_DATE = "__lesson-date-missing__";

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
  private lessonSubjectSelection = "";
  private lessonUnitFilter = "";
  private lessonDatePreset: LessonDatePreset = "all";
  private lessonDateFilter = "";
  private lessonGroupSelection = "";
  private starStudentQuery = "";
  private starStudentFilterMode: StarStudentFilterMode = "all";
  private studentRosterSource: TeacherStudentRosterSourceState | null = null;
  private studentPhotoSource: TeacherStudentPhotoSourceState | null = null;
  private resolvedStudentPhotoCache = new Map<string, ResolvedStudentPhoto | null>();
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

    this.studentRosterSource = teacherData?.roster ?? null;
    this.studentPhotoSource = teacherData?.studentPhotoMap ?? null;
    this.resolvedStudentPhotoCache.clear();

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
    this.renderModeButton(toggle, "teacher", "선생님 페이지");
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
    this.renderTeacherContextCard(parent, teacherData);
    this.renderTeacherStatusSection(parent, teacherData);
    if (this.teacherFocusMode === "overview") {
      this.renderTeacherPrioritySection(parent, teacherData);
    }

    if (this.shouldShowTeacherSection("class")) {
      const classSection = parent.createDiv({ cls: "classpage-section" });
      this.renderSectionHeader(
        classSection,
        settings.classSummaryTitle,
        this.buildClassSectionDescription(teacherData?.classSummary ?? null),
        {
          badgeText: this.getSourceClassroomBadge(teacherData?.classSummary ?? null),
        },
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
        {
          badgeText: this.getSourceClassroomBadge(teacherData?.lessonSummary ?? null),
        },
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
        {
          badgeText: this.getSourceClassroomBadge(teacherData?.starLedger ?? null),
        },
      );
      this.renderStarLedgerCard(
        starSection,
        teacherData?.starLedger ?? null,
        settings.starLedgerEmptyMessage,
      );
    }

    this.renderTeacherAdvancedSection(parent, teacherData);
  }

  private renderTeacherContextCard(
    parent: HTMLElement,
    teacherData: TeacherPageData | null,
  ): void {
    const context = this.buildTeacherContextSummary(teacherData);
    const preferenceLines = buildTeacherDashboardPreferenceSummaryLines(
      this.getDashboardPreferences(),
      { rosterStatus: teacherData?.roster?.status ?? "disabled" },
    );
    const card = parent.createDiv({ cls: "classpage-card classpage-context-card" });
    const top = card.createDiv({ cls: "classpage-context-card__top" });

    top.createEl("span", {
      cls: "classpage-context-card__eyebrow",
      text: "현재 확인 대상 학급",
    });
    top.createEl("span", {
      cls: "classpage-context-badge",
      text: `화면: ${context.focusLabel}`,
    });

    card.createEl("strong", {
      cls: "classpage-context-card__value",
      text: context.classroomLabel,
    });

    if (context.meta) {
      card.createEl("p", {
        cls: "classpage-context-card__meta",
        text: context.meta,
      });
    }

    card.createEl("p", {
      cls: "classpage-context-card__description",
      text: context.description,
    });

    if (preferenceLines.length > 0) {
      this.renderStructuredText(
        card,
        preferenceLines,
        "classpage-context-card__meta",
      );
    }
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
    options: SectionHeaderOptions = {},
  ): void {
    const header = parent.createDiv({ cls: "classpage-section__header" });
    const headingRow = header.createDiv({ cls: "classpage-section__heading-row" });
    headingRow.createEl("h2", {
      cls: "classpage-section__title",
      text: title,
    });

    if (options.badgeText) {
      headingRow.createEl("span", {
        cls: "classpage-context-badge",
        text: options.badgeText,
      });
    }

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
      "한눈에 보기",
      "어느 영역에서 먼저 움직여야 하는지 짧게 보고, 카드를 누르면 그 영역만 이어서 봅니다.",
      {
        badgeText: this.buildTeacherContextSummary(teacherData).badgeText,
      },
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

  private renderTeacherPrioritySection(
    parent: HTMLElement,
    teacherData: TeacherPageData | null,
  ): void {
    const section = parent.createDiv({ cls: "classpage-section" });
    this.renderSectionHeader(
      section,
      "교사 우선순위",
      this.buildTeacherPrioritySectionDescription(teacherData),
      {
        badgeText: this.buildTeacherContextSummary(teacherData).badgeText,
      },
    );

    const grid = section.createDiv({ cls: "classpage-priority-grid" });
    for (const card of this.buildTeacherPriorityCards(teacherData)) {
      this.renderTeacherPriorityCard(grid, card);
    }
  }

  private buildTeacherPrioritySectionDescription(
    teacherData: TeacherPageData | null,
  ): string {
    const preferences = this.getDashboardPreferences();
    const summaryLines = buildTeacherDashboardPreferenceSummaryLines(
      preferences,
      { rosterStatus: teacherData?.roster?.status ?? "disabled" },
    );
    const summary = summaryLines.slice(0, 2).join(" ");

    return summary
      ? `첫 화면에서 우선순위를 빠르게 읽습니다. ${summary}`
      : "첫 화면에서 먼저 볼 학생, 칭찬/격려 대상, 수업 후속지도, 최근 활동 변화를 한 번에 정리했습니다.";
  }

  private getDashboardPreferences(): TeacherDashboardPreferences {
    return this.plugin.settings.teacherPage.dashboardPreferences;
  }

  private getTeacherPriorityCardOrder(
    preferences: TeacherDashboardPreferences,
  ): TeacherPriorityCardData["id"][] {
    const baseOrder = this.getTeacherPriorityBaseOrder(preferences.preset);
    const order = baseOrder.slice();

    if (preferences.prioritizeMissingSubmissionsInOverview) {
      moveArrayItemToFront(order, "missing-submissions");
    }

    if (preferences.prioritizeLessonFollowUpInOverview) {
      moveArrayItemBefore(order, "lesson-follow-up", "praise");
      moveArrayItemBefore(order, "attention", "praise");
    }

    if (!preferences.highlightMissingSubmissions) {
      moveArrayItemToEnd(order, "missing-submissions");
    }

    if (!preferences.highlightAtRiskStudents) {
      moveArrayItemToEnd(order, "attention");
      moveArrayItemToEnd(order, "lesson-follow-up");
    }

    if (!preferences.highlightPraiseCandidates) {
      moveArrayItemToEnd(order, "praise");
      moveArrayItemToEnd(order, "star-movement");
    }

    return order;
  }

  private getTeacherPriorityBaseOrder(
    preset: TeacherDashboardPreset,
  ): TeacherPriorityCardData["id"][] {
    switch (preset) {
      case "risk-focus":
        return [
          "attention",
          "lesson-follow-up",
          "missing-submissions",
          "praise",
          "star-movement",
        ];
      case "praise-focus":
        return [
          "praise",
          "star-movement",
          "attention",
          "lesson-follow-up",
          "missing-submissions",
        ];
      case "submission-focus":
        return [
          "missing-submissions",
          "attention",
          "lesson-follow-up",
          "praise",
          "star-movement",
        ];
      default:
        return [
          "attention",
          "missing-submissions",
          "praise",
          "lesson-follow-up",
          "star-movement",
        ];
    }
  }

  private shouldShowPraiseBeforeRisk(): boolean {
    const preferences = this.getDashboardPreferences();
    return preferences.preset === "praise-focus"
      || (preferences.highlightPraiseCandidates && !preferences.highlightAtRiskStudents);
  }

  private renderTeacherPriorityCard(
    parent: HTMLElement,
    cardData: TeacherPriorityCardData,
  ): void {
    const card = parent.createDiv({
      cls: [
        "classpage-card",
        "classpage-priority-card",
        cardData.tone ? `is-${cardData.tone}` : "",
      ].filter(Boolean).join(" "),
    });
    const header = card.createDiv({ cls: "classpage-priority-card__header" });
    const titleGroup = header.createDiv({ cls: "classpage-priority-card__title-group" });
    titleGroup.createEl("h3", {
      cls: "classpage-card__title classpage-priority-card__title",
      text: cardData.title,
    });
    titleGroup.createEl("span", {
      cls: "classpage-context-badge classpage-priority-card__badge",
      text: cardData.sourceLabel,
    });

    card.createEl("strong", {
      cls: "classpage-priority-card__value",
      text: cardData.value,
    });

    if (cardData.meta) {
      card.createEl("p", {
        cls: "classpage-priority-card__meta",
        text: cardData.meta,
      });
    }

    if (cardData.rows.length > 0) {
      const list = card.createDiv({ cls: "classpage-priority-card__list" });
      for (const row of cardData.rows.slice(0, 4)) {
        const item = list.createDiv({
          cls: [
            "classpage-priority-card__item",
            row.tone ? `is-${row.tone}` : "",
          ].filter(Boolean).join(" "),
        });
        const content = item.createDiv({ cls: "classpage-priority-card__item-content" });
        if (row.student) {
          this.renderStudentAvatar(content, row.student, "small");
        }

        const text = content.createDiv({ cls: "classpage-priority-card__item-text" });
        const itemHeader = text.createDiv({ cls: "classpage-priority-card__item-header" });
        itemHeader.createEl("strong", {
          cls: "classpage-priority-card__item-title",
          text: row.title,
        });

        if (row.meta) {
          itemHeader.createEl("span", {
            cls: "classpage-detail-list__meta classpage-priority-card__item-meta",
            text: row.meta,
          });
        }

        this.renderStructuredText(
          text,
          row.detailLines?.length ? row.detailLines.slice(0, 2) : row.description ? [row.description] : [],
          "classpage-priority-card__item-description",
        );
      }
    } else {
      card.createEl("p", {
        cls: "classpage-empty-card__message classpage-priority-card__empty",
        text: cardData.emptyMessage,
      });
    }

    card.createEl("p", {
      cls: "classpage-priority-card__hint",
      text: cardData.hint,
    });
  }

  private buildTeacherPriorityCards(
    teacherData: TeacherPageData | null,
  ): TeacherPriorityCardData[] {
    const preferences = this.getDashboardPreferences();
    const cards = [
      this.buildTeacherMissingSubmissionPriorityCard(teacherData),
      this.buildTeacherAttentionPriorityCard(teacherData),
      this.buildTeacherPraisePriorityCard(teacherData),
      this.buildTeacherLessonFollowUpPriorityCard(teacherData),
      this.buildTeacherStarMovementPriorityCard(teacherData),
    ];

    const order = this.getTeacherPriorityCardOrder(preferences);
    const orderMap = new Map(order.map((id, index) => [id, index]));
    return cards.sort((left, right) =>
      (orderMap.get(left.id) ?? Number.MAX_SAFE_INTEGER)
      - (orderMap.get(right.id) ?? Number.MAX_SAFE_INTEGER)
    );
  }

  private buildTeacherMissingSubmissionPriorityCard(
    teacherData: TeacherPageData | null,
  ): TeacherPriorityCardData {
    const preferences = this.getDashboardPreferences();
    const roster = this.getLoadedRosterData(teacherData?.roster);
    const classSummary = this.getLoadedAggregateData(teacherData?.classSummary);
    const lessonSummary = this.getLoadedAggregateData(teacherData?.lessonSummary);
    const lessonGroup = lessonSummary ? this.getLessonExplorerState(lessonSummary).selectedGroup : null;
    const classSnapshot = classSummary
      ? this.buildMissingSubmissionSnapshot(
          "학급용 폼",
          classSummary.classroom,
          classSummary.studentResponses.map((item) => item.student),
        )
      : null;
    const lessonSnapshot = lessonGroup
      ? this.buildMissingSubmissionSnapshot(
          "현재 선택한 수업",
          lessonGroup.classroom || lessonSummary?.classroom || "",
          lessonGroup.studentResponses.map((item) => item.student),
        )
      : null;
    const rows = this.mergeTeacherPriorityRows([
      ...(classSnapshot ? this.buildMissingSubmissionRows(classSnapshot) : []),
      ...(lessonSnapshot ? this.buildMissingSubmissionRows(lessonSnapshot) : []),
    ]);
    const sourceLabel = [
      roster ? "명단" : "",
      classSnapshot ? "학급" : "",
      lessonSnapshot ? "수업" : "",
    ].filter(Boolean).join(" + ") || "명단 + 학급/수업";

    if (rows.length > 0) {
      return {
        id: "missing-submissions",
        title: "아직 제출하지 않은 학생",
        sourceLabel,
        value: `${rows.length}명`,
        meta: [
          classSnapshot?.missingStudents.length
            ? `학급 ${classSnapshot.missingStudents.length}명`
            : "",
          lessonSnapshot?.missingStudents.length
            ? `현재 수업 ${lessonSnapshot.missingStudents.length}명`
            : "",
        ].filter(Boolean).join(" · ") || `${this.buildTeacherPriorityPreviewLabel(rows)}부터 확인`,
        hint: "학생 명단과 제출 응답을 비교해, 응답 기록이 아예 없는 학생도 바로 잡아냅니다.",
        rows,
        emptyMessage: "현재 미제출 학생이 없습니다.",
        tone: preferences.highlightMissingSubmissions ? "warning" : undefined,
      };
    }

    if (!teacherData?.roster || teacherData.roster.status === "disabled") {
      return {
        id: "missing-submissions",
        title: "아직 제출하지 않은 학생",
        sourceLabel: "명단",
        value: "연결 전",
        meta: "학생 명단 JSON이 아직 설정되지 않았습니다.",
        hint: "학생 명단 가져오기 도우미에서 CSV를 저장하거나 기존 JSON 경로를 연결하면 제출 응답에 아예 안 보이는 학생도 여기 바로 표시됩니다.",
        rows: [],
        emptyMessage: "학생 명단 가져오기 도우미에서 CSV를 저장하거나 학생 명단 JSON 경로를 연결하면 여기에 미제출 학생이 보입니다.",
        tone: preferences.highlightMissingSubmissions ? "warning" : undefined,
      };
    }

    if (teacherData.roster.status !== "loaded" || !roster) {
      return {
        id: "missing-submissions",
        title: "아직 제출하지 않은 학생",
        sourceLabel: "명단",
        value: teacherData.roster.status === "invalid" ? "형식 확인" : "확인 필요",
        meta: teacherData.roster.message,
        hint: "명단 JSON 형식을 다시 확인하거나 CSV 도우미로 다시 저장해 연결하면 응답이 없는 학생도 자동 비교할 수 있습니다.",
        rows: [],
        emptyMessage: teacherData.roster.message,
        tone: preferences.highlightMissingSubmissions ? "warning" : undefined,
      };
    }

    if (!classSummary && !lessonSummary) {
      return {
        id: "missing-submissions",
        title: "아직 제출하지 않은 학생",
        sourceLabel: "명단",
        value: `${roster.students.length}명`,
        meta: "명단은 읽었지만 비교할 학급/수업 집계가 아직 없습니다.",
        hint: "학급 집계나 수업 집계가 연결되면 누가 빠졌는지 바로 비교해 보여줍니다.",
        rows: [],
        emptyMessage: "학급 또는 수업 집계가 연결되면 여기에 미제출 학생이 표시됩니다.",
        tone: preferences.highlightMissingSubmissions ? "warning" : undefined,
      };
    }

    const fallbackMessage = lessonSummary && !lessonGroup
      ? "선택한 조건에 맞는 수업 그룹이 없어 현재 수업 미제출 비교는 아직 할 수 없습니다."
      : classSnapshot?.message
        || lessonSnapshot?.message
        || "현재 범위에서는 모두 제출했습니다.";

    return {
      id: "missing-submissions",
      title: "아직 제출하지 않은 학생",
      sourceLabel,
      value: "0명",
      meta: fallbackMessage,
      hint: "명단과 현재 범위를 비교한 결과, 지금은 따로 확인할 미제출 학생이 없습니다.",
      rows: [],
      emptyMessage: fallbackMessage,
      tone: preferences.highlightMissingSubmissions ? "positive" : undefined,
    };
  }

  private buildTeacherAttentionPriorityCard(
    teacherData: TeacherPageData | null,
  ): TeacherPriorityCardData {
    const preferences = this.getDashboardPreferences();
    const classSummary = this.getLoadedAggregateData(teacherData?.classSummary);
    const lessonSummary = this.getLoadedAggregateData(teacherData?.lessonSummary);
    const lessonGroup = lessonSummary ? this.getLessonExplorerState(lessonSummary).selectedGroup : null;
    const rows = this.mergeTeacherPriorityRows([
      ...(lessonGroup ? this.buildTeacherLessonFollowUpPriorityRows(lessonGroup) : []),
      ...(classSummary ? this.buildTeacherClassSupportPriorityRows(classSummary) : []),
    ]);
    const sourceLabel = [classSummary ? "학급" : "", lessonGroup ? "수업" : ""]
      .filter(Boolean)
      .join(" + ") || "학급 + 수업";

    if (rows.length > 0) {
      return {
        id: "attention",
        title: "지금 먼저 볼 학생",
        sourceLabel,
        value: `${rows.length}명`,
        meta: `${this.buildTeacherPriorityPreviewLabel(rows)}부터 확인`,
        hint: "정서·목표 상태와 수업 후속지도를 함께 묶었습니다.",
        rows,
        emptyMessage: "지금 바로 멈춰서 볼 학생이 없습니다.",
        tone: preferences.highlightAtRiskStudents ? "warning" : undefined,
      };
    }

    if (!classSummary && !lessonSummary) {
      return {
        id: "attention",
        title: "지금 먼저 볼 학생",
        sourceLabel,
        value: "연결 필요",
        meta: "학급 또는 수업 집계가 아직 없습니다.",
        hint: "파일 상태를 먼저 확인하면 이 카드에 우선 학생이 바로 보입니다.",
        rows: [],
        emptyMessage: "학급 또는 수업 집계가 연결되면 여기에 표시됩니다.",
        tone: preferences.highlightAtRiskStudents ? "warning" : undefined,
      };
    }

    return {
      id: "attention",
      title: "지금 먼저 볼 학생",
      sourceLabel,
      value: "0명",
      meta: lessonSummary && !lessonGroup
        ? "선택한 조건에 맞는 수업 그룹이 없습니다."
        : "지금 바로 우선 확인할 학생이 없습니다.",
      hint: lessonSummary && !lessonGroup
        ? "수업 빠르게 찾기에서 필터를 넓히면 후속지도 대상이 다시 보입니다."
        : "현재 집계 기준으로 급하게 먼저 챙길 학생은 없습니다.",
      rows: [],
      emptyMessage: "지금 바로 멈춰서 볼 학생이 없습니다.",
      tone: preferences.highlightAtRiskStudents ? "positive" : undefined,
    };
  }

  private buildTeacherPraisePriorityCard(
    teacherData: TeacherPageData | null,
  ): TeacherPriorityCardData {
    const preferences = this.getDashboardPreferences();
    const classSummary = this.getLoadedAggregateData(teacherData?.classSummary);
    const rows = classSummary ? this.buildTeacherPraisePriorityRows(classSummary) : [];

    if (rows.length > 0) {
      return {
        id: "praise",
        title: "칭찬/격려할 학생",
        sourceLabel: "학급",
        value: `${rows.length}명`,
        meta: `${this.buildTeacherPriorityPreviewLabel(rows)} 칭찬하기 좋음`,
        hint: "짧게 불러 칭찬하거나 친구 도움을 언급할 학생을 모았습니다.",
        rows,
        emptyMessage: "지금 칭찬/격려 후보로 모인 학생이 없습니다.",
        tone: preferences.highlightPraiseCandidates ? "positive" : undefined,
      };
    }

    if (!classSummary) {
      return {
        id: "praise",
        title: "칭찬/격려할 학생",
        sourceLabel: "학급",
        value: "연결 필요",
        meta: "학급 집계가 아직 없습니다.",
        hint: "학급 집계가 연결되면 칭찬/격려 후보가 여기 먼저 보입니다.",
        rows: [],
        emptyMessage: "학급 집계가 연결되면 여기에 표시됩니다.",
        tone: preferences.highlightPraiseCandidates ? "positive" : undefined,
      };
    }

    return {
      id: "praise",
      title: "칭찬/격려할 학생",
      sourceLabel: "학급",
      value: "0명",
      meta: "지금 바로 띄워서 칭찬할 학생이 없습니다.",
      hint: "학급 상세에서 전체 칭찬 후보와 이유를 계속 확인할 수 있습니다.",
      rows: [],
      emptyMessage: "지금 칭찬/격려 후보로 모인 학생이 없습니다.",
      tone: preferences.highlightPraiseCandidates ? "positive" : undefined,
    };
  }

  private buildTeacherLessonFollowUpPriorityCard(
    teacherData: TeacherPageData | null,
  ): TeacherPriorityCardData {
    const preferences = this.getDashboardPreferences();
    const lessonSummary = this.getLoadedAggregateData(teacherData?.lessonSummary);
    const lessonGroup = lessonSummary ? this.getLessonExplorerState(lessonSummary).selectedGroup : null;
    const rows = lessonGroup ? this.buildTeacherLessonFollowUpPriorityRows(lessonGroup) : [];

    if (rows.length > 0) {
      const topConcept = lessonGroup?.difficultConcepts[0]?.concept || "";
      return {
        id: "lesson-follow-up",
        title: "수업 후속지도 우선",
        sourceLabel: "수업",
        value: `${rows.length}명`,
        meta: topConcept
          ? `${this.buildTeacherPriorityPreviewLabel(rows)} · 재설명 개념 ${topConcept}`
          : `${this.buildTeacherPriorityPreviewLabel(rows)}부터 확인`,
        hint: "다음 차시 시작 전이나 수업 직후에 먼저 다시 볼 학생입니다.",
        rows,
        emptyMessage: "지금 후속지도가 필요한 학생이 없습니다.",
        tone: preferences.highlightAtRiskStudents ? "warning" : undefined,
      };
    }

    if (!lessonSummary) {
      return {
        id: "lesson-follow-up",
        title: "수업 후속지도 우선",
        sourceLabel: "수업",
        value: "연결 필요",
        meta: "수업 집계가 아직 없습니다.",
        hint: "수업 집계가 연결되면 후속지도 학생과 재설명 개념이 여기 먼저 보입니다.",
        rows: [],
        emptyMessage: "수업 집계가 연결되면 여기에 표시됩니다.",
        tone: preferences.highlightAtRiskStudents ? "warning" : undefined,
      };
    }

    return {
      id: "lesson-follow-up",
      title: "수업 후속지도 우선",
      sourceLabel: "수업",
      value: "0명",
      meta: lessonGroup
        ? "지금 바로 후속지도가 필요한 학생이 없습니다."
        : "선택한 조건에 맞는 수업 그룹이 없습니다.",
      hint: lessonGroup
        ? "현재 선택한 수업 기준으로 급한 후속지도 대상이 없습니다."
        : "수업 빠르게 찾기에서 과목·단원·날짜 범위를 넓혀 보세요.",
      rows: [],
      emptyMessage: "지금 후속지도가 필요한 학생이 없습니다.",
      tone: preferences.highlightAtRiskStudents ? "positive" : undefined,
    };
  }

  private buildTeacherStarMovementPriorityCard(
    teacherData: TeacherPageData | null,
  ): TeacherPriorityCardData {
    const preferences = this.getDashboardPreferences();
    const ledger = this.getLoadedAggregateData(teacherData?.starLedger);
    const rows = ledger ? this.buildTeacherStarMovementPriorityRows(ledger) : [];

    if (rows.length > 0 && ledger) {
      const eventMap = this.buildStarRecentEventMap(ledger.recentEvents);
      const recentStudentCount = ledger.totals.filter((total) =>
        (eventMap.get(total.studentKey) ?? []).length > 0
      ).length;
      const positiveRecentCount = ledger.totals.filter((total) =>
        ((eventMap.get(total.studentKey) ?? [])[0]?.delta ?? 0) > 0
      ).length;
      const adjustedCount = ledger.totals.filter((total) => total.hiddenAdjustmentTotal !== 0).length;

      return {
        id: "star-movement",
        title: "최근 별점/활동 변화",
        sourceLabel: "별점",
        value: `${rows.length}명`,
        meta: [
          recentStudentCount > 0 ? `최근 움직임 ${recentStudentCount}명` : "",
          positiveRecentCount > 0 ? `최근 올라간 학생 ${positiveRecentCount}명` : "",
          adjustedCount > 0 ? `숨김 조정 ${adjustedCount}명` : "",
        ].filter(Boolean).join(" · ") || `${this.buildTeacherPriorityPreviewLabel(rows)} 활동 확인`,
        hint: "최근 움직임이 보인 학생과 조정이 반영된 학생을 빠르게 읽습니다.",
        rows,
        emptyMessage: "최근 활동 변화가 보이는 학생이 없습니다.",
        tone: preferences.highlightPraiseCandidates
          ? "positive"
          : rows.some((row) => row.tone === "warning")
            ? "warning"
            : undefined,
      };
    }

    if (!ledger) {
      return {
        id: "star-movement",
        title: "최근 별점/활동 변화",
        sourceLabel: "별점",
        value: "연결 필요",
        meta: "별점 집계가 아직 없습니다.",
        hint: "별점 집계가 연결되면 최근 활동 학생과 변화가 여기 먼저 보입니다.",
        rows: [],
        emptyMessage: "별점 집계가 연결되면 여기에 표시됩니다.",
        tone: preferences.highlightPraiseCandidates ? "positive" : undefined,
      };
    }

    return {
      id: "star-movement",
      title: "최근 별점/활동 변화",
      sourceLabel: "별점",
      value: "0명",
      meta: "최근 표시 이벤트에 잡힌 학생이 없습니다.",
      hint: "최근 이벤트가 없어도 별점 상세에서 전체 학생 누적과 규칙별 흐름을 볼 수 있습니다.",
      rows: [],
      emptyMessage: "최근 활동 변화가 보이는 학생이 없습니다.",
    };
  }

  private buildTeacherClassSupportPriorityRows(
    summary: ClassSummaryAggregate,
  ): DetailRow[] {
    const responseMap = this.buildStudentResponseMap(summary.studentResponses);

    return summary.supportStudents.map((student) => {
      const response = this.findClassResponseByStudent(responseMap, student.student);
      const details = buildStructuredText([
        student.reason ? `상태 이유: ${student.reason}` : "",
        student.goal ? `오늘 목표: ${student.goal}` : "",
        student.teacherNote ? `메모: ${student.teacherNote}` : "",
      ], "학급 상태 확인");

      return {
        title: formatStudentLabel(student.student),
        meta: [
          "학급 상태",
          response?.emotionLabel ? `정서 ${response.emotionLabel}` : "",
          response?.goalLabel ? `목표 ${response.goalLabel}` : "",
        ].filter(Boolean).join(" · "),
        description: details.text,
        detailLines: details.lines,
        tone: "warning",
        student: student.student,
      };
    });
  }

  private buildTeacherPraisePriorityRows(
    summary: ClassSummaryAggregate,
  ): DetailRow[] {
    const responseMap = this.buildStudentResponseMap(summary.studentResponses);

    return summary.praiseCandidates.map((student) => {
      const response = this.findClassResponseByStudent(responseMap, student.student);
      const details = buildStructuredText([
        student.reason ? `이유: ${student.reason}` : "",
        student.mentionedPeer ? `함께 언급한 친구: ${student.mentionedPeer}` : "",
        response?.helpedFriend ? `도움을 준 친구 기록: ${response.helpedFriend}` : "",
      ], "칭찬 사유 확인");

      return {
        title: formatStudentLabel(student.student),
        meta: [
          "학급 칭찬",
          response?.goalLabel ? `목표 ${response.goalLabel}` : "",
        ].filter(Boolean).join(" · "),
        description: details.text,
        detailLines: details.lines,
        tone: "positive",
        student: student.student,
      };
    });
  }

  private buildTeacherLessonFollowUpPriorityRows(
    summary: LessonGroupSummary,
  ): DetailRow[] {
    const responseMap = this.buildLessonResponseMap(summary.studentResponses);

    return this.buildLessonFollowUpDrilldownItems(summary, responseMap)
      .map((item) => ({
        title: item.title,
        meta: ["수업 후속", item.meta].filter(Boolean).join(" · "),
        description: item.summary,
        detailLines: item.summaryLines,
        tone: item.tone ?? "warning",
        student: item.student,
      }));
  }

  private buildTeacherStarMovementPriorityRows(
    ledger: StarModeLedger,
  ): DetailRow[] {
    const eventMap = this.buildStarRecentEventMap(ledger.recentEvents);
    const recentTotals = this.sortStarTotalsByRecentPreview(ledger.totals, eventMap)
      .filter((total) => (eventMap.get(total.studentKey) ?? []).length > 0);
    const activeTotals = recentTotals.length > 0
      ? recentTotals
      : ledger.totals
          .slice()
          .sort((left, right) => {
            if (right.eventCount !== left.eventCount) {
              return right.eventCount - left.eventCount;
            }

            if (right.visibleTotal !== left.visibleTotal) {
              return right.visibleTotal - left.visibleTotal;
            }

            return right.total - left.total;
          })
          .filter((total) => total.eventCount > 0);

    return activeTotals.slice(0, 6).map((total) => {
      const previewEvents = eventMap.get(total.studentKey) ?? [];
      const latestEvent = previewEvents[0];
      const details = buildStructuredText([
        previewEvents.length > 0
          ? `최근 흐름: ${this.buildStarRecentEventSummary(previewEvents, ledger.rules)}`
          : `누적 이벤트 ${total.eventCount}건`,
        `학생 공개 ${formatSignedPoints(total.visibleTotal)} / 전체 ${formatSignedPoints(total.total)}`,
        total.hiddenAdjustmentTotal !== 0
          ? `선생님 조정 ${formatSignedPoints(total.hiddenAdjustmentTotal)}`
          : "",
      ], "활동 흐름 확인");

      return {
        title: formatStudentLabel(total.student),
        meta: previewEvents.length > 0 ? `최근 ${previewEvents.length}건` : `활동 ${total.eventCount}건`,
        description: details.text,
        detailLines: details.lines,
        tone: latestEvent
          ? latestEvent.delta < 0
            ? "warning"
            : "positive"
          : total.hiddenAdjustmentTotal < 0
            ? "warning"
            : undefined,
        student: total.student,
      };
    });
  }

  private mergeTeacherPriorityRows(rows: DetailRow[]): DetailRow[] {
    const merged: DetailRow[] = [];
    const indexByKey = new Map<string, number>();

    for (const row of rows) {
      const key = row.student
        ? this.getStudentLookupKey(row.student)
        : normalizeLookupText(row.title);

      if (!key) {
        merged.push({
          ...row,
          detailLines: row.detailLines ? row.detailLines.slice() : undefined,
        });
        continue;
      }

      const existingIndex = indexByKey.get(key);
      if (existingIndex === undefined) {
        indexByKey.set(key, merged.length);
        merged.push({
          ...row,
          detailLines: row.detailLines ? row.detailLines.slice() : undefined,
        });
        continue;
      }

      const existing = merged[existingIndex];
      const detailLines = uniqueTextLines([
        ...(existing.detailLines?.length
          ? existing.detailLines
          : existing.description
            ? [existing.description]
            : []),
        ...(row.detailLines?.length
          ? row.detailLines
          : row.description
            ? [row.description]
            : []),
      ]);

      merged[existingIndex] = {
        ...existing,
        meta: joinUniqueText([existing.meta, row.meta], " · "),
        description: detailLines.join(" / "),
        detailLines,
        tone: existing.tone === "warning" || row.tone === "warning"
          ? "warning"
          : existing.tone === "positive" || row.tone === "positive"
            ? "positive"
            : existing.tone ?? row.tone,
      };
    }

    return merged;
  }

  private buildTeacherPriorityPreviewLabel(rows: DetailRow[]): string {
    if (rows.length === 0) {
      return "대상 학생";
    }

    if (rows.length === 1) {
      return rows[0].title;
    }

    return `${rows[0].title} 외 ${rows.length - 1}명`;
  }

  private getLoadedAggregateData<T>(
    sourceState: AggregateSourceState<T> | null | undefined,
  ): T | null {
    return sourceState?.status === "loaded" && sourceState.data
      ? sourceState.data
      : null;
  }

  private getLoadedRosterData(
    sourceState: TeacherStudentRosterSourceState | null | undefined,
  ): StudentRoster | null {
    return sourceState?.status === "loaded" && sourceState.data
      ? sourceState.data
      : null;
  }

  private buildMissingSubmissionSnapshot(
    scopeLabel: string,
    classroom: string,
    students: StudentReference[],
  ): MissingSubmissionSnapshot {
    const rosterState = this.studentRosterSource;
    const classroomLabel = formatClassroomLabel(classroom) || "학급 정보 확인 필요";

    if (!rosterState) {
      return {
        rosterStatus: "disabled",
        scopeLabel,
        classroomLabel,
        rosterCount: 0,
        submittedCount: 0,
        missingStudents: [],
        message:
          "학생 명단 가져오기 도우미에서 CSV를 저장하거나 학생 명단 JSON을 연결하면 응답이 없는 학생도 자동으로 미제출로 표시합니다.",
      };
    }

    if (rosterState.status !== "loaded" || !rosterState.data) {
      return {
        rosterStatus: rosterState.status,
        scopeLabel,
        classroomLabel,
        rosterCount: 0,
        submittedCount: 0,
        missingStudents: [],
        message: this.getMissingSubmissionUnavailableMessage(rosterState.status),
      };
    }

    const scopedRoster = this.getScopedRosterStudents(rosterState.data, classroom);
    if (scopedRoster.length === 0) {
      return {
        rosterStatus: "loaded",
        scopeLabel,
        classroomLabel,
        rosterCount: 0,
        submittedCount: 0,
        missingStudents: [],
        message: classroom.trim()
          ? `${classroomLabel} 학생 명단을 아직 찾지 못했습니다. 학생 명단 JSON의 classroom 값을 다시 확인해 주세요.`
          : "학생 명단은 읽었지만 이 화면과 연결할 학급 정보를 아직 찾지 못했습니다. 학급 집계와 명단의 classroom 값을 다시 확인해 주세요.",
      };
    }

    const responseKeySet = new Set(
      students
        .map((student) => this.getStudentLookupKey(student))
        .filter((value): value is string => value !== null),
    );
    const responseNumberNameKeySet = new Set(
      students
        .map((student) => getStudentNumberNameKey(student))
        .filter((value): value is string => value !== null),
    );
    const allowLooseMatch = normalizeStudentClassroomValue(classroom).length > 0;
    const missingStudents = scopedRoster.filter((student) => {
      const fullKey = this.getStudentLookupKey(student);
      if (fullKey && responseKeySet.has(fullKey)) {
        return false;
      }

      const numberNameKey = getStudentNumberNameKey(student);
      return !(allowLooseMatch && numberNameKey && responseNumberNameKeySet.has(numberNameKey));
    });

    return {
      rosterStatus: "loaded",
      scopeLabel,
      classroomLabel,
      rosterCount: scopedRoster.length,
      submittedCount: scopedRoster.length - missingStudents.length,
      missingStudents,
      message: missingStudents.length > 0
        ? `명단 ${scopedRoster.length}명 중 ${scopedRoster.length - missingStudents.length}명 제출`
        : `${scopeLabel} 기준으로는 모두 제출했습니다.`,
    };
  }

  private getScopedRosterStudents(
    roster: StudentRoster,
    classroom: string,
  ): StudentRosterEntry[] {
    const targetClassroom = normalizeStudentClassroomValue(classroom);
    if (!targetClassroom) {
      return roster.students.slice();
    }

    const matchingStudents = roster.students.filter((student) =>
      normalizeStudentClassroomValue(student.classroom) === targetClassroom
    );
    if (matchingStudents.length > 0) {
      return matchingStudents;
    }

    const uniqueClassrooms = roster.students
      .map((student) => normalizeStudentClassroomValue(student.classroom))
      .filter((value, index, array) => value.length > 0 && array.indexOf(value) === index);

    return uniqueClassrooms.length <= 1
      ? roster.students.slice()
      : [];
  }

  private getMissingSubmissionUnavailableMessage(
    status: TeacherStudentRosterSourceState["status"],
  ): string {
    switch (status) {
      case "disabled":
        return "학생 명단 가져오기 도우미에서 CSV를 저장하거나 학생 명단 JSON을 연결하면 응답이 없는 학생도 자동으로 미제출로 표시합니다.";
      case "missing":
        return "학생 명단 JSON 파일 경로를 다시 확인해 주세요. 명단이 없어도 다른 화면은 그대로 사용할 수 있습니다.";
      case "invalid":
        return "학생 명단 JSON 형식을 다시 확인해 주세요. `type: \"student-roster\"` 와 `students` 목록이 필요합니다. 필요하면 CSV 도우미로 다시 저장해도 됩니다.";
      default:
        return "학생 명단 JSON을 읽는 중 문제가 생겼습니다. 파일을 다시 저장한 뒤 한 번 더 확인해 주세요.";
    }
  }

  private buildMissingSubmissionRows(
    snapshot: MissingSubmissionSnapshot,
  ): DetailRow[] {
    return this.sortItemsByStudentPreference(snapshot.missingStudents, {
      getStudent: (student) => student,
      getRecentRank: (_student, index) => index,
    }).map((student) => {
      const details = buildStructuredText([
        `${snapshot.scopeLabel} 응답이 아직 보이지 않습니다.`,
        student.note ? `메모: ${student.note}` : "",
        student.studentId ? `학생 ID: ${student.studentId}` : "",
      ], "현재 응답 없음");

      return {
        title: formatStudentLabel(student),
        meta: [
          snapshot.scopeLabel,
          student.studentId ? `ID ${student.studentId}` : "",
        ].filter(Boolean).join(" · "),
        description: details.text,
        detailLines: details.lines,
        tone: "warning",
        student,
      };
    });
  }

  private getStudentSortMode(): TeacherDashboardStudentSort {
    return this.getDashboardPreferences().defaultStudentSort;
  }

  private sortItemsByStudentPreference<T>(
    items: T[],
    config: {
      getStudent: (item: T) => StudentReference;
      getRiskScore?: (item: T, index: number) => number;
      getPraiseScore?: (item: T, index: number) => number;
      getRecentRank?: (item: T, index: number) => number;
    },
  ): T[] {
    const mode = this.getStudentSortMode();

    return items
      .map((item, index) => ({ item, index }))
      .sort((left, right) => {
        const studentDiff = this.compareStudentsBySortMode(
          config.getStudent(left.item),
          config.getStudent(right.item),
          mode,
        );
        if (studentDiff !== 0) {
          if (mode === "number") {
            return studentDiff;
          }
        }

        if (mode === "risk" && config.getRiskScore) {
          const riskDiff = config.getRiskScore(right.item, right.index)
            - config.getRiskScore(left.item, left.index);
          if (riskDiff !== 0) {
            return riskDiff;
          }
        }

        if (mode === "praise" && config.getPraiseScore) {
          const praiseDiff = config.getPraiseScore(right.item, right.index)
            - config.getPraiseScore(left.item, left.index);
          if (praiseDiff !== 0) {
            return praiseDiff;
          }
        }

        if (mode === "recent" && config.getRecentRank) {
          const recentDiff = config.getRecentRank(left.item, left.index)
            - config.getRecentRank(right.item, right.index);
          if (recentDiff !== 0) {
            return recentDiff;
          }
        }

        const fallbackNumberDiff = this.compareStudentsBySortMode(
          config.getStudent(left.item),
          config.getStudent(right.item),
          "number",
        );
        if (fallbackNumberDiff !== 0) {
          return fallbackNumberDiff;
        }

        return left.index - right.index;
      })
      .map(({ item }) => item);
  }

  private compareStudentsBySortMode(
    left: StudentReference,
    right: StudentReference,
    mode: TeacherDashboardStudentSort,
  ): number {
    if (mode === "number") {
      const numberDiff = parseLeadingNumber(left.number) - parseLeadingNumber(right.number);
      if (numberDiff !== 0) {
        return numberDiff;
      }
    }

    const classDiff = normalizeLookupText(left.classroom)
      .localeCompare(normalizeLookupText(right.classroom), "ko-KR");
    if (classDiff !== 0) {
      return classDiff;
    }

    const nameDiff = left.name.localeCompare(right.name, "ko-KR");
    if (nameDiff !== 0) {
      return nameDiff;
    }

    return left.number.localeCompare(right.number, "ko-KR");
  }

  private getClassSupportRiskScore(
    student: ClassSummaryAggregate["supportStudents"][number],
    index: number,
  ): number {
    return (student.reason ? 4 : 0)
      + (student.teacherNote ? 2 : 0)
      + (/미달|불안|걱정/.test(student.mood + student.yesterdayAchievement) ? 3 : 0)
      + Math.max(0, 50 - index);
  }

  private getPraiseCandidateScore(
    student: ClassSummaryAggregate["praiseCandidates"][number],
    index: number,
    response: ClassStudentResponse | null,
  ): number {
    return (student.reason ? 4 : 0)
      + (student.mentionedPeer ? 2 : 0)
      + (response?.helpedFriend ? 2 : 0)
      + Math.max(0, 50 - index);
  }

  private getClassResponseRiskScore(student: ClassStudentResponse): number {
    let score = 0;
    if (/불안|피곤|걱정|힘듦/.test(student.emotionLabel + student.mood)) {
      score += 4;
    }
    if (/미달/.test(student.goalLabel + student.yesterdayAchievement)) {
      score += 4;
    }
    if (/부분/.test(student.goalLabel + student.yesterdayAchievement)) {
      score += 2;
    }
    if (student.teacherMessage) {
      score += 1;
    }
    return score;
  }

  private getClassResponsePraiseScore(student: ClassStudentResponse): number {
    let score = 0;
    if (student.helpedFriend) {
      score += 4;
    }
    if (/달성/.test(student.goalLabel + student.yesterdayAchievement)) {
      score += 3;
    }
    if (/안정|좋음/.test(student.emotionLabel + student.mood)) {
      score += 1;
    }
    return score;
  }

  private getLessonResponseRiskScore(student: LessonStudentResponse): number {
    return student.incorrectCount * 3
      + (student.assignmentStatus.includes("미완료") ? 5 : 0)
      + (student.assignmentStatus.includes("부분") ? 2 : 0)
      + Math.max(0, 5 - this.getLessonFollowUpPriority(student.followUp));
  }

  private getLessonResponsePraiseScore(student: LessonStudentResponse): number {
    return student.correctCount * 2
      - student.incorrectCount
      + (student.assignmentStatus.includes("완료") ? 3 : 0);
  }

  private getLessonResultRiskScore(
    result: LessonSummaryAggregate["studentResults"][number],
  ): number {
    return result.incorrectCount * 3
      + (result.assignmentStatus.includes("미완료") ? 5 : 0)
      + Math.max(0, 5 - this.getLessonFollowUpPriority(result.followUp));
  }

  private getLessonResultPraiseScore(
    result: LessonSummaryAggregate["studentResults"][number],
  ): number {
    return result.correctCount * 2
      - result.incorrectCount
      + (result.assignmentStatus.includes("완료") ? 3 : 0)
      + (this.normalizeLessonFollowUpValue(result.followUp) ? 0 : 1);
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
        `비교 기준표: 학생 명단 JSON(선택)`,
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
    this.renderStudentRosterSourceCard(
      sourceGrid,
      teacherData?.roster ?? null,
    );
    this.renderStudentPhotoSourceCard(
      sourceGrid,
      teacherData?.studentPhotoMap ?? null,
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
    const entries = items.length > 0 ? items : ["아직 넣어 둔 항목이 없습니다."];

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
    const classroomLabel = getAggregateDisplayClassroom(sourceState.data);
    if (classroomLabel) {
      this.renderMetaRow(metaList, "대상 학급", classroomLabel);
    }
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
      if (sourceState.data.type === "lesson-summary") {
        const subjectCount = sourceState.data.subjectSummaries.length;
        const groupCount = sourceState.data.subjectSummaries.reduce(
          (count, subject) => count + (subject.groups.length > 0 ? subject.groups.length : 1),
          0,
        );
        if (subjectCount > 0 || groupCount > 0) {
          this.renderMetaRow(
            metaList,
            "탐색 범위",
            [
              subjectCount > 0 ? `과목 ${subjectCount}개` : "",
              groupCount > 0 ? `최근 수업 그룹 ${groupCount}개` : "",
            ].filter(Boolean).join(" / "),
          );
        }
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

  private renderStudentRosterSourceCard(
    parent: HTMLElement,
    sourceState: TeacherStudentRosterSourceState | null,
  ): void {
    const card = parent.createDiv({ cls: "classpage-card classpage-source-card" });
    const cardHeader = card.createDiv({ cls: "classpage-source-card__header" });

    cardHeader.createEl("h3", {
      cls: "classpage-card__title",
      text: "학생 명단 파일",
    });

    cardHeader.createEl("span", {
      cls: `classpage-source-status classpage-source-status--${sourceState?.status ?? "disabled"}`,
      text: this.getStudentRosterSourceStatusLabel(sourceState?.status ?? "disabled"),
    });

    card.createEl("p", {
      cls: "classpage-source-card__flow",
      text: "학생 명단 JSON -> classpage -> 학급/수업 응답 비교 -> 미제출 학생 표시",
    });

    card.createEl("p", {
      cls: "classpage-source-card__path",
      text: `경로: ${sourceState?.path || "설정되지 않음"}`,
    });

    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      card.createEl("p", {
        cls: "classpage-source-card__message",
        text: sourceState?.message || "학생 명단을 아직 불러오지 않았습니다.",
      });
      return;
    }

    const metaList = card.createEl("dl", { cls: "classpage-meta-list" });
    this.renderMetaRow(metaList, "학생 수", `${sourceState.data.students.length}명`);
    if (sourceState.data.defaultClassroom) {
      this.renderMetaRow(
        metaList,
        "기본 학급",
        formatClassroomLabel(sourceState.data.defaultClassroom),
      );
    }
    if (sourceState.data.sourceLabel) {
      this.renderMetaRow(metaList, "명단 설명", sourceState.data.sourceLabel);
    }
    if (sourceState.data.generatedAt) {
      this.renderMetaRow(metaList, "갱신 시각", formatDateLabel(sourceState.data.generatedAt));
    }
    this.renderMetaRow(metaList, "비교 기준", "classroom + number + name");
  }

  private renderStudentPhotoSourceCard(
    parent: HTMLElement,
    sourceState: TeacherStudentPhotoSourceState | null,
  ): void {
    const card = parent.createDiv({ cls: "classpage-card classpage-source-card" });
    const cardHeader = card.createDiv({ cls: "classpage-source-card__header" });

    cardHeader.createEl("h3", {
      cls: "classpage-card__title",
      text: "학생 사진 매핑 파일",
    });

    cardHeader.createEl("span", {
      cls: `classpage-source-status classpage-source-status--${sourceState?.status ?? "disabled"}`,
      text: this.getStudentPhotoSourceStatusLabel(sourceState?.status ?? "disabled"),
    });

    card.createEl("p", {
      cls: "classpage-source-card__flow",
      text: "선생님 화면 학생 식별값(classroom|number|name) -> 선택 학생 사진 매핑 JSON -> 볼트 안 이미지 파일",
    });

    card.createEl("p", {
      cls: "classpage-source-card__path",
      text: `경로: ${sourceState?.path || "설정되지 않음"}`,
    });

    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      card.createEl("p", {
        cls: "classpage-source-card__message",
        text: sourceState?.message || "학생 사진 매핑을 아직 불러오지 않았습니다.",
      });
      return;
    }

    const metaList = card.createEl("dl", { cls: "classpage-meta-list" });
    this.renderMetaRow(metaList, "매핑 수", `${Object.keys(sourceState.data.entries).length}명`);
    this.renderMetaRow(metaList, "키 형식", "classroom|number|name");
    this.renderMetaRow(metaList, "경로 기준", "볼트 경로 또는 ./상대 경로");
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
    const preferences = this.getDashboardPreferences();
    const responseMap = this.buildStudentResponseMap(summary.studentResponses);
    const hasStudentSnapshots = summary.studentResponses.length > 0;
    const missingSnapshot = this.buildMissingSubmissionSnapshot(
      "학급용 폼",
      summary.classroom,
      summary.studentResponses.map((item) => item.student),
    );
    const sortedResponses = this.sortItemsByStudentPreference(summary.studentResponses, {
      getStudent: (student) => student.student,
      getRiskScore: (student) => this.getClassResponseRiskScore(student),
      getPraiseScore: (student) => this.getClassResponsePraiseScore(student),
      getRecentRank: (_student, index) => index,
    });
    const sortedSupportStudents = this.sortItemsByStudentPreference(summary.supportStudents, {
      getStudent: (student) => student.student,
      getRiskScore: (student, index) => this.getClassSupportRiskScore(student, index),
      getRecentRank: (_student, index) => index,
    });
    const sortedPraiseCandidates = this.sortItemsByStudentPreference(summary.praiseCandidates, {
      getStudent: (student) => student.student,
      getPraiseScore: (student, index) =>
        this.getPraiseCandidateScore(
          student,
          index,
          this.findClassResponseByStudent(responseMap, student.student),
        ),
      getRecentRank: (_student, index) => index,
    });
    const stats = parent.createDiv({ cls: "classpage-stat-grid" });
    this.renderStatCard(
      stats,
      "응답 수",
      `${summary.responseCount}`,
      this.buildResponseCountDescription(summary),
    );
    this.renderStatCard(
      stats,
      "미제출 학생",
      missingSnapshot.rosterStatus === "loaded"
        ? `${missingSnapshot.missingStudents.length}명`
        : missingSnapshot.rosterStatus === "disabled"
          ? "연결 전"
          : "확인 필요",
      missingSnapshot.message,
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

    if (preferences.highlightMissingSubmissions) {
      this.renderDetailRowsCard(
        parent,
        "아직 제출하지 않은 학생",
        this.buildMissingSubmissionRows(missingSnapshot),
        missingSnapshot.message,
        true,
      );
    }

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
        items: sortedResponses
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
        items: sortedResponses
          .filter((student) => student.goalLabel === item.label)
          .map((student) => this.buildClassResponseDrilldownItem(student)),
      })),
      "목표 분포 데이터가 없습니다.",
    );

    const renderSupportCard = () => {
      this.renderStudentDrilldownCard(
        grid,
        "도움이 필요한 학생",
        sortedSupportStudents.map((student) =>
          this.buildClassSupportDrilldownItem(
            student,
            this.findClassResponseByStudent(responseMap, student.student),
          )
        ),
        "현재 표시할 학생이 없습니다.",
      );
    };

    const renderPraiseCard = () => {
      this.renderStudentDrilldownCard(
        grid,
        "칭찬/격려 후보",
        sortedPraiseCandidates.map((student) =>
          this.buildPraiseCandidateDrilldownItem(
            student,
            this.findClassResponseByStudent(responseMap, student.student),
          )
        ),
        "현재 표시할 학생이 없습니다.",
      );
    };

    if (this.shouldShowPraiseBeforeRisk()) {
      renderPraiseCard();
      renderSupportCard();
    } else {
      renderSupportCard();
      renderPraiseCard();
    }

    if (!preferences.highlightMissingSubmissions) {
      this.renderDetailRowsCard(
        parent,
        "아직 제출하지 않은 학생",
        this.buildMissingSubmissionRows(missingSnapshot),
        missingSnapshot.message,
        true,
      );
    }
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
    const preferences = this.getDashboardPreferences();
    const explorer = this.getLessonExplorerState(summary);
    const {
      availableSubjects,
      selectedSubject,
      allGroups,
      filteredGroups,
      selectedGroup,
      unitOptions,
      dateOptions,
    } = explorer;

    if (
      availableSubjects.length > 1
      || allGroups.length > 1
      || unitOptions.length > 1
      || dateOptions.length > 1
      || this.lessonDatePreset !== "all"
      || this.lessonUnitFilter.length > 0
      || this.lessonDateFilter.length > 0
    ) {
      this.renderLessonSubjectSelectorCard(
        parent,
        availableSubjects,
        selectedSubject,
        selectedGroup?.groupKey ?? "",
      );
    }

    if (!selectedGroup) {
      this.renderLessonEmptySelectionCard(parent, selectedSubject, unitOptions, dateOptions);
      return;
    }

    const responseMap = this.buildLessonResponseMap(selectedGroup.studentResponses);
    const hasStudentSnapshots = selectedGroup.studentResponses.length > 0;
    const urgentFollowUpItems = this.buildLessonFollowUpDrilldownItems(selectedGroup, responseMap);
    const sortedResponses = this.sortItemsByStudentPreference(selectedGroup.studentResponses, {
      getStudent: (student) => student.student,
      getRiskScore: (student) => this.getLessonResponseRiskScore(student),
      getPraiseScore: (student) => this.getLessonResponsePraiseScore(student),
      getRecentRank: (_student, index) => index,
    });
    const sortedStudentResults = this.sortItemsByStudentPreference(
      this.getSortedLessonStudentResults(selectedGroup),
      {
        getStudent: (student) => student.student,
        getRiskScore: (student) => this.getLessonResultRiskScore(student),
        getPraiseScore: (student) => this.getLessonResultPraiseScore(student),
        getRecentRank: (_student, index) => index,
      },
    );
    const missingSnapshot = this.buildMissingSubmissionSnapshot(
      "현재 선택한 수업",
      selectedGroup.classroom || summary.classroom,
      selectedGroup.studentResponses.map((item) => item.student),
    );
    const lessonScopeDescription = this.buildLessonScopeDescription(explorer, {
      includeSubjectCount: false,
      includeCurrentGroup: false,
    });

    const stats = parent.createDiv({ cls: "classpage-stat-grid" });
    this.renderStatCard(
      stats,
      "현재 수업 그룹",
      selectedGroup.label || selectedGroup.periodLabel || "수업 정보 없음",
      [
        getAggregateDisplayClassroom(selectedGroup) || "",
        lessonScopeDescription,
      ].filter(Boolean).join(" · "),
    );
    this.renderStatCard(
      stats,
      "응답 수",
      `${selectedGroup.responseCount}`,
      this.buildResponseCountDescription(selectedGroup),
    );
    this.renderStatCard(
      stats,
      "다음 피드백 대상",
      urgentFollowUpItems.length > 0 ? `${urgentFollowUpItems.length}명` : "없음",
      urgentFollowUpItems.length > 0
        ? `${urgentFollowUpItems[0].title}부터 확인`
        : "지금 바로 확인할 학생이 없습니다.",
    );
    this.renderStatCard(
      stats,
      "미제출 학생",
      missingSnapshot.rosterStatus === "loaded"
        ? `${missingSnapshot.missingStudents.length}명`
        : missingSnapshot.rosterStatus === "disabled"
          ? "연결 전"
          : "확인 필요",
      missingSnapshot.message,
    );
    this.renderStatCard(
      stats,
      "평균 정답",
      selectedGroup.overview.averageCorrectCount.toFixed(1),
      `${selectedSubject.subject || selectedGroup.subject || "수업"} 기준`,
    );
    this.renderStatCard(
      stats,
      "평균 오답",
      selectedGroup.overview.averageIncorrectCount.toFixed(1),
      "학생별 정오답 평균",
    );
    this.renderStatCard(
      stats,
      "복습/수행",
      selectedGroup.overview.assignmentCompletionLabel || "미분류",
      "가장 많이 확인된 상태",
    );

    const renderMissingSubmissionCard = () => {
      this.renderDetailRowsCard(
        parent,
        "이번 수업 아직 제출하지 않은 학생",
        this.buildMissingSubmissionRows(missingSnapshot),
        missingSnapshot.message,
        true,
      );
    };

    const renderLessonFollowUpCard = () => {
      this.renderStudentDrilldownCard(
        parent,
        "다음 피드백 대상",
        urgentFollowUpItems,
        "현재 바로 확인할 학생이 없습니다.",
        true,
      );
    };

    if (
      preferences.preset === "submission-focus"
      || (preferences.highlightMissingSubmissions && !preferences.highlightAtRiskStudents)
    ) {
      renderMissingSubmissionCard();
      renderLessonFollowUpCard();
    } else {
      renderLessonFollowUpCard();
      renderMissingSubmissionCard();
    }

    const grid = parent.createDiv({ cls: "classpage-summary-grid" });
    this.renderDetailRowsCard(
      grid,
      "지금 먼저 볼 학생과 개념",
      this.buildLessonPriorityRows(selectedGroup),
      "지금 바로 볼 항목이 없습니다.",
    );
    this.renderGroupedDrilldownCard(
      grid,
      "재설명 필요한 개념",
      selectedGroup.difficultConcepts.map((item) => ({
        title: item.concept,
        meta: `${item.count}명`,
        description: [item.averageUnderstanding, item.note]
          .filter(Boolean)
          .join(" / "),
        tone: item.count > 0 ? "warning" : undefined,
        emptyMessage: hasStudentSnapshots
          ? "해당 개념에서 낮은 이해 학생이 없습니다."
          : "학생별 응답 스냅샷이 없어 drill-down을 열 수 없습니다.",
        items: sortedResponses
          .filter((student) => this.hasLowConcept(student, item.concept))
          .map((student) => this.buildLessonStudentDrilldownItem(student)),
      })),
      "어려워한 개념 데이터가 없습니다.",
    );
    this.renderGroupedDrilldownCard(
      grid,
      "복습/수행 분포",
      selectedGroup.assignmentSummary.map((item) => ({
        title: item.label,
        meta: `${item.count}명`,
        description: item.note || "복습/수행 상태",
        emptyMessage: hasStudentSnapshots
          ? "해당 복습/수행 상태 학생이 없습니다."
          : "학생별 응답 스냅샷이 없어 drill-down을 열 수 없습니다.",
        items: sortedResponses
          .filter((student) => student.assignmentStatus === item.label)
          .map((student) => this.buildLessonStudentDrilldownItem(student)),
      })),
      "복습/수행 집계가 없습니다.",
    );

    this.renderStudentDrilldownCard(
      parent,
      "학생별 결과와 후속 지도",
      sortedStudentResults.map((result) =>
        this.buildStudentResultDrilldownItem(
          result,
          this.findLessonResponseByStudent(responseMap, result.student),
        )
      ),
      "표시할 학생 결과가 없습니다.",
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
    const enabledRules = sortStarRulesForDisplay(getEnabledStarRules(ledger.rules));
    const visibleRules = enabledRules.filter((rule) => rule.visibility === "student");
    const teacherOnlyRules = enabledRules.filter((rule) => rule.visibility === "teacher");
    const autoRules = enabledRules.filter((rule) => hasAutomaticStarSource(rule.sources));
    const manualRules = enabledRules.filter((rule) => rule.sources.includes("manual"));
    const topStudents = sortStarTotals(ledger.totals).slice(0, 5);
    const adjustedStudents = sortStarTotalsByHiddenAdjustment(ledger.totals)
      .filter((total) => total.hiddenAdjustmentTotal !== 0)
      .slice(0, 8);
    const ruleSummaryRows = this.buildStarRuleSummaryRows(ledger, enabledRules);
    const automaticEventCount = getAutomaticStarEventCount(ledger.sourceSummary);
    const classroomLabel = getAggregateDisplayClassroom(ledger) || "학급 정보 확인 필요";
    const customDeltaRules = manualRules.filter((rule) => rule.allowCustomDelta);
    const eventMap = this.buildStarRecentEventMap(ledger.recentEvents);
    const flowRows = this.buildStarStudentFlowRows(ledger, eventMap);

    const stats = parent.createDiv({ cls: "classpage-stat-grid" });
    this.renderStatCard(
      stats,
      "대상 학급",
      classroomLabel,
      ledger.classroom
        ? `${ledger.periodLabel} 기준`
        : "학급 정보가 비어 있으면 학생 목록의 공통 학급으로 보완 표시",
    );
    this.renderStatCard(
      stats,
      "활성 규칙",
      `${enabledRules.length}`,
      `자동 ${autoRules.length}개 / 수동 ${manualRules.length}개`,
    );
    this.renderStatCard(
      stats,
      "학생 공개 규칙",
      `${visibleRules.length}`,
      `${ledger.totals.length}명 기준 공개 누적 계산`,
    );
    this.renderStatCard(
      stats,
      "선생님 확인 규칙",
      `${teacherOnlyRules.length}`,
      "숨김 조정과 비공개 규칙은 별도 합계로 표시",
    );
    this.renderStatCard(
      stats,
      "반영 이벤트",
      `${ledger.eventCount}`,
      `자동 ${automaticEventCount}건 / 수동·일괄 ${ledger.sourceSummary.manual}건`,
    );
    this.renderStatCard(
      stats,
      "수동 조정 가능",
      `${manualRules.length}`,
      customDeltaRules.length > 0
        ? `행별 점수 직접 입력 허용 ${customDeltaRules.length}개`
        : "수동 규칙은 기본 점수만 사용",
    );
    this.renderStatCard(
      stats,
      "숨김 조정 반영 학생",
      adjustedStudents.length > 0 ? `${adjustedStudents.length}명` : "없음",
      adjustedStudents.length > 0
        ? "선생님 확인 전용 조정이 공개 점수와 분리 반영됨"
        : "현재 숨김 조정 반영 학생이 없습니다.",
    );
    this.renderStatCard(
      stats,
      "발생 규칙",
      `${ruleSummaryRows.filter((row) => row.meta !== "0건").length}`,
      "규칙별 발생 집계 기준",
    );

    const grid = parent.createDiv({ cls: "classpage-summary-grid" });
    this.renderDetailRowsCard(
      grid,
      "별점 운영 상태",
      this.buildStarOperationRows(ledger, visibleRules, teacherOnlyRules, manualRules),
      "운영 상태를 표시할 수 없습니다.",
    );
    this.renderDetailRowsCard(
      grid,
      "규칙별 발생 현황",
      ruleSummaryRows,
      "규칙별 발생 현황이 없습니다.",
    );
    this.renderDetailRowsCard(
      grid,
      "최근 별점 이벤트",
      ledger.recentEvents.map((event) => this.buildStarEventRow(event, ledger.rules)),
      ledger.eventCount > 0
        ? "누적에는 반영되었지만 최근 표시 이벤트에는 아직 들어오지 않았습니다. 최근 집계 시각을 다시 확인해 주세요."
        : "아직 최근에 표시할 별점 이벤트가 없습니다. 폼 제출이나 수동 조정이 반영되면 여기에 보입니다.",
    );
    this.renderDetailRowsCard(
      grid,
      "학생 흐름 빠른 보기",
      flowRows,
      "학생 흐름 요약이 없습니다.",
    );
    this.renderDetailRowsCard(
      grid,
      "학생별 누적 상위 5명",
      topStudents.map((total) => this.buildStarTotalRow(total)),
      "표시할 학생이 없습니다.",
    );
    this.renderDetailRowsCard(
      grid,
      "숨김 조정이 반영된 학생",
      adjustedStudents.map((total) => this.buildStarAdjustmentTotalRow(total)),
      "현재 숨김 조정이 반영된 학생이 없습니다.",
    );
    this.renderStarStudentFilterCard(parent, ledger, eventMap);

    this.renderDetailRowsCard(
      parent,
      "학생 공개 규칙",
      visibleRules.map((rule) => this.buildStarRuleRow(rule, this.findStarRuleSummary(ledger, rule.ruleId))),
      "학생 공개 규칙이 없습니다.",
      true,
    );
    this.renderDetailRowsCard(
      parent,
      "선생님 확인 전용 규칙",
      teacherOnlyRules.map((rule) => this.buildStarRuleRow(rule, this.findStarRuleSummary(ledger, rule.ruleId))),
      "선생님 확인 전용 규칙이 없습니다.",
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
      text: this.getAggregateEmptyStateTitle(sourceState),
    });
    card.createEl("p", {
      cls: "classpage-empty-card__message",
      text: this.getAggregateEmptyStateMessage(emptyMessage, sourceState),
    });

    const tips = this.getAggregateEmptyStateTips(sourceState);
    if (tips.length > 0) {
      const tipList = card.createEl("ul", { cls: "classpage-empty-card__tips" });
      for (const tip of tips) {
        tipList.createEl("li", {
          cls: "classpage-empty-card__tip",
          text: tip,
        });
      }
    }

    if (sourceState?.path) {
      card.createEl("p", {
        cls: "classpage-source-card__path",
        text: `설정 경로: ${sourceState.path}`,
      });
    }

    if (sourceState?.message) {
      card.createEl("p", {
        cls: "classpage-empty-card__detail",
        text: `현재 상태: ${sourceState.message}`,
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

  private renderLessonSubjectSelectorCard(
    parent: HTMLElement,
    subjects: LessonSubjectSummary[],
    selectedSubject: LessonSubjectSummary,
    selectedGroupKey: string,
  ): void {
    const sortedSubjects = this.getLessonAvailableSummariesFromSubjects(subjects);
    const explorer = this.getLessonExplorerStateFromSubject(selectedSubject, sortedSubjects);
    const {
      allGroups,
      unitFilteredGroups,
      filteredGroups,
      unitOptions,
      dateOptions,
    } = explorer;
    const showUnitFilter = unitOptions.length > 1 || this.lessonUnitFilter.length > 0;
    const showDatePreset = unitFilteredGroups.length > 1 || this.lessonDatePreset !== "all";
    const showDateFilter = this.lessonDatePreset === "specific"
      && (dateOptions.length > 1 || this.lessonDateFilter.length > 0);
    const card = parent.createDiv({ cls: "classpage-card classpage-filter-card" });
    card.createEl("h3", {
      cls: "classpage-card__title",
      text: "수업 빠르게 찾기",
    });
    card.createEl("p", {
      cls: "classpage-filter-card__description",
      text: "과목을 고른 뒤 단원과 최근 수업 범위를 좁히고, 마지막에 수업 그룹을 선택하면 다음 피드백 대상과 수업 상태가 함께 바뀝니다.",
    });

    const toolbar = card.createDiv({
      cls: "classpage-filter-toolbar classpage-filter-toolbar--lesson",
    });
    const subjectLabel = toolbar.createEl("label", {
      cls: "classpage-filter-toolbar__label",
      text: "확인할 과목",
    });
    const subjectSelect = subjectLabel.createEl("select", {
      cls: "classpage-filter-select",
    });

    for (const subject of sortedSubjects) {
      const option = subjectSelect.createEl("option", {
        value: this.getLessonSubjectSelectionValue(subject),
        text: subject.subject || "과목 정보 없음",
      });
      if (this.getLessonSubjectSelectionValue(subject) === this.getLessonSubjectSelectionValue(selectedSubject)) {
        option.selected = true;
      }
    }

    let unitSelect: HTMLSelectElement | null = null;
    if (showUnitFilter) {
      const unitLabel = toolbar.createEl("label", {
        cls: "classpage-filter-toolbar__label",
        text: "단원 필터",
      });
      unitSelect = unitLabel.createEl("select", {
        cls: "classpage-filter-select",
      });
      unitSelect.createEl("option", {
        value: "",
        text: "전체 단원",
      });

      for (const option of unitOptions) {
        const item = unitSelect.createEl("option", {
          value: option.value,
          text: option.label,
        });
        if (option.value === this.lessonUnitFilter) {
          item.selected = true;
        }
      }
    }

    let datePresetSelect: HTMLSelectElement | null = null;
    if (showDatePreset) {
      const datePresetLabel = toolbar.createEl("label", {
        cls: "classpage-filter-toolbar__label",
        text: "최근 수업 범위",
      });
      datePresetSelect = datePresetLabel.createEl("select", {
        cls: "classpage-filter-select",
      });

      for (const option of this.getLessonDatePresetOptions()) {
        const item = datePresetSelect.createEl("option", {
          value: option.value,
          text: option.label,
        });
        if (option.value === this.lessonDatePreset) {
          item.selected = true;
        }
      }
    }

    let dateSelect: HTMLSelectElement | null = null;
    if (showDateFilter) {
      const dateLabel = toolbar.createEl("label", {
        cls: "classpage-filter-toolbar__label",
        text: "특정 날짜",
      });
      dateSelect = dateLabel.createEl("select", {
        cls: "classpage-filter-select",
      });

      for (const option of dateOptions) {
        const item = dateSelect.createEl("option", {
          value: option.value,
          text: option.label,
        });
        if (option.value === this.lessonDateFilter) {
          item.selected = true;
        }
      }
    }

    const groupLabel = toolbar.createEl("label", {
      cls: "classpage-filter-toolbar__label classpage-filter-toolbar__label--wide",
      text: "확인할 수업 그룹",
    });
    const groupSelect = groupLabel.createEl("select", {
      cls: "classpage-filter-select",
    });

    if (filteredGroups.length === 0) {
      groupSelect.disabled = true;
      groupSelect.createEl("option", {
        value: "",
        text: "조건에 맞는 수업 그룹 없음",
      });
    } else {
      for (const group of filteredGroups) {
        const option = groupSelect.createEl("option", {
          value: group.groupKey,
          text: this.buildLessonGroupOptionLabel(group),
        });
        if (group.groupKey === selectedGroupKey) {
          option.selected = true;
        }
      }
    }

    const currentGroup = filteredGroups.find((group) => group.groupKey === selectedGroupKey)
      ?? filteredGroups[0]
      ?? null;

    toolbar.createEl("p", {
      cls: "classpage-filter-toolbar__meta",
      text: [
        `과목 ${selectedSubject.subject || "과목 정보 없음"}`,
        sortedSubjects.length > 1 ? `전체 과목 ${sortedSubjects.length}개` : "",
        this.buildLessonScopeDescription(explorer, {
          includeSubject: false,
          includeSubjectCount: false,
          includeCurrentGroup: false,
        }),
        filteredGroups.length > 0
          ? `표시 ${filteredGroups.length}개 그룹 / 과목 전체 ${allGroups.length}개`
          : "조건에 맞는 수업 그룹이 없습니다.",
        currentGroup ? `확인 중: ${this.buildLessonGroupOptionLabel(currentGroup)}` : "",
      ].filter(Boolean).join(" · "),
    });

    const qualityMessage = this.buildLessonStructuredFieldNotice(allGroups);
    if (qualityMessage) {
      card.createEl("p", {
        cls: "classpage-filter-toolbar__meta",
        text: qualityMessage,
      });
    }

    subjectSelect.addEventListener("change", () => {
      const nextSubject = sortedSubjects.find((subject) =>
        this.getLessonSubjectSelectionValue(subject) === subjectSelect.value,
      );
      this.lessonSubjectSelection = subjectSelect.value;
      this.lessonUnitFilter = "";
      this.lessonDatePreset = "all";
      this.lessonDateFilter = "";
      this.lessonGroupSelection = this.getFilteredLessonGroups(nextSubject ?? selectedSubject)[0]?.groupKey
        || nextSubject?.groupKey
        || "";
      this.render();
    });

    unitSelect?.addEventListener("change", () => {
      this.lessonSubjectSelection = subjectSelect.value;
      this.lessonUnitFilter = unitSelect?.value ?? "";
      const nextSubject = sortedSubjects.find((subject) =>
        this.getLessonSubjectSelectionValue(subject) === subjectSelect.value,
      ) ?? selectedSubject;
      if (this.lessonDatePreset === "specific" && this.lessonDateFilter.length === 0) {
        this.lessonDateFilter = this.getLessonDateOptions(nextSubject)[0]?.value ?? "";
      }
      this.lessonGroupSelection = this.getPreferredLessonGroupSelection(nextSubject);
      this.render();
    });

    datePresetSelect?.addEventListener("change", () => {
      this.lessonSubjectSelection = subjectSelect.value;
      this.lessonDatePreset = (datePresetSelect?.value as LessonDatePreset) ?? "all";
      const nextSubject = sortedSubjects.find((subject) =>
        this.getLessonSubjectSelectionValue(subject) === subjectSelect.value,
      ) ?? selectedSubject;
      if (this.lessonDatePreset === "specific") {
        this.lessonDateFilter = this.lessonDateFilter
          || this.getLessonDateOptions(nextSubject)[0]?.value
          || "";
      } else {
        this.lessonDateFilter = "";
      }
      this.lessonGroupSelection = this.getPreferredLessonGroupSelection(nextSubject);
      this.render();
    });

    dateSelect?.addEventListener("change", () => {
      this.lessonSubjectSelection = subjectSelect.value;
      this.lessonDateFilter = dateSelect?.value ?? "";
      const nextSubject = sortedSubjects.find((subject) =>
        this.getLessonSubjectSelectionValue(subject) === subjectSelect.value,
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

  private renderStarStudentFilterCard(
    parent: HTMLElement,
    ledger: StarModeLedger,
    eventMap: Map<string, StarEvent[]>,
  ): void {
    const filteredTotals = this.getFilteredStarTotals(ledger, eventMap);
    const filterCard = parent.createDiv({ cls: "classpage-card classpage-filter-card" });
    filterCard.createEl("h3", {
      cls: "classpage-card__title",
      text: "학생별 별점 흐름 확인",
    });
    filterCard.createEl("p", {
      cls: "classpage-filter-card__description",
      text: "학생 이름이나 번호로 빠르게 찾고, 숨김 조정 반영 학생이나 최근 변동 학생만 좁혀 볼 수 있습니다. 상세 펼침은 학생 누적 점수와 최근 표시 이벤트 기준의 읽기 전용 미리보기입니다.",
    });

    const toolbar = filterCard.createDiv({ cls: "classpage-filter-toolbar" });
    const inputWrap = toolbar.createDiv({ cls: "classpage-filter-input-wrap" });
    const input = inputWrap.createEl("input", {
      cls: "classpage-filter-input",
      attr: {
        type: "search",
        placeholder: "이름, 번호, 반 검색",
      },
    });
    input.value = this.starStudentQuery;

    const actionGroup = toolbar.createDiv({ cls: "classpage-filter-pill-group" });
    const applyButton = actionGroup.createEl("button", {
      cls: "classpage-filter-pill is-primary",
      text: "적용",
      attr: { type: "button" },
    });
    const clearButton = actionGroup.createEl("button", {
      cls: "classpage-filter-pill",
      text: "초기화",
      attr: { type: "button" },
    });

    const modeGroup = filterCard.createDiv({ cls: "classpage-filter-pill-group" });
    this.renderFilterPill(
      modeGroup,
      "전체 보기",
      this.starStudentFilterMode === "all",
      () => {
        this.starStudentFilterMode = "all";
        this.render();
      },
    );
    this.renderFilterPill(
      modeGroup,
      "숨김 조정 반영만",
      this.starStudentFilterMode === "adjusted",
      () => {
        this.starStudentFilterMode = "adjusted";
        this.render();
      },
    );
    this.renderFilterPill(
      modeGroup,
      "최근 변동 학생",
      this.starStudentFilterMode === "recent",
      () => {
        this.starStudentFilterMode = "recent";
        this.render();
      },
    );
    this.renderFilterPill(
      modeGroup,
      "최근 수동 조정",
      this.starStudentFilterMode === "manual",
      () => {
        this.starStudentFilterMode = "manual";
        this.render();
      },
    );

    filterCard.createEl("p", {
      cls: "classpage-filter-toolbar__meta",
      text: [
        `현재 ${filteredTotals.length}명 표시`,
        `모드 ${this.getStarStudentFilterModeLabel()}`,
        this.starStudentFilterMode === "recent" || this.starStudentFilterMode === "manual"
          ? "최근 표시 이벤트 기준"
          : "학생 누적 기준",
      ].join(" · "),
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
      "학생별 별점 흐름 상세",
      filteredTotals.map((total) =>
        this.buildStarStudentDrilldownItem(
          total,
          eventMap.get(total.studentKey) ?? [],
          ledger.rules,
        )
      ),
      "이름, 번호, 보기 모드를 다시 확인해 주세요.",
      true,
    );
  }

  private renderFilterPill(
    parent: HTMLElement,
    label: string,
    isActive: boolean,
    onClick: () => void,
  ): void {
    const button = parent.createEl("button", {
      cls: `classpage-filter-pill${isActive ? " is-active" : ""}`,
      text: label,
      attr: { type: "button" },
    });
    button.addEventListener("click", onClick);
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
      item.summaryLines,
      item.student,
    );

    if (item.fields.length === 0) {
      details.createEl("p", {
        cls: "classpage-drilldown-empty",
        text: "표시할 상세 내용이 없습니다.",
      });
      return;
    }

    const fieldList = details.createDiv({ cls: "classpage-drilldown-fields" });
    for (const field of item.fields) {
      const fieldRow = fieldList.createDiv({ cls: "classpage-drilldown-field" });
      fieldRow.createEl("span", {
        cls: "classpage-drilldown-field__label",
        text: field.label,
      });
      fieldRow.createEl("p", {
        cls: "classpage-drilldown-field__value",
        text: field.value,
      });
    }
  }

  private renderDrilldownSummary(
    parent: HTMLElement,
    title: string,
    meta: string,
    description: string,
    textClass: string,
    descriptionLines?: string[],
    student?: StudentReference,
  ): void {
    const content = parent.createDiv({ cls: "classpage-student-summary__content" });
    if (student) {
      this.renderStudentAvatar(content, student);
    }

    const text = content.createDiv({ cls: `${textClass} classpage-identity-text` });
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

    this.renderStructuredText(
      text,
      descriptionLines?.length ? descriptionLines : description ? [description] : [],
      "classpage-detail-list__description",
    );
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
      const titleGroup = itemHeader.createDiv({ cls: "classpage-detail-list__title-group" });
      if (row.student) {
        this.renderStudentAvatar(titleGroup, row.student, "small");
      }
      const titleWrap = titleGroup.createDiv({ cls: "classpage-detail-list__title-wrap" });
      titleWrap.createEl("strong", {
        cls: "classpage-detail-list__title",
        text: row.title,
      });

      if (row.meta) {
        itemHeader.createEl("span", {
          cls: "classpage-detail-list__meta",
          text: row.meta,
        });
      }

      this.renderStructuredText(
        item,
        row.detailLines?.length ? row.detailLines : row.description ? [row.description] : [],
        "classpage-detail-list__description",
      );
    }
  }

  private renderStructuredText(
    parent: HTMLElement,
    lines: readonly string[],
    paragraphClass: string,
  ): void {
    const normalizedLines = compactTextLines(lines);
    if (normalizedLines.length === 0) {
      return;
    }

    if (normalizedLines.length === 1) {
      parent.createEl("p", {
        cls: paragraphClass,
        text: normalizedLines[0],
      });
      return;
    }

    const stack = parent.createDiv({ cls: "classpage-detail-list__segments" });
    for (const line of normalizedLines) {
      stack.createEl("p", {
        cls: "classpage-detail-list__segment",
        text: line,
      });
    }
  }

  private renderStudentAvatar(
    parent: HTMLElement,
    student: StudentReference,
    size: "default" | "small" = "default",
  ): void {
    const avatar = parent.createDiv({
      cls: [
        "classpage-student-avatar",
        size === "small" ? "classpage-student-avatar--small" : "",
      ].filter(Boolean).join(" "),
    });
    avatar.createEl("span", {
      cls: "classpage-student-avatar__fallback",
      text: this.getStudentAvatarFallbackText(student),
    });

    const photo = this.resolveStudentPhoto(student);
    if (!photo) {
      return;
    }

    const image = avatar.createEl("img", {
      cls: "classpage-student-avatar__image",
      attr: {
        alt: `${formatStudentLabel(student)} 사진`,
        loading: "lazy",
      },
    });
    image.src = photo.src;
    image.addEventListener("load", () => {
      avatar.addClass("has-image");
    });
    image.addEventListener("error", () => {
      image.remove();
      avatar.removeClass("has-image");
    });
  }

  private resolveStudentPhoto(student: StudentReference): ResolvedStudentPhoto | null {
    const lookupKey = this.getStudentLookupKey(student);
    if (!lookupKey) {
      return null;
    }

    if (this.resolvedStudentPhotoCache.has(lookupKey)) {
      return this.resolvedStudentPhotoCache.get(lookupKey) ?? null;
    }

    const mappedPath = this.studentPhotoSource?.status === "loaded"
      ? this.studentPhotoSource.data?.entries[lookupKey] ?? ""
      : "";
    const resolvedPath = this.resolveStudentPhotoVaultPath(mappedPath);

    if (!resolvedPath) {
      this.resolvedStudentPhotoCache.set(lookupKey, null);
      return null;
    }

    const file = this.app.vault.getAbstractFileByPath(resolvedPath);
    if (!(file instanceof TFile)) {
      this.resolvedStudentPhotoCache.set(lookupKey, null);
      return null;
    }

    const photo = {
      src: this.app.vault.getResourcePath(file),
      path: resolvedPath,
    };
    this.resolvedStudentPhotoCache.set(lookupKey, photo);
    return photo;
  }

  private resolveStudentPhotoVaultPath(rawPath: string): string {
    const trimmed = rawPath.trim();
    if (!trimmed) {
      return "";
    }

    if (
      (trimmed.startsWith("./") || trimmed.startsWith("../"))
      && this.studentPhotoSource?.path
    ) {
      const mappingDirectory = getParentPath(this.studentPhotoSource.path);
      return normalizePath(
        mappingDirectory
          ? `${mappingDirectory}/${trimmed}`
          : trimmed.replace(/^\.\//, ""),
      );
    }

    return normalizePath(trimmed.replace(/^\/+/, ""));
  }

  private getStudentAvatarFallbackText(student: StudentReference): string {
    const name = student.name.trim();
    if (!name) {
      return "?";
    }

    const words = name.split(/\s+/).filter(Boolean);
    if (words.length > 1) {
      return words.slice(0, 2).map((word) => Array.from(word)[0] ?? "").join("");
    }

    return Array.from(name.replace(/\s+/g, "")).slice(0, 2).join("") || "?";
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
    return buildStudentLookupKey(student);
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
    const summary = buildStructuredText([
      student.goal ? `오늘 목표: ${student.goal}` : "",
      student.yesterdayAchievement ? `어제 달성도: ${student.yesterdayAchievement}` : "",
    ], "제출 응답 상세 보기");

    return {
      title: formatStudentLabel(student.student),
      meta: student.mood || student.emotionLabel || "상태 확인 필요",
      summary: summary.text,
      summaryLines: summary.lines,
      student: student.student,
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
      student: student.student,
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
      student: student.student,
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
    const followUp = this.normalizeLessonFollowUpValue(student.followUp);
    const summary = buildStructuredText([
      student.assignmentStatus ? `복습/수행: ${student.assignmentStatus}` : "",
      followUp ? `후속: ${followUp}` : "",
    ], "수업 응답 상세 보기");

    return {
      title: formatStudentLabel(student.student),
      meta: `정답 ${student.correctCount} / 오답 ${student.incorrectCount}`,
      summary: summary.text,
      summaryLines: summary.lines,
      student: student.student,
      fields: this.compactDrilldownFields([
        ["단원", student.lessonUnit],
        ["정답 수", String(student.correctCount)],
        ["오답 수", String(student.incorrectCount)],
        ["복습/수행 상태", student.assignmentStatus],
        ["헷갈린 부분", student.misconception],
        ["후속 지도", followUp],
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
    const followUp = this.normalizeLessonFollowUpValue(response?.followUp || "")
      || "보충 설명 필요";
    const summary = buildStructuredText([
      student.assignmentStatus ? `복습/수행: ${student.assignmentStatus}` : "",
      student.misconception ? `헷갈린 부분: ${student.misconception}` : "",
    ], "보충 지도 근거 보기");

    return {
      title: formatStudentLabel(student.student),
      meta: [
        this.getLessonFollowUpBadge(followUp),
        `정답 ${student.correctCount} / 오답 ${student.incorrectCount}`,
      ].filter(Boolean).join(" · "),
      summary: summary.text,
      summaryLines: summary.lines,
      tone: this.getLessonFollowUpTone(followUp) ?? "warning",
      student: student.student,
      fields: this.compactDrilldownFields([
        ["복습/수행 상태", student.assignmentStatus],
        ["후속 지도", followUp],
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
    const followUp = this.normalizeLessonFollowUpValue(result.followUp);
    const summary = buildStructuredText([
      result.assignmentStatus ? `복습/수행: ${result.assignmentStatus}` : "",
      followUp ? `후속 지도: ${followUp}` : "",
    ], "학생별 결과 보기");

    return {
      title: formatStudentLabel(result.student),
      meta: [
        this.getLessonFollowUpBadge(followUp),
        `정답 ${result.correctCount} / 오답 ${result.incorrectCount}`,
      ].filter(Boolean).join(" · "),
      summary: summary.text,
      summaryLines: summary.lines,
      tone: this.getLessonFollowUpTone(followUp),
      student: result.student,
      fields: this.compactDrilldownFields([
        ["복습/수행 상태", result.assignmentStatus],
        ["후속 지도", followUp],
        ["틀린 이유", response?.incorrectReason || ""],
        ["선생님께 하고 싶은 말", response?.teacherMessage || ""],
        ["개념 응답", response ? this.buildConceptSummary(response) : ""],
        ["분석 메모", response?.teacherNote || ""],
      ]),
    };
  }

  private buildLessonFollowUpDrilldownItems(
    summary: LessonGroupSummary,
    responseMap: Map<string, LessonStudentResponse>,
  ): DrilldownItem[] {
    const supportKeys = new Set(
      summary.supportStudents
        .map((student) => this.getStudentLookupKey(student.student))
        .filter((key): key is string => key !== null),
    );
    const sortedSupportStudents = this.sortItemsByStudentPreference(summary.supportStudents, {
      getStudent: (student) => student.student,
      getRiskScore: (student) =>
        student.incorrectCount * 3
        + (student.assignmentStatus.includes("미완료") ? 5 : 0)
        + (student.assignmentStatus.includes("부분") ? 2 : 0),
      getRecentRank: (_student, index) => index,
    });
    const supportItems = sortedSupportStudents
      .map((student) =>
        this.buildLessonSupportDrilldownItem(
          student,
          this.findLessonResponseByStudent(responseMap, student.student),
        )
      );
    const extraItems = this.sortItemsByStudentPreference(this.getSortedLessonStudentResults(summary), {
      getStudent: (student) => student.student,
      getRiskScore: (student) => this.getLessonResultRiskScore(student),
      getPraiseScore: (student) => this.getLessonResultPraiseScore(student),
      getRecentRank: (_student, index) => index,
    })
      .filter((result) => {
        const key = this.getStudentLookupKey(result.student);
        if (key && supportKeys.has(key)) {
          return false;
        }

        return this.isUrgentLessonFollowUp(result.followUp);
      })
      .map((result) =>
        this.buildStudentResultDrilldownItem(
          result,
          this.findLessonResponseByStudent(responseMap, result.student),
        )
      );

    return [...supportItems, ...extraItems].slice(0, 8);
  }

  private getSortedLessonStudentResults(
    summary: Pick<LessonGroupSummary, "studentResults">,
  ): LessonSummaryAggregate["studentResults"] {
    return summary.studentResults.slice().sort((left, right) => {
      const priorityDiff = this.getLessonFollowUpPriority(left.followUp)
        - this.getLessonFollowUpPriority(right.followUp);
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

  private getLessonFollowUpBadge(followUp: string): string {
    const normalized = this.normalizeLessonFollowUpValue(followUp);
    if (!normalized) {
      return "";
    }

    return normalized;
  }

  private getLessonFollowUpTone(followUp: string): RowTone | undefined {
    const normalized = this.normalizeLessonFollowUpValue(followUp);
    if (!normalized) {
      return undefined;
    }

    if (normalized.includes("심화")) {
      return "positive";
    }

    if (normalized.includes("보충") || normalized.includes("확인") || normalized.includes("재")) {
      return "warning";
    }

    return undefined;
  }

  private getLessonFollowUpPriority(followUp: string): number {
    const normalized = this.normalizeLessonFollowUpValue(followUp);
    if (!normalized) {
      return 2;
    }

    if (normalized.includes("보충")) {
      return 0;
    }

    if (normalized.includes("확인") || normalized.includes("재")) {
      return 1;
    }

    if (normalized.includes("심화")) {
      return 3;
    }

    return 2;
  }

  private isUrgentLessonFollowUp(followUp: string): boolean {
    return this.getLessonFollowUpPriority(followUp) <= 1;
  }

  private normalizeLessonFollowUpValue(followUp: string): string {
    const normalized = followUp.trim();
    if (!normalized || normalized === "미확인" || normalized === "정보 없음") {
      return "";
    }

    return normalized;
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

  private getLessonAvailableSummaries(summary: LessonSummaryAggregate): LessonSubjectSummary[] {
    const subjects = summary.subjectSummaries.length > 0
      ? summary.subjectSummaries
      : [this.buildFallbackLessonSubjectSummary(summary)];

    return this.getLessonAvailableSummariesFromSubjects(subjects);
  }

  private getLessonAvailableSummariesFromSubjects(
    subjects: LessonSubjectSummary[],
  ): LessonSubjectSummary[] {
    return subjects
      .slice()
      .sort((left, right) => this.compareLessonGroupsForDisplay(left, right));
  }

  private getLessonSubjectSelectionValue(summary: LessonSubjectSummary): string {
    return summary.subjectKey.trim()
      || summary.subject.trim()
      || summary.groupKey;
  }

  private getSelectedLessonSubjectSummary(summary: LessonSummaryAggregate): LessonSubjectSummary {
    const availableSummaries = this.getLessonAvailableSummaries(summary);

    return availableSummaries.find((item) =>
      this.getLessonSubjectSelectionValue(item) === this.lessonSubjectSelection,
    )
      ?? availableSummaries.find((item) =>
        item.groups.some((group) => group.groupKey === this.lessonGroupSelection)
          || item.groupKey === this.lessonGroupSelection,
      )
      ?? availableSummaries.find((item) => item.subject === summary.subject)
      ?? availableSummaries[0];
  }

  private getLessonExplorerState(summary: LessonSummaryAggregate): LessonExplorerState {
    const availableSubjects = this.getLessonAvailableSummaries(summary);
    const selectedSubject = this.getSelectedLessonSubjectSummary(summary);
    return this.getLessonExplorerStateFromSubject(selectedSubject, availableSubjects);
  }

  private getLessonExplorerStateFromSubject(
    selectedSubject: LessonSubjectSummary,
    availableSubjects: LessonSubjectSummary[],
  ): LessonExplorerState {
    const allGroups = this.getSortedLessonGroups(selectedSubject);
    const unitFilteredGroups = this.getUnitFilteredLessonGroups(selectedSubject);
    const unitOptions = this.getLessonUnitOptions(selectedSubject);
    const dateOptions = this.getLessonDateOptions(selectedSubject);
    const filteredGroups = this.getFilteredLessonGroups(selectedSubject);
    const selectedGroup = filteredGroups.find((item) => item.groupKey === this.lessonGroupSelection)
      ?? filteredGroups.find((item) => item.groupKey === selectedSubject.groupKey)
      ?? filteredGroups[0]
      ?? null;

    return {
      availableSubjects,
      selectedSubject,
      allGroups,
      unitFilteredGroups,
      filteredGroups,
      selectedGroup,
      unitOptions,
      dateOptions,
    };
  }

  private getSelectedLessonSummary(summary: LessonSummaryAggregate): LessonGroupSummary {
    const explorer = this.getLessonExplorerState(summary);

    return explorer.selectedGroup
      ?? explorer.allGroups[0]
      ?? this.buildFallbackLessonGroupSummary(explorer.selectedSubject);
  }

  private buildFallbackLessonSubjectSummary(summary: LessonSummaryAggregate): LessonSubjectSummary {
    const group = this.buildFallbackLessonGroupSummary(summary);

    return {
      ...group,
      groups: [this.cloneLessonGroupSummary(group)],
    };
  }

  private buildFallbackLessonGroupSummary(
    summary: LessonSummaryAggregate | LessonSubjectSummary,
  ): LessonGroupSummary {
    const lessonUnit = summary.studentResponses[0]?.lessonUnit || "";
    const unitLabel = "unitLabel" in summary && typeof summary.unitLabel === "string"
      ? summary.unitLabel
      : lessonUnit;
    const lessonDate = "lessonDate" in summary && typeof summary.lessonDate === "string"
      ? summary.lessonDate
      : this.extractLessonDate(summary.periodLabel);
    const periodOrder = "periodOrder" in summary && typeof summary.periodOrder === "number"
      ? summary.periodOrder
      : this.extractLessonPeriodOrder(summary.periodLabel);
    const subjectKey = "subjectKey" in summary && typeof summary.subjectKey === "string"
      ? summary.subjectKey
      : this.buildLessonStructuredKey(summary.subject);
    const unitKey = "unitKey" in summary && typeof summary.unitKey === "string"
      ? summary.unitKey
      : this.buildLessonStructuredKey(unitLabel);
    const lessonKey = "lessonKey" in summary && typeof summary.lessonKey === "string"
      ? summary.lessonKey
      : this.buildLessonMachineKey(lessonDate, periodOrder, subjectKey, unitKey);

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

  private getSortedLessonGroups(subject: LessonSubjectSummary): LessonGroupSummary[] {
    const groups = subject.groups.length > 0
      ? subject.groups
      : [this.buildFallbackLessonGroupSummary(subject)];

    return groups
      .slice()
      .sort((left, right) => this.compareLessonGroupsForDisplay(left, right));
  }

  private getUnitFilteredLessonGroups(subject: LessonSubjectSummary): LessonGroupSummary[] {
    return this.getSortedLessonGroups(subject).filter((group) => {
      if (
        this.lessonUnitFilter.length > 0
        && this.getLessonGroupUnitFilterValue(group) !== this.lessonUnitFilter
      ) {
        return false;
      }

      return true;
    });
  }

  private getFilteredLessonGroups(subject: LessonSubjectSummary): LessonGroupSummary[] {
    const groups = this.getUnitFilteredLessonGroups(subject);

    switch (this.lessonDatePreset) {
      case "recent-3":
        return groups.slice(0, 3);
      case "recent-5":
        return groups.slice(0, 5);
      case "specific":
        return groups.filter((group) =>
          this.lessonDateFilter.length === 0
            || this.getLessonGroupDateFilterValue(group) === this.lessonDateFilter
        );
      default:
        return groups;
    }
  }

  private getLessonUnitOptions(subject: LessonSubjectSummary): LessonFilterOption[] {
    const seen = new Set<string>();
    const options: LessonFilterOption[] = [];

    for (const group of this.getSortedLessonGroups(subject)) {
      const value = this.getLessonGroupUnitFilterValue(group);
      if (seen.has(value)) {
        continue;
      }

      seen.add(value);
      options.push({
        value,
        label: this.getLessonGroupUnitLabel(group),
      });
    }

    return options;
  }

  private getLessonDateOptions(subject: LessonSubjectSummary): LessonFilterOption[] {
    const seen = new Set<string>();
    const options: LessonFilterOption[] = [];

    for (const group of this.getUnitFilteredLessonGroups(subject)) {
      const value = this.getLessonGroupDateFilterValue(group);
      if (seen.has(value)) {
        continue;
      }

      seen.add(value);
      options.push({
        value,
        label: this.getLessonGroupDateLabel(group),
      });
    }

    return options;
  }

  private getPreferredLessonGroupSelection(subject: LessonSubjectSummary): string {
    const filteredGroups = this.getFilteredLessonGroups(subject);

    return filteredGroups.find((group) => group.groupKey === this.lessonGroupSelection)?.groupKey
      ?? filteredGroups.find((group) => group.groupKey === subject.groupKey)?.groupKey
      ?? filteredGroups[0]?.groupKey
      ?? "";
  }

  private getLessonDatePresetOptions(): LessonFilterOption[] {
    return [
      { value: "all", label: "전체 수업" },
      { value: "recent-3", label: "최근 3개 수업" },
      { value: "recent-5", label: "최근 5개 수업" },
      { value: "specific", label: "특정 날짜" },
    ];
  }

  private getLessonDatePresetLabel(): string {
    switch (this.lessonDatePreset) {
      case "recent-3":
        return "최근 3개 수업";
      case "recent-5":
        return "최근 5개 수업";
      case "specific":
        return this.lessonDateFilter.length > 0 ? "특정 날짜" : "날짜 선택 필요";
      default:
        return "전체 수업";
    }
  }

  private buildLessonScopeDescription(
    explorer: LessonExplorerState,
    options?: {
      includeSubject?: boolean;
      includeSubjectCount?: boolean;
      includeCurrentGroup?: boolean;
    },
  ): string {
    const parts = [
      options?.includeSubject
        ? `과목 ${explorer.selectedSubject.subject || "과목 정보 없음"}`
        : "",
      options?.includeSubjectCount === false
        ? ""
        : explorer.availableSubjects.length > 1
          ? `과목 ${explorer.availableSubjects.length}개`
          : "",
      `단원 ${this.getLessonFilterOptionLabel(this.lessonUnitFilter, explorer.unitOptions, "전체 단원")}`,
      `범위 ${this.getLessonDateScopeLabel(explorer.dateOptions)}`,
      explorer.filteredGroups.length !== explorer.unitFilteredGroups.length
        ? `표시 ${explorer.filteredGroups.length}개 그룹`
        : explorer.unitFilteredGroups.length !== explorer.allGroups.length
          ? `단원 안 ${explorer.unitFilteredGroups.length}개 그룹`
          : explorer.allGroups.length > 1
            ? `과목 전체 ${explorer.allGroups.length}개 그룹`
            : "",
      options?.includeCurrentGroup === false
        ? ""
        : explorer.selectedGroup
          ? `선택 ${this.buildLessonGroupOptionLabel(explorer.selectedGroup)}`
          : "조건에 맞는 수업 그룹이 없습니다.",
    ];

    return parts.filter(Boolean).join(" · ");
  }

  private getLessonDateScopeLabel(dateOptions: LessonFilterOption[]): string {
    if (this.lessonDatePreset === "specific") {
      return this.getLessonFilterOptionLabel(this.lessonDateFilter, dateOptions, "날짜 선택 필요");
    }

    return this.getLessonDatePresetLabel();
  }

  private getLessonFilterOptionLabel(
    value: string,
    options: LessonFilterOption[],
    allLabel: string,
  ): string {
    if (!value) {
      return allLabel;
    }

    return options.find((option) => option.value === value)?.label ?? allLabel;
  }

  private getLessonGroupUnitFilterValue(
    summary: Pick<LessonGroupSummary, "unitKey" | "unitLabel" | "lessonUnit">,
  ): string {
    return summary.unitKey.trim()
      || this.buildLessonStructuredKey(summary.unitLabel || summary.lessonUnit || "")
      || LESSON_FILTER_MISSING_UNIT;
  }

  private getLessonGroupUnitLabel(
    summary: Pick<LessonGroupSummary, "unitLabel" | "lessonUnit">,
  ): string {
    return summary.unitLabel.trim() || summary.lessonUnit.trim() || "단원 정보 없음";
  }

  private getLessonGroupDateFilterValue(
    summary: Pick<LessonGroupSummary, "lessonDate" | "periodLabel">,
  ): string {
    return summary.lessonDate.trim()
      || this.extractLessonDate(summary.periodLabel)
      || LESSON_FILTER_MISSING_DATE;
  }

  private getLessonGroupDateLabel(
    summary: Pick<LessonGroupSummary, "lessonDate" | "periodLabel">,
  ): string {
    return summary.lessonDate.trim()
      || this.extractLessonDate(summary.periodLabel)
      || "날짜 정보 없음";
  }

  private buildLessonStructuredFieldNotice(groups: LessonGroupSummary[]): string {
    const missingUnitCount = groups.filter((group) =>
      !group.unitLabel.trim() && !group.lessonUnit.trim()
    ).length;
    const missingDateCount = groups.filter((group) =>
      !group.lessonDate.trim() && !this.extractLessonDate(group.periodLabel)
    ).length;
    const parts = [
      missingUnitCount > 0 ? `단원 정보 없음 ${missingUnitCount}개` : "",
      missingDateCount > 0 ? `날짜 정보 없음 ${missingDateCount}개` : "",
    ].filter(Boolean);

    if (parts.length === 0) {
      return "";
    }

    return `일부 수업은 ${parts.join(" / ")}라서 필터에서 '정보 없음'으로 묶여 보일 수 있습니다.`;
  }

  private cloneLessonGroupSummary(summary: LessonGroupSummary): LessonGroupSummary {
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

  private buildLessonGroupLabel(subject: string, periodLabel: string, lessonUnit: string): string {
    const parts = [subject, periodLabel];
    if (lessonUnit && !periodLabel.includes(lessonUnit)) {
      parts.push(lessonUnit);
    }

    return parts.filter(Boolean).join(" · ") || "수업 그룹";
  }

  private buildLessonGroupOptionLabel(summary: LessonGroupSummary): string {
    const parts = [
      this.getLessonGroupDateLabel(summary),
      summary.periodOrder != null ? `${summary.periodOrder}교시` : "",
      this.getLessonGroupUnitLabel(summary),
    ].filter(Boolean);

    return parts.length > 0
      ? parts.join(" · ")
      : summary.label || summary.periodLabel || summary.groupKey;
  }

  private renderLessonEmptySelectionCard(
    parent: HTMLElement,
    selectedSubject: LessonSubjectSummary,
    unitOptions: LessonFilterOption[],
    dateOptions: LessonFilterOption[],
  ): void {
    const card = parent.createDiv({ cls: "classpage-card classpage-empty-card" });
    card.createEl("h3", {
      cls: "classpage-card__title",
      text: "조건에 맞는 수업 그룹이 없습니다",
    });
    card.createEl("p", {
      cls: "classpage-empty-card__message",
      text: "화면은 정상입니다. 선택한 과목 안에서 지금 조건에 맞는 수업 그룹만 아직 없습니다. 최근 수업 범위를 넓히거나 단원, 날짜 선택을 다시 확인해 주세요.",
    });
    card.createEl("p", {
      cls: "classpage-empty-card__detail",
      text: [
        `과목 ${selectedSubject.subject || "과목 정보 없음"}`,
        `단원 ${this.getLessonFilterOptionLabel(this.lessonUnitFilter, unitOptions, "전체 단원")}`,
        `범위 ${this.getLessonDateScopeLabel(dateOptions)}`,
      ].join(" · "),
    });
    card.createEl("p", {
      cls: "classpage-empty-card__detail",
      text: this.lessonDatePreset === "specific"
        ? "특정 날짜 대신 최근 3개 수업이나 전체 수업으로 넓혀 보면 더 빨리 찾을 수 있습니다."
        : "조건을 조금 넓혀 보면 최근 수업 흐름을 더 빠르게 다시 확인할 수 있습니다.",
    });
  }

  private compareLessonGroupsForDisplay(
    left: Pick<LessonGroupSummary, "lessonDate" | "periodOrder" | "lessonKey" | "label">,
    right: Pick<LessonGroupSummary, "lessonDate" | "periodOrder" | "lessonKey" | "label">,
  ): number {
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

  private buildLessonStructuredKey(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, "-").replace(/[|/\\]+/g, "-");
  }

  private buildLessonMachineKey(
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

  private extractLessonDate(value: string): string {
    const match = value.match(/\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : "";
  }

  private extractLessonPeriodOrder(value: string): number | null {
    const periodMatch = value.match(/(\d+)\s*교시/);
    if (periodMatch) {
      return Number(periodMatch[1]);
    }

    const numericMatch = value.match(/(\d+)/);
    return numericMatch ? Number(numericMatch[1]) : null;
  }

  private buildStarRecentEventMap(events: StarEvent[]): Map<string, StarEvent[]> {
    const map = new Map<string, StarEvent[]>();

    for (const event of events) {
      const list = map.get(event.studentKey) ?? [];
      list.push(event);
      map.set(event.studentKey, list);
    }

    return map;
  }

  private getFilteredStarTotals(
    ledger: StarModeLedger,
    eventMap: Map<string, StarEvent[]>,
  ): StarStudentTotal[] {
    const query = normalizeLookupText(this.starStudentQuery);
    const baseTotals = this.getStarTotalsForFilterMode(ledger, eventMap);

    return baseTotals.filter((total) => {
      if (!query) {
        return true;
      }

      const haystack = normalizeLookupText([
        total.student.classroom,
        total.student.number,
        total.student.name,
      ].join(" "));

      return haystack.includes(query);
    });
  }

  private getStarTotalsForFilterMode(
    ledger: StarModeLedger,
    eventMap: Map<string, StarEvent[]>,
  ): StarStudentTotal[] {
    switch (this.starStudentFilterMode) {
      case "adjusted":
        return sortStarTotalsByHiddenAdjustment(ledger.totals)
          .filter((total) => total.hiddenAdjustmentTotal !== 0);
      case "recent":
        return this.sortStarTotalsByRecentPreview(ledger.totals, eventMap)
          .filter((total) => (eventMap.get(total.studentKey) ?? []).length > 0);
      case "manual":
        return this.sortStarTotalsByRecentPreview(ledger.totals, eventMap, (event) => event.source === "manual")
          .filter((total) =>
            (eventMap.get(total.studentKey) ?? []).some((event) => event.source === "manual")
          );
      default:
        return sortStarTotals(ledger.totals);
    }
  }

  private sortStarTotalsByRecentPreview(
    totals: StarStudentTotal[],
    eventMap: Map<string, StarEvent[]>,
    predicate?: (event: StarEvent) => boolean,
  ): StarStudentTotal[] {
    return totals.slice().sort((left, right) => {
      const leftEvents = (eventMap.get(left.studentKey) ?? []).filter((event) =>
        predicate ? predicate(event) : true
      );
      const rightEvents = (eventMap.get(right.studentKey) ?? []).filter((event) =>
        predicate ? predicate(event) : true
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

  private getStarStudentFilterModeLabel(): string {
    switch (this.starStudentFilterMode) {
      case "adjusted":
        return "숨김 조정 반영 학생";
      case "recent":
        return "최근 변동 학생";
      case "manual":
        return "최근 수동 조정";
      default:
        return "전체 학생";
    }
  }

  private findStarRuleSummary(
    ledger: StarModeLedger,
    ruleId: string,
  ): StarRuleEventSummary | null {
    return ledger.ruleSummary.find((item) => item.ruleId === ruleId) ?? null;
  }

  private buildStarRuleSummaryRows(
    ledger: StarModeLedger,
    rules: StarRuleSettings[],
  ): DetailRow[] {
    const knownRuleIds = new Set(rules.map((rule) => rule.ruleId));
    const rows = rules.map((rule) => this.buildStarRuleSummaryRow(rule, this.findStarRuleSummary(ledger, rule.ruleId)));
    const fallbackRows = ledger.ruleSummary
      .filter((item) => !knownRuleIds.has(item.ruleId))
      .map((item) => this.buildFallbackStarRuleSummaryRow(item));

    return [...rows, ...fallbackRows].sort((left, right) => {
      const leftCount = parseLeadingNumber(left.meta);
      const rightCount = parseLeadingNumber(right.meta);
      if (rightCount !== leftCount) {
        return rightCount - leftCount;
      }

      return left.title.localeCompare(right.title, "ko-KR");
    });
  }

  private buildStarRuleSummaryRow(
    rule: StarRuleSettings,
    summary: StarRuleEventSummary | null,
  ): DetailRow {
    const automaticCount = summary?.automaticCount ?? 0;
    const manualCount = summary?.manualCount ?? 0;
    const eventCount = summary?.eventCount ?? 0;

    return {
      title: rule.label,
      meta: `${eventCount}건`,
      description: [
        `${getStarVisibilityLabel(rule.visibility)} · ${getStarCategoryLabel(rule.category)}`,
        automaticCount > 0 ? `자동 ${automaticCount}건` : "",
        manualCount > 0 ? `수동 ${manualCount}건` : "",
        getStarRuleSourceSummary(rule.sources),
      ].filter(Boolean).join(" / "),
      tone: rule.visibility === "teacher" || rule.delta < 0
        ? "warning"
        : eventCount > 0
          ? "positive"
          : undefined,
    };
  }

  private buildFallbackStarRuleSummaryRow(summary: StarRuleEventSummary): DetailRow {
    return {
      title: summary.label || summary.ruleId,
      meta: `${summary.eventCount}건`,
      description: [
        `${getStarVisibilityLabel(summary.visibility)} · ${getStarCategoryLabel(summary.category)}`,
        summary.automaticCount > 0 ? `자동 ${summary.automaticCount}건` : "",
        summary.manualCount > 0 ? `수동 ${summary.manualCount}건` : "",
        `ruleId ${summary.ruleId}`,
      ].filter(Boolean).join(" / "),
      tone: summary.visibility === "teacher" ? "warning" : summary.eventCount > 0 ? "positive" : undefined,
    };
  }

  private buildStarStudentFlowRows(
    ledger: StarModeLedger,
    eventMap: Map<string, StarEvent[]>,
  ): DetailRow[] {
    const recentStudents = this.sortStarTotalsByRecentPreview(ledger.totals, eventMap)
      .filter((total) => (eventMap.get(total.studentKey) ?? []).length > 0)
      .slice(0, 4);
    const recentManualStudents = this.sortStarTotalsByRecentPreview(
      ledger.totals,
      eventMap,
      (event) => event.source === "manual",
    )
      .filter((total) =>
        (eventMap.get(total.studentKey) ?? []).some((event) => event.source === "manual")
      )
      .slice(0, 4);
    const adjustedStudents = sortStarTotalsByHiddenAdjustment(ledger.totals)
      .filter((total) => total.hiddenAdjustmentTotal !== 0)
      .slice(0, 4);

    return [
      {
        title: "최근 변동이 보이는 학생",
        meta: recentStudents.length > 0 ? `${recentStudents.length}명` : "없음",
        description: recentStudents.length > 0
          ? recentStudents
              .map((total) =>
                `${formatStudentLabel(total.student)} (${this.buildStarRecentEventSummary(
                  eventMap.get(total.studentKey) ?? [],
                  ledger.rules,
                )})`
              )
              .join(" / ")
          : "최근 표시 이벤트에 잡힌 학생이 아직 없습니다.",
      },
      {
        title: "최근 수동 조정이 보이는 학생",
        meta: recentManualStudents.length > 0 ? `${recentManualStudents.length}명` : "없음",
        description: recentManualStudents.length > 0
          ? `${recentManualStudents
              .map((total) =>
                `${formatStudentLabel(total.student)} (${this.buildStarRecentEventSummary(
                  (eventMap.get(total.studentKey) ?? []).filter((event) => event.source === "manual"),
                  ledger.rules,
                )})`
              )
              .join(" / ")} / 최근 표시 이벤트 안에서만 보입니다.`
          : "최근 표시 이벤트 안에서 수동 조정이 보이는 학생이 없습니다.",
      },
      {
        title: "숨김 조정이 반영된 학생",
        meta: adjustedStudents.length > 0 ? `${adjustedStudents.length}명` : "없음",
        description: adjustedStudents.length > 0
          ? adjustedStudents
              .map((total) => {
                const latestEvent = (eventMap.get(total.studentKey) ?? [])[0];
                const previewLabel = latestEvent
                  ? this.buildCompactStarEventPreview(latestEvent, ledger.rules)
                  : `최근 미리보기 없음 / 총 ${formatSignedPoints(total.total)}`;

                return `${formatStudentLabel(total.student)} (선생님 조정 ${formatSignedPoints(total.hiddenAdjustmentTotal)} / ${previewLabel})`;
              })
              .join(" / ")
          : "현재 숨김 조정이 반영된 학생이 없습니다.",
        tone: adjustedStudents.some((total) => total.hiddenAdjustmentTotal < 0) ? "warning" : undefined,
      },
    ];
  }

  private buildStarStudentDrilldownItem(
    total: StarStudentTotal,
    previewEvents: StarEvent[],
    rules: StarRuleSettings[],
  ): DrilldownItem {
    const manualPreviewCount = previewEvents.filter((event) => event.source === "manual").length;
    return {
      title: formatStudentLabel(total.student),
      meta: [
        `총 ${formatSignedPoints(total.total)}`,
        previewEvents.length > 0 ? `최근 ${previewEvents.length}건` : "",
      ].filter(Boolean).join(" · "),
      summary: [
        `학생 공개 ${formatSignedPoints(total.visibleTotal)}`,
        `선생님 조정 ${formatSignedPoints(total.hiddenAdjustmentTotal)}`,
        manualPreviewCount > 0 ? `최근 수동 조정 ${manualPreviewCount}건` : "",
        previewEvents.length > 0
          ? `최근 흐름: ${this.buildStarRecentEventSummary(previewEvents, rules)}`
          : "최근 표시 이벤트가 없습니다.",
      ].filter(Boolean).join(" / "),
      tone: total.hiddenAdjustmentTotal < 0
        ? "warning"
        : total.hiddenAdjustmentTotal > 0
          ? "positive"
          : undefined,
      student: total.student,
      fields: this.compactDrilldownFields([
        ["학생 공개 누적", formatSignedPoints(total.visibleTotal)],
        ["선생님 조정 합계", formatSignedPoints(total.hiddenAdjustmentTotal)],
        ["전체 이벤트 수", `${total.eventCount}건`],
        ...previewEvents.slice(0, 4).map((event, index) => ([
          `최근 이벤트 ${index + 1}`,
          this.buildCompactStarEventPreview(event, rules),
        ] as const)),
      ]),
    };
  }

  private buildStarRecentEventSummary(
    previewEvents: StarEvent[],
    rules: StarRuleSettings[],
  ): string {
    if (previewEvents.length === 0) {
      return "최근 이벤트 없음";
    }

    return previewEvents
      .slice(0, 2)
      .map((event) => {
        const rule = rules.find((item) => item.ruleId === event.ruleId);
        return [
          formatDateLabel(event.occurredAt, "시각 정보 없음"),
          `${rule?.label ?? event.ruleId} ${formatSignedPoints(event.delta)}`,
        ].join(" ");
      })
      .join(" / ");
  }

  private buildCompactStarEventPreview(
    event: StarEvent,
    rules: StarRuleSettings[],
  ): string {
    const rule = rules.find((item) => item.ruleId === event.ruleId);

    return [
      formatDateLabel(event.occurredAt, "시각 정보 없음"),
      `${rule?.label ?? event.ruleId} ${formatSignedPoints(event.delta)}`,
      getStarEventSourceLabel(event),
      event.visibility === "teacher" ? "선생님 확인 전용" : "",
      event.note,
    ].filter(Boolean).join(" / ");
  }

  private buildTeacherContextSummary(
    teacherData: TeacherPageData | null,
  ): {
    badgeText: string;
    focusLabel: string;
    classroomLabel: string;
    meta: string;
    description: string;
  } {
    const focusLabel = this.getTeacherFocusLabel(this.teacherFocusMode);
    const candidates: Array<TeacherAggregateState | null> = [
      this.teacherFocusMode === "class" ? teacherData?.classSummary ?? null : null,
      this.teacherFocusMode === "lesson" ? teacherData?.lessonSummary ?? null : null,
      this.teacherFocusMode === "star" ? teacherData?.starLedger ?? null : null,
      teacherData?.classSummary ?? null,
      teacherData?.lessonSummary ?? null,
      teacherData?.starLedger ?? null,
    ];
    const sourceState = candidates.find((item) =>
      item?.status === "loaded" && item.data,
    ) ?? null;

    if (!sourceState || !sourceState.data) {
      return {
        badgeText: "학급 정보 없음",
        focusLabel,
        classroomLabel: "학급 정보 확인 필요",
        meta: `현재 화면: ${focusLabel}`,
        description:
          "학급, 수업, 별점 집계 중 하나에 학급 정보가 들어오면 여기와 각 섹션 헤더에 함께 표시됩니다.",
      };
    }

    const lessonExplorer = sourceState.data.type === "lesson-summary"
      ? this.getLessonExplorerState(sourceState.data)
      : null;
    const lessonDisplayTarget = lessonExplorer?.selectedGroup
      ?? lessonExplorer?.selectedSubject
      ?? null;
    const classroomLabel = getAggregateDisplayClassroom(
      sourceState.data.type === "lesson-summary"
        ? lessonDisplayTarget ?? sourceState.data
        : sourceState.data,
    ) || "학급 정보 확인 필요";
    const selectedLessonSubject = lessonExplorer
      ? lessonExplorer.selectedSubject
      : null;
    const selectedLessonGroup = lessonExplorer
      ? lessonExplorer.selectedGroup
      : null;
    const lessonMetaLabel = selectedLessonGroup?.label
      ?? (lessonExplorer
        ? [
            selectedLessonSubject?.subject
              || (sourceState.data.type === "lesson-summary" ? sourceState.data.subject : ""),
            this.buildLessonScopeDescription(lessonExplorer, {
              includeSubject: false,
              includeSubjectCount: false,
              includeCurrentGroup: false,
            }),
            "조건에 맞는 수업 그룹 없음",
          ].filter(Boolean).join(" · ")
        : sourceState.data.type === "lesson-summary"
          ? sourceState.data.subject
          : "");
    const meta = [
      `현재 화면: ${focusLabel}`,
      `기준: ${this.getTeacherAggregateLabel(sourceState.kind)}`,
      lessonMetaLabel,
      sourceState.data.type === "lesson-summary"
        ? ""
        : sourceState.data.periodLabel,
    ].filter(Boolean).join(" · ");

    const description = sourceState.data.type === "star-ledger"
      ? sourceState.data.classroom
        ? "별점은 공개 점수와 선생님 확인 전용 조정을 분리해 읽는 확인 화면입니다."
        : "별점 집계에 학급 정보가 비어 있으면 학생 목록의 공통 학급을 찾아 화면에 보완 표시합니다."
      : sourceState.data.type === "lesson-summary"
        ? "수업 카드와 drill-down은 선택한 과목 안의 수업 그룹 기준으로 이해도, 복습/수행, 후속 지도를 먼저 보도록 정리합니다."
        : "학급 카드와 drill-down은 이 학급의 정서 상태, 목표 달성, 도움이 필요한 학생을 먼저 보여줍니다.";

    return {
      badgeText: classroomLabel,
      focusLabel,
      classroomLabel,
      meta,
      description,
    };
  }

  private getTeacherFocusLabel(mode: TeacherFocusMode): string {
    switch (mode) {
      case "class":
        return "학급";
      case "lesson":
        return "수업";
      case "star":
        return "별점";
      default:
        return "전체 보기";
    }
  }

  private getTeacherAggregateLabel(kind: TeacherAggregateState["kind"]): string {
    switch (kind) {
      case "class":
        return "학급 집계";
      case "lesson":
        return "수업 집계";
      case "star":
        return "별점 집계";
    }
  }

  private getSourceClassroomBadge(sourceState: TeacherAggregateState | null): string | undefined {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return undefined;
    }

    const lessonExplorer = sourceState.data.type === "lesson-summary"
      ? this.getLessonExplorerState(sourceState.data)
      : null;
    return getAggregateDisplayClassroom(
      sourceState.data.type === "lesson-summary"
        ? lessonExplorer?.selectedGroup ?? lessonExplorer?.selectedSubject ?? sourceState.data
        : sourceState.data,
    ) || undefined;
  }

  private buildLessonPriorityRows(summary: LessonSummaryAggregate | LessonGroupSummary): DetailRow[] {
    const partialCount = this.getAggregateCountByLabel(summary.assignmentSummary, "부분 완료");
    const incompleteCount = this.getAggregateCountByLabel(summary.assignmentSummary, "미완료");
    const needsFollowUpCount = partialCount + incompleteCount;
    const supportPreview = summary.supportStudents
      .slice(0, 3)
      .map((student) => formatStudentLabel(student.student))
      .join(", ");
    const topConcept = summary.difficultConcepts[0];
    const supportDetails = buildStructuredText([
      supportPreview ? `먼저 볼 학생: ${supportPreview}` : "",
      summary.supportStudents[0]?.misconception
        ? `핵심 오개념: ${summary.supportStudents[0].misconception}`
        : "",
    ], "현재는 보충 설명 우선 학생이 없습니다.");
    const assignmentDetails = buildStructuredText([
      incompleteCount > 0 ? `미완료 ${incompleteCount}명` : "",
      partialCount > 0 ? `부분 완료 ${partialCount}명` : "",
      summary.overview.assignmentCompletionLabel
        ? `전체 흐름: ${summary.overview.assignmentCompletionLabel}`
        : "",
    ], `전체 흐름: ${summary.overview.assignmentCompletionLabel || "미분류"}`);
    const conceptDetails = buildStructuredText([
      topConcept?.concept || "",
      topConcept?.averageUnderstanding || "",
      topConcept?.note || "",
    ], "현재 다시 설명이 필요한 대표 개념이 없습니다.");

    return [
      {
        title: "보충 설명이 필요한 학생",
        meta: summary.supportStudents.length > 0 ? `${summary.supportStudents.length}명` : "없음",
        description: supportDetails.text,
        detailLines: summary.supportStudents.length > 0 ? supportDetails.lines : undefined,
        tone: summary.supportStudents.length > 0 ? "warning" : "positive",
      },
      {
        title: "복습/수행 미완료 확인",
        meta: needsFollowUpCount > 0 ? `${needsFollowUpCount}명` : "없음",
        description: assignmentDetails.text,
        detailLines: needsFollowUpCount > 0 ? assignmentDetails.lines : undefined,
        tone: needsFollowUpCount > 0 ? "warning" : undefined,
      },
      {
        title: "재설명 필요한 개념",
        meta: topConcept ? `${topConcept.count}명` : "없음",
        description: conceptDetails.text,
        detailLines: topConcept ? conceptDetails.lines : undefined,
        tone: topConcept ? "warning" : undefined,
      },
    ];
  }

  private getAggregateCountByLabel(items: AggregateCountItem[], label: string): number {
    return items.find((item) => item.label === label)?.count ?? 0;
  }

  private buildStarOperationRows(
    ledger: StarModeLedger,
    visibleRules: StarRuleSettings[],
    teacherOnlyRules: StarRuleSettings[],
    manualRules: StarRuleSettings[],
  ): DetailRow[] {
    const customDeltaRules = manualRules.filter((rule) => rule.allowCustomDelta);
    const manualOperationDetails = buildStructuredText([
      "운영 규칙: 자동화 설정에서 관리",
      "입력 위치: 별점 수동 조정 시트",
      customDeltaRules.length > 0
        ? `행별 점수 덮어쓰기 허용 ${customDeltaRules.length}개`
        : "행별 점수 덮어쓰기 허용 없음",
    ], "");

    return [
      {
        title: "지금 확인 가능한 내용",
        meta: "읽기 전용",
        description:
          "활성 규칙, 공개/비공개 구분, 최근 이벤트, 학생별 누적 점수, 숨김 조정 합계를 이 화면에서 확인합니다.",
      },
      {
        title: "공개/비공개 기준",
        meta: `학생 공개 ${visibleRules.length}개 / 선생님 확인 ${teacherOnlyRules.length}개`,
        description:
          "학생 공개 점수와 선생님 확인 전용 조정은 분리해 읽습니다. 숨김 조정은 학생 공개 합계에 섞지 않습니다.",
      },
      {
        title: "수동 조정 기준",
        meta: `수동 규칙 ${manualRules.length}개`,
        description: manualOperationDetails.text,
        detailLines: manualOperationDetails.lines,
      },
      {
        title: "일괄 부여 흐름",
        meta: ledger.sourceSummary.manual > 0
          ? `현재 반영 ${ledger.sourceSummary.manual}건`
          : "입력 없음",
        description:
          "별점 일괄 부여 시트에서 준비한 행이 Apps Script를 거쳐 별점 수동 조정 이벤트로 반영되면 이 화면에 나타납니다.",
      },
      {
        title: "학급 표시 기준",
        meta: ledger.classroom ? "집계 제공" : "표시 보완",
        description: ledger.classroom
          ? "별점 집계 파일의 학급 값을 우선 표시합니다."
          : "별점 집계 파일에 학급 값이 없으면 학생 목록의 공통 학급을 찾아 보완 표시합니다.",
      },
      {
        title: "규칙별 발생 집계",
        meta: ledger.ruleSummary.length > 0 ? "정확 집계" : "부분 표시",
        description: ledger.ruleSummary.length > 0
          ? "최신 집계 파일이면 규칙별 총 발생 수와 자동/수동 분리를 정확히 보여줍니다."
          : "오래된 집계 파일이면 일부 규칙은 최근 표시 이벤트 중심의 미리보기만 보일 수 있습니다.",
      },
      {
        title: "아직 이 화면에서 하지 않는 것",
        meta: "베타 범위 밖",
        description:
          "Google Sheets 직접 쓰기, 규칙 편집, 전체 기간 필터와 다중 차시 drill-down은 아직 넣지 않았습니다.",
        tone: "warning",
      },
    ];
  }

  private buildStarRuleRow(
    rule: StarRuleSettings,
    summary: StarRuleEventSummary | null,
  ): DetailRow {
    const description = buildStructuredText([
      getStarCategoryLabel(rule.category),
      summary && summary.automaticCount > 0 ? `자동 ${summary.automaticCount}건` : "",
      summary && summary.manualCount > 0 ? `수동 ${summary.manualCount}건` : "",
      getStarRuleSourceSummary(rule.sources),
      getStarAutoCriteriaSummary(rule.autoCriteria),
      rule.sources.includes("manual")
        ? rule.allowCustomDelta
          ? "행별 점수 덮어쓰기 허용"
          : "행별 점수는 기본값 고정"
        : "자동 적립 전용",
      rule.description,
    ], "설명 없음");

    return {
      title: rule.label,
      meta: [
        formatSignedPoints(rule.delta),
        getStarVisibilityLabel(rule.visibility),
        summary ? `${summary.eventCount}건` : "",
      ].filter(Boolean).join(" · "),
      description: description.text,
      detailLines: description.lines,
      tone: rule.delta < 0 ? "warning" : "positive",
    };
  }

  private buildStarAdjustmentTotalRow(total: StarStudentTotal): DetailRow {
    const description = buildStructuredText([
      `총 ${formatSignedPoints(total.total)}`,
      `학생 공개 ${formatSignedPoints(total.visibleTotal)}`,
      `이벤트 ${total.eventCount}건`,
    ], "");

    return {
      title: formatStudentLabel(total.student),
      meta: `선생님 조정 ${formatSignedPoints(total.hiddenAdjustmentTotal)}`,
      description: description.text,
      detailLines: description.lines,
      tone: total.hiddenAdjustmentTotal < 0 ? "warning" : "positive",
      student: total.student,
    };
  }

  private getTeacherStatusPrimaryValue(
    mode: Exclude<TeacherFocusMode, "overview">,
    sourceState: TeacherAggregateState | null,
  ): string {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return sourceState?.status === "invalid" ? "형식 확인" : "확인 필요";
    }

    const classroomLabel = getAggregateDisplayClassroom(sourceState.data);
    if (classroomLabel) {
      return classroomLabel;
    }

    if (mode === "lesson" && sourceState.data.type === "lesson-summary" && sourceState.data.subject) {
      return sourceState.data.subject;
    }

    if (mode === "star" || sourceState.data.type === "star-ledger") {
      return "읽기 전용";
    }

    return `${sourceState.data.responseCount}건`;
  }

  private getTeacherStatusPrimaryMeta(
    mode: Exclude<TeacherFocusMode, "overview">,
    sourceState: TeacherAggregateState | null,
  ): string {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return sourceState?.message || "집계 파일 상태를 확인해 주세요.";
    }

    if (mode === "class" && sourceState.data.type === "class-summary") {
      const missingSnapshot = this.buildMissingSubmissionSnapshot(
        "학급용 폼",
        sourceState.data.classroom,
        sourceState.data.studentResponses.map((item) => item.student),
      );
      return [
        `응답 ${sourceState.data.responseCount}건`,
        missingSnapshot.rosterStatus === "loaded"
          ? `미제출 ${missingSnapshot.missingStudents.length}명`
          : "",
        sourceState.data.periodLabel,
      ].filter(Boolean).join(" · ");
    }

    if (mode === "lesson" && sourceState.data.type === "lesson-summary") {
      const explorer = this.getLessonExplorerState(sourceState.data);
      if (!explorer.selectedGroup) {
        return [
          explorer.selectedSubject.subject || "수업",
          "조건에 맞는 수업 그룹 없음",
        ].filter(Boolean).join(" · ");
      }

      const selectedSummary = explorer.selectedGroup;
      const missingSnapshot = this.buildMissingSubmissionSnapshot(
        "현재 선택한 수업",
        selectedSummary.classroom || sourceState.data.classroom,
        selectedSummary.studentResponses.map((item) => item.student),
      );
      return [
        selectedSummary.label,
        `응답 ${selectedSummary.responseCount}건`,
        missingSnapshot.rosterStatus === "loaded"
          ? `미제출 ${missingSnapshot.missingStudents.length}명`
          : "",
        selectedSummary.supportStudents.length > 0
          ? `보충 지도 ${selectedSummary.supportStudents.length}명`
          : "",
      ].filter(Boolean).join(" · ");
    }

    if (mode === "star" && sourceState.data.type === "star-ledger") {
      const enabledRules = getEnabledStarRules(sourceState.data.rules);
      return [
        sourceState.data.periodLabel,
        `규칙 ${enabledRules.length}개`,
        `학생 ${sourceState.data.totals.length}명`,
      ].join(" · ");
    }

    return sourceState.data.periodLabel || "범위 정보 없음";
  }

  private getTeacherStatusHint(
    mode: Exclude<TeacherFocusMode, "overview">,
    sourceState: TeacherAggregateState | null,
  ): string {
    const actionHint = this.teacherFocusMode === mode
      ? "다시 누르면 전체 보기"
      : "누르면 이 영역만 보기";

    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return `${actionHint} · 처음 연결 중이라면 정상입니다. 집계 파일 생성과 경로를 확인해 주세요.`;
    }

    const suffix = sourceState.data.type === "star-ledger"
      ? [
          sourceState.data.eventCount > 0
            ? `이벤트 ${sourceState.data.eventCount}건`
            : "이벤트 없음",
          `집계 ${formatDateLabel(sourceState.data.generatedAt, "시각 정보 없음")}`,
        ].join(" · ")
      : [
          `집계 ${formatDateLabel(sourceState.data.generatedAt, "시각 정보 없음")}`,
          sourceState.data.excludedResponseCount > 0
            ? `제외 ${sourceState.data.excludedResponseCount}건`
            : "",
        ].filter(Boolean).join(" · ");

    switch (mode) {
      case "class":
        return `${actionHint} · 정서와 목표 상태 확인 · ${suffix}`;
      case "lesson":
        return `${actionHint} · 보충 지도와 복습/수행 상태를 먼저 확인 · ${suffix}`;
      case "star":
        return `${actionHint} · 공개 점수와 숨김 조정 상태를 읽기 전용으로 확인 · ${suffix}`;
    }
  }

  private getTeacherSourceDescription(): string {
    return "문제가 생기면 이 섹션에서 집계 파일 경로, 학생 명단 연결, 집계 시각, 원본 시트 이름, 학생 사진 매핑 상태를 확인합니다.";
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
      return "학급 집계가 연결되면 정서 상태, 목표 달성, 도움 필요 학생, 칭찬 후보와 미제출 학생을 여기서 확인합니다.";
    }

    const missingSnapshot = this.buildMissingSubmissionSnapshot(
      "학급용 폼",
      sourceState.data.classroom,
      sourceState.data.studentResponses.map((item) => item.student),
    );

    return [
      sourceState.data.periodLabel,
      `응답 ${sourceState.data.responseCount}건`,
      missingSnapshot.rosterStatus === "loaded"
        ? `미제출 ${missingSnapshot.missingStudents.length}명`
        : "",
      sourceState.data.supportStudents.length > 0
        ? `주의 ${sourceState.data.supportStudents.length}명`
        : "주의 학생 없음",
      sourceState.data.praiseCandidates.length > 0
        ? `칭찬 후보 ${sourceState.data.praiseCandidates.length}명`
        : "",
      sourceState.data.excludedResponseCount > 0
        ? `제외 ${sourceState.data.excludedResponseCount}건`
        : "",
    ].filter(Boolean).join(" · ");
  }

  private buildLessonSectionDescription(
    sourceState: AggregateSourceState<LessonSummaryAggregate> | null,
  ): string {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return "수업 집계가 연결되면 재설명 필요한 개념, 정오답, 복습/수행 상태와 미제출 학생을 여기서 확인합니다.";
    }

    const explorer = this.getLessonExplorerState(sourceState.data);
    const { selectedSubject, selectedGroup } = explorer;
    if (!selectedGroup) {
      return [
        selectedSubject.subject || sourceState.data.subject,
        this.buildLessonScopeDescription(explorer, {
          includeSubject: false,
          includeSubjectCount: false,
          includeCurrentGroup: false,
        }),
        "조건에 맞는 수업 그룹 없음",
      ].filter(Boolean).join(" · ");
    }

    const followUpCount = this.getAggregateCountByLabel(selectedGroup.assignmentSummary, "부분 완료")
      + this.getAggregateCountByLabel(selectedGroup.assignmentSummary, "미완료");
    const missingSnapshot = this.buildMissingSubmissionSnapshot(
      "현재 선택한 수업",
      selectedGroup.classroom || sourceState.data.classroom,
      selectedGroup.studentResponses.map((item) => item.student),
    );

    return [
      selectedGroup.label,
      this.buildLessonScopeDescription(explorer, {
        includeSubject: false,
        includeCurrentGroup: false,
      }),
      `응답 ${selectedGroup.responseCount}건`,
      missingSnapshot.rosterStatus === "loaded"
        ? `미제출 ${missingSnapshot.missingStudents.length}명`
        : "",
      selectedGroup.supportStudents.length > 0
        ? `보충 지도 ${selectedGroup.supportStudents.length}명`
        : "보충 지도 대상 없음",
      followUpCount > 0 ? `후속 확인 ${followUpCount}명` : "",
      selectedGroup.excludedResponseCount > 0
        ? `제외 ${selectedGroup.excludedResponseCount}건`
        : "",
    ].filter(Boolean).join(" · ");
  }

  private buildStarSectionDescription(
    sourceState: AggregateSourceState<StarModeLedger> | null,
  ): string {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return "별점 집계가 연결되면 읽기 전용 요약, 최근 이벤트, 공개/비공개 구분을 여기서 확인합니다.";
    }

    const enabledRules = getEnabledStarRules(sourceState.data.rules);
    const teacherOnlyRules = enabledRules.filter((rule) => rule.visibility === "teacher");
    const activeRuleSummaryCount = sourceState.data.ruleSummary
      .filter((item) => item.eventCount > 0)
      .length;

    return [
      sourceState.data.periodLabel,
      `규칙 ${enabledRules.length}개`,
      activeRuleSummaryCount > 0 ? `발생 규칙 ${activeRuleSummaryCount}개` : "",
      `학생 ${sourceState.data.totals.length}명`,
      teacherOnlyRules.length > 0
        ? `선생님 확인 ${teacherOnlyRules.length}개`
        : "",
      `자동 ${getAutomaticStarEventCount(sourceState.data.sourceSummary)}건`,
      sourceState.data.sourceSummary.manual > 0
        ? `수동/일괄 ${sourceState.data.sourceSummary.manual}건`
        : "",
    ].filter(Boolean).join(" · ");
  }

  private buildResponseCountDescription(
    summary: Pick<ClassSummaryAggregate | LessonSummaryAggregate | LessonGroupSummary, "periodLabel" | "excludedResponseCount">,
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
    const timeLabel = formatDateLabel(event.occurredAt, "시각 정보 없음");

    return {
      title: `${rule?.label ?? "규칙 정보 없음"} · ${formatStudentLabel(event.student)}`,
      meta: [
        formatSignedPoints(event.delta),
        getStarVisibilityLabel(event.visibility),
        sourceLabel,
      ].join(" · "),
      description: [
        getStarCategoryLabel(event.category),
        timeLabel,
        event.actor ? `선생님 ${event.actor}` : "",
        event.batchId ? `batch ${event.batchId}` : "",
        event.note || rule?.description || "설명 없음",
      ].filter(Boolean).join(" / "),
      tone: event.delta < 0 ? "warning" : "positive",
      student: event.student,
    };
  }

  private buildStarTotalRow(total: StarStudentTotal): DetailRow {
    return {
      title: formatStudentLabel(total.student),
      meta: `총 ${formatSignedPoints(total.total)}`,
      description: [
        `학생 공개 ${formatSignedPoints(total.visibleTotal)}`,
        `선생님 조정 ${formatSignedPoints(total.hiddenAdjustmentTotal)}`,
        `이벤트 ${total.eventCount}건`,
      ].join(" / "),
      tone: total.hiddenAdjustmentTotal < 0 ? "warning" : "positive",
      student: total.student,
    };
  }

  private getAggregateEmptyStateTitle(
    sourceState: AggregateSourceState<
      ClassSummaryAggregate | LessonSummaryAggregate | StarModeLedger
    > | null,
  ): string {
    if (!sourceState) {
      return "집계 연결을 확인해 주세요";
    }

    const label = this.getTeacherAggregateLabel(sourceState.kind);
    switch (sourceState.status) {
      case "missing":
        return `${label}이 아직 연결되지 않았습니다`;
      case "invalid":
        return `${label} 형식을 다시 확인해 주세요`;
      case "error":
        return `${label}을 읽는 중 문제가 생겼습니다`;
      default:
        return `${label}을 표시할 수 없습니다`;
    }
  }

  private getAggregateEmptyStateMessage(
    emptyMessage: string,
    sourceState: AggregateSourceState<
      ClassSummaryAggregate | LessonSummaryAggregate | StarModeLedger
    > | null,
  ): string {
    if (!sourceState) {
      return emptyMessage;
    }

    if (sourceState.status === "invalid") {
      return "파일은 찾았지만 classpage가 읽는 형식과 맞지 않습니다. 집계 파일을 다시 생성하거나 저장 내용을 다시 확인해 주세요.";
    }

    if (sourceState.status === "error") {
      return "집계 파일을 읽는 동안 문제가 생겼습니다. 최근 동기화와 파일 내용을 다시 확인해 주세요.";
    }

    return emptyMessage;
  }

  private getAggregateEmptyStateTips(
    sourceState: AggregateSourceState<
      ClassSummaryAggregate | LessonSummaryAggregate | StarModeLedger
    > | null,
  ): string[] {
    if (!sourceState) {
      return [];
    }

    const generationTip = sourceState.kind === "class"
      ? "학급 집계를 한 번 생성한 뒤 class-summary.json 경로를 확인해 주세요."
      : sourceState.kind === "lesson"
        ? "수업 집계를 한 번 생성한 뒤 lesson-summary.json 경로를 확인해 주세요."
        : "별점 집계를 한 번 생성한 뒤 star-ledger.json 경로를 확인해 주세요.";

    if (sourceState.status === "missing") {
      return [
        "처음 연결 중이라면 빈 화면이 정상입니다.",
        generationTip,
      ];
    }

    if (sourceState.status === "invalid") {
      return [
        "집계 파일 전체를 그대로 저장했는지 확인해 주세요.",
        "예전 형식 파일이라면 최신 집계 결과로 다시 바꿔 주세요.",
      ];
    }

    if (sourceState.status === "error") {
      return [
        "볼트 안 파일 경로와 동기화 상태를 다시 확인해 주세요.",
        "파일을 다시 저장하거나 집계를 다시 생성하면 해결되는 경우가 많습니다.",
      ];
    }

    return [];
  }

  private getSourceStatusLabel(
    status: AggregateSourceState<unknown>["status"],
  ): string {
    switch (status) {
      case "loaded":
        return "연결됨";
      case "missing":
        return "연결 필요";
      case "invalid":
        return "형식 확인";
      default:
        return "오류";
    }
  }

  private getStudentPhotoSourceStatusLabel(
    status: TeacherStudentPhotoSourceState["status"],
  ): string {
    switch (status) {
      case "disabled":
        return "선택 안 함";
      case "loaded":
        return "연결됨";
      case "missing":
        return "연결 필요";
      case "invalid":
        return "형식 확인";
      default:
        return "오류";
    }
  }

  private getStudentRosterSourceStatusLabel(
    status: TeacherStudentRosterSourceState["status"],
  ): string {
    switch (status) {
      case "disabled":
        return "선택 안 함";
      case "loaded":
        return "연결됨";
      case "missing":
        return "연결 필요";
      case "invalid":
        return "형식 확인";
      default:
        return "오류";
    }
  }
}

class ClassPageSettingTab extends PluginSettingTab {
  private rosterImportCsvText = "";
  private rosterImportTargetPath = "";
  private rosterImportDefaultClassroom = "";
  private rosterImportResult: StudentRosterImportResult | null = null;

  constructor(
    app: App,
    private readonly plugin: ClassPagePlugin,
  ) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    const { settings } = this.plugin;
    if (!this.rosterImportTargetPath.trim()) {
      this.rosterImportTargetPath = settings.teacherPage.roster.rosterJsonPath.trim()
        || "classpage-data/student-roster.json";
    }

    containerEl.empty();
    containerEl.createEl("h2", { text: "classpage 설정" });
    containerEl.createEl("p", {
      text: "학생용 화면은 정적 문구와 Google Form 링크를, 선생님 화면은 집계 JSON과 선택 명단/사진 JSON 경로를 읽습니다. 학생 응답 원본이나 집계 로직 자체는 이 플러그인에서 수정하지 않습니다.",
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
      "선생님 페이지",
      "선생님 화면은 원본 응답이 아니라 집계 결과와 선택 명단/사진 파일을 읽습니다. 아래 값은 표시 레이어 설명, 집계 경로, 학생 명단 경로, 학생 사진 매핑 경로만 바꿉니다.",
    );

    this.addTextSetting(
      "제목",
      "선생님 페이지 상단 제목입니다.",
      settings.teacherPage.title,
      async (value) => {
        settings.teacherPage.title = value.trim() || DEFAULT_SETTINGS.teacherPage.title;
        await this.plugin.saveSettings();
      },
    );

    this.addTextSetting(
      "설명",
      "선생님 페이지의 역할을 설명하는 문구입니다.",
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
      "선생님용 별점모드 섹션 제목입니다.",
      settings.teacherPage.starLedgerTitle,
      async (value) => {
        settings.teacherPage.starLedgerTitle = value.trim() || DEFAULT_SETTINGS.teacherPage.starLedgerTitle;
        await this.plugin.saveSettings();
      },
    );

    this.addSettingsSection(
      "선생님 화면 보기 기준",
      "어떤 학생을 먼저 보고 싶은지 정합니다. 먼저 프리셋을 고르고, 필요하면 아래 항목을 조금씩 조정하면 됩니다.",
    );

    this.containerEl.createEl("strong", {
      text: "현재 적용 요약",
    });
    this.containerEl.createEl("p", {
      text: buildTeacherDashboardPreferenceSummaryLines(
        settings.teacherPage.dashboardPreferences,
        {
          rosterStatus: settings.teacherPage.roster.rosterJsonPath.trim() ? "loaded" : "disabled",
        },
      ).join(" "),
    });
    this.containerEl.createEl("p", {
      text: "프리셋 안내: 기본형은 균형 있게, 위험 조기 발견형은 위험/후속지도 우선, 칭찬 강화형은 칭찬/격려 우선, 미제출 집중형은 미제출 확인 우선으로 보여줍니다.",
    });

    this.addDropdownSetting(
      "프리셋",
      "선생님 화면의 기본 시선 흐름을 한 번에 고릅니다. 프리셋을 바꾸면 아래 추천값도 함께 바뀝니다.",
      settings.teacherPage.dashboardPreferences.preset,
      [
        { value: "default", label: "기본형" },
        { value: "risk-focus", label: "위험 조기 발견형" },
        { value: "praise-focus", label: "칭찬 강화형" },
        { value: "submission-focus", label: "미제출 집중형" },
      ],
      async (value) => {
        settings.teacherPage.dashboardPreferences = {
          ...getTeacherDashboardPresetDefaults(value),
        };
        await this.plugin.saveSettings();
        this.display();
      },
    );

    this.addDropdownSetting(
      "학생 목록 기본 정렬",
      "번호순은 출석부처럼 찾기 쉽고, 위험/칭찬 우선은 해당 학생이 먼저 보입니다.",
      settings.teacherPage.dashboardPreferences.defaultStudentSort,
      [
        { value: "number", label: "번호순" },
        { value: "risk", label: "위험 우선" },
        { value: "praise", label: "칭찬 우선" },
        { value: "recent", label: "최근 반영 순" },
      ],
      async (value) => {
        settings.teacherPage.dashboardPreferences.defaultStudentSort = value;
        await this.plugin.saveSettings();
        this.display();
      },
    );

    this.addToggleSetting(
      "위험 학생 강조",
      "overview와 학급/수업 화면에서 도움이 필요한 학생과 후속지도가 필요한 학생을 더 앞쪽에서 보이게 합니다.",
      settings.teacherPage.dashboardPreferences.highlightAtRiskStudents,
      async (value) => {
        settings.teacherPage.dashboardPreferences.highlightAtRiskStudents = value;
        await this.plugin.saveSettings();
        this.display();
      },
    );

    this.addToggleSetting(
      "칭찬/격려 후보 강조",
      "overview와 학급 화면에서 칭찬하거나 격려할 학생을 더 눈에 띄게 보여줍니다.",
      settings.teacherPage.dashboardPreferences.highlightPraiseCandidates,
      async (value) => {
        settings.teacherPage.dashboardPreferences.highlightPraiseCandidates = value;
        await this.plugin.saveSettings();
        this.display();
      },
    );

    this.addToggleSetting(
      "미제출 학생 강조",
      "overview와 학급/수업 화면에서 아직 제출하지 않은 학생을 더 먼저 확인하기 쉽게 보여줍니다.",
      settings.teacherPage.dashboardPreferences.highlightMissingSubmissions,
      async (value) => {
        settings.teacherPage.dashboardPreferences.highlightMissingSubmissions = value;
        await this.plugin.saveSettings();
        this.display();
      },
    );

    this.addToggleSetting(
      "overview에서 미제출 먼저 보기",
      "첫 화면 카드 순서에서 미제출 학생 카드를 더 앞쪽에 둡니다.",
      settings.teacherPage.dashboardPreferences.prioritizeMissingSubmissionsInOverview,
      async (value) => {
        settings.teacherPage.dashboardPreferences.prioritizeMissingSubmissionsInOverview = value;
        await this.plugin.saveSettings();
        this.display();
      },
    );

    this.addToggleSetting(
      "overview에서 수업 후속지도 먼저 보기",
      "첫 화면 카드 순서에서 수업 후속지도와 바로 볼 학생을 더 앞쪽에 둡니다.",
      settings.teacherPage.dashboardPreferences.prioritizeLessonFollowUpInOverview,
      async (value) => {
        settings.teacherPage.dashboardPreferences.prioritizeLessonFollowUpInOverview = value;
        await this.plugin.saveSettings();
        this.display();
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
      "별점 집계 JSON 파일의 볼트 내부 경로입니다.",
      settings.teacherPage.sources.starLedgerPath,
      async (value) => {
        settings.teacherPage.sources.starLedgerPath =
          value.trim() || DEFAULT_SETTINGS.teacherPage.sources.starLedgerPath;
        await this.plugin.saveSettings();
      },
      "classpage-data/star-ledger.json",
    );

    this.addSettingsSection(
      "학생 명단 JSON (선택)",
      "미제출 학생을 보려면 학생 명단 JSON을 연결합니다. 이 파일이 없으면 기존 학급/수업/별점 화면은 그대로 유지되고, 미제출 학생만 계산하지 않습니다.",
    );

    this.addTextSetting(
      "학생 명단 JSON 경로",
      "볼트 내부 경로입니다. 비워 두면 미제출 학생 비교를 끕니다.",
      settings.teacherPage.roster.rosterJsonPath,
      async (value) => {
        settings.teacherPage.roster.rosterJsonPath = value.trim();
        if (value.trim()) {
          this.rosterImportTargetPath = value.trim();
        }
        await this.plugin.saveSettings();
      },
      "classpage-data/student-roster.json",
    );

    this.renderRosterImportHelper(settings.teacherPage);

    this.addSettingsSection(
      "학생 사진 매핑 (선택)",
      "선생님 화면에서만 학생 사진을 붙이고 싶을 때 사용합니다. 집계 JSON은 그대로 두고, 별도 JSON 파일에서 classroom|number|name -> 이미지 경로를 연결합니다.",
    );

    this.addTextSetting(
      "학생 사진 매핑 JSON 경로",
      "볼트 내부 경로입니다. 비워 두면 학생 사진 대신 이니셜 아바타만 표시합니다.",
      settings.teacherPage.studentPhotos.mappingJsonPath,
      async (value) => {
        settings.teacherPage.studentPhotos.mappingJsonPath = value.trim();
        await this.plugin.saveSettings();
      },
      "classpage-data/student-photo-map.json",
    );
  }

  private renderRosterImportHelper(settings: ClassPageSettings["teacherPage"]): void {
    this.addSettingsSection(
      "학생 명단 가져오기 도우미",
      "JSON을 직접 만들기 어렵다면 CSV를 붙여넣거나 불러와서 student-roster.json으로 저장할 수 있습니다. 저장이 끝나면 학생 명단 JSON 경로도 함께 맞춰집니다. 이번 버전은 CSV를 우선 지원합니다.",
    );

    this.containerEl.createEl("p", {
      text: "필수 컬럼: classroom/class/반/학급, number/no/번호, name/이름/학생명",
    });
    this.containerEl.createEl("p", {
      text: "선택 컬럼: studentId/학번, note/비고/메모. 엑셀이나 구글 시트에서 표를 복사해 붙여넣어도 기본적으로 읽을 수 있습니다.",
    });
    this.containerEl.createEl("pre", {
      text: [
        "classroom,number,name,studentId,note",
        "3-2,01,김민서,2026-3-2-01,학급 대표",
        "3-2,02,박준호,2026-3-2-02,",
      ].join("\n"),
    });

    const fileInput = this.containerEl.createEl("input", {
      attr: {
        type: "file",
        accept: ".csv,text/csv",
      },
    });
    fileInput.style.display = "none";
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      if (!file) {
        return;
      }

      try {
        this.rosterImportCsvText = await file.text();
        this.rosterImportResult = null;
        new Notice(`CSV 파일을 불러왔습니다: ${file.name}`);
        this.display();
      } catch (error) {
        new Notice(
          error instanceof Error
            ? `CSV 파일을 읽지 못했습니다: ${error.message}`
            : "CSV 파일을 읽지 못했습니다.",
        );
      } finally {
        fileInput.value = "";
      }
    });

    new Setting(this.containerEl)
      .setName("CSV 파일 불러오기")
      .setDesc("컴퓨터에 있는 CSV 파일을 바로 읽습니다. XLSX는 추후 지원 예정입니다.")
      .addButton((button) => {
        button.setButtonText("CSV 파일 선택");
        button.onClick(() => fileInput.click());
      })
      .addButton((button) => {
        button.setButtonText("샘플 넣기");
        button.onClick(() => {
          this.rosterImportCsvText = [
            "classroom,number,name,studentId,note",
            "3-2,01,김민서,2026-3-2-01,학급 대표",
            "3-2,02,박준호,2026-3-2-02,",
            "3-2,15,이서윤,2026-3-2-15,전학 후 첫 주",
          ].join("\n");
          this.rosterImportResult = null;
          this.display();
        });
      });

    new Setting(this.containerEl)
      .setName("CSV 내용 붙여넣기")
      .setDesc("CSV 파일 내용을 그대로 붙여넣거나, 엑셀/구글 시트에서 학생 표를 복사해 붙여넣습니다.")
      .addTextArea((text) => {
        text.setValue(this.rosterImportCsvText);
        text.setPlaceholder("classroom,number,name\n3-2,01,김민서");
        text.inputEl.rows = 10;
        text.inputEl.cols = 60;
        text.onChange((value) => {
          this.rosterImportCsvText = value;
          this.rosterImportResult = null;
        });
      });

    new Setting(this.containerEl)
      .setName("기본 저장 경로")
      .setDesc("비워 두면 기존 명단 경로 또는 classpage-data/student-roster.json 에 저장합니다.")
      .addText((text) => {
        text.setValue(this.rosterImportTargetPath);
        text.setPlaceholder("classpage-data/student-roster.json");
        text.onChange((value) => {
          this.rosterImportTargetPath = value.trim();
        });
      });

    new Setting(this.containerEl)
      .setName("기본 학급 (선택)")
      .setDesc("CSV에 반 컬럼이 없을 때만 사용합니다. 예: 3-2")
      .addText((text) => {
        text.setValue(this.rosterImportDefaultClassroom);
        text.setPlaceholder("예: 3-2");
        text.onChange((value) => {
          this.rosterImportDefaultClassroom = value;
          this.rosterImportResult = null;
        });
      });

    new Setting(this.containerEl)
      .setName("가져오기 확인")
      .setDesc("먼저 미리보기로 읽기 결과를 확인한 뒤 저장하면 안전합니다.")
      .addButton((button) => {
        button.setButtonText("가져오기 미리보기");
        button.onClick(() => {
          this.rosterImportResult = this.analyzeRosterImport();
          this.display();
        });
      })
      .addButton((button) => {
        button.setButtonText("명단 JSON 저장");
        button.setCta();
        button.setDisabled(!(this.rosterImportResult?.ok));
        button.onClick(async () => {
          await this.saveImportedRoster(settings);
        });
      });

    if (!this.rosterImportResult) {
      return;
    }

    const resultCard = this.containerEl.createDiv();
    resultCard.createEl("h4", {
      text: this.rosterImportResult.ok ? "가져오기 결과" : "가져오기 확인 필요",
    });

    const messageList = resultCard.createEl("ul");
    const messages = this.rosterImportResult.summary.messages.length > 0
      ? this.rosterImportResult.summary.messages
      : [this.rosterImportResult.ok ? "읽은 결과를 요약할 내용이 없습니다." : this.rosterImportResult.message];

    for (const message of messages) {
      messageList.createEl("li", { text: message });
    }

    const detectedColumnText = [
      this.rosterImportResult.summary.detectedColumns.classroom
        ? `반 -> ${this.rosterImportResult.summary.detectedColumns.classroom}`
        : this.rosterImportDefaultClassroom.trim()
          ? `반 -> 기본 학급 ${this.rosterImportDefaultClassroom.trim()}`
          : "",
      this.rosterImportResult.summary.detectedColumns.number
        ? `번호 -> ${this.rosterImportResult.summary.detectedColumns.number}`
        : "",
      this.rosterImportResult.summary.detectedColumns.name
        ? `이름 -> ${this.rosterImportResult.summary.detectedColumns.name}`
        : "",
      this.rosterImportResult.summary.detectedColumns.studentId
        ? `학생 ID -> ${this.rosterImportResult.summary.detectedColumns.studentId}`
        : "",
      this.rosterImportResult.summary.detectedColumns.note
        ? `메모 -> ${this.rosterImportResult.summary.detectedColumns.note}`
        : "",
    ].filter(Boolean);

    if (detectedColumnText.length > 0) {
      resultCard.createEl("p", {
        text: `읽은 컬럼: ${detectedColumnText.join(" / ")}`,
      });
    }

    if (this.rosterImportResult.ok && this.rosterImportResult.summary.previewStudents.length > 0) {
      const previewTitle = resultCard.createEl("p", {
        text: "미리보기 학생",
      });
      previewTitle.addClass("setting-item-description");

      const previewList = resultCard.createEl("ul");
      for (const student of this.rosterImportResult.summary.previewStudents) {
        previewList.createEl("li", {
          text: formatStudentLabel(student),
        });
      }

      resultCard.createEl("p", {
        text: `저장 위치: ${this.getRosterImportTargetPath(settings)}`,
      });
    }
  }

  private analyzeRosterImport(): StudentRosterImportResult {
    return importStudentRosterFromDelimitedText(this.rosterImportCsvText, {
      defaultClassroom: this.rosterImportDefaultClassroom.trim(),
      sourceLabel: "classpage CSV 가져오기",
    });
  }

  private async saveImportedRoster(settings: ClassPageSettings["teacherPage"]): Promise<void> {
    const result = this.analyzeRosterImport();
    this.rosterImportResult = result;

    if (!result.ok) {
      new Notice(result.message);
      this.display();
      return;
    }

    const targetPath = this.getRosterImportTargetPath(settings);
    if (!targetPath) {
      new Notice("저장 경로를 먼저 확인해 주세요.");
      this.display();
      return;
    }

    try {
      await this.ensureVaultFolder(targetPath);
      const roster = {
        ...result.roster,
        generatedAt: new Date().toISOString(),
      };
      const raw = `${JSON.stringify(roster, null, 2)}\n`;
      const existing = this.app.vault.getAbstractFileByPath(targetPath);

      if (existing instanceof TFile) {
        await this.app.vault.modify(existing, raw);
      } else if (existing) {
        throw new Error("저장 경로가 파일이 아니라 폴더로 잡혀 있습니다.");
      } else {
        await this.app.vault.create(targetPath, raw);
      }

      const pathChanged = settings.roster.rosterJsonPath !== targetPath;
      if (pathChanged) {
        settings.roster.rosterJsonPath = targetPath;
        await this.plugin.saveSettings();
      } else {
        this.plugin.refreshOpenViews();
      }

      this.rosterImportTargetPath = targetPath;
      this.rosterImportResult = {
        ok: true,
        roster,
        summary: {
          ...result.summary,
          messages: [
            ...result.summary.messages,
            `명단 JSON을 ${targetPath} 에 저장했습니다.`,
            pathChanged
              ? "학생 명단 JSON 경로도 이 파일로 함께 맞췄습니다."
              : "",
            "이제 선생님 화면의 미제출 학생 비교에 바로 사용됩니다.",
          ].filter(Boolean),
        },
      };
      new Notice(
        pathChanged
          ? `학생 ${roster.students.length}명 명단을 저장했고, 학생 명단 JSON 경로도 함께 맞췄습니다.`
          : `학생 ${roster.students.length}명 명단을 저장했습니다. 이제 미제출 학생 비교에 사용됩니다.`,
      );
      this.display();
    } catch (error) {
      new Notice(
        error instanceof Error
          ? `명단 JSON 저장에 실패했습니다: ${error.message}`
          : "명단 JSON 저장에 실패했습니다.",
      );
      this.display();
    }
  }

  private getRosterImportTargetPath(settings: ClassPageSettings["teacherPage"]): string {
    return normalizePath(
      (this.rosterImportTargetPath.trim()
        || settings.roster.rosterJsonPath.trim()
        || "classpage-data/student-roster.json")
        .replace(/^\/+/, ""),
    );
  }

  private async ensureVaultFolder(path: string): Promise<void> {
    const parentPath = getParentPath(path);
    if (!parentPath) {
      return;
    }

    const parts = parentPath.split("/").filter(Boolean);
    let currentPath = "";
    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const existing = this.app.vault.getAbstractFileByPath(currentPath);
      if (!existing) {
        await this.app.vault.createFolder(currentPath);
      }
    }
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

  private addDropdownSetting<T extends string>(
    name: string,
    desc: string,
    value: T,
    options: Array<{ value: T; label: string }>,
    onChange: (value: T) => Promise<void>,
  ): void {
    new Setting(this.containerEl)
      .setName(name)
      .setDesc(desc)
      .addDropdown((dropdown) => {
        for (const option of options) {
          dropdown.addOption(option.value, option.label);
        }
        dropdown.setValue(value);
        dropdown.onChange(async (nextValue) => {
          await onChange(nextValue as T);
        });
      });
  }

  private addToggleSetting(
    name: string,
    desc: string,
    value: boolean,
    onChange: (value: boolean) => Promise<void>,
  ): void {
    new Setting(this.containerEl)
      .setName(name)
      .setDesc(desc)
      .addToggle((toggle) => {
        toggle.setValue(value);
        toggle.onChange(onChange);
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

function getParentPath(path: string): string {
  const normalized = normalizePath(path.trim());
  if (!normalized || !normalized.includes("/")) {
    return "";
  }

  return normalized.slice(0, normalized.lastIndexOf("/"));
}

function uniqueTextLines(lines: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const line of lines) {
    const normalized = line.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

function joinUniqueText(
  values: readonly string[],
  separator: string,
): string {
  return uniqueTextLines(values).join(separator);
}

function compactTextLines(lines: readonly string[]): string[] {
  return lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function buildStructuredText(
  lines: readonly string[],
  fallback: string,
): { text: string; lines: string[] } {
  const normalized = compactTextLines(lines);
  if (normalized.length === 0) {
    return { text: fallback, lines: fallback ? [fallback] : [] };
  }

  return {
    text: normalized.join(" / "),
    lines: normalized,
  };
}

function formatDateLabel(
  value: string,
  fallback = "집계 시각 정보 없음",
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
  const classroomLabel = formatClassroomLabel(student.classroom);
  const numberLabel = formatStudentNumberLabel(student.number);
  const nameLabel = student.name.trim();

  const head = [classroomLabel, numberLabel].filter(Boolean).join(" ").trim();
  const label = [head, nameLabel].filter(Boolean).join(" ").trim();
  return label || "학생 정보 없음";
}

function formatClassroomLabel(classroom: string): string {
  const trimmed = classroom.trim();
  if (!trimmed) {
    return "";
  }

  const normalized = trimmed.replace(/\s+/g, " ");
  const dashMatch = normalized.match(/^(\d+)\s*[-/]\s*(\d+)$/);
  if (dashMatch) {
    return `${dashMatch[1]}학년 ${dashMatch[2]}반`;
  }

  const gradeClassMatch = normalized.match(/^(\d+)\s*학년\s*(\d+)\s*반$/);
  if (gradeClassMatch) {
    return `${gradeClassMatch[1]}학년 ${gradeClassMatch[2]}반`;
  }

  const classOnlyMatch = normalized.match(/^(\d+)\s*반$/);
  if (classOnlyMatch) {
    return `${classOnlyMatch[1]}반`;
  }

  if (/^\d+$/.test(normalized)) {
    return `${normalized}반`;
  }

  return normalized;
}

function formatStudentNumberLabel(number: string): string {
  const trimmed = number.trim();
  if (!trimmed) {
    return "";
  }

  const numeric = trimmed.match(/^0*(\d+)$/);
  if (numeric) {
    return `${numeric[1]}번`;
  }

  return trimmed.endsWith("번") ? trimmed : `${trimmed}번`;
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
  return visibility === "teacher" ? "선생님 확인 전용" : "학생 공개";
}

function getStarSourceLabel(source: StarEvent["source"]): string {
  switch (source) {
    case "class-form":
      return "학급용 폼";
    case "lesson-form":
      return "수업용 폼";
    case "manual":
      return "수동 조정/일괄 부여";
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
    return "입력 경로 없음";
  }

  return `입력 ${labels.join(", ")}`;
}

function getStarAutoCriteriaSummary(criteria: StarAutoCriteria | null): string {
  if (!criteria) {
    return "";
  }

  const parts: string[] = [];
  if (criteria.assignmentStatusIn.length > 0) {
    parts.push(`복습/수행 ${criteria.assignmentStatusIn.join("/")}`);
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

function getAggregateDisplayClassroom(
  data: ClassSummaryAggregate | LessonSummaryAggregate | LessonSubjectSummary | LessonGroupSummary | StarModeLedger,
): string {
  if ("type" in data && data.type === "star-ledger") {
    return formatClassroomLabel(getStarLedgerClassroom(data));
  }

  return formatClassroomLabel(data.classroom);
}

function getStarLedgerClassroom(ledger: StarModeLedger): string {
  if (ledger.classroom?.trim()) {
    return ledger.classroom.trim();
  }

  const classrooms = [
    ...ledger.totals.map((total) => total.student.classroom.trim()),
    ...ledger.recentEvents.map((event) => event.student.classroom.trim()),
  ].filter(Boolean);

  if (classrooms.length === 0) {
    return "";
  }

  const uniqueClassrooms = classrooms
    .filter((value, index, array) => array.indexOf(value) === index);

  return uniqueClassrooms.length === 1 ? uniqueClassrooms[0] : "여러 학급";
}

function sortStarRulesForDisplay(rules: StarRuleSettings[]): StarRuleSettings[] {
  return rules.slice().sort((left, right) => {
    const manualDiff = Number(right.sources.includes("manual"))
      - Number(left.sources.includes("manual"));
    if (manualDiff !== 0) {
      return manualDiff;
    }

    const visibilityDiff = Number(left.visibility === "teacher")
      - Number(right.visibility === "teacher");
    if (visibilityDiff !== 0) {
      return visibilityDiff;
    }

    if (right.delta !== left.delta) {
      return right.delta - left.delta;
    }

    return left.label.localeCompare(right.label, "ko-KR");
  });
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

function sortStarTotalsByHiddenAdjustment(totals: StarStudentTotal[]): StarStudentTotal[] {
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

function normalizeLookupText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseLeadingNumber(value: string): number {
  const match = value.match(/^\d+/);
  return match ? Number(match[0]) : 0;
}

function getTeacherDashboardPresetLabel(
  preset: TeacherDashboardPreset,
): string {
  switch (preset) {
    case "risk-focus":
      return "위험 조기 발견형";
    case "praise-focus":
      return "칭찬 강화형";
    case "submission-focus":
      return "미제출 집중형";
    default:
      return "기본형";
  }
}

function getTeacherDashboardStudentSortLabel(
  sort: TeacherDashboardStudentSort,
): string {
  switch (sort) {
    case "risk":
      return "위험 우선";
    case "praise":
      return "칭찬 우선";
    case "recent":
      return "최근 반영 순";
    default:
      return "번호순";
  }
}

function buildTeacherDashboardPreferenceSummaryLines(
  preferences: TeacherDashboardPreferences,
  options: {
    rosterStatus?: TeacherStudentRosterSourceState["status"];
  } = {},
): string[] {
  const isMissingPriority =
    preferences.preset === "submission-focus"
    || preferences.prioritizeMissingSubmissionsInOverview
    || (preferences.highlightMissingSubmissions && !preferences.highlightAtRiskStudents);
  const isRiskPriority =
    preferences.preset === "risk-focus"
    || preferences.prioritizeLessonFollowUpInOverview
    || (preferences.highlightAtRiskStudents && !preferences.highlightPraiseCandidates);
  const isPraisePriority =
    preferences.preset === "praise-focus"
    || (preferences.highlightPraiseCandidates && !preferences.highlightAtRiskStudents);
  const lines = [
    `현재는 ${getTeacherDashboardPresetLabel(preferences.preset)}으로 보고 있습니다.`,
    isMissingPriority
      ? "아직 제출하지 않은 학생을 먼저 확인합니다."
      : isRiskPriority
        ? "도움이 필요한 학생과 수업 후속지도를 먼저 살핍니다."
        : isPraisePriority
          ? "칭찬/격려할 학생을 더 눈에 띄게 보여줍니다."
          : "필요한 카드들을 균형 있게 읽습니다.",
    `학생 목록은 ${getTeacherDashboardStudentSortLabel(preferences.defaultStudentSort)}으로 정렬합니다.`,
  ];

  if (
    isMissingPriority
    && options.rosterStatus
    && options.rosterStatus !== "loaded"
  ) {
    lines.push("학생 명단 JSON을 연결하면 미제출 강조가 함께 동작합니다.");
  }

  return uniqueTextLines(lines);
}

function moveArrayItemToFront<T>(items: T[], target: T): void {
  const index = items.indexOf(target);
  if (index <= 0) {
    return;
  }

  items.splice(index, 1);
  items.unshift(target);
}

function moveArrayItemToEnd<T>(items: T[], target: T): void {
  const index = items.indexOf(target);
  if (index === -1 || index === items.length - 1) {
    return;
  }

  items.splice(index, 1);
  items.push(target);
}

function moveArrayItemBefore<T>(items: T[], target: T, before: T): void {
  const targetIndex = items.indexOf(target);
  const beforeIndex = items.indexOf(before);
  if (targetIndex === -1 || beforeIndex === -1 || targetIndex < beforeIndex) {
    return;
  }

  items.splice(targetIndex, 1);
  const nextBeforeIndex = items.indexOf(before);
  items.splice(nextBeforeIndex, 0, target);
}
