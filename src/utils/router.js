/**
 * 간단한 클라이언트 사이드 라우터 구현
 * 
 * 이 클래스는 SPA(Single Page Application)에서 페이지 라우팅을 처리합니다.
 * 히스토리 API를 사용하여 URL 변경을 감지하고 해당 페이지를 로드합니다.
 */

export class Router {
  /**
   * Router 클래스 생성자
   */
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.beforeHooks = [];
    this.afterHooks = [];
    
    // 브라우저 히스토리 이벤트 리스너 등록
    window.addEventListener('popstate', this.handlePopState.bind(this));
    
    // 링크 클릭 이벤트 위임 리스너 등록
    document.addEventListener('click', this.handleLinkClick.bind(this));
  }

  /**
   * 라우트 추가
   * @param {string} path - 라우트 경로 (예: '/dashboard')
   * @param {string} module - 모듈 경로 (예: 'pages/dashboard/dashboard.js')
   * @param {string} name - 라우트 이름
   */
  addRoute(path, module, name) {
    this.routes.set(path, { path, module, name });
  }

  /**
   * 라우트 이동 전 훅 추가
   * @param {Function} hook - 이동 전 실행할 함수
   */
  beforeEach(hook) {
    this.beforeHooks.push(hook);
  }

  /**
   * 라우트 이동 후 훅 추가
   * @param {Function} hook - 이동 후 실행할 함수
   */
  afterEach(hook) {
    this.afterHooks.push(hook);
  }

  /**
   * 라우터 시작
   */
  start() {
    // 초기 URL 처리
    this.handleRouteChange(window.location.pathname);
  }

  /**
   * 페이지 이동
   * @param {string} path - 이동할 경로
   */
  navigate(path) {
    // 현재 경로와 같으면 무시
    if (window.location.pathname === path) {
      return;
    }
    
    // 히스토리 API로 URL 변경
    window.history.pushState(null, '', path);
    
    // 라우트 변경 처리
    this.handleRouteChange(path);
  }

  /**
   * 뒤로 가기
   */
  back() {
    window.history.back();
  }

  /**
   * 앞으로 가기
   */
  forward() {
    window.history.forward();
  }

  /**
   * 브라우저 뒤로/앞으로 버튼 이벤트 처리
   * @param {PopStateEvent} event - 팝스테이트 이벤트
   */
  handlePopState(event) {
    this.handleRouteChange(window.location.pathname);
  }

  /**
   * 링크 클릭 이벤트 처리
   * @param {MouseEvent} event - 클릭 이벤트
   */
  handleLinkClick(event) {
    // 링크 요소 찾기
    let target = event.target;
    while (target && target.tagName !== 'A') {
      target = target.parentNode;
      if (!target) return;
    }
    
    // 내부 링크인지 확인
    if (
      target.tagName === 'A' &&
      target.href &&
      target.href.startsWith(window.location.origin) &&
      !target.hasAttribute('external') &&
      !target.hasAttribute('download') &&
      !(target.target === '_blank')
    ) {
      // 기본 동작 방지
      event.preventDefault();
      
      // 경로 추출 및 이동
      const path = target.pathname;
      this.navigate(path);
    }
  }

  /**
   * 라우트 변경 처리
   * @param {string} path - 변경된 경로
   */
  async handleRouteChange(path) {
    // 경로에 맞는 라우트 찾기
    let route = this.routes.get(path);
    
    // 일치하는 라우트가 없으면 404 라우트 사용
    if (!route) {
      route = this.routes.get('*');
    }
    
    if (!route) {
      console.error(`라우트를 찾을 수 없습니다: ${path}`);
      return;
    }
    
    // 이전 라우트 저장
    const fromRoute = this.currentRoute;
    
    // beforeEach 훅 실행
    let shouldContinue = true;
    
    for (const hook of this.beforeHooks) {
      await new Promise(resolve => {
        hook(route.path, fromRoute ? fromRoute.path : null, (result) => {
          // next 함수가 경로와 함께 호출되면 해당 경로로 리디렉션
          if (typeof result === 'string') {
            shouldContinue = false;
            this.navigate(result);
          } else {
            shouldContinue = result !== false;
          }
          resolve();
        });
      });
      
      if (!shouldContinue) {
        return;
      }
    }
    
    // 현재 라우트 업데이트
    this.currentRoute = route;
    
    // afterEach 훅 실행
    for (const hook of this.afterHooks) {
      hook(route);
    }
  }

  /**
   * 현재 라우트 반환
   * @returns {Object|null} 현재 라우트 객체
   */
  getCurrentRoute() {
    return this.currentRoute;
  }
}
