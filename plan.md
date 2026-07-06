# 프로젝트 포트폴리오 랜딩 페이지 기획서

## 1. 목표

GitHub Pages에 배포 가능한 정적 포트폴리오 랜딩 페이지를 만든다. 이 페이지의 목적은 개인 서사를 길게 전달하는 것이 아니라, 여러 프로젝트를 보기 좋게 정리하고, 프로젝트를 나중에 쉽게 추가하거나 제거할 수 있는 구조를 갖추는 것이다.

Three.js는 첫 화면과 섹션 전환에 사용하는 시각적 인터랙션 레이어로 활용한다. 페이지의 핵심은 프로젝트 탐색성과 유지보수성이다.

핵심 목표는 다음과 같다.

- 프로젝트 목록을 한눈에 볼 수 있다.
- 프로젝트별 핵심 정보, 영상, 문서, GitHub 링크로 빠르게 이동할 수 있다.
- 프로젝트 추가/제거가 코드 수정 없이 데이터 파일 수정만으로 가능하다.
- 키보드 조작 없이 스크롤과 클릭만으로 이용할 수 있다.
- GitHub Pages에서 안정적으로 동작한다.

## 2. 추천 콘셉트

### 메인 콘셉트: 스크롤형 게임 월드 프로젝트 갤러리

페이지 전체를 하나의 게임 월드처럼 구성하되, 각 프로젝트를 월드 안의 스테이지, 지역, 포털, 던전 입구처럼 보여준다.

사용자가 스크롤하면 Three.js 카메라가 월드를 따라 이동하고, 프로젝트 노드들이 순서대로 등장한다. 각 프로젝트 노드는 카드 UI와 연결되며, 클릭하면 상세 페이지 또는 상세 패널로 이동한다.

테마는 다음 둘 중 하나로 선택할 수 있다.

### A안: 횡스크롤 RPG 테마

가로로 이어지는 필드, 마을, 던전, 보스룸을 지나가며 프로젝트를 보여주는 방식이다.

장점:

- 포트폴리오 탐색 흐름이 자연스럽다.
- 프로젝트를 스테이지 단위로 추가하기 쉽다.
- 캐릭터가 직접 조작되지 않아도 스크롤 이동만으로 충분히 게임적인 느낌을 줄 수 있다.
- 여러 장르의 프로젝트를 지역별로 구분하기 좋다.

예시:

- 마을: 프로필과 Contact
- 초원 스테이지: Unity 2D RPG 프로젝트
- 던전 입구: Unreal 액션/TPS 프로젝트
- 전술 맵: 턴제 RPG 프로젝트
- 작업대/상점: 에디터 툴 프로젝트

### B안: 종스크롤 슈팅게임 테마

위에서 아래로 내려가며 프로젝트 섹션을 통과하는 방식이다. 프로젝트는 웨이브, 보스, 업그레이드 모듈처럼 표현한다.

장점:

- 사격, 투사체, VFX, 네트워크 프로젝트와 잘 어울린다.
- 세로 스크롤 웹 페이지의 기본 방향과 일치한다.
- 모바일에서도 구조를 이해하기 쉽다.

단점:

- 프로젝트 포트폴리오보다 미니게임처럼 보일 위험이 있다.
- 다양한 프로젝트를 차분하게 읽는 데는 횡스크롤 RPG보다 불리할 수 있다.

### 최종 추천

프로젝트를 계속 추가/제거할 포트폴리오라면 **횡스크롤 RPG 테마**를 추천한다.

각 프로젝트를 독립된 스테이지로 표현할 수 있고, 데이터 기반으로 프로젝트 목록을 관리하기 쉽다. 또한 Three.js 장면은 장식과 탐색 보조 역할에 집중하고, 실제 프로젝트 정보는 HTML 카드와 상세 문서로 관리할 수 있다.

## 3. 사용자 경험

### 첫 화면

첫 화면은 포트폴리오 전체의 입구 역할을 한다.

구성:

- Three.js 배경 월드
- Game Client Programmer 타이틀
- 짧은 소개 문구
- 주요 CTA
  - Projects
  - Resume
  - GitHub
  - Email

첫 화면에서 모든 설명을 길게 쓰지 않는다. 포트폴리오 사이트임을 명확하게 보여주고, 바로 프로젝트 목록으로 내려갈 수 있게 한다.

### 프로젝트 탐색

스크롤하면 월드가 이동하고, 프로젝트 스테이지가 순서대로 등장한다.

각 프로젝트는 다음 형태로 보여준다.

- 프로젝트 이름
- 한 줄 요약
- 역할
- 사용 기술
- 대표 이미지 또는 영상 썸네일
- 상세 보기 버튼
- GitHub / Video / PDF / Demo 링크

프로젝트 카드는 Three.js 오브젝트 위에 직접 텍스트를 그리지 않고, HTML 카드로 구성한다. Three.js는 배경 월드와 프로젝트 분위기 연출을 담당한다.

### 상세 포트폴리오 페이지 이동

프로젝트 카드를 클릭하면 같은 화면 위에 내용을 띄우는 것이 아니라, 프로젝트별 상세 포트폴리오 페이지로 이동한다.

기본 흐름:

```text
메인 랜딩 페이지
→ 프로젝트 카드 클릭
→ 프로젝트 상세 포트폴리오 페이지
→ Back to Projects 또는 상단 내비게이션으로 복귀
```

상세 페이지 이동 방식을 기본으로 삼는 이유는 다음과 같다.

- 프로젝트별 기술 설명을 충분히 담을 수 있다.
- 특정 프로젝트 URL을 이력서, 자기소개서, 면접 자료에 직접 첨부할 수 있다.
- 브라우저 뒤로가기, 새 탭 열기, 링크 공유가 자연스럽다.
- 프로젝트가 늘어나도 메인 페이지가 과하게 길어지지 않는다.
- 검색 엔진과 GitHub Pages 정적 구조에 더 적합하다.

예시:

```text
/projects/remnant-clone/
/projects/turn-based-rpg/
/projects/reward-editor/
```

모달은 상세 설명용이 아니라 보조 기능으로만 사용한다.

모달 사용 예:

- 영상 빠른 미리보기
- 이미지 갤러리 확대
- 짧은 GIF 확인

즉, 프로젝트 카드의 기본 액션은 상세 페이지 이동이고, 카드 안의 영상/이미지 버튼만 모달을 사용한다.

## 4. 정보 구조

### 페이지 섹션

권장 섹션은 다음과 같다.

1. Hero
2. Featured Projects
3. All Projects
4. Skills / Tech Stack
5. Resume / Contact

Three.js 연출은 Hero와 Featured Projects에 집중한다. All Projects 이후부터는 일반적인 포트폴리오 UI로 구성해 탐색성을 높인다.

### 프로젝트 카드 정보

각 프로젝트 카드는 다음 정보를 가진다.

```text
title
subtitle
summary
role
period
teamSize
tech
category
thumbnail
featured
links
```

카드에 노출할 필드는 제한한다.

카드 노출:

- title
- summary
- tech
- thumbnail
- category
- links 일부

상세 페이지 노출:

- overview
- role
- responsibilities
- problems
- solutions
- results
- media
- links

## 5. 데이터 기반 확장 구조

프로젝트 추가/제거가 쉽도록 콘텐츠를 데이터로 분리한다.

권장 구조:

```text
data/
  profile.json
  projects.json
  projects/
    remnant-clone.md
    turn-based-rpg.md
    reward-editor.md
projects/
  remnant-clone/
    index.html
  turn-based-rpg/
    index.html
  reward-editor/
    index.html
assets/
  img/
    projects/
      remnant-clone/
      turn-based-rpg/
      reward-editor/
  video/
  pdf/
src/
  main.ts
  scene/
  components/
  content/
```

빌드 도구를 쓰지 않는다면 현재 구조처럼 `data/projects/index.json`과 `data/projects/*.md`를 유지해도 된다. 이 경우 상세 페이지는 하나의 공통 템플릿이 `id` 값을 받아 해당 Markdown을 렌더링하는 방식으로 구현할 수 있다.

중요한 원칙은 다음과 같다.

- 프로젝트 목록 순서는 데이터 파일에서 제어한다.
- `featured` 값으로 메인 노출 여부를 결정한다.
- 프로젝트를 숨기려면 파일 삭제가 아니라 `visible: false`로 처리할 수 있게 한다.
- 카드 레이아웃은 프로젝트 개수 변화에 대응해야 한다.
- 링크가 없는 항목은 버튼을 자동으로 숨긴다.
- 상세 페이지 URL은 프로젝트 `id`에서 자동으로 결정한다.

## 6. 프로젝트 데이터 예시

```json
{
  "id": "remnant-clone",
  "title": "Remnant-like TPS Prototype",
  "subtitle": "Unreal C++ Multiplayer Action",
  "summary": "멀티플레이 전투, 상호작용, GAS 기반 전투 시스템을 구현한 Unreal 프로젝트",
  "category": "Unreal",
  "role": "Client Programmer / Team Lead",
  "period": "2025",
  "teamSize": 4,
  "tech": ["Unreal Engine 5", "C++", "GAS", "Replication"],
  "thumbnail": "assets/img/projects/remnant-clone/thumbnail.jpg",
  "detailUrl": "projects/remnant-clone/",
  "featured": true,
  "visible": true,
  "links": {
    "video": "",
    "github": "",
    "pdf": "",
    "demo": ""
  },
  "theme": {
    "worldType": "dungeon",
    "accentColor": "#4cc9f0"
  }
}
```

`theme` 필드는 Three.js 월드에서 프로젝트별 분위기를 바꿀 때 사용한다.

예시:

- `worldType: "forest"`: 횡스크롤 RPG / Unity 프로젝트
- `worldType: "dungeon"`: 액션 전투 프로젝트
- `worldType: "tactical"`: 턴제 전략 프로젝트
- `worldType: "editor"`: 툴 제작 프로젝트

## 7. Three.js 활용 범위

Three.js는 포트폴리오의 배경과 프로젝트 탐색 경험을 강화하는 데 사용한다.

권장 사용:

- 스크롤에 따른 카메라 이동
- 프로젝트별 스테이지 배경
- 캐릭터 또는 마커 이동
- 포털, 던전 입구, 노드 같은 프로젝트 진입 오브젝트
- 가벼운 파티클, 광원, Trail 효과
- 프로젝트 카테고리별 분위기 전환

피해야 할 사용:

- 긴 텍스트를 Three.js 안에 렌더링
- 실제 게임처럼 복잡한 조작 요구
- 프로젝트 정보를 3D 오브젝트에만 의존
- 무거운 모델과 후처리 효과 과다 사용

포트폴리오의 정보 전달은 HTML/CSS가 담당하고, Three.js는 기억에 남는 시각적 경험을 담당한다.

## 8. 스크롤 인터랙션 설계

키보드 조작은 사용하지 않는다.

사용자 입력:

- 스크롤
- 프로젝트 카드 클릭
- 링크 버튼 클릭
- 모바일 터치 스크롤

스크롤 진행률은 다음 요소를 제어한다.

- 카메라 위치
- 배경 스테이지 전환
- 프로젝트 카드 등장
- 프로젝트 마커 활성화
- 짧은 VFX 타이밍

권장 구간:

```text
0.00 ~ 0.18: Hero
0.18 ~ 0.55: Featured Projects 월드 탐색
0.55 ~ 0.78: All Projects 그리드
0.78 ~ 0.90: Skills / Tech Stack
0.90 ~ 1.00: Resume / Contact
```

모바일에서는 Three.js 카메라 이동을 단순화하고, 프로젝트 카드는 일반 세로 리스트 중심으로 보여준다.

## 9. UI 설계

### 내비게이션

상단 고정 내비게이션은 작고 간단하게 둔다.

메뉴:

- Projects
- Skills
- Resume
- Contact

### 프로젝트 카드

카드는 반복 요소이므로 일정한 크기와 정보 구조를 유지한다.

카드 구성:

- 썸네일
- 카테고리 태그
- 제목
- 한 줄 요약
- 기술 태그
- 상세 보기 버튼
- 외부 링크 아이콘

프로젝트 카드가 많아질 수 있으므로 필터 기능을 고려한다.

필터 예시:

- All
- Unreal
- Unity
- Tool
- Network
- Gameplay

### 상세 페이지

상세 페이지는 프로젝트별 독립 포트폴리오 문서다. 메인 랜딩 페이지와 달리 Three.js 연출은 최소화하고, 읽기 좋은 기술 문서 형태를 우선한다.

상세 페이지의 목적:

- 프로젝트에서 무엇을 만들었는지 설명한다.
- 어떤 문제를 해결했는지 보여준다.
- 맡은 역할과 기여 범위를 명확히 한다.
- 영상, 이미지, 코드, PDF 링크를 한 곳에 모은다.
- 면접에서 바로 열어 설명할 수 있는 문서가 된다.

상세 페이지 공통 구성:

```text
상단 Hero
  - 프로젝트 제목
  - 한 줄 요약
  - 대표 이미지 또는 영상
  - 주요 링크

본문
  - Overview
  - Role
  - Tech Stack
  - Key Features
  - Problem & Solution
  - Result
  - Media
  - Links

하단
  - 이전/다음 프로젝트
  - Back to Projects
```

기술문서 템플릿은 통일한다.

권장 템플릿:

```markdown
# 프로젝트 이름

## Overview

## Role

## Tech Stack

## Key Features

## Problem & Solution

## Result

## Media

## Links
```

프로젝트별 내용은 다르더라도 제목 구조를 유지하면 포트폴리오 전체가 정돈되어 보인다.

### 상세 페이지 내비게이션

상세 페이지에는 다음 이동 수단을 둔다.

- 좌상단 또는 상단 내비게이션: Home
- 본문 상단: Back to Projects
- 본문 하단: Previous Project / Next Project
- 외부 링크: GitHub, Video, PDF, Demo

사용자가 상세 페이지로 들어간 뒤 막히지 않도록, 항상 메인 프로젝트 목록으로 돌아갈 수 있는 링크를 노출한다.

## 10. 구현 아키텍처

### 단순 정적 버전

현재 구조를 유지하면서 확장하려면 다음 방식이 적합하다.

```text
index.html
project.html
assets/
  css/style.css
  js/main.js
  js/project.js
  js/scene.js
data/
  profile.json
  projects/
    index.json
    project-a.md
    project-b.md
```

장점:

- GitHub Pages에 바로 배포 가능
- 빌드 과정이 없다
- 관리가 단순하다
- 상세 페이지를 하나의 `project.html?id=<project-id>` 템플릿으로 처리할 수 있다

단점:

- 코드가 커질수록 파일 관리가 어려워질 수 있다
- Three.js 모듈 관리가 불편할 수 있다
- URL이 `/projects/remnant-clone/`처럼 깔끔하지 않고 `project.html?id=remnant-clone` 형태가 될 수 있다

단순 정적 버전의 URL 예시:

```text
/project.html?id=remnant-clone
/project.html?id=turn-based-rpg
/project.html?id=reward-editor
```

### 권장 확장 버전

프로젝트가 계속 늘어날 예정이라면 Vite 기반 구성을 추천한다.

```text
src/
  main.ts
  App.ts
  pages/
    HomePage.ts
    ProjectPage.ts
  scene/
    PortfolioWorld.ts
    ScrollController.ts
    ProjectMarker.ts
    StageFactory.ts
  components/
    ProjectCard.ts
    ProjectGrid.ts
    ProjectDetail.ts
    FilterTabs.ts
  data/
    loadProjects.ts
  styles/
    main.css
public/
  data/
  assets/
  projects/
```

장점:

- Three.js 코드를 모듈 단위로 분리하기 쉽다.
- 프로젝트 카드, 필터, 상세 뷰를 컴포넌트화하기 좋다.
- TypeScript를 쓰면 프로젝트 데이터 구조를 안전하게 관리할 수 있다.
- 프로젝트별 정적 페이지를 생성하거나, 라우터로 상세 페이지를 구성하기 좋다.

단점:

- 빌드와 배포 설정이 필요하다.

권장 확장 버전의 URL 예시:

```text
/projects/remnant-clone/
/projects/turn-based-rpg/
/projects/reward-editor/
```

### 최종 구현 추천

장기적으로는 **프로젝트별 상세 페이지 URL을 갖는 구조**를 추천한다.

MVP에서는 구현 부담을 줄이기 위해 `project.html?id=<project-id>` 방식으로 시작할 수 있다. 이후 Vite 기반으로 전환하거나 빌드 스크립트를 추가해 `/projects/<project-id>/` 형태의 정적 페이지를 생성하면 된다.

추천 단계:

1. MVP: `project.html?id=project-id` 공통 상세 템플릿
2. 확장: `/projects/project-id/` 정적 페이지 생성
3. 고도화: 프로젝트별 SEO 메타데이터, 이전/다음 프로젝트, 목차 자동 생성

## 11. 프로젝트 추가/제거 흐름

### 프로젝트 추가

1. 프로젝트 ID를 정한다.
2. `data/projects/<project-id>.md` 상세 문서를 작성한다.
3. 썸네일과 이미지를 `assets/img/projects/<project-id>/`에 추가한다.
4. `projects.json` 또는 `index.json`에 프로젝트 메타데이터를 추가한다.
5. `detailUrl`을 설정한다.
6. `visible: true`를 설정한다.
7. 메인에 강조 노출할 프로젝트라면 `featured: true`를 설정한다.

코드 수정 없이 카드와 상세 페이지가 자동으로 생성되어야 한다.

MVP 방식의 `detailUrl`:

```json
{
  "id": "remnant-clone",
  "detailUrl": "project.html?id=remnant-clone"
}
```

정적 페이지 방식의 `detailUrl`:

```json
{
  "id": "remnant-clone",
  "detailUrl": "projects/remnant-clone/"
}
```

메인 페이지는 `detailUrl`을 읽어 프로젝트 카드의 링크를 자동으로 만든다.

### 프로젝트 제거

완전 삭제보다 숨김 처리를 우선한다.

```json
{
  "id": "old-project",
  "visible": false
}
```

이렇게 하면 나중에 다시 공개하기 쉽고, 링크나 문서도 보존할 수 있다.

`visible: false`인 프로젝트는 다음 위치에서 제외한다.

- Featured Projects
- All Projects
- 필터 결과
- 이전/다음 프로젝트 이동

다만 상세 페이지 파일이나 Markdown은 남겨둘 수 있다. 이미 공유된 URL을 완전히 막고 싶다면 상세 페이지에서 비공개 안내 또는 메인으로 리다이렉트하는 정책을 추가한다.

### 프로젝트 순서 변경

프로젝트 순서는 배열 순서 또는 `order` 필드로 제어한다.

```json
{
  "id": "reward-editor",
  "order": 30
}
```

추천은 `order` 필드다. 프로젝트가 많아지면 배열 순서만으로 관리하기 불편해질 수 있다.

이전/다음 프로젝트 이동도 `order` 기준으로 계산한다.

## 12. MVP 범위

첫 버전은 과하게 크게 만들지 않는다.

MVP 포함:

- Three.js Hero 배경
- 스크롤 기반 카메라 이동
- Featured Projects 3~4개
- All Projects 그리드
- 프로젝트 상세 페이지
- 프로젝트 카드 클릭 시 상세 페이지 이동
- 프로젝트 데이터 기반 자동 렌더링
- 필터 탭
- Contact / Resume 링크
- 모바일 대응

MVP 제외:

- 복잡한 캐릭터 애니메이션
- 실제 플레이 가능한 미니게임
- 무거운 3D 모델
- 모든 프로젝트의 완성형 기술문서
- 과도한 페이지 전환 효과
- 상세 설명을 메인 페이지 모달에 모두 담는 구조

## 13. 향후 확장 아이디어

프로젝트가 늘어난 뒤 다음 기능을 추가할 수 있다.

- 프로젝트 검색
- 태그 기반 필터
- Featured Projects 자동 슬라이드
- 프로젝트별 테마 스테이지
- 기술 스택별 관계 그래프
- 상세 문서 목차 자동 생성
- 프로젝트별 정적 페이지 자동 생성
- PDF 포트폴리오 다운로드
- 프로젝트별 영상 모달
- GitHub API 연동을 통한 최신 커밋 표시

단, GitHub Pages 정적 사이트라는 조건을 고려해 초기에는 외부 API 의존성을 최소화한다.

## 14. 성공 기준

방문자가 30초 안에 다음을 파악할 수 있어야 한다.

- 어떤 프로젝트들이 있는지
- 각 프로젝트에서 무엇을 만들었는지
- 어떤 기술을 사용했는지
- 상세 내용을 어디서 볼 수 있는지
- GitHub, 영상, 문서, 연락처로 어떻게 이동하는지

관리 측면에서는 다음을 만족해야 한다.

- 프로젝트 추가 시 HTML 구조를 직접 수정하지 않는다.
- 프로젝트 삭제 대신 숨김 처리가 가능하다.
- 프로젝트 카드 클릭 시 프로젝트별 상세 페이지로 이동한다.
- 상세 페이지 URL을 개별적으로 공유할 수 있다.
- 썸네일, 링크, 기술 태그가 없는 경우에도 레이아웃이 깨지지 않는다.
- 프로젝트 개수가 늘어나도 그리드와 필터가 자연스럽게 동작한다.
- Three.js 연출이 꺼지거나 축소되어도 프로젝트 탐색이 가능하다.

## 15. 최종 권장 방향

최종 방향은 **Three.js를 활용한 스크롤형 횡스크롤 RPG 테마 프로젝트 갤러리 + 프로젝트별 상세 포트폴리오 페이지**다.

메인 랜딩 페이지는 프로젝트를 고르는 허브 역할을 하고, 각 프로젝트 카드를 클릭하면 독립된 상세 페이지로 이동한다. Three.js는 첫인상과 탐색 경험을 강화하는 역할에 집중시키고, 프로젝트 정보는 JSON/Markdown 기반으로 분리해 추가와 제거가 쉬운 포트폴리오 구조로 설계한다.
