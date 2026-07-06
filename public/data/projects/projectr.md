---
title: Project R
summary: GAS 기반 액션 컴뱃 시스템과 드론 AI를 설계·구현한 Unreal 프로젝트.
category: Unreal
role: Client / Gameplay Programmer
period: 2025
tech: [Unreal Engine 5, C++, GAS, Behavior Tree]
biome: meadow
accent: "#b14cf0"
featured: true
order: 20
thumbnail: assets/img/projectr.jpg
video: https://youtu.be/xxxxxxxxxxx
github: https://github.com/username/projectr
pdf: assets/pdf/projectr.pdf
---

## 개요

Unreal Engine 5 기반 액션 게임 클라이언트. Gameplay Ability System(GAS)을
중심으로 컴뱃, 드론 AI, 아이템/샵 시스템을 담당.

## 담당 시스템

- **컴뱃 / 어빌리티**: GAS 기반 스킬 파이프라인 설계
- **드론 AI**: Behavior Tree + EQS 기반 추적/회피
- **아이템 · 샵**: 데이터 테이블 주도 인벤토리 구조

## 기술 상세

GAS 어빌리티 활성화 흐름의 핵심 진입점.

```cpp
void UPRGameplayAbility::ActivateAbility(
    const FGameplayAbilitySpecHandle Handle,
    const FGameplayAbilityActorInfo* ActorInfo,
    const FGameplayAbilityActivationInfo ActivationInfo,
    const FGameplayEventData* TriggerEventData)
{
    Super::ActivateAbility(Handle, ActorInfo, ActivationInfo, TriggerEventData);

    // 코스트/쿨다운 커밋 후 몽타주 재생
    if (!CommitAbility(Handle, ActorInfo, ActivationInfo))
    {
        EndAbility(Handle, ActorInfo, ActivationInfo, true, true);
        return;
    }
}
```

## 성과

- 어빌리티 추가 비용 감소: 신규 스킬을 데이터 에셋만으로 확장
- 드론 AI 프레임 비용 최적화

> 이미지/GIF는 `![설명](assets/img/파일.gif)` 형식으로 추가.
