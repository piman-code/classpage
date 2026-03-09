# classpage

`classpage`는 교실 운영용 Obsidian 플러그인입니다.  
학생용 화면에서는 오늘의 할 일, 공지사항, Google Form 제출 버튼을 보여주고, 교사용 화면에서는 외부 집계 레이어가 만든 요약 JSON을 읽어 빠르게 판단할 수 있게 합니다.

## 왜 이렇게 구성했는가

`classpage`는 수집, 집계, 표시를 한 곳에 몰아넣지 않습니다.

- 학생용 페이지: 정적 설정과 Google Form 링크만 표시
- 집계 레이어: Google Sheets / Apps Script가 계산 담당
- 교사용 페이지: 집계 JSON만 읽어 요약 표시

이 구조를 택한 이유는 운영자가 아래를 구분할 수 있어야 하기 때문입니다.

- 무엇이 설정값인지
- 무엇이 학생 입력 원본인지
- 무엇이 집계 결과인지
- 어디를 수정해야 화면이 바뀌는지

## 현재 구조 요약

- 학생용 페이지
  오늘의 할 일, 공지사항, 학급용/수업용 Google Form 버튼
- 교사용 페이지
  학급용 집계, 수업용 집계, 집계 연결 상태, 요약 카드와 목록
- 집계 레이어
  Google Form 응답을 Google Sheets에 저장한 뒤 Apps Script 또는 외부 자동화가 JSON 생성
- 표시 레이어
  classpage가 볼트 안 JSON 파일을 읽어 렌더링

자세한 구조 설명은 [docs/OPERATING_MODEL.md](/Users/hangbokee/classpage/docs/OPERATING_MODEL.md) 에 정리했습니다.
집계 자동화 구조는 [docs/AUTOMATION_LAYER.md](/Users/hangbokee/classpage/docs/AUTOMATION_LAYER.md) 에 정리했습니다.
처음 설치하고 직접 따라 할 때는 [docs/BEGINNER_SETUP.md](/Users/hangbokee/classpage/docs/BEGINNER_SETUP.md) 부터 보는 것을 권장합니다.
Drive 자동 갱신 + Mac 자동 복사 운영은 [docs/DRIVE_SYNC_SETUP.md](/Users/hangbokee/classpage/docs/DRIVE_SYNC_SETUP.md) 에 정리했습니다.

## 데이터 흐름

1. 학생이 Google Form을 제출합니다.
2. 응답이 Google Sheets에 저장됩니다.
3. Apps Script 또는 외부 자동화가 교사용 요약 JSON을 생성합니다.
4. JSON 파일이 Obsidian 볼트 안 경로에 저장됩니다.
5. classpage 교사용 화면이 그 JSON만 읽어 표시합니다.

기본 경로는 아래와 같습니다.

- `classpage-data/class-summary.json`
- `classpage-data/lesson-summary.json`

예시 계약 파일은 아래를 참고하면 됩니다.

- [docs/contracts/class-summary.example.json](/Users/hangbokee/classpage/docs/contracts/class-summary.example.json)
- [docs/contracts/lesson-summary.example.json](/Users/hangbokee/classpage/docs/contracts/lesson-summary.example.json)

## 학생용 페이지에서 바뀌는 값

`Settings -> classpage`에서 바로 바꿀 수 있습니다.

- 학생용 페이지 제목 / 설명 / 상태 문구
- 오늘의 할 일 제목 / 내용
- 공지사항 제목 / 내용
- 학급용 폼 링크 / 제목 / 설명 / 버튼 문구 / 안내 문구
- 수업용 폼 링크 / 제목 / 설명 / 버튼 문구 / 안내 문구

이 값들은 모두 정적 설정값입니다.

## 교사용 페이지에서 바뀌는 값

`Settings -> classpage`에서 아래를 바꿀 수 있습니다.

- 교사용 페이지 제목 / 설명 / 상태 문구
- 학급 집계 섹션 제목
- 수업 집계 섹션 제목
- 학급 집계 JSON 경로
- 수업 집계 JSON 경로

중요한 점:

- 교사용 화면의 숫자와 목록은 설정값이 아니라 집계 JSON 결과입니다.
- 집계 로직 자체는 classpage 안에 없습니다.
- 결과를 바꾸려면 Google Sheets / Apps Script / JSON 생성 로직을 수정해야 합니다.

## 설치

### BRAT로 베타 설치

1. Obsidian에서 BRAT 플러그인을 설치하고 활성화합니다.
2. BRAT의 `Add beta plugin`에 저장소 주소 `https://github.com/piman-code/classpage`를 입력합니다.
3. 설치 후 Community Plugins에서 `classpage`를 활성화합니다.

처음 설치한 뒤 실제 설정까지 이어서 진행하려면 [docs/BEGINNER_SETUP.md](/Users/hangbokee/classpage/docs/BEGINNER_SETUP.md) 를 바로 따라가면 됩니다.

BRAT 설치는 GitHub Release 자산을 사용합니다. 릴리스에는 아래 파일이 포함되어 있어야 합니다.

- `manifest.json`
- `main.js`
- `styles.css`

### 수동 설치

아래 파일을 볼트의 `.obsidian/plugins/classpage/` 폴더에 넣으면 됩니다.

- `manifest.json`
- `main.js`
- `styles.css`

## 개발

```bash
npm install
npm run typecheck
npm run build
```

Apps Script 자동화 코드는 [automation/apps-script/Config.gs](/Users/hangbokee/classpage/automation/apps-script/Config.gs) 와 [automation/apps-script/Code.gs](/Users/hangbokee/classpage/automation/apps-script/Code.gs) 에 두었습니다.

## 현재 의도적으로 넣지 않은 것

- Google Form 응답 수집 자체
- classpage 플러그인 내부에서의 Google Sheets 직접 연결 및 집계 로직
- 원문 응답 전체 보기 기능
- 과한 범용화와 복잡한 상태 관리

`classpage`는 보는 화면과 설정을 담당하고, 수집과 계산은 바깥 레이어에 맡기는 것을 기본 원칙으로 합니다.
