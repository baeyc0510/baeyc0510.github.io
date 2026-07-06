---
title: Elderwood Saga
summary: 절차적 숲 던전과 스킬 트리를 갖춘 Unity 2D 액션 RPG.
category: Unity
role: Gameplay Programmer
period: 2024
tech: [Unity, C#, URP, Addressables]
biome: forest
accent: "#5ee0a0"
featured: true
order: 10
thumbnail: assets/img/elderwood.jpg
demo: ""
github: ""
---

## Overview

죽은 숲을 배경으로 한 횡스크롤 액션 RPG. 절차적으로 생성되는 스테이지와
스킬 트리 기반 성장 시스템을 중심으로 설계.

## Role

- 전투 및 스킬 트리 시스템 구현
- 절차적 스테이지 제너레이터 설계
- 세이브/로드 및 진행도 관리

## Tech Stack

- Unity URP 기반 2D 파이프라인
- Addressables 로 스테이지 에셋 스트리밍
- ScriptableObject 데이터 주도 스킬 정의

## Key Features

- **스킬 트리**: 노드형 트리에서 어빌리티 해금, 데이터로 확장
- **절차적 숲**: 방 단위 프리팹 조합 + 시드 기반 재현
- **콤보 전투**: 입력 버퍼와 상태 머신 기반 액션

## Problem & Solution

스킬 추가마다 코드 수정이 필요하던 초기 구조를 ScriptableObject 데이터
주도로 전환. 신규 스킬을 에셋 생성만으로 등록하도록 개선.

## Result

- 신규 스킬 등록 비용 대폭 감소
- 스테이지 로딩을 스트리밍으로 전환해 초기 로딩 단축
