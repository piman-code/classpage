function refreshAllSummaries() {
  const starBatchGrantReport = applyPendingStarBatchGrants_();
  const classSummary = buildClassSummary_();
  const lessonSummary = buildLessonSummary_();
  const starLedger = buildStarLedger_();

  writeSummaryFileIfConfigured_(
    CLASSPAGE_AUTOMATION_CONFIG.output.classFileName,
    classSummary,
  );
  writeSummaryFileIfConfigured_(
    CLASSPAGE_AUTOMATION_CONFIG.output.lessonFileName,
    lessonSummary,
  );
  writeSummaryFileIfConfigured_(
    CLASSPAGE_AUTOMATION_CONFIG.output.starFileName,
    starLedger,
  );

  return {
    starBatchGrants: starBatchGrantReport,
    classSummary: classSummary,
    lessonSummary: lessonSummary,
    starLedger: starLedger,
  };
}

function previewClassSummary() {
  const summary = buildClassSummary_();
  Logger.log(JSON.stringify(summary, null, 2));
  return summary;
}

function previewLessonSummary() {
  const summary = buildLessonSummary_();
  Logger.log(JSON.stringify(summary, null, 2));
  return summary;
}

function previewStarLedger() {
  const ledger = buildStarLedger_();
  Logger.log(JSON.stringify(ledger, null, 2));
  return ledger;
}

function applyPendingStarBatchGrants() {
  const report = applyPendingStarBatchGrants_();
  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function validateAutomationSetup() {
  const report = {
    classSheet: validateSheet_(
      CLASSPAGE_AUTOMATION_CONFIG.sources.classForm,
      ["timestamp", "email"],
    ),
    lessonSheet: validateSheet_(
      CLASSPAGE_AUTOMATION_CONFIG.sources.lessonForm,
      ["timestamp", "email", "subject", "period"],
    ),
    allowlistSheet: validateAllowlistSetup_(),
    starAdjustmentSheet: validateOptionalSheet_(
      CLASSPAGE_AUTOMATION_CONFIG.sources.starAdjustments,
      ["timestamp"],
    ),
    starBatchGrantSheet: validateOptionalSheet_(
      CLASSPAGE_AUTOMATION_CONFIG.sources.starBatchGrants,
      ["apply", "status", "ruleId"],
    ),
    starRuleConfig: validateStarRuleConfig_(),
    outputFolder: validateOutputFolder_(),
  };

  if (report.allowlistSheet.ok && report.allowlistSheet.enabled) {
    const allowlist = readAllowlistIndex_();
    report.allowlistSheet.allowedCount = allowlist.allowedCount;
    if (allowlist.allowedCount === 0) {
      report.allowlistSheet.message = "정상 연결, 허가 학생 0명";
    }
  }

  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function installRefreshTrigger() {
  const triggers = ScriptApp.getProjectTriggers();

  triggers.forEach(function (trigger) {
    if (trigger.getHandlerFunction() === "refreshAllSummaries") {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger("refreshAllSummaries")
    .timeBased()
    .everyMinutes(15)
    .create();
}

function doGet(e) {
  const summaryType = normalizeText_(e && e.parameter ? e.parameter.summary : "") || "all";
  let payload;

  if (summaryType === "class") {
    payload = buildClassSummary_();
  } else if (summaryType === "lesson") {
    payload = buildLessonSummary_();
  } else if (summaryType === "star") {
    payload = buildStarLedger_();
  } else {
    payload = {
      classSummary: buildClassSummary_(),
      lessonSummary: buildLessonSummary_(),
      starLedger: buildStarLedger_(),
    };
  }

  return ContentService.createTextOutput(JSON.stringify(payload, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

function buildClassSummary_() {
  const sourceConfig = CLASSPAGE_AUTOMATION_CONFIG.sources.classForm;
  const rules = CLASSPAGE_AUTOMATION_CONFIG.rules.classSummary;
  const allowlist = readAllowlistIndex_();
  const rows = readSheetRows_(sourceConfig);
  const periodRows = dedupeLatestByStudent_(
    filterRowsForLatestDate_(rows, sourceConfig.headers.timestamp),
    sourceConfig.headers,
  );
  const allowlistResult = filterRowsByAllowlist_(periodRows, sourceConfig.headers, allowlist);
  const latestRows = allowlistResult.includedRows;
  const responseCount = latestRows.length;
  const excludedResponseCount = allowlistResult.excludedCount;
  const referenceRows = latestRows.length > 0 ? latestRows : periodRows;
  const latestDate = referenceRows.length > 0
    ? getRowDate_(referenceRows[0], sourceConfig.headers.timestamp)
    : new Date();
  const dateLabel = formatDateOnly_(latestDate);
  const classroom = getMostCommonValue_(referenceRows, sourceConfig.headers.classroom);
  const classAnalyses = latestRows.map(function (row) {
    return analyzeClassRow_(row, sourceConfig, rules);
  });
  const emotionLabels = classAnalyses.map(function (item) {
    return item.response.emotionLabel;
  });
  const goalLabels = classAnalyses.map(function (item) {
    return item.response.goalLabel;
  });
  const supportStudents = classAnalyses
    .map(function (item) {
      return item.supportStudent;
    })
    .filter(function (item) {
      return item !== null;
    });
  const praiseCandidates = classAnalyses
    .map(function (item) {
      return item.praiseCandidate;
    })
    .filter(function (item) {
      return item !== null;
    });

  return {
    type: "class-summary",
    generatedAt: toIsoString_(new Date()),
    periodLabel: referenceRows.length > 0 ? dateLabel + " 아침" : "응답 없음",
    classroom: classroom,
    responseCount: responseCount,
    excludedResponseCount: excludedResponseCount,
    source: {
      formName: sourceConfig.formName,
      formUrl: sourceConfig.formUrl,
      sheetName: sourceConfig.sheetName,
      aggregatorNote: buildClassSummaryNote_(allowlist.enabled),
    },
    emotionSummary: buildBucketSummary_(emotionLabels, rules.emotionBuckets, "미분류", "분류되지 않은 응답"),
    goalSummary: buildBucketSummary_(goalLabels, rules.goalBuckets, "미분류", "분류되지 않은 응답"),
    supportStudents: supportStudents,
    praiseCandidates: praiseCandidates,
    studentResponses: classAnalyses.map(function (item) {
      return item.response;
    }),
  };
}

function buildLessonSummary_() {
  const sourceConfig = CLASSPAGE_AUTOMATION_CONFIG.sources.lessonForm;
  const rules = CLASSPAGE_AUTOMATION_CONFIG.rules.lessonSummary;
  const allowlist = readAllowlistIndex_();
  const rows = readSheetRows_(sourceConfig);
  const periodRows = dedupeLatestByStudent_(
    filterRowsForLatestLessonGroup_(rows, sourceConfig.headers),
    sourceConfig.headers,
  );
  const allowlistResult = filterRowsByAllowlist_(periodRows, sourceConfig.headers, allowlist);
  const latestRows = allowlistResult.includedRows;
  const responseCount = latestRows.length;
  const excludedResponseCount = allowlistResult.excludedCount;
  const referenceRows = latestRows.length > 0 ? latestRows : periodRows;
  const latestRow = referenceRows.length > 0 ? referenceRows[0] : null;
  const classroom = getMostCommonValue_(referenceRows, sourceConfig.headers.classroom);
  const subject = latestRow ? getRowValue_(latestRow, sourceConfig.headers.subject) : "";
  const periodLabel = latestRow
    ? buildLessonPeriodLabel_(latestRow, sourceConfig.headers)
    : "응답 없음";

  const conceptStats = buildConceptStats_(latestRows, sourceConfig.headers, rules);
  const difficultConcepts = Object.keys(conceptStats)
    .map(function (conceptName) {
      const stat = conceptStats[conceptName];
      const averageScore = stat.responses > 0 ? stat.scoreTotal / stat.responses : 0;
      return {
        concept: conceptName,
        count: stat.lowCount,
        averageUnderstanding: scoreToUnderstandingLabel_(averageScore, rules.understandingBuckets),
        note: stat.lowCount > 0
          ? "낮은 이해 응답 " + stat.lowCount + "건"
          : "낮은 이해 응답 없음",
      };
    })
    .sort(function (left, right) {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.averageUnderstanding.localeCompare(right.averageUnderstanding);
    });

  const supportAnalyses = latestRows.map(function (row) {
    return analyzeLessonRow_(row, sourceConfig.headers, rules);
  });

  const assignmentLabels = supportAnalyses.map(function (item) {
    return item.assignmentLabel;
  });

  const supportStudents = supportAnalyses
    .filter(function (item) {
      return item.score >= rules.supportScoreThreshold;
    })
    .map(function (item) {
      return item.supportStudent;
    });

  const studentResults = supportAnalyses
    .map(function (item) {
      return item.studentResult;
    })
    .sort(function (left, right) {
      if (right.incorrectCount !== left.incorrectCount) {
        return right.incorrectCount - left.incorrectCount;
      }
      return right.correctCount - left.correctCount;
    });

  const averageCorrectCount = calculateAverage_(
    supportAnalyses.map(function (item) {
      return item.correctCount;
    }),
  );
  const averageIncorrectCount = calculateAverage_(
    supportAnalyses.map(function (item) {
      return item.incorrectCount;
    }),
  );
  const assignmentSummary = buildBucketSummary_(
    assignmentLabels,
    rules.assignmentBuckets,
    "미분류",
    "분류되지 않은 응답",
  );

  return {
    type: "lesson-summary",
    generatedAt: toIsoString_(new Date()),
    periodLabel: periodLabel,
    classroom: classroom,
    subject: subject,
    responseCount: responseCount,
    excludedResponseCount: excludedResponseCount,
    source: {
      formName: sourceConfig.formName,
      formUrl: sourceConfig.formUrl,
      sheetName: sourceConfig.sheetName,
      aggregatorNote: buildLessonSummaryNote_(allowlist.enabled),
    },
    overview: {
      averageCorrectCount: roundToOneDecimal_(averageCorrectCount),
      averageIncorrectCount: roundToOneDecimal_(averageIncorrectCount),
      assignmentCompletionLabel: buildAssignmentCompletionLabel_(assignmentSummary),
    },
    difficultConcepts: difficultConcepts,
    assignmentSummary: assignmentSummary,
    supportStudents: supportStudents,
    studentResults: studentResults,
    studentResponses: supportAnalyses
      .map(function (item) {
        return item.studentResponse;
      })
      .sort(function (left, right) {
        if (right.incorrectCount !== left.incorrectCount) {
          return right.incorrectCount - left.incorrectCount;
        }
        return right.correctCount - left.correctCount;
      }),
  };
}

function buildStarLedger_() {
  const classConfig = CLASSPAGE_AUTOMATION_CONFIG.sources.classForm;
  const lessonConfig = CLASSPAGE_AUTOMATION_CONFIG.sources.lessonForm;
  const adjustmentConfig = CLASSPAGE_AUTOMATION_CONFIG.sources.starAdjustments;
  const starModeConfig = CLASSPAGE_AUTOMATION_CONFIG.rules.starMode;
  const rules = normalizeStarRules_(starModeConfig.rules || []);
  const allowlist = readAllowlistIndex_();

  const classRows = filterRowsByAllowlist_(
    dedupeLatestByGroupAndStudent_(
      readSheetRows_(classConfig),
      classConfig.headers,
      function (row, headers) {
        return buildClassDateGroupKey_(row, headers.timestamp);
      },
    ),
    classConfig.headers,
    allowlist,
  );
  const lessonRows = filterRowsByAllowlist_(
    dedupeLatestByGroupAndStudent_(
      readSheetRows_(lessonConfig),
      lessonConfig.headers,
      function (row, headers) {
        return buildLessonGroupKey_(row, headers);
      },
    ),
    lessonConfig.headers,
    allowlist,
  );
  const adjustmentRows = filterRowsByAllowlist_(
    readOptionalSheetRows_(adjustmentConfig),
    adjustmentConfig.headers,
    allowlist,
  );

  const events = [];
  const automaticEventIds = {};

  appendAutomaticStarEventsForSource_(
    events,
    automaticEventIds,
    classRows.includedRows,
    classConfig.headers,
    rules,
    "class-form",
  );
  appendAutomaticStarEventsForSource_(
    events,
    automaticEventIds,
    lessonRows.includedRows,
    lessonConfig.headers,
    rules,
    "lesson-form",
  );
  adjustmentRows.includedRows.forEach(function (row) {
    pushStarEventIfActive_(
      events,
      buildManualStarEvent_(row, adjustmentConfig.headers, rules),
    );
  });

  const sortedEvents = sortStarEvents_(events);
  const totals = buildStarStudentTotals_(sortedEvents);
  const sourceSummary = buildStarEventSourceSummary_(sortedEvents);
  const sheetNames = [
    classConfig.sheetName,
    lessonConfig.sheetName,
    adjustmentRows.includedRows.length > 0 ? adjustmentConfig.sheetName : "",
  ].filter(Boolean).join(", ");

  return {
    type: "star-ledger",
    generatedAt: toIsoString_(new Date()),
    periodLabel: buildStarPeriodLabel_(sortedEvents),
    excludedResponseCount:
      classRows.excludedCount + lessonRows.excludedCount + adjustmentRows.excludedCount,
    eventCount: sortedEvents.length,
    source: {
      formName: "학급용/수업용 응답 + 별점 규칙",
      formUrl: "",
      sheetName: sheetNames,
      aggregatorNote: buildStarLedgerNote_(allowlist.enabled),
    },
    sourceSummary: sourceSummary,
    rules: rules,
    totals: totals,
    recentEvents: sortedEvents.slice(0, starModeConfig.recentEventLimit || 8),
  };
}

function validateSheet_(sourceConfig, requiredHeaderKeys) {
  const result = {
    spreadsheetId: sourceConfig.spreadsheetId || "(active spreadsheet)",
    sheetName: sourceConfig.sheetName,
    ok: false,
    message: "",
  };

  try {
    const sheet = getSourceSheet_(sourceConfig);
    const headerLabels = readSheetHeaderLabels_(sheet);
    const missingHeaders = (requiredHeaderKeys || [])
      .map(function (key) {
        return sourceConfig.headers && sourceConfig.headers[key]
          ? String(sourceConfig.headers[key]).trim()
          : "";
      })
      .filter(function (label) {
        return label && headerLabels.indexOf(label) === -1;
      });

    result.ok = !!sheet && missingHeaders.length === 0;
    result.message = missingHeaders.length === 0
      ? "정상 연결"
      : "헤더를 찾을 수 없습니다: " + missingHeaders.join(", ");
  } catch (error) {
    result.message = error && error.message ? error.message : "알 수 없는 오류";
  }

  return result;
}

function validateOptionalSheet_(sourceConfig, requiredHeaderKeys) {
  if (!sourceConfig || !sourceConfig.spreadsheetId) {
    return {
      spreadsheetId: "(optional)",
      sheetName: sourceConfig && sourceConfig.sheetName ? sourceConfig.sheetName : "",
      ok: true,
      message: "미사용",
    };
  }

  return validateSheet_(sourceConfig, requiredHeaderKeys);
}

function validateAllowlistSetup_() {
  const sourceConfig = CLASSPAGE_AUTOMATION_CONFIG.sources.allowlist;
  if (!isAllowlistEnabled_()) {
    return {
      spreadsheetId: "(optional)",
      sheetName: sourceConfig && sourceConfig.sheetName ? sourceConfig.sheetName : "",
      ok: true,
      enabled: false,
      message: "미사용: Google 로그인 이메일 기준으로 집계",
    };
  }

  const result = validateSheet_(sourceConfig, ["email"]);
  result.enabled = true;
  return result;
}

function validateOutputFolder_() {
  if (!CLASSPAGE_AUTOMATION_CONFIG.output.driveFolderId) {
    return {
      ok: false,
      message: "driveFolderId가 비어 있습니다. Drive 파일 갱신 대신 doGet 또는 preview 함수만 사용할 수 있습니다.",
    };
  }

  try {
    const folder = DriveApp.getFolderById(CLASSPAGE_AUTOMATION_CONFIG.output.driveFolderId);
    return {
      ok: !!folder,
      message: folder ? "정상 연결" : "폴더를 찾지 못함",
    };
  } catch (error) {
    return {
      ok: false,
      message: error && error.message ? error.message : "알 수 없는 오류",
    };
  }
}

function validateStarRuleConfig_() {
  const rawRules = CLASSPAGE_AUTOMATION_CONFIG.rules.starMode.rules || [];
  const rules = normalizeStarRules_(rawRules);
  const duplicates = [];
  const issues = [];
  const seen = {};

  rawRules.forEach(function (rule, index) {
    const rawRuleId = String(rule && (rule.ruleId || rule.id || "") || "").trim();
    const rawLabel = String(rule && rule.label || "").trim();

    if (!rawRuleId) {
      issues.push("index " + index + ": ruleId 없음");
    }

    if (!rawLabel) {
      issues.push((rawRuleId || "index " + index) + ": label 없음");
    }
  });

  rules.forEach(function (rule) {
    if (seen[rule.ruleId]) {
      duplicates.push(rule.ruleId);
    }
    seen[rule.ruleId] = true;

    if (!Array.isArray(rule.sources) || rule.sources.length === 0) {
      issues.push(rule.ruleId + ": source 없음");
    }

    if (hasAutomaticStarSource_(rule.sources) && rule.allowCustomDelta) {
      issues.push(rule.ruleId + ": 자동 규칙에서 allowCustomDelta 사용 안 함");
    }

    if (rule.autoCriteria && !hasAutomaticStarSource_(rule.sources)) {
      issues.push(rule.ruleId + ": autoCriteria는 자동 규칙에서만 사용");
    }

    if (rule.autoCriteria && rule.sources.indexOf("lesson-form") !== -1) {
      if (rule.autoCriteria.assignmentStatusIn.length > 0
        && !CLASSPAGE_AUTOMATION_CONFIG.sources.lessonForm.headers.assignmentStatus) {
        issues.push(rule.ruleId + ": assignmentStatus 헤더 없음");
      }
      if (rule.autoCriteria.minimumCorrectCount !== null
        && !CLASSPAGE_AUTOMATION_CONFIG.sources.lessonForm.headers.correctCount) {
        issues.push(rule.ruleId + ": correctCount 헤더 없음");
      }
      if (rule.autoCriteria.maximumIncorrectCount !== null
        && !CLASSPAGE_AUTOMATION_CONFIG.sources.lessonForm.headers.incorrectCount) {
        issues.push(rule.ruleId + ": incorrectCount 헤더 없음");
      }
    }
  });

  return {
    ok: duplicates.length === 0 && issues.length === 0,
    ruleCount: rules.length,
    enabledCount: rules.filter(function (rule) {
      return rule.enabled;
    }).length,
    message: duplicates.length === 0 && issues.length === 0
      ? "정상 연결"
      : "중복 또는 조건 설정 확인 필요",
    duplicates: duplicates,
    issues: issues,
  };
}

function writeSummaryFileIfConfigured_(fileName, payload) {
  const folderId = CLASSPAGE_AUTOMATION_CONFIG.output.driveFolderId;
  if (!folderId) {
    return;
  }

  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFilesByName(fileName);
  const content = JSON.stringify(payload, null, 2);

  if (files.hasNext()) {
    const file = files.next();
    file.setContent(content);
    return;
  }

  folder.createFile(fileName, content, MimeType.PLAIN_TEXT);
}

function isAllowlistEnabled_() {
  const sourceConfig = CLASSPAGE_AUTOMATION_CONFIG.sources.allowlist;
  return !!(sourceConfig && sourceConfig.enabled);
}

function buildClassSummaryNote_(useAllowlist) {
  return useAllowlist
    ? "Apps Script가 학급용 응답과 허가 학생 명단을 이메일로 대조한 뒤 정서/목표/도움 필요/칭찬 후보를 규칙 기반으로 집계"
    : "Apps Script가 Google 로그인 이메일 기준으로 학급용 응답을 정리해 정서/목표/도움 필요/칭찬 후보를 규칙 기반으로 집계";
}

function buildLessonSummaryNote_(useAllowlist) {
  return useAllowlist
    ? "Apps Script가 수업용 응답과 허가 학생 명단을 이메일로 대조한 뒤 개념 난도/정오답/과제/보충 필요 학생을 규칙 기반으로 집계"
    : "Apps Script가 Google 로그인 이메일 기준으로 수업용 응답을 정리해 개념 난도/정오답/과제/보충 필요 학생을 규칙 기반으로 집계";
}

function buildStarLedgerNote_(useAllowlist) {
  return useAllowlist
    ? "Apps Script가 허가 학생 응답만 남기고 자동 적립과 수동/일괄 조정을 같은 이벤트 로그 구조로 합쳐 별점 ledger를 생성"
    : "Apps Script가 Google 로그인 이메일 기준으로 자동 적립과 수동/일괄 조정을 같은 이벤트 로그 구조로 합쳐 별점 ledger를 생성";
}

function readSheetRows_(sourceConfig) {
  const sheet = getSourceSheet_(sourceConfig);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return [];
  }

  const headers = readSheetHeaderLabels_(sheet);

  return values.slice(1)
    .filter(function (row) {
      return row.some(function (value) {
        return String(value).trim() !== "";
      });
    })
    .map(function (row) {
      const item = {};
      headers.forEach(function (header, index) {
        item[header] = row[index];
      });
      return item;
    });
}

function readOptionalSheetRows_(sourceConfig) {
  if (!sourceConfig || !sourceConfig.spreadsheetId) {
    return [];
  }

  try {
    return readSheetRows_(sourceConfig);
  } catch (error) {
    return [];
  }
}

function readSheetRowsWithNumbers_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return [];
  }

  const headers = readSheetHeaderLabels_(sheet);

  return values.slice(1)
    .map(function (row, index) {
      const item = {};
      headers.forEach(function (header, headerIndex) {
        item[header] = row[headerIndex];
      });

      return {
        rowNumber: index + 2,
        row: item,
      };
    })
    .filter(function (entry) {
      return Object.keys(entry.row).some(function (key) {
        return String(entry.row[key] == null ? "" : entry.row[key]).trim() !== "";
      });
    });
}

function readSheetHeaderLabels_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length === 0) {
    return [];
  }

  return values[0].map(function (header) {
    return String(header).trim();
  });
}

function readAllowlistIndex_() {
  if (!isAllowlistEnabled_()) {
    return {
      enabled: false,
      byEmail: {},
      allowedCount: 0,
    };
  }

  const sourceConfig = CLASSPAGE_AUTOMATION_CONFIG.sources.allowlist;
  const rows = readSheetRows_(sourceConfig);
  return buildAllowlistIndex_(rows, sourceConfig.headers);
}

function buildAllowlistIndex_(rows, headers) {
  const byEmail = {};

  rows.forEach(function (row) {
    const email = normalizeEmail_(getRowValue_(row, headers.email));
    if (!email) {
      return;
    }

    if (!isAllowlistRowActive_(getRowValue_(row, headers.active))) {
      return;
    }

    byEmail[email] = {
      email: email,
      classroom: getRowValue_(row, headers.classroom),
      number: getRowValue_(row, headers.number),
      name: getRowValue_(row, headers.name),
    };
  });

  return {
    enabled: true,
    byEmail: byEmail,
    allowedCount: Object.keys(byEmail).length,
  };
}

function filterRowsByAllowlist_(rows, responseHeaders, allowlist) {
  if (!allowlist || !allowlist.enabled) {
    return {
      includedRows: rows.slice(),
      excludedCount: 0,
    };
  }

  const includedRows = [];
  let excludedCount = 0;

  rows.forEach(function (row) {
    const email = normalizeEmail_(getRowValue_(row, responseHeaders.email));
    const allowlistStudent = email ? allowlist.byEmail[email] : null;

    if (!allowlistStudent) {
      excludedCount += 1;
      return;
    }

    includedRows.push(bindAllowlistStudent_(row, responseHeaders, allowlistStudent));
  });

  return {
    includedRows: includedRows,
    excludedCount: excludedCount,
  };
}

function bindAllowlistStudent_(row, headers, allowlistStudent) {
  const copy = {};

  Object.keys(row).forEach(function (key) {
    copy[key] = row[key];
  });

  if (headers.classroom && allowlistStudent.classroom) {
    copy[headers.classroom] = allowlistStudent.classroom;
  }
  if (headers.number && allowlistStudent.number) {
    copy[headers.number] = allowlistStudent.number;
  }
  if (headers.name && allowlistStudent.name) {
    copy[headers.name] = allowlistStudent.name;
  }

  return copy;
}

function hasAutomaticStarSource_(sources) {
  return Array.isArray(sources) && sources.some(function (source) {
    return source === "class-form" || source === "lesson-form" || source === "system";
  });
}

function getSourceSheet_(sourceConfig) {
  const spreadsheet = sourceConfig.spreadsheetId
    ? SpreadsheetApp.openById(sourceConfig.spreadsheetId)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error("스프레드시트를 열 수 없습니다.");
  }

  const sheet = spreadsheet.getSheetByName(sourceConfig.sheetName);
  if (!sheet) {
    throw new Error("시트를 찾을 수 없습니다: " + sourceConfig.sheetName);
  }

  return sheet;
}

function applyPendingStarBatchGrants_() {
  const batchConfig = CLASSPAGE_AUTOMATION_CONFIG.sources.starBatchGrants;
  if (!batchConfig || !batchConfig.spreadsheetId) {
    return {
      enabled: false,
      pendingCount: 0,
      appliedCount: 0,
      skippedCount: 0,
      message: "별점 일괄 부여 시트 미사용",
    };
  }

  try {
    const batchSheet = getSourceSheet_(batchConfig);
    const batchHeaders = readSheetHeaderLabels_(batchSheet);
    const pendingRows = readSheetRowsWithNumbers_(batchSheet)
      .filter(function (entry) {
        return isQueuedStarBatchGrantRow_(entry.row, batchConfig.headers);
      });

    if (pendingRows.length === 0) {
      return {
        enabled: true,
        pendingCount: 0,
        appliedCount: 0,
        skippedCount: 0,
        message: "적용 대기 중인 일괄 부여 행 없음",
      };
    }

    const adjustmentConfig = CLASSPAGE_AUTOMATION_CONFIG.sources.starAdjustments;
    const adjustmentSheet = getSourceSheet_(adjustmentConfig);
    const adjustmentHeaders = readSheetHeaderLabels_(adjustmentSheet);
    const runBatchId = buildGeneratedStarBatchId_();
    const appliedAt = toIsoString_(new Date());
    const rowsToAppend = [];
    const rowResults = [];

    pendingRows.forEach(function (entry) {
      const validationMessage = validateStarBatchGrantRow_(entry.row, batchConfig.headers);
      const batchId = getRowValue_(entry.row, batchConfig.headers.batchId) || runBatchId;

      if (validationMessage) {
        rowResults.push({
          rowNumber: entry.rowNumber,
          applied: false,
          batchId: batchId,
          status: "오류: " + validationMessage,
        });
        return;
      }

      const adjustmentRow = buildStarAdjustmentRowFromBatchGrant_(
        entry.row,
        batchConfig.headers,
        batchId,
        appliedAt,
      );

      rowsToAppend.push(adjustmentHeaders.map(function (headerLabel) {
        return adjustmentRow.hasOwnProperty(headerLabel) ? adjustmentRow[headerLabel] : "";
      }));
      rowResults.push({
        rowNumber: entry.rowNumber,
        applied: true,
        batchId: batchId,
        status: "적용 완료: " + batchId + " / " + appliedAt,
      });
    });

    if (rowsToAppend.length > 0) {
      adjustmentSheet
        .getRange(
          adjustmentSheet.getLastRow() + 1,
          1,
          rowsToAppend.length,
          adjustmentHeaders.length,
        )
        .setValues(rowsToAppend);
    }

    rowResults.forEach(function (result) {
      writeStarBatchGrantRowResult_(
        batchSheet,
        batchHeaders,
        batchConfig.headers,
        result.rowNumber,
        result.status,
        result.batchId,
      );
    });

    return {
      enabled: true,
      pendingCount: pendingRows.length,
      appliedCount: rowsToAppend.length,
      skippedCount: pendingRows.length - rowsToAppend.length,
      message: rowsToAppend.length > 0
        ? "일괄 부여 행 " + rowsToAppend.length + "건을 수동 조정 시트로 반영"
        : "적용할 수 있는 일괄 부여 행 없음",
    };
  } catch (error) {
    return {
      enabled: true,
      pendingCount: 0,
      appliedCount: 0,
      skippedCount: 0,
      message: error && error.message ? "오류: " + error.message : "오류: 일괄 부여 반영 실패",
    };
  }
}

function isQueuedStarBatchGrantRow_(row, headers) {
  if (!isTruthyStarBatchApplyValue_(getRowValue_(row, headers.apply))) {
    return false;
  }

  const status = normalizeText_(getRowValue_(row, headers.status));
  return !(status.indexOf("적용 완료") === 0 || status.indexOf("applied") === 0);
}

function isTruthyStarBatchApplyValue_(value) {
  if (value === true) {
    return true;
  }

  const normalized = normalizeText_(value);
  return [
    "1",
    "true",
    "y",
    "yes",
    "적용",
    "실행",
    "go",
  ].indexOf(normalized) !== -1;
}

function validateStarBatchGrantRow_(row, headers) {
  const ruleId = getRowValue_(row, headers.ruleId);
  if (!normalizeText_(ruleId)) {
    return "규칙 ID가 비어 있습니다.";
  }

  if (buildStudentKey_(row, headers) === "student|unknown") {
    return "학생 식별 정보가 없습니다.";
  }

  return "";
}

function buildStarAdjustmentRowFromBatchGrant_(row, headers, batchId, appliedAt) {
  const adjustmentHeaders = CLASSPAGE_AUTOMATION_CONFIG.sources.starAdjustments.headers;

  return {
    [adjustmentHeaders.timestamp]: getRowValue_(row, headers.timestamp) || appliedAt,
    [adjustmentHeaders.studentKey]: getRowValue_(row, headers.studentKey),
    [adjustmentHeaders.email]: getRowValue_(row, headers.email),
    [adjustmentHeaders.classroom]: getRowValue_(row, headers.classroom),
    [adjustmentHeaders.number]: getRowValue_(row, headers.number),
    [adjustmentHeaders.name]: getRowValue_(row, headers.name),
    [adjustmentHeaders.ruleId]: getRowValue_(row, headers.ruleId),
    [adjustmentHeaders.delta]: getRowValue_(row, headers.delta),
    [adjustmentHeaders.visibility]: getRowValue_(row, headers.visibility),
    [adjustmentHeaders.note]: getRowValue_(row, headers.note),
    [adjustmentHeaders.teacher]: getRowValue_(row, headers.teacher),
    [adjustmentHeaders.batchId]: batchId,
  };
}

function writeStarBatchGrantRowResult_(
  batchSheet,
  headerLabels,
  headers,
  rowNumber,
  status,
  batchId,
) {
  const statusColumn = getHeaderColumnNumber_(headerLabels, headers.status);
  if (statusColumn > 0) {
    batchSheet.getRange(rowNumber, statusColumn).setValue(status);
  }

  const batchIdColumn = getHeaderColumnNumber_(headerLabels, headers.batchId);
  if (batchIdColumn > 0 && batchId) {
    batchSheet.getRange(rowNumber, batchIdColumn).setValue(batchId);
  }

  const applyColumn = getHeaderColumnNumber_(headerLabels, headers.apply);
  if (applyColumn > 0) {
    batchSheet.getRange(rowNumber, applyColumn).setValue(false);
  }
}

function getHeaderColumnNumber_(headerLabels, headerName) {
  if (!headerName) {
    return -1;
  }

  const index = headerLabels.indexOf(String(headerName).trim());
  return index === -1 ? -1 : index + 1;
}

function buildGeneratedStarBatchId_() {
  return "batch-" + Utilities.formatDate(
    new Date(),
    CLASSPAGE_AUTOMATION_CONFIG.timezone || Session.getScriptTimeZone() || "Asia/Seoul",
    "yyyyMMdd-HHmmss",
  );
}

function filterRowsForLatestDate_(rows, timestampHeader) {
  if (rows.length === 0) {
    return [];
  }

  const datedRows = rows
    .map(function (row) {
      return getRowDate_(row, timestampHeader);
    })
    .filter(function (date) {
      return isValidDate_(date);
    })
    .sort(function (left, right) {
      return right.getTime() - left.getTime();
    });

  if (datedRows.length === 0) {
    return rows.slice();
  }

  const latestDate = datedRows[0];
  const latestLabel = formatDateOnly_(latestDate);

  return rows.filter(function (row) {
    return formatDateOnly_(getRowDate_(row, timestampHeader)) === latestLabel;
  });
}

function filterRowsForLatestLessonGroup_(rows, headers) {
  if (rows.length === 0) {
    return [];
  }

  const sortedRows = rows.slice().sort(function (left, right) {
    return getComparableRowDate_(right, headers).getTime()
      - getComparableRowDate_(left, headers).getTime();
  });
  const latestGroupKey = buildLessonGroupKey_(sortedRows[0], headers);

  return sortedRows.filter(function (row) {
    return buildLessonGroupKey_(row, headers) === latestGroupKey;
  });
}

function dedupeLatestByStudent_(rows, headers) {
  const rowMap = {};

  rows.forEach(function (row) {
    const key = buildStudentKey_(row, headers);
    const current = rowMap[key];

    if (!current) {
      rowMap[key] = row;
      return;
    }

    const currentDate = getComparableRowDate_(current, headers);
    const nextDate = getComparableRowDate_(row, headers);
    if (nextDate.getTime() >= currentDate.getTime()) {
      rowMap[key] = row;
    }
  });

  return Object.keys(rowMap).map(function (key) {
    return rowMap[key];
  });
}

function dedupeLatestByGroupAndStudent_(rows, headers, groupKeyBuilder) {
  const rowMap = {};

  rows.forEach(function (row) {
    const groupKey = groupKeyBuilder(row, headers) || "group|unknown";
    const studentKey = buildStudentKey_(row, headers) || "student|unknown";
    const key = groupKey + "|" + studentKey;
    const current = rowMap[key];

    if (!current) {
      rowMap[key] = row;
      return;
    }

    const currentDate = getComparableRowDate_(current, headers);
    const nextDate = getComparableRowDate_(row, headers);
    if (nextDate.getTime() >= currentDate.getTime()) {
      rowMap[key] = row;
    }
  });

  return Object.keys(rowMap).map(function (key) {
    return rowMap[key];
  });
}

function analyzeClassRow_(row, sourceConfig, rules) {
  const moodLabel = classifyBucketLabel_(
    getRowValue_(row, sourceConfig.headers.mood),
    rules.emotionBuckets,
    "미분류",
  );
  const achievementLabel = classifyBucketLabel_(
    getRowValue_(row, sourceConfig.headers.yesterdayAchievement),
    rules.goalBuckets,
    "미분류",
  );
  const moodReason = getRowValue_(row, sourceConfig.headers.moodReason);
  const teacherMessage = getRowValue_(row, sourceConfig.headers.teacherMessage);
  const helpedFriend = getRowValue_(row, sourceConfig.headers.helpedFriend);
  const helpedByFriend = getRowValue_(row, sourceConfig.headers.helpedByFriend);
  const notes = [];
  let score = 0;

  if (rules.attentionEmotionLabels.indexOf(moodLabel) !== -1) {
    score += 1;
    notes.push("정서 상태 주의");
  }

  if (achievementLabel === "미달") {
    score += 2;
    notes.push("어제 할 일 미달");
  } else if (achievementLabel === "부분 달성") {
    score += 1;
    notes.push("어제 할 일 부분 달성");
  }

  if (containsAnyKeyword_(moodReason + " " + teacherMessage, rules.helpKeywords)) {
    score += 1;
    notes.push("도움 요청성 문구");
  }

  if (normalizeText_(helpedByFriend)) {
    score += 1;
    notes.push("최근 도움 받은 기록");
  }

  if (score < rules.supportScoreThreshold) {
    return {
      response: {
        student: buildStudentReference_(row, sourceConfig.headers),
        mood: getRowValue_(row, sourceConfig.headers.mood),
        emotionLabel: moodLabel,
        moodReason: moodReason,
        goal: getRowValue_(row, sourceConfig.headers.goal),
        yesterdayAchievement: getRowValue_(row, sourceConfig.headers.yesterdayAchievement),
        goalLabel: achievementLabel,
        teacherMessage: teacherMessage,
        helpedFriend: helpedFriend,
        helpedByFriend: helpedByFriend,
        teacherNote: notes.join(", "),
      },
      supportStudent: null,
      praiseCandidate: buildPraiseCandidate_(row, sourceConfig, rules),
    };
  }

  const response = {
    student: buildStudentReference_(row, sourceConfig.headers),
    mood: getRowValue_(row, sourceConfig.headers.mood),
    emotionLabel: moodLabel,
    moodReason: moodReason,
    goal: getRowValue_(row, sourceConfig.headers.goal),
    yesterdayAchievement: getRowValue_(row, sourceConfig.headers.yesterdayAchievement),
    goalLabel: achievementLabel,
    teacherMessage: teacherMessage,
    helpedFriend: helpedFriend,
    helpedByFriend: helpedByFriend,
    teacherNote: notes.join(", "),
  };

  return {
    response: response,
    supportStudent: {
      student: response.student,
      mood: moodLabel,
      reason: firstNonEmpty_(moodReason, teacherMessage, helpedByFriend),
      goal: response.goal,
      yesterdayAchievement: achievementLabel,
      teacherNote: response.teacherNote,
    },
    praiseCandidate: buildPraiseCandidate_(row, sourceConfig, rules),
  };
}

function buildPraiseCandidate_(row, sourceConfig, rules) {
  const helpedFriend = getRowValue_(row, sourceConfig.headers.helpedFriend);
  if (normalizeText_(helpedFriend).length < rules.praiseMinLength) {
    return null;
  }

  return {
    student: buildStudentReference_(row, sourceConfig.headers),
    reason: helpedFriend,
    mentionedPeer: extractPeerName_(helpedFriend),
  };
}

function analyzeLessonRow_(row, headers, rules) {
  const correctCount = toNumber_(getRowValue_(row, headers.correctCount));
  const incorrectCount = toNumber_(getRowValue_(row, headers.incorrectCount));
  const incorrectReason = getRowValue_(row, headers.incorrectReason);
  const teacherMessage = getRowValue_(row, headers.teacherMessage);
  const lessonUnit = getRowValue_(row, headers.lessonUnit);
  const assignmentLabel = classifyBucketLabel_(
    getRowValue_(row, headers.assignmentStatus),
    rules.assignmentBuckets,
    "미분류",
  );
  const lowConcepts = [];
  const conceptResponses = [];
  const notes = [];
  let score = 0;

  [
    {
      concept: getRowValue_(row, headers.concept1),
      understanding: getRowValue_(row, headers.concept1Understanding),
    },
    {
      concept: getRowValue_(row, headers.concept2),
      understanding: getRowValue_(row, headers.concept2Understanding),
    },
  ].forEach(function (entry) {
    const understandingLabel = scoreToUnderstandingLabel_(
      classifyUnderstandingScore_(entry.understanding, rules.understandingBuckets),
      rules.understandingBuckets,
    );

    if (entry.concept || entry.understanding) {
      conceptResponses.push({
        concept: entry.concept,
        understanding: entry.understanding,
        understandingLabel: understandingLabel,
      });
    }

    if (entry.concept && understandingLabel === "낮음") {
      lowConcepts.push(entry.concept);
      score += 1;
      notes.push("개념 이해 낮음");
    }
  });

  if (incorrectCount >= rules.incorrectThreshold) {
    score += 2;
    notes.push("오답 수 높음");
  } else if (incorrectCount > 0) {
    score += 1;
    notes.push("오답 발생");
  }

  if (assignmentLabel === "미완료") {
    score += 2;
    notes.push("과제 미완료");
  } else if (assignmentLabel === "부분 완료") {
    score += 1;
    notes.push("과제 부분 완료");
  }

  if (containsAnyKeyword_(incorrectReason + " " + teacherMessage, rules.messageKeywords)) {
    score += 1;
    notes.push("추가 설명 필요 문구");
  }

  const misconception = lowConcepts.length > 0
    ? lowConcepts.join(", ")
    : shortenText_(incorrectReason, 50) || "미분류";
  let followUp = "미확인";

  if (score >= rules.supportScoreThreshold) {
    followUp = "보충 설명 필요";
  } else if (
    correctCount >= rules.excellentCorrectThreshold
    && assignmentLabel === "완료"
    && incorrectCount <= 1
  ) {
    followUp = "심화 가능";
  } else if (incorrectCount > 0) {
    followUp = "오답 원인 확인";
  }

  return {
    score: score,
    correctCount: correctCount,
    incorrectCount: incorrectCount,
    assignmentLabel: assignmentLabel,
    studentResponse: {
      student: buildStudentReference_(row, headers),
      lessonUnit: lessonUnit,
      correctCount: correctCount,
      incorrectCount: incorrectCount,
      assignmentStatus: assignmentLabel,
      incorrectReason: incorrectReason,
      teacherMessage: teacherMessage,
      misconception: misconception,
      followUp: followUp,
      teacherNote: notes.join(", "),
      concepts: conceptResponses,
    },
    supportStudent: {
      student: buildStudentReference_(row, headers),
      correctCount: correctCount,
      incorrectCount: incorrectCount,
      misconception: misconception,
      assignmentStatus: assignmentLabel,
      teacherNote: notes.join(", "),
    },
    studentResult: {
      student: buildStudentReference_(row, headers),
      correctCount: correctCount,
      incorrectCount: incorrectCount,
      assignmentStatus: assignmentLabel,
      followUp: followUp,
    },
  };
}

function buildConceptStats_(rows, headers, rules) {
  const stats = {};

  rows.forEach(function (row) {
    [
      {
        concept: getRowValue_(row, headers.concept1),
        understanding: getRowValue_(row, headers.concept1Understanding),
      },
      {
        concept: getRowValue_(row, headers.concept2),
        understanding: getRowValue_(row, headers.concept2Understanding),
      },
    ].forEach(function (entry) {
      const concept = normalizeText_(entry.concept);
      if (!concept) {
        return;
      }

      if (!stats[concept]) {
        stats[concept] = {
          responses: 0,
          scoreTotal: 0,
          lowCount: 0,
        };
      }

      const score = classifyUnderstandingScore_(
        entry.understanding,
        rules.understandingBuckets,
      );

      stats[concept].responses += 1;
      stats[concept].scoreTotal += score;
      if (score <= 1) {
        stats[concept].lowCount += 1;
      }
    });
  });

  return stats;
}

function buildBucketSummary_(labels, buckets, otherLabel, otherNote) {
  const counts = {};

  buckets.forEach(function (bucket) {
    counts[bucket.label] = 0;
  });
  counts[otherLabel] = 0;

  labels.forEach(function (label) {
    const key = counts.hasOwnProperty(label) ? label : otherLabel;
    counts[key] += 1;
  });

  const summary = buckets.map(function (bucket) {
    return {
      label: bucket.label,
      count: counts[bucket.label] || 0,
      note: bucket.note || "",
    };
  });

  if (counts[otherLabel] > 0 || labels.length === 0) {
    summary.push({
      label: otherLabel,
      count: counts[otherLabel] || 0,
      note: otherNote,
    });
  }

  return summary;
}

function buildAssignmentCompletionLabel_(assignmentSummary) {
  if (assignmentSummary.length === 0) {
    return "미분류";
  }

  return assignmentSummary
    .map(function (item) {
      return item.label + " " + item.count + "명";
    })
    .join(" / ");
}

function buildLessonGroupKey_(row, headers) {
  const dateLabel = getExplicitDateLabel_(row, headers.date)
    || formatDateOnly_(getRowDate_(row, headers.timestamp));
  const period = getRowValue_(row, headers.period);
  const subject = getRowValue_(row, headers.subject);
  return [dateLabel, period, subject].join("|");
}

function buildClassDateGroupKey_(row, timestampHeader) {
  return formatDateOnly_(getRowDate_(row, timestampHeader));
}

function buildLessonPeriodLabel_(row, headers) {
  const dateLabel = getExplicitDateLabel_(row, headers.date)
    || formatDateOnly_(getRowDate_(row, headers.timestamp));
  const period = getRowValue_(row, headers.period);
  const lessonUnit = getRowValue_(row, headers.lessonUnit);
  return [dateLabel, period, lessonUnit].filter(Boolean).join(" / ");
}

function buildStudentKey_(row, headers) {
  const explicitStudentKey = headers.studentKey
    ? normalizeText_(getRowValue_(row, headers.studentKey))
    : "";

  if (explicitStudentKey) {
    return explicitStudentKey;
  }

  const email = headers.email
    ? normalizeEmail_(getRowValue_(row, headers.email))
    : "";

  if (email) {
    return buildOpaqueEmailStudentKey_(email);
  }

  const fallbackKey = [
    getRowValue_(row, headers.classroom),
    getRowValue_(row, headers.number),
    getRowValue_(row, headers.name),
  ].join("|");

  return normalizeText_(fallbackKey) ? fallbackKey : "student|unknown";
}

function buildStudentReference_(row, headers) {
  return {
    classroom: getRowValue_(row, headers.classroom),
    number: getRowValue_(row, headers.number),
    name: getRowValue_(row, headers.name),
  };
}

function normalizeStarRules_(rules) {
  return (rules || []).map(function (rule) {
    const ruleId = String(rule.ruleId || rule.id || "").trim();
    return {
      ruleId: ruleId,
      label: String(rule.label || "").trim(),
      category: rule.category || "custom",
      delta: Number(rule.delta || 0),
      visibility: rule.visibility === "teacher" ? "teacher" : "student",
      description: String(rule.description || "").trim(),
      enabled: rule.enabled !== false && rule.active !== false,
      sources: normalizeStarRuleSources_(rule.sources, getDefaultStarRuleSources_(ruleId)),
      allowCustomDelta: rule.allowCustomDelta === true,
      autoCriteria: normalizeStarAutoCriteria_(rule.autoCriteria, getDefaultStarRuleAutoCriteria_(ruleId)),
    };
  }).filter(function (rule) {
    return rule.ruleId && rule.label;
  });
}

function normalizeStarRuleSources_(sources, fallback) {
  if (!Array.isArray(sources)) {
    return fallback.slice();
  }

  const normalized = sources
    .map(function (source) {
      return normalizeStarEventSource_(source);
    })
    .filter(function (source, index, array) {
      return array.indexOf(source) === index;
    });

  return normalized.length > 0 ? normalized : fallback.slice();
}

function normalizeStarAutoCriteria_(criteria, fallback) {
  const base = criteria && typeof criteria === "object"
    ? criteria
    : fallback && typeof fallback === "object"
      ? fallback
      : null;

  if (!base) {
    return null;
  }

  const assignmentStatusIn = Array.isArray(base.assignmentStatusIn)
    ? base.assignmentStatusIn
        .map(function (label) {
          return String(label || "").trim();
        })
        .filter(function (label) {
          return label;
        })
    : [];
  const minimumCorrectCount = typeof base.minimumCorrectCount === "number"
    ? base.minimumCorrectCount
    : null;
  const maximumIncorrectCount = typeof base.maximumIncorrectCount === "number"
    ? base.maximumIncorrectCount
    : null;

  if (
    assignmentStatusIn.length === 0
    && minimumCorrectCount === null
    && maximumIncorrectCount === null
  ) {
    return null;
  }

  return {
    assignmentStatusIn: assignmentStatusIn,
    minimumCorrectCount: minimumCorrectCount,
    maximumIncorrectCount: maximumIncorrectCount,
  };
}

function normalizeStarEventSource_(value) {
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

function getDefaultStarRuleSources_(ruleId) {
  switch (ruleId) {
    case "arrival":
    case "attendance-check":
      return ["class-form"];
    case "lesson-submit":
    case "assignment-complete":
    case "no-incorrect":
      return ["lesson-form"];
    case "manual-praise":
    case "teacher-adjustment":
      return ["manual"];
    default:
      return ["manual"];
  }
}

function getDefaultStarRuleAutoCriteria_(ruleId) {
  switch (ruleId) {
    case "assignment-complete":
      return {
        assignmentStatusIn: ["완료"],
        minimumCorrectCount: null,
        maximumIncorrectCount: null,
      };
    case "no-incorrect":
      return {
        assignmentStatusIn: ["완료"],
        minimumCorrectCount: 1,
        maximumIncorrectCount: 0,
      };
    default:
      return null;
  }
}

function isStarRuleEnabledForSource_(rule, source) {
  return !!(
    rule
    && rule.enabled
    && Array.isArray(rule.sources)
    && rule.sources.indexOf(source) !== -1
  );
}

function pushStarEventIfActive_(events, event) {
  if (event) {
    events.push(event);
  }
}

function appendAutomaticStarEventsForSource_(events, eventIds, rows, headers, rules, source) {
  rows.forEach(function (row) {
    buildAutomaticStarEventsForRow_(row, headers, rules, source).forEach(function (event) {
      if (!event || eventIds[event.id]) {
        return;
      }

      eventIds[event.id] = true;
      events.push(event);
    });
  });
}

function buildAutomaticStarEventsForRow_(row, headers, rules, source) {
  return (rules || [])
    .filter(function (rule) {
      return isStarRuleEnabledForSource_(rule, source) && hasAutomaticStarSource_(rule.sources);
    })
    .filter(function (rule) {
      return matchesAutomaticStarRule_(row, headers, rule, source);
    })
    .map(function (rule) {
      return buildAutomaticStarEvent_(row, headers, rule, source);
    })
    .filter(function (event) {
      return !!event;
    });
}

function buildAutomaticStarEvent_(row, headers, rule, source) {
  const studentKey = buildStudentKey_(row, headers);
  const occurredAt = buildEventOccurredAt_(row, headers);
  const groupKey = buildEventGroupKey_(row, headers, source);

  if (!studentKey || studentKey === "student|unknown" || !occurredAt || !groupKey) {
    return null;
  }


  return {
    id: [source, rule.ruleId, groupKey, studentKey].join("|"),
    studentKey: studentKey,
    student: buildStudentReference_(row, headers),
    ruleId: rule.ruleId,
    category: rule.category,
    delta: rule.delta,
    visibility: rule.visibility,
    source: source,
    occurredAt: occurredAt,
    note: rule.description || "자동 적립",
    actor: "",
    batchId: "",
  };
}

function matchesAutomaticStarRule_(row, headers, rule, source) {
  if (!rule || !hasAutomaticStarSource_(rule.sources)) {
    return false;
  }

  const criteria = rule.autoCriteria;
  if (!criteria) {
    return true;
  }

  if (criteria.assignmentStatusIn.length > 0) {
    if (!headers.assignmentStatus) {
      return false;
    }

    const assignmentLabel = classifyBucketLabel_(
      getRowValue_(row, headers.assignmentStatus),
      CLASSPAGE_AUTOMATION_CONFIG.rules.lessonSummary.assignmentBuckets,
      "미분류",
    );
    if (criteria.assignmentStatusIn.indexOf(assignmentLabel) === -1) {
      return false;
    }
  }

  if (criteria.minimumCorrectCount !== null) {
    if (!headers.correctCount) {
      return false;
    }

    if (toNumber_(getRowValue_(row, headers.correctCount)) < criteria.minimumCorrectCount) {
      return false;
    }
  }

  if (criteria.maximumIncorrectCount !== null) {
    if (!headers.incorrectCount) {
      return false;
    }

    if (toNumber_(getRowValue_(row, headers.incorrectCount)) > criteria.maximumIncorrectCount) {
      return false;
    }
  }

  return true;
}

function buildManualStarEvent_(row, headers, rules) {
  const requestedRuleId = getRowValue_(row, headers.ruleId) || "teacher-adjustment";
  const rule = findStarRule_(rules, requestedRuleId) || findStarRule_(rules, "teacher-adjustment");
  if (!isStarRuleEnabledForSource_(rule, "manual")) {
    return null;
  }

  const rawDelta = headers.delta ? getRowValue_(row, headers.delta) : "";
  const rawVisibility = headers.visibility ? normalizeText_(getRowValue_(row, headers.visibility)) : "";
  const note = headers.note ? getRowValue_(row, headers.note) : "";
  const actor = headers.teacher ? getRowValue_(row, headers.teacher) : "";
  const batchId = headers.batchId ? getRowValue_(row, headers.batchId) : "";
  const studentKey = buildStudentKey_(row, headers);
  const occurredAt = buildEventOccurredAt_(row, headers);
  const delta = rawDelta && rule.allowCustomDelta ? toNumber_(rawDelta) : rule.delta;

  if (!studentKey || studentKey === "student|unknown" || !occurredAt) {
    return null;
  }

  return {
    id: ["manual", rule.ruleId, batchId || toIsoString_(getComparableRowDate_(row, headers)), studentKey].join("|"),
    studentKey: studentKey,
    student: buildStudentReference_(row, headers),
    ruleId: rule.ruleId,
    category: rule.category,
    delta: delta,
    visibility: rawVisibility === "teacher" ? "teacher" : rule.visibility,
    source: "manual",
    occurredAt: occurredAt,
    note: note || rule.description || "수동 조정",
    actor: actor,
    batchId: batchId,
  };
}

function buildStarEventSourceSummary_(events) {
  const summary = {
    manual: 0,
    "class-form": 0,
    "lesson-form": 0,
    system: 0,
  };

  events.forEach(function (event) {
    const source = normalizeStarEventSource_(event.source);
    summary[source] += 1;
  });

  return summary;
}

function buildStarStudentTotals_(events) {
  const totalsByStudent = {};

  events.forEach(function (event) {
    if (!totalsByStudent[event.studentKey]) {
      totalsByStudent[event.studentKey] = {
        studentKey: event.studentKey,
        student: event.student,
        total: 0,
        visibleTotal: 0,
        hiddenAdjustmentTotal: 0,
        eventCount: 0,
      };
    }

    const total = totalsByStudent[event.studentKey];
    total.total += event.delta;
    total.eventCount += 1;

    if (event.visibility === "teacher") {
      total.hiddenAdjustmentTotal += event.delta;
    } else {
      total.visibleTotal += event.delta;
    }

    if (!normalizeText_(total.student.name) && normalizeText_(event.student.name)) {
      total.student = event.student;
    }
  });

  return Object.keys(totalsByStudent)
    .map(function (key) {
      return totalsByStudent[key];
    })
    .sort(function (left, right) {
      if (right.visibleTotal !== left.visibleTotal) {
        return right.visibleTotal - left.visibleTotal;
      }
      if (right.total !== left.total) {
        return right.total - left.total;
      }
      return right.eventCount - left.eventCount;
    });
}

function sortStarEvents_(events) {
  return events.slice().sort(function (left, right) {
    const rightDate = parseDateValue_(right.occurredAt);
    const leftDate = parseDateValue_(left.occurredAt);
    const rightTime = rightDate ? rightDate.getTime() : 0;
    const leftTime = leftDate ? leftDate.getTime() : 0;
    return rightTime - leftTime;
  });
}

function buildStarPeriodLabel_(events) {
  if (events.length === 0) {
    return "이벤트 없음";
  }

  const dates = events
    .map(function (event) {
      return parseDateValue_(event.occurredAt);
    })
    .filter(function (date) {
      return isValidDate_(date);
    });

  if (dates.length === 0) {
    return "날짜 미확인";
  }

  const sortedDates = dates.slice().sort(function (left, right) {
    return left.getTime() - right.getTime();
  });
  const startLabel = formatDateOnly_(sortedDates[0]);
  const endLabel = formatDateOnly_(sortedDates[sortedDates.length - 1]);

  return startLabel === endLabel ? startLabel : startLabel + " ~ " + endLabel;
}

function buildEventOccurredAt_(row, headers) {
  const date = getComparableRowDate_(row, headers);
  return isValidDate_(date) ? toIsoString_(date) : "";
}

function buildEventGroupKey_(row, headers, source) {
  if (source === "lesson-form") {
    return buildLessonGroupKey_(row, headers);
  }

  return buildClassDateGroupKey_(row, headers.timestamp);
}

function findStarRule_(rules, ruleId) {
  return (rules || []).find(function (rule) {
    return rule.ruleId === ruleId;
  }) || null;
}

function classifyBucketLabel_(text, buckets, fallbackLabel) {
  const normalized = normalizeText_(text);
  for (let index = 0; index < buckets.length; index += 1) {
    const bucket = buckets[index];
    if (containsAnyKeyword_(normalized, bucket.keywords)) {
      return bucket.label;
    }
  }

  return fallbackLabel;
}

function classifyUnderstandingScore_(text, buckets) {
  const normalized = normalizeText_(text);

  for (let index = 0; index < buckets.length; index += 1) {
    const bucket = buckets[index];
    if (containsAnyKeyword_(normalized, bucket.keywords)) {
      return bucket.score;
    }
  }

  return 2;
}

function scoreToUnderstandingLabel_(score, buckets) {
  const rounded = Math.round(score);
  const bucket = buckets.find(function (item) {
    return item.score === rounded;
  });
  return bucket ? bucket.label : "미분류";
}

function getMostCommonValue_(rows, header) {
  const counts = {};
  let bestLabel = "";
  let bestCount = 0;

  rows.forEach(function (row) {
    const label = getRowValue_(row, header);
    if (!label) {
      return;
    }

    counts[label] = (counts[label] || 0) + 1;
    if (counts[label] > bestCount) {
      bestLabel = label;
      bestCount = counts[label];
    }
  });

  return bestLabel;
}

function getComparableRowDate_(row, headers) {
  if (headers.date) {
    const explicitDate = parseDateValue_(getRowValue_(row, headers.date));
    if (explicitDate) {
      return explicitDate;
    }
  }

  return getRowDate_(row, headers.timestamp) || new Date(0);
}

function getRowDate_(row, headerName) {
  if (!headerName) {
    return null;
  }

  const value = row[headerName];
  if (value instanceof Date) {
    return isValidDate_(value) ? value : null;
  }

  const parsed = parseDateValue_(value);
  return parsed || null;
}

function getExplicitDateLabel_(row, headerName) {
  if (!headerName) {
    return "";
  }

  const raw = getRowValue_(row, headerName);
  const parsed = parseDateValue_(raw);
  if (parsed) {
    return formatDateOnly_(parsed);
  }

  return String(raw || "").trim();
}

function getRowValue_(row, headerName) {
  if (!headerName) {
    return "";
  }

  const value = row[headerName];
  if (value instanceof Date) {
    return formatDateOnly_(value);
  }

  return String(value == null ? "" : value).trim();
}

function parseDateValue_(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function isValidDate_(value) {
  return value instanceof Date && !Number.isNaN(value.getTime()) && value.getTime() > 0;
}

function toNumber_(value) {
  const numeric = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function calculateAverage_(values) {
  if (values.length === 0) {
    return 0;
  }

  const sum = values.reduce(function (total, value) {
    return total + value;
  }, 0);
  return sum / values.length;
}

function roundToOneDecimal_(value) {
  return Math.round(value * 10) / 10;
}

function containsAnyKeyword_(text, keywords) {
  const normalized = normalizeText_(text);
  return keywords.some(function (keyword) {
    return normalized.indexOf(normalizeText_(keyword)) !== -1;
  });
}

function normalizeText_(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeEmail_(value) {
  return normalizeText_(value);
}

function buildOpaqueEmailStudentKey_(email) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    email,
    Utilities.Charset.UTF_8,
  );
  const hex = digest.map(function (value) {
    const normalized = value < 0 ? value + 256 : value;
    const pair = normalized.toString(16);
    return pair.length === 1 ? "0" + pair : pair;
  }).join("");

  return "email-sha256|" + hex.slice(0, 24);
}

function isAllowlistRowActive_(value) {
  if (value === true) {
    return true;
  }

  if (value === false) {
    return false;
  }

  const normalized = normalizeText_(value);
  if (!normalized) {
    return true;
  }

  return [
    "0",
    "false",
    "n",
    "no",
    "제외",
    "비활성",
    "사용안함",
    "사용 안 함",
  ].indexOf(normalized) === -1;
}

function firstNonEmpty_() {
  for (let index = 0; index < arguments.length; index += 1) {
    const value = normalizeText_(arguments[index]);
    if (value) {
      return String(arguments[index]).trim();
    }
  }

  return "";
}

function extractPeerName_(text) {
  const raw = String(text || "").trim();
  if (!raw) {
    return "";
  }

  const delimiters = [":", "-", "/", ",", "(", " "];
  for (let index = 0; index < delimiters.length; index += 1) {
    const delimiter = delimiters[index];
    const parts = raw.split(delimiter);
    if (parts.length > 1) {
      const candidate = parts[0].trim();
      if (candidate.length >= 2 && candidate.length <= 8) {
        return candidate;
      }
    }
  }

  return "";
}

function shortenText_(text, limit) {
  const raw = String(text || "").trim();
  if (raw.length <= limit) {
    return raw;
  }

  return raw.slice(0, limit) + "...";
}

function formatDateOnly_(date) {
  if (!isValidDate_(date)) {
    return "날짜 미확인";
  }

  return Utilities.formatDate(
    date,
    CLASSPAGE_AUTOMATION_CONFIG.timezone,
    "yyyy-MM-dd",
  );
}

function toIsoString_(date) {
  const raw = Utilities.formatDate(
    date,
    CLASSPAGE_AUTOMATION_CONFIG.timezone,
    "yyyy-MM-dd'T'HH:mm:ssZ",
  );
  return raw.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
}
