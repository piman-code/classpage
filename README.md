# classpage

`classpage`는 교실 운영에 필요한 최소 기능만 제공하는 Obsidian 플러그인입니다.  
복잡한 범용 홈페이지 대신, 오늘의 할 일과 공지사항, 그리고 Google Form 이동 버튼 두 개를 안정적으로 보여주는 데 집중합니다.

## 목적

- 오늘의 할 일 표시
- 공지사항 표시
- 학급용 Google Form 버튼
- 수업용 Google Form 버튼
- 교실 운영 흐름인 `Google Form 제출 -> 트리거 -> Obsidian 반영`을 가볍게 지원할 수 있는 출발점 제공

## 왜 homepage와 분리했는가

기존 `homepage` 플러그인은 기능이 많아지면서 교실 운영용 핵심 흐름보다 범용 홈페이지 성격이 강해졌습니다.  
`classpage`는 그 반대 방향을 택합니다.

- 목적을 교실 운영으로 한정합니다.
- 첫 버전에서는 최소 화면과 최소 설정만 제공합니다.
- 과한 일반화, 복잡한 상태 관리, 큰 구조를 의도적으로 넣지 않습니다.

## 현재 MVP 기능

- `오늘의 할 일` 섹션
- `공지사항` 섹션
- `학급용 폼` 버튼
- `수업용 폼` 버튼
- 모바일에서도 무리 없는 반응형 레이아웃
- Obsidian 설정 탭에서 자주 바뀌는 문구와 링크 수정 가능

## 설정 방법

플러그인 설치 후 `Settings -> classpage`에서 아래 항목을 수정할 수 있습니다.

- 페이지 제목
- 페이지 설명
- 상태 문구
- 오늘의 할 일 제목 / 내용
- 공지사항 제목 / 내용
- 학급용 폼 제목 / 설명 / 버튼명 / 상태 문구 / 링크
- 수업용 폼 제목 / 설명 / 버튼명 / 상태 문구 / 링크

`오늘의 할 일`과 `공지사항` 내용은 한 줄에 한 항목씩 입력하면 됩니다.

## 설치

### BRAT로 베타 설치

1. Obsidian에서 BRAT 플러그인을 설치하고 활성화합니다.
2. BRAT의 `Add beta plugin`에 저장소 주소 `https://github.com/piman-code/classpage`를 입력합니다.
3. GitHub 릴리스가 준비되어 있다면 `classpage`를 설치할 수 있습니다.
4. 설치 후 Community Plugins에서 `classpage`를 활성화합니다.

BRAT 설치는 GitHub 릴리스의 자산 파일을 사용합니다.  
릴리스에는 아래 파일이 그대로 포함되어 있어야 합니다.

- `manifest.json`
- `main.js`
- `styles.css`

### 수동 설치

아래 파일을 볼트의 `.obsidian/plugins/classpage/` 폴더에 넣으면 됩니다.

- `manifest.json`
- `main.js`
- `styles.css`

파일을 넣은 뒤 Obsidian에서 Community Plugins를 다시 불러오고 `classpage`를 활성화합니다.

## 개발

```bash
npm install
npm run typecheck
npm run build
```

빌드가 끝나면 아래 파일이 저장소 루트에 생성되며, 수동 설치나 GitHub 릴리스 자산으로 사용할 수 있습니다.

- `manifest.json`
- `main.js`
- `styles.css`

## 베타 배포 전 확인

- `manifest.json`의 `version`과 GitHub 릴리스 태그를 동일하게 맞춥니다.
- 릴리스 자산에 `manifest.json`, `main.js`, `styles.css`를 첨부합니다.
- BRAT 설치 후 `교실 페이지 열기`, 설정 저장, Google Form 버튼 동작만 최소 확인합니다.

## 향후 확장 방향

현재는 일부러 가볍게 유지합니다. 이후 필요하면 아래 정도만 점진적으로 붙일 수 있습니다.

- 폼별 제출 시간 안내 강화
- 폼별 상태 표시 개선
- Obsidian 반영용 메타 정보 연결
- 표현 템플릿 정도의 제한된 커스터마이징

첫 버전의 우선순위는 확장성보다 안정성과 단순함입니다.
