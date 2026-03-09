const CLASSPAGE_AUTOMATION_CONFIG = {
  timezone: "Asia/Seoul",
  output: {
    driveFolderId: "",
    classFileName: "class-summary.json",
    lessonFileName: "lesson-summary.json",
  },
  sources: {
    classForm: {
      spreadsheetId: "",
      sheetName: "학급용 응답",
      formName: "학급용 Google Form",
      formUrl:
        "https://docs.google.com/forms/d/e/1FAIpQLSeBR_cBQFf_CXo6ytCabIMfvStXn_QPSYadonYLKNR6WAT2bg/viewform?usp=header",
      headers: {
        timestamp: "타임스탬프",
        email: "이메일 주소",
        classroom: "반",
        number: "번호",
        name: "이름",
        mood: "오늘 아침 기분",
        moodReason: "기분의 이유",
        goal: "오늘의 목표",
        yesterdayAchievement: "어제 할일 달성도",
        teacherMessage: "선생님께 하고 싶은 말",
        helpedFriend: "최근 도움을 준 친구와 그 이유",
        helpedByFriend: "최근 도움 받은 친구와 그 이유",
      },
    },
    lessonForm: {
      spreadsheetId: "",
      sheetName: "수업용 응답",
      formName: "수업용 Google Form",
      formUrl:
        "https://docs.google.com/forms/d/e/1FAIpQLSefjZ3vyJs6T5PkkrUQDo2JY1wNh8cHPdeieRWRFVsMzu-_NA/viewform?usp=header",
      headers: {
        timestamp: "타임스탬프",
        email: "이메일 주소",
        classroom: "반",
        number: "번호",
        name: "이름",
        subject: "과목",
        date: "날짜",
        period: "교시",
        lessonUnit: "오늘 배운 단원",
        concept1: "개념 1",
        concept1Understanding: "개념1 이해 정도",
        concept2: "개념 2",
        concept2Understanding: "개념2 이해 정도",
        correctCount: "문제 맞은 개수",
        incorrectCount: "틀린 개수",
        incorrectReason: "틀린 이유",
        teacherMessage: "선생님께 하고 싶은 말",
        assignmentStatus: "과제 수행 정도",
      },
    },
    allowlist: {
      spreadsheetId: "",
      sheetName: "허가 학생 명단",
      headers: {
        email: "이메일 주소",
        classroom: "반",
        number: "번호",
        name: "이름",
        active: "허가",
      },
    },
  },
  rules: {
    classSummary: {
      emotionBuckets: [
        {
          label: "안정",
          note: "좋음/괜찮음/보통 계열 응답",
          keywords: ["좋", "행복", "기쁨", "편안", "보통", "괜찮", "평온"],
        },
        {
          label: "피곤함",
          note: "피곤함/졸림/지침 계열 응답",
          keywords: ["피곤", "졸", "지침", "힘듦", "지쳤"],
        },
        {
          label: "불안",
          note: "불안/걱정/슬픔/짜증 계열 응답",
          keywords: ["불안", "걱정", "긴장", "슬픔", "우울", "짜증", "화남", "무기력"],
        },
      ],
      goalBuckets: [
        {
          label: "달성",
          note: "달성/완료/100% 계열 응답",
          keywords: ["달성", "완료", "다 함", "100", "전부", "높음"],
        },
        {
          label: "부분 달성",
          note: "부분 달성/절반/보통 계열 응답",
          keywords: ["부분", "절반", "반", "조금", "보통", "중간"],
        },
        {
          label: "미달",
          note: "미달/못함/낮음 계열 응답",
          keywords: ["미달", "못", "안 함", "낮음", "0", "거의 못"],
        },
      ],
      supportScoreThreshold: 2,
      attentionEmotionLabels: ["피곤함", "불안"],
      lowAchievementLabels: ["부분 달성", "미달"],
      helpKeywords: [
        "도움",
        "걱정",
        "불안",
        "힘들",
        "어려",
        "모르겠",
        "아프",
        "싸움",
        "갈등",
      ],
      praiseMinLength: 4,
    },
    lessonSummary: {
      understandingBuckets: [
        {
          label: "낮음",
          score: 1,
          keywords: ["1", "낮", "어려", "헷갈", "모르겠", "힘들"],
        },
        {
          label: "보통",
          score: 2,
          keywords: ["2", "보통", "절반", "조금"],
        },
        {
          label: "높음",
          score: 3,
          keywords: ["3", "높", "잘", "충분", "이해", "괜찮"],
        },
      ],
      assignmentBuckets: [
        {
          label: "완료",
          note: "완료/다 함/높음 계열 응답",
          keywords: ["완료", "다 함", "충분", "높음"],
        },
        {
          label: "부분 완료",
          note: "부분 완료/조금 함 계열 응답",
          keywords: ["부분", "조금", "절반", "중간"],
        },
        {
          label: "미완료",
          note: "미완료/못함/낮음 계열 응답",
          keywords: ["미완료", "못", "안 함", "낮음", "0"],
        },
      ],
      supportScoreThreshold: 3,
      incorrectThreshold: 3,
      messageKeywords: ["헷갈", "모르겠", "어려", "실수", "계산", "용어"],
      excellentCorrectThreshold: 7,
    },
  },
};
