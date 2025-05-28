# 케빈랩 사업관리 웹서비스 요구사항서

> **목적**
> 2025년 주간업무 Excel에 기록된 **영업·매출 파이프라인**과 **서비스 KPI** 관리 프로세스를 웹 서비스화하여, 기획자 1인 (관리자)과 AI가 협업 · 운영할 수 있는 **경량 내부 시스템**을 구축한다.

---

## 1. 기술 스택

| 구분                 | 선택 기술                                 | 비고                                                                                                               |
| ------------------ | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Frontend**       | `HTML` + `CSS` + Vanilla `JavaScript` | 경량 구현·빠른 학습 곡선ㆍUI 라이브러리 (선택): Shoelace, Flowbiteㆍ차트 라이브러리 (권장): Chart.js, ApexCharts                             |
| **Backend (BaaS)** | **Firebase**                          | ㆍCloud Firestore (NoSQL)ㆍFirebase Auth (이메일/비밀번호) — 관리자만 사용자 추가ㆍCloud Functions (서버리스 비즈니스 로직)ㆍHosting · Storage |
| **형상 관리**          | GitHub (Private)                      | GitHub Actions → Firebase Hosting 자동 배포                                                                          |
| **협업**             | Google Workspace                      | 요구사항/회의록: Google Docs와이어프레임: Figma 또는 마크다운 + SVG                                                                 |

---

## 2. 사용자·권한 모델

| 역할                | 주요 권한                                   | 비고                              |
| ----------------- | --------------------------------------- | ------------------------------- |
| **관리자 (Admin)**   | • 사용자 추가·비활성화• 전 영역 CRUD• 통계·대시보드 열람    | 초기 1계정(기획자). 회원가입 UI 미제공        |
| **일반 사용자 (User)** | • 사업장·영업·서비스 입력/편집, 서비스 현황 입력/편집 (필요 시) | 현재 미사용. 확장 대응을 위해 Role 필드 사전 정의 |

### 인증·인가 정책

* Firebase Auth (E‑mail / Password)
* `users` 컬렉션 스키마: `{ uid, role, displayName, email, isActive }`
* Firestore Security Rules: `role == 'admin'` 인 계정만 **읽기·쓰기** 허용

---

## 3. 핵심 화면 & 주요 기능

| 경로                  | 화면명    | 핵심 기능                                                               | 데이터 원본                              |
| ------------------- | ------ | ------------------------------------------------------------------- | ----------------------------------- |
| `/login`            | 로그인    | Firebase Auth 관리자 로그인                                               | —                                   |
| `/dashboard`        | 대시보드   | • 월·분기 매출 전망/달성률 차트• 수주잔·계약예정 합계표• 서비스 KPI 카드 (HEMS/BEMS/REMS/FEMS) | `aggregates/dashboard` 문서 또는 실시간 쿼리 |
| `/sales`            | 영업현황   | • 영업 파이프라인 CRUD• 단계 드래그 & 드롭 이동                                     | `sales` 컬렉션                         |
| `/contracts`        | 계약 관리  | • 계약예정·수주완료 리스트• “계약확정” → 수주잔 이동                                    | `contracts` 컬렉션                     |
| `/backlog`          | 수주잔    | • 월별 매출 스케줄 입력/편집• 실적 반영                                            | `backlog` 컬렉션                       |
| `/services`         | 서비스 현황 | • 서비스 KPI 요약 표• 라인별 상세 탭 (HEMS/BEMS/REMS/FEMS)                      | `services/{type}` 서브컬렉션             |
| `/settings/users`   | 사용자 관리 | 관리자용 사용자 추가·비활성화                                                    | `users` 컬렉션                         |
| `/settings/lookups` | 기준 정보  | 사업구분·단계 등 공통 코드 관리                                                  | `lookups` 컬렉션                       |

---

## 4. 데이터 모델 (Firestore)

```jsonc
// businesses
{
  id,              // 문서 ID
  name,            // 사업장·프로젝트명
  client,
  industry,
  startDate,
  memo
}

// sales
{
  id,
  businessId,      // FK → businesses.id
  stage,           // e.g. prospect, proposal, pending, won
  expectedAmount,
  expectedClose,
  owner,
  nextAction,
  updatedAt
}

// contracts (계약예정)
{
  id,
  businessId,
  status: "pending" | "won",
  contractAmount,
  monthlyPlan: {
    "2025-05": 10000,
    ...
  },
  signedDate?
}

// backlog (수주잔)
{
  id,
  contractId,      // FK → contracts.id
  remainingAmount,
  monthlyRevenue: {
    "2025-07": 5000,
    ...
  },
  lastInputWeek
}

// services/{type = hems | bems | rems | fems}
{
  id,
  businessId,
  kpi: {
    energySaved,
    area,
    co2Reduced
  }
}

// aggregates (Materialized by Cloud Function)
{
  id: "dashboard",
  fetchedAt,
  metrics: {
    revenueForecast,
    backlogTotal,
    kpiSummary
  }
}
```

---

## 5. UX · UI 가이드라인

1. **심플 & 가독성**
   ‑ 화이트 배경 + 브랜드 포인트 1색
   ‑ 다크 모드 지원(선호 설정 토글)
2. **반응형**
   ‑ Desktop 우선, Flex/Grid 기반
   ‑ 모바일 최소 대응(조회·간단 입력)
3. **대시보드 구성**
   ‑ 사업 및 서비스 현황 카드 4개
   ‑ Doughnut / Bar 차트
   ‑ 미니 테이블로 핵심 수치 요약
4. **테이블 UX**
   ‑ 최소 컬럼
   ‑ 행 Hover 강조
   ‑ Sticky Header
5. **폼 UX**
   ‑ Stepper 모달로 다단계 입력 부담 최소화

---

## 6. 자동화 · AI 협업 포인트

| 영역         | 방식                              | 설명                                                             |
| ---------- | ------------------------------- | -------------------------------------------------------------- |
| **데이터 이동** | Cloud Functions Trigger         | 영업 단계가 `pending` → `won` 변경 시, `contracts` → `backlog` 자동 이관 등 |
| **KPI 집계** | 스케줄드 Function (매일 02:00)        | 서비스 KPI 합산 → `aggregates/dashboard` 문서 갱신                      |
| **개발 지원**  | AI (ChatGPT, VS Code Extension) | 기획자 프롬프트로 컴포넌트/함수 Skeleton 생성                                  |

---

## 7. 비기능 요구사항

* **성능**: 최초 페이지 로딩 ≤ 2 초 (코드 분할, 캐시 활용)
* **보안**: 전 구간 HTTPS, Firestore Rules 준수, Google OAuth 콘솔 보호
* **백업**: Cloud Firestore Export 일 1회 → Cloud Storage (보존 30일)
* **테스트**: Vitest 단위 테스트 · Cypress Smoke E2E
* **모니터링**: Firebase Crashlytics · Performance · Cloud Logging

---

## 8. 참고 사항

* Excel 기반 **주간 입력 흐름**을 유지하도록 UX 설계 — 30 분 이내 온보딩 목표
* 차후 React/Vue 전환을 고려하여 컴포넌트·API 레이어 **모듈화**

