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

export interface ClassPageSettings {
  pageTitle: string;
  pageDescription: string;
  statusMessage: string;
  today: ClassPageSectionSettings;
  notices: ClassPageSectionSettings;
  forms: {
    classForm: ClassPageFormSettings;
    lessonForm: ClassPageFormSettings;
  };
}

