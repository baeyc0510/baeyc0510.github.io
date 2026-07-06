# Game Client Programmer 랜딩페이지

다크 + 네온 테마의 정적 포트폴리오 사이트. GitHub Pages 호스팅.

## 구조

```
LandingPage/
├─ index.html                 페이지 골격 (Hero / Projects / Contact)
├─ data/
│  ├─ profile.json            이름·소개·연락처 링크
│  └─ projects/
│     ├─ index.json           프로젝트 노출 목록 (순서 = 표시 순서)
│     └─ <slug>.md            프로젝트별 포트폴리오 (frontmatter + 본문)
├─ assets/
│  ├─ css/style.css           네온 다크 테마
│  ├─ js/main.js              카드 렌더·라우팅·Hero 파티클
│  ├─ img/                    썸네일·GIF
│  └─ pdf/                    다운로드용 PDF (선택)
└─ .github/workflows/deploy.yml
```

## 프로젝트 추가 방법 (확장)

2단계면 끝.

1. `data/projects/<slug>.md` 파일 생성 (아래 템플릿)
2. `data/projects/index.json`의 배열에 `"<slug>"` 한 줄 추가

```markdown
---
title: 프로젝트 이름
summary: 카드에 보일 한 줄 요약.
tech: [Unreal, C++, GAS]
thumbnail: assets/img/파일.jpg
video: https://youtu.be/xxxx
github: https://github.com/username/repo
pdf: assets/pdf/파일.pdf
---

## 개요
본문은 마크다운. 코드블록·이미지·GIF 자유롭게 삽입.
```

- frontmatter 필드는 **있는 것만** 표시됨 (`video`, `github`, `pdf` 없으면 버튼 자동 숨김)
- `thumbnail` 없으면 이니셜 플레이스홀더 표시
- 목록에서 제외하려면 `index.json`에서 슬러그만 빼면 됨 (파일 삭제 불필요)

## 프로필 수정

`data/profile.json`에서 이름·소개·링크 편집. `url`이 빈 문자열이면 미표시.

## 로컬 미리보기

`fetch`로 데이터를 읽으므로 `file://` 직접 열기는 불가. 정적 서버 필요.

```bash
python -m http.server 8000
# http://localhost:8000
```

## 배포

`main` 브랜치 push 시 GitHub Actions로 자동 배포.
저장소 Settings > Pages > Source 를 **GitHub Actions**로 설정.
사용자 사이트는 저장소 이름을 `<username>.github.io`로 생성.
