/**
 * 케빈랩 사업관리 시스템 (BMS) 앱 클래스
 * 
 * 이 클래스는 애플리케이션의 핵심 로직을 담당합니다.
 * 라우팅, 상태 관리, 인증 등의 기능을 처리합니다.
 */

export class App {
  /**
   * App 클래스 생성자
   * @param {Object} config - 앱 설정 객체
   * @param {Router} config.router - 라우터 인스턴스
   * @param {HTMLElement} config.appElement - 앱이 마운트될 DOM 요소
   */
  constructor(config) {
    this.router = config.router;
    this.appElement = config.appElement;
    this.currentPage = null;
    this.isAuthenticated = false;
    this.user = null;
    this.state = {
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      currentWeek: this.getCurrentWeek(),
      notifications: []
    };
  }

  /**
   * 앱 초기화 메서드
   */
  init() {
    // 다크 모드 감지 및 적용
    this.setupDarkModeDetection();
    
    // 로컬 스토리지에서 인증 상태 복원
    this.restoreAuthState();
    
    // 라우터 초기화 및 이벤트 리스너 설정
    this.setupRouterEvents();
    
    // 라우터 시작
    this.router.start();
  }

  /**
   * 다크 모드 감지 및 설정
   */
  setupDarkModeDetection() {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 시스템 다크 모드 변경 감지
    darkModeMediaQuery.addEventListener('change', e => {
      this.state.darkMode = e.matches;
      this.applyTheme();
    });
    
    // 로컬 스토리지에서 테마 설정 복원
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.state.darkMode = savedTheme === 'dark';
    }
    
    // 테마 적용
    this.applyTheme();
  }

  /**
   * 테마 적용
   */
  applyTheme() {
    if (this.state.darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }

  /**
   * 테마 토글
   */
  toggleTheme() {
    this.state.darkMode = !this.state.darkMode;
    localStorage.setItem('theme', this.state.darkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  /**
   * 로컬 스토리지에서 인증 상태 복원
   */
  restoreAuthState() {
    const authData = localStorage.getItem('auth');
    if (authData) {
      try {
        const { user, token, expiry } = JSON.parse(authData);
        
        // 토큰 만료 확인
        if (expiry && new Date(expiry) > new Date()) {
          this.isAuthenticated = true;
          this.user = user;
        } else {
          // 만료된 토큰은 제거
          this.logout();
        }
      } catch (error) {
        console.error('인증 상태 복원 중 오류 발생:', error);
        this.logout();
      }
    }
  }

  /**
   * 라우터 이벤트 설정
   */
  setupRouterEvents() {
    // 라우트 변경 전 인증 확인
    this.router.beforeEach((to, from, next) => {
      // 로그인 페이지는 항상 접근 가능
      if (to === '/') {
        return next();
      }
      
      // 인증이 필요한 페이지는 인증 상태 확인
      if (!this.isAuthenticated) {
        return next('/');
      }
      
      // 인증된 사용자는 통과
      next();
    });
    
    // 라우트 변경 후 페이지 렌더링
    this.router.afterEach(async (route) => {
      try {
        // 로딩 표시
        this.showLoading();
        
        // 이전 페이지 언마운트
        if (this.currentPage && typeof this.currentPage.unmount === 'function') {
          this.currentPage.unmount();
        }
        
        // 새 페이지 모듈 동적 로드
        const pageModule = await import(`./${route.module}`);
        const PageComponent = pageModule.default;
        
        // 새 페이지 인스턴스 생성 및 마운트
        this.currentPage = new PageComponent({
          app: this,
          router: this.router
        });
        
        // 페이지 렌더링
        const pageElement = await this.currentPage.render();
        
        // DOM에 페이지 추가
        this.clearAppContent();
        this.appElement.appendChild(pageElement);
        
        // 페이지 마운트 후크 호출
        if (typeof this.currentPage.mounted === 'function') {
          this.currentPage.mounted();
        }
      } catch (error) {
        console.error('페이지 렌더링 중 오류 발생:', error);
        this.showError('페이지를 로드하는 중 오류가 발생했습니다.');
      } finally {
        // 로딩 숨김
        this.hideLoading();
      }
    });
  }

  /**
   * 앱 콘텐츠 영역 비우기
   */
  clearAppContent() {
    while (this.appElement.firstChild) {
      this.appElement.removeChild(this.appElement.firstChild);
    }
  }

  /**
   * 로딩 표시
   */
  showLoading() {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading';
    loadingElement.innerHTML = `
      <div class="spinner"></div>
      <p>로딩 중...</p>
    `;
    
    this.clearAppContent();
    this.appElement.appendChild(loadingElement);
  }

  /**
   * 로딩 숨김
   */
  hideLoading() {
    const loadingElement = this.appElement.querySelector('.loading');
    if (loadingElement) {
      loadingElement.remove();
    }
  }

  /**
   * 에러 표시
   * @param {string} message - 에러 메시지
   */
  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'alert alert-danger';
    errorElement.textContent = message;
    
    this.clearAppContent();
    this.appElement.appendChild(errorElement);
  }

  /**
   * 알림 추가
   * @param {Object} notification - 알림 객체
   * @param {string} notification.type - 알림 타입 (success, warning, danger, info)
   * @param {string} notification.message - 알림 메시지
   * @param {number} [notification.duration=3000] - 알림 표시 시간 (ms)
   */
  addNotification(notification) {
    const id = Date.now();
    const newNotification = {
      id,
      type: notification.type || 'info',
      message: notification.message,
      duration: notification.duration || 3000
    };
    
    this.state.notifications.push(newNotification);
    this.renderNotifications();
    
    // 자동 제거 타이머 설정
    setTimeout(() => {
      this.removeNotification(id);
    }, newNotification.duration);
  }

  /**
   * 알림 제거
   * @param {number} id - 알림 ID
   */
  removeNotification(id) {
    this.state.notifications = this.state.notifications.filter(
      notification => notification.id !== id
    );
    this.renderNotifications();
  }

  /**
   * 알림 렌더링
   */
  renderNotifications() {
    let notificationsContainer = document.getElementById('notifications');
    
    if (!notificationsContainer) {
      notificationsContainer = document.createElement('div');
      notificationsContainer.id = 'notifications';
      notificationsContainer.className = 'notifications';
      document.body.appendChild(notificationsContainer);
    }
    
    notificationsContainer.innerHTML = '';
    
    this.state.notifications.forEach(notification => {
      const notificationElement = document.createElement('div');
      notificationElement.className = `notification notification-${notification.type}`;
      notificationElement.innerHTML = `
        <div class="notification-content">${notification.message}</div>
        <button class="notification-close">&times;</button>
      `;
      
      // 닫기 버튼 이벤트 리스너
      const closeButton = notificationElement.querySelector('.notification-close');
      closeButton.addEventListener('click', () => {
        this.removeNotification(notification.id);
      });
      
      notificationsContainer.appendChild(notificationElement);
    });
  }

  /**
   * 로그인 처리
   * @param {Object} userData - 사용자 데이터
   * @param {string} token - 인증 토큰
   */
  login(userData, token) {
    this.isAuthenticated = true;
    this.user = userData;
    
    // 토큰 만료 시간 설정 (예: 1일)
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 1);
    
    // 인증 정보 저장
    localStorage.setItem('auth', JSON.stringify({
      user: userData,
      token,
      expiry: expiry.toISOString()
    }));
    
    // 대시보드로 이동
    this.router.navigate('/dashboard');
  }

  /**
   * 로그아웃 처리
   */
  logout() {
    this.isAuthenticated = false;
    this.user = null;
    
    // 인증 정보 제거
    localStorage.removeItem('auth');
    
    // 로그인 페이지로 이동
    this.router.navigate('/');
  }

  /**
   * 현재 주차 계산
   * @returns {string} 현재 주차 (YYYY-WW 형식)
   */
  getCurrentWeek() {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((now - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    
    return `${now.getFullYear()}-${weekNumber.toString().padStart(2, '0')}`;
  }
}
