# 케빈랩 사업관리 시스템 백엔드 연동 계획서

> 본 문서는 프론트엔드 완성 후 Firebase 백엔드 연동 단계에 대한 상세 계획을 제공합니다.
> 각 단계별 체크리스트에 따라 개발 완료 후 테스트를 진행하고 Git에 커밋하세요.

## 1. Firebase 프로젝트 설정

### Firebase 프로젝트 생성
- [ ] Firebase 콘솔에서 새 프로젝트 생성
- [ ] 웹 앱 등록 (케빈랩 BMS)
- [ ] Firebase SDK 설치 (`npm install firebase`)
- [ ] 환경 변수 설정 (.env 파일 생성)
- [ ] Firebase 초기화 코드 작성 (src/services/firebase.js)

### Firebase 서비스 활성화
- [ ] Firebase Authentication 활성화 (이메일/비밀번호)
- [ ] Cloud Firestore 활성화
- [ ] Cloud Functions 활성화 (필요시)
- [ ] Firebase Hosting 활성화

### Firebase 보안 규칙 설정
- [ ] Firestore 보안 규칙 작성
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      // 인증된 관리자만 모든 문서에 접근 가능
      match /{document=**} {
        allow read, write: if request.auth != null && 
          exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      }
      
      // 사용자 컬렉션 규칙
      match /users/{userId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if request.auth != null && 
          exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      }
    }
  }
  ```
- [ ] Storage 보안 규칙 작성 (필요시)

## 2. 인증 기능 구현

### 인증 서비스 구현
- [ ] 인증 서비스 클래스 작성 (src/services/auth.js)
- [ ] 로그인 기능 구현 (Firebase Auth)
- [ ] 로그아웃 기능 구현
- [ ] 인증 상태 관리 구현 (onAuthStateChanged)
- [ ] 인증 상태에 따른 UI 업데이트 구현

### 인증 관련 UI 연동
- [ ] 로그인 폼에 실제 인증 기능 연결
- [ ] 로그인 성공/실패 처리
- [ ] 로그인 상태 유지 기능 구현
- [ ] 로그아웃 버튼 기능 연결
- [ ] 보호된 라우트 구현 (인증되지 않은 사용자 리디렉션)

### 사용자 관리 기능 구현
- [ ] 관리자용 사용자 추가 기능 구현
- [ ] 사용자 정보 수정 기능 구현
- [ ] 사용자 비활성화 기능 구현

## 3. Firestore 데이터 모델 구현

### 데이터베이스 구조 설계
- [ ] 컬렉션 구조 설계
  - [ ] users 컬렉션
  - [ ] businesses 컬렉션
  - [ ] sales 컬렉션
  - [ ] contracts 컬렉션
  - [ ] backlog 컬렉션
  - [ ] services/{type} 컬렉션
  - [ ] lookups 컬렉션
  - [ ] aggregates 컬렉션

### 데이터 모델 인터페이스 정의
- [ ] 사용자 모델 정의
  ```javascript
  /**
   * @typedef {Object} User
   * @property {string} uid - 사용자 고유 ID
   * @property {string} role - 역할 (admin, user)
   * @property {string} displayName - 표시 이름
   * @property {string} email - 이메일
   * @property {boolean} isActive - 활성화 상태
   */
  ```
- [ ] 사업장 모델 정의
  ```javascript
  /**
   * @typedef {Object} Business
   * @property {string} id - 문서 ID
   * @property {string} name - 사업장/프로젝트명
   * @property {string} client - 고객사
   * @property {string} industry - 산업 분야
   * @property {Date} startDate - 시작일
   * @property {string} memo - 메모
   */
  ```
- [ ] 영업 모델 정의
  ```javascript
  /**
   * @typedef {Object} Sales
   * @property {string} id - 문서 ID
   * @property {string} businessId - 사업장 ID
   * @property {string} stage - 단계 (prospect, proposal, pending, won)
   * @property {number} expectedAmount - 예상 금액
   * @property {Date} expectedClose - 예상 마감일
   * @property {string} owner - 담당자
   * @property {string} nextAction - 다음 조치사항
   * @property {Date} updatedAt - 업데이트 일시
   */
  ```
- [ ] 계약 모델 정의
  ```javascript
  /**
   * @typedef {Object} Contract
   * @property {string} id - 문서 ID
   * @property {string} businessId - 사업장 ID
   * @property {string} status - 상태 (pending, won)
   * @property {number} contractAmount - 계약 금액
   * @property {Object} monthlyPlan - 월별 계획 {YYYY-MM: amount}
   * @property {Date} signedDate - 계약일
   */
  ```
- [ ] 수주잔 모델 정의
  ```javascript
  /**
   * @typedef {Object} Backlog
   * @property {string} id - 문서 ID
   * @property {string} contractId - 계약 ID
   * @property {number} remainingAmount - 잔액
   * @property {Object} monthlyRevenue - 월별 매출 {YYYY-MM: amount}
   * @property {string} lastInputWeek - 마지막 입력 주차
   */
  ```
- [ ] 서비스 모델 정의
  ```javascript
  /**
   * @typedef {Object} Service
   * @property {string} id - 문서 ID
   * @property {string} businessId - 사업장 ID
   * @property {Object} kpi - KPI 지표
   * @property {number} kpi.energySaved - 에너지 절감량
   * @property {number} kpi.area - 관리 면적
   * @property {number} kpi.co2Reduced - CO2 감축량
   */
  ```
- [ ] 집계 모델 정의
  ```javascript
  /**
   * @typedef {Object} Aggregate
   * @property {string} id - 문서 ID (dashboard)
   * @property {Date} fetchedAt - 집계 시간
   * @property {Object} metrics - 지표
   * @property {Object} metrics.revenueForecast - 매출 전망
   * @property {Object} metrics.backlogTotal - 수주잔 합계
   * @property {Object} metrics.kpiSummary - KPI 요약
   */
  ```

### 초기 데이터 시드 스크립트 작성
- [ ] 관리자 계정 생성 스크립트
- [ ] 기준 정보 초기 데이터 생성 스크립트
- [ ] 테스트용 샘플 데이터 생성 스크립트

## 4. API 서비스 구현

### 기본 API 서비스 구현
- [ ] Firestore CRUD 유틸리티 함수 구현 (src/services/firestore.js)
  - [ ] 문서 생성 함수
  - [ ] 문서 조회 함수
  - [ ] 문서 업데이트 함수
  - [ ] 문서 삭제 함수
  - [ ] 컬렉션 쿼리 함수

### 도메인별 API 서비스 구현
- [ ] 사용자 API 서비스 구현 (src/services/userService.js)
  - [ ] 사용자 목록 조회
  - [ ] 사용자 추가
  - [ ] 사용자 수정
  - [ ] 사용자 비활성화
- [ ] 사업장 API 서비스 구현 (src/services/businessService.js)
  - [ ] 사업장 목록 조회
  - [ ] 사업장 추가
  - [ ] 사업장 수정
  - [ ] 사업장 삭제
- [ ] 영업 API 서비스 구현 (src/services/salesService.js)
  - [ ] 영업 목록 조회
  - [ ] 영업 추가
  - [ ] 영업 수정
  - [ ] 영업 삭제
  - [ ] 영업 단계 변경
- [ ] 계약 API 서비스 구현 (src/services/contractService.js)
  - [ ] 계약 목록 조회
  - [ ] 계약 추가
  - [ ] 계약 수정
  - [ ] 계약 확정 (수주잔으로 이동)
- [ ] 수주잔 API 서비스 구현 (src/services/backlogService.js)
  - [ ] 수주잔 목록 조회
  - [ ] 수주잔 수정
  - [ ] 입금 확인 처리
- [ ] 서비스 API 서비스 구현 (src/services/serviceService.js)
  - [ ] 서비스 목록 조회
  - [ ] 서비스 추가
  - [ ] 서비스 수정
  - [ ] KPI 업데이트
- [ ] 대시보드 API 서비스 구현 (src/services/dashboardService.js)
  - [ ] 대시보드 데이터 조회
  - [ ] 실시간 집계 데이터 조회

### 에러 처리 및 로딩 상태 관리
- [ ] 전역 에러 처리 구현
- [ ] API 요청 로딩 상태 관리 구현
- [ ] 에러 메시지 표시 구현
- [ ] 재시도 메커니즘 구현

### 데이터 캐싱 전략 구현
- [ ] 로컬 캐싱 구현
- [ ] 캐시 무효화 전략 구현
- [ ] 오프라인 지원 구현 (선택 사항)

## 5. Cloud Functions 구현

### 자동화 함수 구현
- [ ] 영업 단계 변경 시 자동 이관 함수 구현
  ```javascript
  // 영업 단계가 'pending' -> 'won' 변경 시 contracts 컬렉션으로 자동 이관
  exports.onSalesStageChanged = functions.firestore
    .document('sales/{salesId}')
    .onUpdate((change, context) => {
      const before = change.before.data();
      const after = change.after.data();
      
      if (before.stage !== 'won' && after.stage === 'won') {
        // contracts 컬렉션에 새 문서 생성
        return admin.firestore().collection('contracts').add({
          businessId: after.businessId,
          status: 'pending',
          contractAmount: after.expectedAmount,
          monthlyPlan: {},
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      
      return null;
    });
  ```

- [ ] 계약 확정 시 수주잔 생성 함수 구현
  ```javascript
  // 계약 상태가 'pending' -> 'won' 변경 시 backlog 컬렉션에 문서 생성
  exports.onContractConfirmed = functions.firestore
    .document('contracts/{contractId}')
    .onUpdate((change, context) => {
      const before = change.before.data();
      const after = change.after.data();
      
      if (before.status !== 'won' && after.status === 'won') {
        // backlog 컬렉션에 새 문서 생성
        return admin.firestore().collection('backlog').add({
          contractId: context.params.contractId,
          remainingAmount: after.contractAmount,
          monthlyRevenue: after.monthlyPlan,
          lastInputWeek: getCurrentWeek(),
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      
      return null;
    });
  ```

### 스케줄드 함수 구현
- [ ] KPI 집계 스케줄드 함수 구현 (매일 02:00)
  ```javascript
  // 매일 02:00에 실행되는 KPI 집계 함수
  exports.aggregateKPI = functions.pubsub
    .schedule('0 2 * * *')
    .timeZone('Asia/Seoul')
    .onRun(async (context) => {
      // 서비스 KPI 집계
      const servicesSnapshot = await admin.firestore()
        .collectionGroup('services')
        .get();
      
      // KPI 집계 로직
      const kpiSummary = {
        hems: { energySaved: 0, area: 0, co2Reduced: 0 },
        bems: { energySaved: 0, area: 0, co2Reduced: 0 },
        rems: { energySaved: 0, area: 0, co2Reduced: 0 },
        fems: { energySaved: 0, area: 0, co2Reduced: 0 }
      };
      
      servicesSnapshot.forEach(doc => {
        const service = doc.data();
        const type = doc.ref.parent.id;
        
        if (kpiSummary[type]) {
          kpiSummary[type].energySaved += service.kpi.energySaved || 0;
          kpiSummary[type].area += service.kpi.area || 0;
          kpiSummary[type].co2Reduced += service.kpi.co2Reduced || 0;
        }
      });
      
      // 매출 전망 집계
      const contractsSnapshot = await admin.firestore()
        .collection('contracts')
        .get();
      
      const backlogSnapshot = await admin.firestore()
        .collection('backlog')
        .get();
      
      // 매출 집계 로직
      const revenueForecast = calculateRevenueForecast(contractsSnapshot, backlogSnapshot);
      const backlogTotal = calculateBacklogTotal(backlogSnapshot);
      
      // 집계 데이터 저장
      return admin.firestore()
        .collection('aggregates')
        .doc('dashboard')
        .set({
          fetchedAt: admin.firestore.FieldValue.serverTimestamp(),
          metrics: {
            revenueForecast,
            backlogTotal,
            kpiSummary
          }
        });
    });
  ```

### 이메일 알림 함수 구현 (선택 사항)
- [ ] 계약 확정 시 이메일 알림 함수 구현
- [ ] 입금 확인 시 이메일 알림 함수 구현
- [ ] 주간 보고서 이메일 발송 함수 구현

## 6. 프론트엔드 연동

### 인증 연동
- [ ] 로그인 페이지와 Firebase Auth 연동
- [ ] 인증 상태에 따른 UI 업데이트 구현
- [ ] 보호된 라우트 구현

### API 서비스 연동
- [ ] 대시보드 페이지와 API 서비스 연동
- [ ] 영업현황 페이지와 API 서비스 연동
- [ ] 계약 관리 페이지와 API 서비스 연동
- [ ] 수주잔 페이지와 API 서비스 연동
- [ ] 서비스 현황 페이지와 API 서비스 연동
- [ ] 설정 페이지와 API 서비스 연동

### 실시간 업데이트 구현
- [ ] Firestore 실시간 리스너 구현
- [ ] 실시간 데이터 변경 시 UI 업데이트 구현

## 7. 배포 및 운영

### Firebase Hosting 설정
- [ ] Firebase Hosting 설정
- [ ] 빌드 스크립트 작성
- [ ] 배포 스크립트 작성

### CI/CD 파이프라인 설정
- [ ] GitHub Actions 워크플로우 설정
- [ ] 자동 테스트 및 배포 설정

### 모니터링 설정
- [ ] Firebase Performance 설정
- [ ] Firebase Crashlytics 설정
- [ ] Firebase Analytics 설정
- [ ] 로깅 설정

### 백업 설정
- [ ] Firestore 데이터 자동 백업 설정 (일 1회)
- [ ] 백업 보존 정책 설정 (30일)

## 8. 테스트 및 디버깅

### 백엔드 테스트
- [ ] API 서비스 단위 테스트
- [ ] Cloud Functions 테스트
- [ ] 보안 규칙 테스트

### 통합 테스트
- [ ] 프론트엔드-백엔드 통합 테스트
- [ ] 엔드투엔드 테스트

### 성능 테스트
- [ ] 쿼리 성능 테스트
- [ ] 로딩 시간 측정
- [ ] 병목 현상 식별 및 해결

---

## 테스트 완료 후 Git 커밋 가이드

각 기능 개발 완료 후 테스트를 진행하고 Git에 커밋하세요. 아래 커밋 메시지 컨벤션을 따라주세요.

```
<type>: <subject>

<body>

<footer>
```

### 커밋 타입
- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **docs**: 문서 변경
- **style**: 코드 포맷팅, 세미콜론 누락 등 (코드 변경 없음)
- **refactor**: 코드 리팩토링
- **test**: 테스트 코드 추가 또는 수정
- **chore**: 빌드 프로세스, 패키지 매니저 설정 등 (소스 변경 없음)

### 예시
```
feat: Firebase 인증 기능 구현

- 로그인 기능 구현
- 로그아웃 기능 구현
- 인증 상태 관리 구현
- 보호된 라우트 연결

Closes #124
```
