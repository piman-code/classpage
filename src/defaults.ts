import type {
  ClassPageFormSettings,
  ClassPageSectionSettings,
  ClassPageSettings,
} from "./types";

export const DEFAULT_SETTINGS: ClassPageSettings = {
  pageTitle: "우리 반 교실 페이지",
  pageDescription: "오늘 해야 할 일과 공지, 제출 폼만 빠르게 확인합니다.",
  statusMessage: "제출은 Google Form으로 받고, 결과는 Obsidian에서 확인합니다.",
  today: {
    title: "오늘의 할 일",
    items: [
      "등교 후 학급용 폼을 제출합니다.",
      "1교시 전 준비물과 오늘 일정을 확인합니다.",
      "수업을 마친 뒤 수업용 폼으로 이해 상태를 남깁니다.",
    ],
  },
  notices: {
    title: "공지사항",
    items: [
      "오늘 5교시 후 청소 구역 점검이 있습니다.",
      "가정통신문 제출이 필요한 학생은 종례 전까지 제출합니다.",
    ],
  },
  forms: {
    classForm: {
      title: "학급용 폼",
      description: "아침 일지와 오늘 상태를 제출하는 폼입니다.",
      buttonLabel: "학급용 폼 바로가기",
      url: "",
      helperText: "등교 직후 제출",
    },
    lessonForm: {
      title: "수업용 폼",
      description: "수업 후 이해 정도와 느낀 점을 남기는 폼입니다.",
      buttonLabel: "수업용 폼 바로가기",
      url: "",
      helperText: "수업 직후 제출",
    },
  },
};

function normalizeString(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeOptionalString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalStringWithFallback(
  value: unknown,
  fallback: string,
): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeItems(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function normalizeSection(
  value: unknown,
  fallback: ClassPageSectionSettings,
): ClassPageSectionSettings {
  const section = (value ?? {}) as Partial<ClassPageSectionSettings>;

  return {
    title: normalizeString(section.title, fallback.title),
    items: normalizeItems(section.items, fallback.items),
  };
}

function normalizeForm(
  value: unknown,
  fallback: ClassPageFormSettings,
): ClassPageFormSettings {
  const form = (value ?? {}) as Partial<ClassPageFormSettings>;

  return {
    title: normalizeString(form.title, fallback.title),
    description: normalizeOptionalStringWithFallback(
      form.description,
      fallback.description,
    ),
    buttonLabel: normalizeString(form.buttonLabel, fallback.buttonLabel),
    url: normalizeOptionalString(form.url),
    helperText: normalizeOptionalStringWithFallback(
      form.helperText,
      fallback.helperText,
    ),
  };
}

export function normalizeSettings(value: unknown): ClassPageSettings {
  const settings = (value ?? {}) as Partial<ClassPageSettings>;

  return {
    pageTitle: normalizeString(settings.pageTitle, DEFAULT_SETTINGS.pageTitle),
    pageDescription: normalizeOptionalStringWithFallback(
      settings.pageDescription,
      DEFAULT_SETTINGS.pageDescription,
    ),
    statusMessage: normalizeOptionalStringWithFallback(
      settings.statusMessage,
      DEFAULT_SETTINGS.statusMessage,
    ),
    today: normalizeSection(settings.today, DEFAULT_SETTINGS.today),
    notices: normalizeSection(settings.notices, DEFAULT_SETTINGS.notices),
    forms: {
      classForm: normalizeForm(
        settings.forms?.classForm,
        DEFAULT_SETTINGS.forms.classForm,
      ),
      lessonForm: normalizeForm(
        settings.forms?.lessonForm,
        DEFAULT_SETTINGS.forms.lessonForm,
      ),
    },
  };
}
