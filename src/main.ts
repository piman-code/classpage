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
import type { ClassPageFormSettings, ClassPageSettings } from "./types";

const VIEW_TYPE_CLASSPAGE = "classpage-view";

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
    this.render();
  }

  async onClose(): Promise<void> {
    this.contentEl.empty();
  }

  render(): void {
    const { contentEl } = this;
    const { settings } = this.plugin;

    contentEl.empty();
    contentEl.addClass("classpage-view");

    const shell = contentEl.createDiv({ cls: "classpage-shell" });

    const header = shell.createDiv({ cls: "classpage-card classpage-header" });
    if (settings.statusMessage) {
      const headerTop = header.createDiv({ cls: "classpage-header__top" });
      headerTop.createEl("span", {
        cls: "classpage-status",
        text: settings.statusMessage,
      });
    }
    header.createEl("h1", {
      cls: "classpage-title",
      text: settings.pageTitle,
    });
    if (settings.pageDescription) {
      header.createEl("p", {
        cls: "classpage-description",
        text: settings.pageDescription,
      });
    }

    const boardSection = shell.createDiv({ cls: "classpage-section" });
    this.renderSectionHeader(
      boardSection,
      "오늘 확인할 내용",
      "할 일과 공지를 한 번에 확인할 수 있습니다.",
    );

    const board = boardSection.createDiv({ cls: "classpage-board" });
    this.renderListCard(board, settings.today.title, settings.today.items);
    this.renderListCard(board, settings.notices.title, settings.notices.items);

    const formsSection = shell.createDiv({ cls: "classpage-section" });
    this.renderSectionHeader(
      formsSection,
      "제출 바로가기",
      "학생이 아래 버튼으로 Google Form을 바로 열 수 있습니다.",
    );

    const forms = formsSection.createDiv({ cls: "classpage-form-grid" });
    this.renderFormCard(forms, settings.forms.classForm);
    this.renderFormCard(forms, settings.forms.lessonForm);
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
    const card = parent.createDiv({ cls: "classpage-card" });
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
      text: "교실 운영 중 자주 바뀌는 문구와 Google Form 링크만 빠르게 수정할 수 있도록 정리했습니다.",
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
      "상단 안내",
      "페이지 맨 위에 보이는 제목과 소개 문구입니다.",
    );

    this.addTextSetting(
      "제목",
      "상단에 표시할 교실 페이지 제목입니다.",
      settings.pageTitle,
      async (value) => {
        settings.pageTitle = value.trim() || DEFAULT_SETTINGS.pageTitle;
        await this.plugin.saveSettings();
      },
      "예: 3학년 2반 교실 페이지",
    );

    this.addTextSetting(
      "설명",
      "상단에 짧게 보여줄 안내 문구입니다.",
      settings.pageDescription,
      async (value) => {
        settings.pageDescription = value.trim();
        await this.plugin.saveSettings();
      },
      "예: 오늘 해야 할 일과 제출 폼을 확인합니다.",
    );

    this.addTextSetting(
      "상태 문구",
      "상단 배지에 표시할 짧은 운영 안내입니다.",
      settings.statusMessage,
      async (value) => {
        settings.statusMessage = value.trim();
        await this.plugin.saveSettings();
      },
      "예: 제출은 Google Form으로 받고, 결과는 Obsidian에서 확인합니다.",
    );

    this.addSettingsSection(
      "오늘의 할 일",
      "학생이 등교 후 바로 확인할 항목입니다.",
    );

    this.addTextSetting(
      "제목",
      "첫 번째 카드의 제목입니다.",
      settings.today.title,
      async (value) => {
        settings.today.title = value.trim() || DEFAULT_SETTINGS.today.title;
        await this.plugin.saveSettings();
      },
    );

    this.addTextareaSetting(
      "내용",
      "한 줄에 한 항목씩 입력합니다.",
      settings.today.items,
      async (items) => {
        settings.today.items = items;
        await this.plugin.saveSettings();
      },
      "예: 등교 후 학급용 폼 제출",
    );

    this.addSettingsSection(
      "공지사항",
      "당일 공지나 안내만 간단하게 적는 용도입니다.",
    );

    this.addTextSetting(
      "제목",
      "두 번째 카드의 제목입니다.",
      settings.notices.title,
      async (value) => {
        settings.notices.title = value.trim() || DEFAULT_SETTINGS.notices.title;
        await this.plugin.saveSettings();
      },
    );

    this.addTextareaSetting(
      "내용",
      "한 줄에 한 항목씩 입력합니다.",
      settings.notices.items,
      async (items) => {
        settings.notices.items = items;
        await this.plugin.saveSettings();
      },
      "예: 오늘 5교시 후 청소 점검",
    );

    this.addSettingsSection(
      "학급용 폼",
      "아침 일지나 상태 확인용 Google Form 설정입니다.",
    );
    this.buildFormSettings(
      settings.forms.classForm,
      DEFAULT_SETTINGS.forms.classForm,
      async () => {
        await this.plugin.saveSettings();
      },
    );

    this.addSettingsSection(
      "수업용 폼",
      "수업 후 이해 상태를 받는 Google Form 설정입니다.",
    );
    this.buildFormSettings(
      settings.forms.lessonForm,
      DEFAULT_SETTINGS.forms.lessonForm,
      async () => {
        await this.plugin.saveSettings();
      },
    );
  }

  private buildFormSettings(
    target: ClassPageFormSettings,
    defaults: ClassPageFormSettings,
    onSave: () => Promise<void>,
  ): void {
    this.addTextSetting(
      "Google Form 링크",
      "비워두면 버튼이 비활성화됩니다.",
      target.url,
      async (value) => {
        target.url = value.trim();
        await onSave();
      },
      "https://forms.gle/...",
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
      "제출 시간이나 간단한 상태를 표시합니다.",
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
