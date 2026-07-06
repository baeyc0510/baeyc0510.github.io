---
title: Frostline Tactics
summary: 설산을 무대로 한 그리드 기반 턴제 전술 RPG. AI 행동 평가와 스킬 파이프라인 담당.
category: Gameplay
role: AI / Systems Programmer
period: 2024
tech: [Unreal Engine 5, C++, Blueprint, EQS]
biome: night
accent: "#7ee0ff"
featured: false
order: 30
thumbnail: assets/img/frostline.jpg
video: ""
---

## Overview

설산 지형 위의 그리드 기반 턴제 전술 RPG. 유닛 이동, 지형 효과,
적 AI 의사결정을 중심으로 구현.

## Role

- 그리드 이동 및 사거리 계산 시스템
- 적 유닛 AI 행동 평가(utility) 설계
- 스킬/상태이상 파이프라인

## Tech Stack

- Unreal C++ 코어 + Blueprint 데이터 튜닝
- EQS 로 위치 점수화
- 데이터 테이블 주도 스킬 정의

## Key Features

- **행동 평가 AI**: 다중 후보 행동을 점수화해 최적 수 선택
- **지형 효과**: 눈/얼음 타일이 이동력과 명중에 영향
- **스킬 파이프라인**: 코스트/쿨다운/상태이상을 데이터로 조합

## Problem & Solution

적 AI가 근시안적으로 이동하던 문제를, 이동 후 예상 이득까지 포함한
2단계 평가로 개선. 포위/집중 공격 패턴이 자연스럽게 발현.

## Result

- 적 AI 난이도 곡선 조절이 데이터 튜닝만으로 가능
- 스킬 신규 추가 시 코드 변경 최소화
