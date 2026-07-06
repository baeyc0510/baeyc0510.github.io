---
title: Forge Kit
summary: 레벨 디자이너용 인게임 에디터 툴. 데이터 주도 배치와 실시간 프리뷰 제공.
category: Tool
role: Tools Programmer
period: 2023
tech: [Unreal Engine 5, C++, Slate, Editor Utility]
biome: candy
accent: "#ffd166"
featured: false
order: 40
thumbnail: assets/img/forgekit.jpg
github: ""
---

## Overview

레벨 디자이너가 스크립트 없이 오브젝트를 배치/편집하도록 돕는 인게임 에디터
툴. 데이터 주도 배치와 실시간 프리뷰가 핵심.

## Role

- Slate 기반 에디터 UI 구현
- 데이터 주도 배치 시스템 설계
- 실시간 프리뷰 및 언두/리두 지원

## Tech Stack

- Unreal Editor Utility Widget + Slate
- 커스텀 데이터 에셋으로 프리셋 관리
- 트랜잭션 기반 언두/리두

## Key Features

- **프리셋 배치**: 데이터 에셋 선택만으로 오브젝트 그룹 배치
- **실시간 프리뷰**: 파라미터 변경이 즉시 뷰포트에 반영
- **안전한 편집**: 트랜잭션 기반 언두/리두로 실수 복구

## Problem & Solution

반복 배치 작업이 수작업에 의존하던 파이프라인을 프리셋 기반으로 전환.
디자이너의 배치 반복 시간을 크게 단축.

## Result

- 레벨 배치 반복 작업 시간 단축
- 프로그래머 개입 없이 디자이너가 독립적으로 편집
