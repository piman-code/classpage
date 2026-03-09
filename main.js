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
var import_obsidian = require("obsidian");

// src/defaults.ts
var DEFAULT_SETTINGS = {
  pageTitle: "\uC6B0\uB9AC \uBC18 \uAD50\uC2E4 \uD398\uC774\uC9C0",
  pageDescription: "\uC624\uB298 \uD574\uC57C \uD560 \uC77C\uACFC \uACF5\uC9C0, \uC81C\uCD9C \uD3FC\uB9CC \uBE60\uB974\uAC8C \uD655\uC778\uD569\uB2C8\uB2E4.",
  statusMessage: "\uC81C\uCD9C\uC740 Google Form\uC73C\uB85C \uBC1B\uACE0, \uACB0\uACFC\uB294 Obsidian\uC5D0\uC11C \uD655\uC778\uD569\uB2C8\uB2E4.",
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
      url: "",
      helperText: "\uB4F1\uAD50 \uC9C1\uD6C4 \uC81C\uCD9C"
    },
    lessonForm: {
      title: "\uC218\uC5C5\uC6A9 \uD3FC",
      description: "\uC218\uC5C5 \uD6C4 \uC774\uD574 \uC815\uB3C4\uC640 \uB290\uB080 \uC810\uC744 \uB0A8\uAE30\uB294 \uD3FC\uC785\uB2C8\uB2E4.",
      buttonLabel: "\uC218\uC5C5\uC6A9 \uD3FC \uBC14\uB85C\uAC00\uAE30",
      url: "",
      helperText: "\uC218\uC5C5 \uC9C1\uD6C4 \uC81C\uCD9C"
    }
  }
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
    url: normalizeOptionalString(form.url),
    helperText: normalizeOptionalStringWithFallback(
      form.helperText,
      fallback.helperText
    )
  };
}
function normalizeSettings(value) {
  const settings = value ?? {};
  return {
    pageTitle: normalizeString(settings.pageTitle, DEFAULT_SETTINGS.pageTitle),
    pageDescription: normalizeOptionalStringWithFallback(
      settings.pageDescription,
      DEFAULT_SETTINGS.pageDescription
    ),
    statusMessage: normalizeOptionalStringWithFallback(
      settings.statusMessage,
      DEFAULT_SETTINGS.statusMessage
    ),
    today: normalizeSection(settings.today, DEFAULT_SETTINGS.today),
    notices: normalizeSection(settings.notices, DEFAULT_SETTINGS.notices),
    forms: {
      classForm: normalizeForm(
        settings.forms?.classForm,
        DEFAULT_SETTINGS.forms.classForm
      ),
      lessonForm: normalizeForm(
        settings.forms?.lessonForm,
        DEFAULT_SETTINGS.forms.lessonForm
      )
    }
  };
}

// src/main.ts
var VIEW_TYPE_CLASSPAGE = "classpage-view";
var ClassPagePlugin = class extends import_obsidian.Plugin {
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
      new import_obsidian.Notice("classpage\uB97C \uC5F4 \uC218 \uC788\uB294 \uD328\uB110\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
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
var ClassPageView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
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
    this.render();
  }
  async onClose() {
    this.contentEl.empty();
  }
  render() {
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
        text: settings.statusMessage
      });
    }
    header.createEl("h1", {
      cls: "classpage-title",
      text: settings.pageTitle
    });
    if (settings.pageDescription) {
      header.createEl("p", {
        cls: "classpage-description",
        text: settings.pageDescription
      });
    }
    const boardSection = shell.createDiv({ cls: "classpage-section" });
    this.renderSectionHeader(
      boardSection,
      "\uC624\uB298 \uD655\uC778\uD560 \uB0B4\uC6A9",
      "\uD560 \uC77C\uACFC \uACF5\uC9C0\uB97C \uD55C \uBC88\uC5D0 \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."
    );
    const board = boardSection.createDiv({ cls: "classpage-board" });
    this.renderListCard(board, settings.today.title, settings.today.items);
    this.renderListCard(board, settings.notices.title, settings.notices.items);
    const formsSection = shell.createDiv({ cls: "classpage-section" });
    this.renderSectionHeader(
      formsSection,
      "\uC81C\uCD9C \uBC14\uB85C\uAC00\uAE30",
      "\uD559\uC0DD\uC774 \uC544\uB798 \uBC84\uD2BC\uC73C\uB85C Google Form\uC744 \uBC14\uB85C \uC5F4 \uC218 \uC788\uC2B5\uB2C8\uB2E4."
    );
    const forms = formsSection.createDiv({ cls: "classpage-form-grid" });
    this.renderFormCard(forms, settings.forms.classForm);
    this.renderFormCard(forms, settings.forms.lessonForm);
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
    const card = parent.createDiv({ cls: "classpage-card" });
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
        new import_obsidian.Notice("\uC124\uC815\uC5D0\uC11C Google Form \uB9C1\uD06C\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.");
      });
    }
  }
};
var ClassPageSettingTab = class extends import_obsidian.PluginSettingTab {
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
      text: "\uAD50\uC2E4 \uC6B4\uC601 \uC911 \uC790\uC8FC \uBC14\uB00C\uB294 \uBB38\uAD6C\uC640 Google Form \uB9C1\uD06C\uB9CC \uBE60\uB974\uAC8C \uC218\uC815\uD560 \uC218 \uC788\uB3C4\uB85D \uC815\uB9AC\uD588\uC2B5\uB2C8\uB2E4."
    });
    new import_obsidian.Setting(containerEl).setName("\uBC14\uB85C \uC5F4\uAE30").setDesc("\uD604\uC7AC \uC124\uC815\uC73C\uB85C \uAD50\uC2E4 \uD398\uC774\uC9C0\uB97C \uBC14\uB85C \uC5F4\uC5B4 \uD655\uC778\uD569\uB2C8\uB2E4.").addButton((button) => {
      button.setButtonText("\uAD50\uC2E4 \uD398\uC774\uC9C0 \uC5F4\uAE30");
      button.setCta();
      button.onClick(async () => {
        await this.plugin.activateView();
      });
    });
    this.addSettingsSection(
      "\uC0C1\uB2E8 \uC548\uB0B4",
      "\uD398\uC774\uC9C0 \uB9E8 \uC704\uC5D0 \uBCF4\uC774\uB294 \uC81C\uBAA9\uACFC \uC18C\uAC1C \uBB38\uAD6C\uC785\uB2C8\uB2E4."
    );
    this.addTextSetting(
      "\uC81C\uBAA9",
      "\uC0C1\uB2E8\uC5D0 \uD45C\uC2DC\uD560 \uAD50\uC2E4 \uD398\uC774\uC9C0 \uC81C\uBAA9\uC785\uB2C8\uB2E4.",
      settings.pageTitle,
      async (value) => {
        settings.pageTitle = value.trim() || DEFAULT_SETTINGS.pageTitle;
        await this.plugin.saveSettings();
      },
      "\uC608: 3\uD559\uB144 2\uBC18 \uAD50\uC2E4 \uD398\uC774\uC9C0"
    );
    this.addTextSetting(
      "\uC124\uBA85",
      "\uC0C1\uB2E8\uC5D0 \uC9E7\uAC8C \uBCF4\uC5EC\uC904 \uC548\uB0B4 \uBB38\uAD6C\uC785\uB2C8\uB2E4.",
      settings.pageDescription,
      async (value) => {
        settings.pageDescription = value.trim();
        await this.plugin.saveSettings();
      },
      "\uC608: \uC624\uB298 \uD574\uC57C \uD560 \uC77C\uACFC \uC81C\uCD9C \uD3FC\uC744 \uD655\uC778\uD569\uB2C8\uB2E4."
    );
    this.addTextSetting(
      "\uC0C1\uD0DC \uBB38\uAD6C",
      "\uC0C1\uB2E8 \uBC30\uC9C0\uC5D0 \uD45C\uC2DC\uD560 \uC9E7\uC740 \uC6B4\uC601 \uC548\uB0B4\uC785\uB2C8\uB2E4.",
      settings.statusMessage,
      async (value) => {
        settings.statusMessage = value.trim();
        await this.plugin.saveSettings();
      },
      "\uC608: \uC81C\uCD9C\uC740 Google Form\uC73C\uB85C \uBC1B\uACE0, \uACB0\uACFC\uB294 Obsidian\uC5D0\uC11C \uD655\uC778\uD569\uB2C8\uB2E4."
    );
    this.addSettingsSection(
      "\uC624\uB298\uC758 \uD560 \uC77C",
      "\uD559\uC0DD\uC774 \uB4F1\uAD50 \uD6C4 \uBC14\uB85C \uD655\uC778\uD560 \uD56D\uBAA9\uC785\uB2C8\uB2E4."
    );
    this.addTextSetting(
      "\uC81C\uBAA9",
      "\uCCAB \uBC88\uC9F8 \uCE74\uB4DC\uC758 \uC81C\uBAA9\uC785\uB2C8\uB2E4.",
      settings.today.title,
      async (value) => {
        settings.today.title = value.trim() || DEFAULT_SETTINGS.today.title;
        await this.plugin.saveSettings();
      }
    );
    this.addTextareaSetting(
      "\uB0B4\uC6A9",
      "\uD55C \uC904\uC5D0 \uD55C \uD56D\uBAA9\uC529 \uC785\uB825\uD569\uB2C8\uB2E4.",
      settings.today.items,
      async (items) => {
        settings.today.items = items;
        await this.plugin.saveSettings();
      },
      "\uC608: \uB4F1\uAD50 \uD6C4 \uD559\uAE09\uC6A9 \uD3FC \uC81C\uCD9C"
    );
    this.addSettingsSection(
      "\uACF5\uC9C0\uC0AC\uD56D",
      "\uB2F9\uC77C \uACF5\uC9C0\uB098 \uC548\uB0B4\uB9CC \uAC04\uB2E8\uD558\uAC8C \uC801\uB294 \uC6A9\uB3C4\uC785\uB2C8\uB2E4."
    );
    this.addTextSetting(
      "\uC81C\uBAA9",
      "\uB450 \uBC88\uC9F8 \uCE74\uB4DC\uC758 \uC81C\uBAA9\uC785\uB2C8\uB2E4.",
      settings.notices.title,
      async (value) => {
        settings.notices.title = value.trim() || DEFAULT_SETTINGS.notices.title;
        await this.plugin.saveSettings();
      }
    );
    this.addTextareaSetting(
      "\uB0B4\uC6A9",
      "\uD55C \uC904\uC5D0 \uD55C \uD56D\uBAA9\uC529 \uC785\uB825\uD569\uB2C8\uB2E4.",
      settings.notices.items,
      async (items) => {
        settings.notices.items = items;
        await this.plugin.saveSettings();
      },
      "\uC608: \uC624\uB298 5\uAD50\uC2DC \uD6C4 \uCCAD\uC18C \uC810\uAC80"
    );
    this.addSettingsSection(
      "\uD559\uAE09\uC6A9 \uD3FC",
      "\uC544\uCE68 \uC77C\uC9C0\uB098 \uC0C1\uD0DC \uD655\uC778\uC6A9 Google Form \uC124\uC815\uC785\uB2C8\uB2E4."
    );
    this.buildFormSettings(
      settings.forms.classForm,
      DEFAULT_SETTINGS.forms.classForm,
      async () => {
        await this.plugin.saveSettings();
      }
    );
    this.addSettingsSection(
      "\uC218\uC5C5\uC6A9 \uD3FC",
      "\uC218\uC5C5 \uD6C4 \uC774\uD574 \uC0C1\uD0DC\uB97C \uBC1B\uB294 Google Form \uC124\uC815\uC785\uB2C8\uB2E4."
    );
    this.buildFormSettings(
      settings.forms.lessonForm,
      DEFAULT_SETTINGS.forms.lessonForm,
      async () => {
        await this.plugin.saveSettings();
      }
    );
  }
  buildFormSettings(target, defaults, onSave) {
    this.addTextSetting(
      "Google Form \uB9C1\uD06C",
      "\uBE44\uC6CC\uB450\uBA74 \uBC84\uD2BC\uC774 \uBE44\uD65C\uC131\uD654\uB429\uB2C8\uB2E4.",
      target.url,
      async (value) => {
        target.url = value.trim();
        await onSave();
      },
      "https://forms.gle/..."
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
      "\uC81C\uCD9C \uC2DC\uAC04\uC774\uB098 \uAC04\uB2E8\uD55C \uC0C1\uD0DC\uB97C \uD45C\uC2DC\uD569\uB2C8\uB2E4.",
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
    new import_obsidian.Setting(this.containerEl).setName(name).setDesc(desc).addText((text) => {
      text.setValue(value);
      if (placeholder) {
        text.setPlaceholder(placeholder);
      }
      text.onChange(onChange);
    });
  }
  addTextareaSetting(name, desc, items, onChange, placeholder = "") {
    new import_obsidian.Setting(this.containerEl).setName(name).setDesc(desc).addTextArea((text) => {
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
