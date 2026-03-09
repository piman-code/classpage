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
  ClassSummaryAggregate,
  LessonSummaryAggregate,
  StudentPageSettings,
  TeacherPageData,
  TeacherPageSettings,
} from "./types";

const VIEW_TYPE_CLASSPAGE = "classpage-view";

type PageMode = "student" | "teacher";
type RowTone = "neutral" | "warning" | "positive";

interface DetailRow {
  title: string;
  meta: string;
  description: string;
  tone?: RowTone;
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

    this.renderTeacherPage(shell, settings.teacherPage, teacherData);
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
    this.renderBoundaryCard(
      parent,
      "학생용 페이지 구조",
      "이 화면은 classpage 설정값과 Google Form 링크만 사용합니다. 학생 응답 원본이나 집계 결과는 여기서 직접 계산하지 않습니다.",
      [
        `정적 설정: 오늘의 할 일, 공지사항, 버튼 문구`,
        `외부 입력: 학급용/수업용 Google Form 제출`,
        `수정 위치: Settings -> classpage`,
      ],
    );

    const boardSection = parent.createDiv({ cls: "classpage-section" });
    this.renderSectionHeader(
      boardSection,
      "오늘 확인할 내용",
      "학생용 화면은 운영자가 설정한 정적 문구를 그대로 보여줍니다.",
    );

    const board = boardSection.createDiv({ cls: "classpage-board" });
    this.renderListCard(board, settings.today.title, settings.today.items);
    this.renderListCard(board, settings.notices.title, settings.notices.items);

    const formsSection = parent.createDiv({ cls: "classpage-section" });
    this.renderSectionHeader(
      formsSection,
      "제출 바로가기",
      "버튼은 Google Form 원본 링크로 이동만 하고, classpage 안에서 응답을 저장하지 않습니다.",
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
    this.renderBoundaryCard(
      parent,
      "교사용 페이지 구조",
      "교사용 화면은 Google Form 원본 응답을 직접 읽지 않고, Google Sheets 또는 Apps Script가 만든 집계 JSON만 읽습니다. 이 구조로 수집, 집계, 표시 역할을 분리합니다.",
      [
        `원본 입력: Google Form / Google Sheets`,
        `집계 레이어: Apps Script 또는 외부 자동화가 JSON 생성`,
        `표시 레이어: classpage가 JSON을 읽어 요약 카드와 목록 표시`,
      ],
    );

    const sourceSection = parent.createDiv({ cls: "classpage-section" });
    this.renderSectionHeader(
      sourceSection,
      "집계 연결 상태",
      "교사용 화면에서 보이는 값은 아래 JSON 경로에 있는 집계 결과입니다. 경로만 바꾸면 표시 데이터가 함께 바뀝니다.",
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
    sourceState: AggregateSourceState<ClassSummaryAggregate | LessonSummaryAggregate> | null,
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
    this.renderMetaRow(metaList, "응답 수", `${sourceState.data.responseCount}건`);
    this.renderMetaRow(metaList, "범위", sourceState.data.periodLabel);

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
    const stats = parent.createDiv({ cls: "classpage-stat-grid" });
    this.renderStatCard(stats, "응답 수", `${summary.responseCount}`, summary.periodLabel);
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
    this.renderDetailRowsCard(
      grid,
      "정서 상태 분포",
      summary.emotionSummary.map((item) => this.buildCountRow(item)),
      "정서 분포 데이터가 없습니다.",
    );
    this.renderDetailRowsCard(
      grid,
      "목표 달성 분포",
      summary.goalSummary.map((item) => this.buildCountRow(item)),
      "목표 분포 데이터가 없습니다.",
    );
    this.renderDetailRowsCard(
      grid,
      "도움이 필요한 학생",
      summary.supportStudents.map((student) => ({
        title: formatStudentLabel(student.student),
        meta: student.mood || "상태 확인 필요",
        description: [
          student.reason ? `이유: ${student.reason}` : "",
          student.goal ? `오늘 목표: ${student.goal}` : "",
          student.yesterdayAchievement ? `어제 달성도: ${student.yesterdayAchievement}` : "",
          student.teacherNote ? `메모: ${student.teacherNote}` : "",
        ].filter(Boolean).join(" / "),
        tone: "warning",
      })),
      "현재 표시할 학생이 없습니다.",
    );
    this.renderDetailRowsCard(
      grid,
      "칭찬/격려 후보",
      summary.praiseCandidates.map((student) => ({
        title: formatStudentLabel(student.student),
        meta: student.mentionedPeer ? `언급 친구: ${student.mentionedPeer}` : "관계 기록",
        description: student.reason || "칭찬 사유 없음",
        tone: "positive",
      })),
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
    const stats = parent.createDiv({ cls: "classpage-stat-grid" });
    this.renderStatCard(stats, "응답 수", `${summary.responseCount}`, summary.periodLabel);
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
      summary.overview.assignmentCompletionLabel || "-",
      "집계 레이어 결과",
    );

    const grid = parent.createDiv({ cls: "classpage-summary-grid" });
    this.renderDetailRowsCard(
      grid,
      "어려워한 개념",
      summary.difficultConcepts.map((item) => ({
        title: item.concept,
        meta: `${item.count}명`,
        description: [item.averageUnderstanding, item.note]
          .filter(Boolean)
          .join(" / "),
        tone: "warning",
      })),
      "어려워한 개념 데이터가 없습니다.",
    );
    this.renderDetailRowsCard(
      grid,
      "과제 수행 분포",
      summary.assignmentSummary.map((item) => this.buildCountRow(item)),
      "과제 수행 집계가 없습니다.",
    );
    this.renderDetailRowsCard(
      grid,
      "보충 지도가 필요한 학생",
      summary.supportStudents.map((student) => ({
        title: formatStudentLabel(student.student),
        meta: `정답 ${student.correctCount} / 오답 ${student.incorrectCount}`,
        description: [
          student.misconception ? `헷갈린 부분: ${student.misconception}` : "",
          student.assignmentStatus ? `과제: ${student.assignmentStatus}` : "",
          student.teacherNote ? `메모: ${student.teacherNote}` : "",
        ].filter(Boolean).join(" / "),
        tone: "warning",
      })),
      "보충 지도가 필요한 학생이 없습니다.",
    );

    this.renderDetailRowsCard(
      parent,
      "학생별 정오답 및 과제 현황",
      summary.studentResults.map((result) => ({
        title: formatStudentLabel(result.student),
        meta: `정답 ${result.correctCount} / 오답 ${result.incorrectCount}`,
        description: [
          result.assignmentStatus ? `과제: ${result.assignmentStatus}` : "",
          result.followUp ? `후속 지도: ${result.followUp}` : "",
        ].filter(Boolean).join(" / "),
      })),
      "학생별 결과가 없습니다.",
      true,
    );
  }

  private renderEmptyAggregateCard(
    parent: HTMLElement,
    emptyMessage: string,
    sourceState: AggregateSourceState<ClassSummaryAggregate | LessonSummaryAggregate> | null,
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

  private buildClassSectionDescription(
    sourceState: AggregateSourceState<ClassSummaryAggregate> | null,
  ): string {
    if (!sourceState || sourceState.status !== "loaded" || !sourceState.data) {
      return "정서 상태, 목표 달성, 도움 필요 학생, 칭찬 후보를 학급용 집계 JSON에서 읽습니다.";
    }

    return [
      sourceState.data.classroom,
      sourceState.data.periodLabel,
      `${sourceState.data.responseCount}건 응답`,
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
      `${sourceState.data.responseCount}건 응답`,
    ].filter(Boolean).join(" · ");
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
      "데이터 흐름을 상단에 짧게 표시합니다.",
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

function formatDateLabel(value: string): string {
  if (!value) {
    return "집계 시각 없음";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatStudentLabel(student: { classroom: string; number: string; name: string }): string {
  return [student.classroom, student.number, student.name].filter(Boolean).join(" ");
}
