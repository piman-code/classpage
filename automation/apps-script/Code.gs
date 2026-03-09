function refreshAllSummaries() {
  const classSummary = buildClassSummary_();
  const lessonSummary = buildLessonSummary_();

  writeSummaryFileIfConfigured_(
    CLASSPAGE_AUTOMATION_CONFIG.output.classFileName,
    classSummary,
  );
  writeSummaryFileIfConfigured_(
    CLASSPAGE_AUTOMATION_CONFIG.output.lessonFileName,
    lessonSummary,
  );

  return {
    classSummary: classSummary,
    lessonSummary: lessonSummary,
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

function validateAutomationSetup() {
  const report = {
    classSheet: validateSheet_(
      CLASSPAGE_AUTOMATION_CONFIG.sources.classForm,
      ["timestamp", "email", "classroom", "number", "name"],
    ),
    lessonSheet: validateSheet_(
      CLASSPAGE_AUTOMATION_CONFIG.sources.lessonForm,
      ["timestamp", "email", "classroom", "number", "name", "subject", "period"],
    ),
    allowlistSheet: validateSheet_(
      CLASSPAGE_AUTOMATION_CONFIG.sources.allowlist,
      ["email", "classroom", "number", "name"],
    ),
    outputFolder: validateOutputFolder_(),
  };

  if (report.allowlistSheet.ok) {
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
  } else {
    payload = {
      classSummary: buildClassSummary_(),
      lessonSummary: buildLessonSummary_(),
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

  const emotionLabels = latestRows.map(function (row) {
    return classifyBucketLabel_(
      getRowValue_(row, sourceConfig.headers.mood),
      rules.emotionBuckets,
      "기타",
    );
  });

  const goalLabels = latestRows.map(function (row) {
    return classifyBucketLabel_(
      getRowValue_(row, sourceConfig.headers.yesterdayAchievement),
      rules.goalBuckets,
      "기타",
    );
  });

  const supportStudents = latestRows
    .map(function (row) {
      return buildClassSupportStudent_(row, sourceConfig, rules);
    })
    .filter(function (item) {
      return item !== null;
    });

  const praiseCandidates = latestRows
    .map(function (row) {
      return buildPraiseCandidate_(row, sourceConfig, rules);
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
      aggregatorNote: "Apps Script가 학급용 응답 시트와 허가 학생 명단 시트를 이메일로 대조한 뒤 정서/목표/도움 필요/칭찬 후보를 규칙 기반으로 집계",
    },
    emotionSummary: buildBucketSummary_(emotionLabels, rules.emotionBuckets, "기타", "분류되지 않은 응답"),
    goalSummary: buildBucketSummary_(goalLabels, rules.goalBuckets, "기타", "분류되지 않은 응답"),
    supportStudents: supportStudents,
    praiseCandidates: praiseCandidates,
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
    "기타",
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
      aggregatorNote: "Apps Script가 수업용 응답 시트와 허가 학생 명단 시트를 이메일로 대조한 뒤 개념 난도/정오답/과제/보충 필요 학생을 규칙 기반으로 집계",
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
    byEmail: byEmail,
    allowedCount: Object.keys(byEmail).length,
  };
}

function filterRowsByAllowlist_(rows, responseHeaders, allowlist) {
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

function filterRowsForLatestDate_(rows, timestampHeader) {
  if (rows.length === 0) {
    return [];
  }

  const latestDate = rows
    .map(function (row) {
      return getRowDate_(row, timestampHeader);
    })
    .sort(function (left, right) {
      return right.getTime() - left.getTime();
    })[0];
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

function buildClassSupportStudent_(row, sourceConfig, rules) {
  const moodLabel = classifyBucketLabel_(
    getRowValue_(row, sourceConfig.headers.mood),
    rules.emotionBuckets,
    "기타",
  );
  const achievementLabel = classifyBucketLabel_(
    getRowValue_(row, sourceConfig.headers.yesterdayAchievement),
    rules.goalBuckets,
    "기타",
  );
  const moodReason = getRowValue_(row, sourceConfig.headers.moodReason);
  const teacherMessage = getRowValue_(row, sourceConfig.headers.teacherMessage);
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
    return null;
  }

  return {
    student: buildStudentReference_(row, sourceConfig.headers),
    mood: moodLabel,
    reason: firstNonEmpty_(moodReason, teacherMessage, helpedByFriend),
    goal: getRowValue_(row, sourceConfig.headers.goal),
    yesterdayAchievement: achievementLabel,
    teacherNote: notes.join(", "),
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
  const assignmentLabel = classifyBucketLabel_(
    getRowValue_(row, headers.assignmentStatus),
    rules.assignmentBuckets,
    "기타",
  );
  const lowConcepts = [];
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
    const label = scoreToUnderstandingLabel_(
      classifyUnderstandingScore_(entry.understanding, rules.understandingBuckets),
      rules.understandingBuckets,
    );

    if (entry.concept && label === "낮음") {
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
    : shortenText_(incorrectReason, 50);
  let followUp = "";

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
    return "응답 없음";
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

function buildLessonPeriodLabel_(row, headers) {
  const dateLabel = getExplicitDateLabel_(row, headers.date)
    || formatDateOnly_(getRowDate_(row, headers.timestamp));
  const period = getRowValue_(row, headers.period);
  const lessonUnit = getRowValue_(row, headers.lessonUnit);
  return [dateLabel, period, lessonUnit].filter(Boolean).join(" / ");
}

function buildStudentKey_(row, headers) {
  const email = headers.email
    ? normalizeEmail_(getRowValue_(row, headers.email))
    : "";

  if (email) {
    return "email|" + email;
  }

  return [
    getRowValue_(row, headers.classroom),
    getRowValue_(row, headers.number),
    getRowValue_(row, headers.name),
  ].join("|");
}

function buildStudentReference_(row, headers) {
  return {
    classroom: getRowValue_(row, headers.classroom),
    number: getRowValue_(row, headers.number),
    name: getRowValue_(row, headers.name),
  };
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
  return bucket ? bucket.label : "보통";
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

  return getRowDate_(row, headers.timestamp);
}

function getRowDate_(row, headerName) {
  const value = row[headerName];
  if (value instanceof Date) {
    return value;
  }

  const parsed = parseDateValue_(value);
  return parsed || new Date(0);
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

  return normalizeText_(raw);
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
